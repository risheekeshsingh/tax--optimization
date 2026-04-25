const mongoose = require('mongoose');

const taxProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    income: { type: Number, default: 0 },
    investments: { type: Number, default: 0 }, // 80C
    insurance: { type: Number, default: 0 },   // 80D
    nps: { type: Number, default: 0 },         // 80CCD
    hra: { type: Number, default: 0 },
    homeLoan: { type: Number, default: 0 },
    activeRegime: { type: String, default: 'NEW' },
    isSenior: { type: Boolean, default: false },
    cityCategory: { type: String, default: 'metro' },
    age: { type: Number },
    investmentHistory: [{
        month: Number,
        amount: Number,
        category: String
    }]
}, { timestamps: true });

const TaxProfile = mongoose.model('TaxProfile', taxProfileSchema);
module.exports = TaxProfile;
