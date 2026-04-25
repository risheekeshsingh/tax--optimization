const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    name:      { type: String, required: true },
    email:     { type: String, required: true },
    mobile:    { type: String, required: true },
    product:   { type: String, required: true },
    provider:  { type: String, required: true },
    category:  { type: String, enum: ['80C', '80D', 'NPS'], required: true },
    amount:    { type: Number },
    frequency: { type: String, enum: ['SIP', 'Lumpsum'], default: 'SIP' },
    status:    { type: String, enum: ['new', 'contacted', 'converted'], default: 'new' },
    partnerUrl:{ type: String },
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
