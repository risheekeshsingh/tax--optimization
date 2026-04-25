const agenticCoordinator = require('../agent-core/agenticCoordinator');
const Notification = require('../models/Notification');

const getUrgencyContext = () => {
    const month = new Date().getMonth(); // 0-indexed
    if (month >= 3 && month <= 8) return { tone: "Plan early", urgency: "low" };
    if (month >= 9 && month <= 11) return { tone: "Optimize now", urgency: "medium" };
    return { tone: "Last chance to save tax", urgency: "high" };
};

const determinePriority = (impact, type) => {
    if (impact >= 20000 || type === 'Critical') return 'high';
    if (impact >= 10000 || type === 'High') return 'medium';
    return 'low';
};

/**
 * Core engine to generate or update tax-saving notifications
 * Now powered by the fully Agentic Autonomous Engine.
 */
const generateNotifications = async (userId, data) => {
    const context = getUrgencyContext();
    
    // 1. Get agentic response
    const agenticResponse = await agenticCoordinator.process(data, userId);
    const { recommendations, alerts } = agenticResponse;

    const results = [];

    // 2. Process Recommendations into Notifications
    if (recommendations && Array.isArray(recommendations)) {
        for (const action of recommendations) {
        const priority = determinePriority(action.impact.replace(/[^0-9]/g, ''), action.priority);
        
        let typeMapping = '80C';
        if (action.type === 'INVESTMENT') typeMapping = '80C';
        else if (action.type === 'INSURANCE') typeMapping = '80D';
        else if (action.type === 'RETIREMENT') typeMapping = 'NPS';
        else if (action.type === 'STRATEGY') typeMapping = 'STRATEGY';

        const notification = await Notification.findOneAndUpdate(
            { userId, type: typeMapping, status: 'active' },
            {
                userId,
                type: typeMapping,
                title: action.action,
                message: `${action.explanation.reason}. ${context.tone}!`,
                actionHint: action.timeline,
                priority: priority.toLowerCase(),
                taxSaving: parseInt(action.impact.replace(/[^0-9]/g, '')) || 0,
                status: 'active'
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );
        results.push(notification);
    }
    }

    // 3. Process Alerts into Notifications
    for (const alert of alerts) {
        const notification = await Notification.findOneAndUpdate(
            { userId, type: alert.trigger, status: 'active' },
            {
                userId,
                type: 'NPS', // fallback or mapping
                title: alert.message,
                message: alert.suggestion || alert.message,
                actionHint: "Optimize Now",
                priority: alert.severity.toLowerCase(),
                taxSaving: 0,
                status: 'active'
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );
        results.push(notification);
    }

    // 4. Resolve resolved recommendations
    const activeSections = (recommendations || []).map(r => r.section || r.type);
    await Notification.updateMany(
        { userId, type: { $in: ['80C', '80D', 'NPS'] }, type: { $nin: activeSections }, status: 'active' },
        { status: 'resolved' }
    );

    return results;
};

const cleanupExpired = async (userId) => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    return Notification.updateMany(
        { userId, createdAt: { $lt: ninetyDaysAgo }, status: 'active' },
        { status: 'expired' }
    );
};

module.exports = {
    generateNotifications,
    cleanupExpired
};
