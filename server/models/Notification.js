const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['80C', '80D', 'NPS', 'STRATEGY', 'ALERT', 'PLAN', 'ERROR'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    actionHint: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'low'
    },
    taxSaving: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'resolved', 'expired'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Index to ensure unique notification type per user for upsert logic
notificationSchema.index({ userId: 1, type: 1, status: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
