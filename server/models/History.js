const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    snapshot: {
        income: Number,
        investments: Number,
        insurance: Number,
        nps: Number,
        hra: Number,
        homeLoan: Number,
        activeRegime: String,
        cityCategory: String,
        isSenior: Boolean
    },
    description: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Limit history to last 50 entries per user for performance
historySchema.index({ user: 1, timestamp: -1 });

const History = mongoose.model('History', historySchema);
module.exports = History;
