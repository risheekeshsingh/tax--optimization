const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { generateNotifications } = require('./services/notificationService');
const Notification = require('./models/Notification');
const User = require('./models/User');

dotenv.config();

async function runTest() {
    try {
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI is missing in .env');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Create or find a dummy user
        let user = await User.findOne({ email: 'notifier@test.com' });
        if (!user) {
            user = await User.create({
                name: 'Test Notifier',
                email: 'notifier@test.com',
                password: 'Password123'
            });
        }
        const userId = user._id;

        // 2. Clear previous notifications for this user (Fresh Start)
        await Notification.deleteMany({ userId });
        console.log('Cleared old notifications for test user');

        // 3. Scenario 1: High gaps in all sections
        const initialData = {
            income: 1200000,
            investments: 40000, // 1.1L gap (High Priority)
            insurance: 0,       // 25k gap
            nps: 5000           // 45k gap
        };

        console.log('\n--- Scenario 1: Initial Gaps (Should trigger alerts) ---');
        let notes = await generateNotifications(userId, initialData);
        notes.forEach(n => {
            console.log(`[${n.priority.toUpperCase()}] ${n.type}: ${n.title}`);
            console.log(`Saving: ₹${n.taxSaving}`);
            console.log(`Msg: ${n.message}\n`);
        });

        // 4. Scenario 2: Partial Optimization (Upsert & Resolve)
        const partialData = {
            income: 1200000,
            investments: 150000, // 0 gap (Should RESOLVE)
            insurance: 15000,    // 10k gap (Should UPDATE)
            nps: 50000           // 0 gap (Should RESOLVE)
        };

        console.log('\n--- Scenario 2: Partial Optimization (Upsert & Resolve) ---');
        await generateNotifications(userId, partialData);
        
        const activeNotes = await Notification.find({ userId, status: 'active' });
        console.log(`Active alerts after update: ${activeNotes.length}`);
        activeNotes.forEach(n => {
            console.log(`[${n.priority.toUpperCase()}] ${n.type}: ${n.message}`);
        });

        const resolvedNotes = await Notification.find({ userId, status: 'resolved' });
        console.log(`Resolved alerts: ${resolvedNotes.length} (Expect 80C and NPS to be resolved)`);
        resolvedNotes.forEach(n => {
            console.log(`[RESOLVED] ${n.type}`);
        });

        console.log('\n✅ Verification Complete!');
        process.exit(0);
    } catch (err) {
        console.error('Test Failed:', err);
        process.exit(1);
    }
}

runTest();
