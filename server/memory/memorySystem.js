/**
 * Memory System
 * Handles short-term (session) and long-term (historical) memory.
 */
const History = require('../models/History');

class MemorySystem {
    constructor() {
        this.sessionMemory = new Map(); // Short-term: userId -> currentSessionState
    }

    /**
     * Update short-term memory
     */
    updateSession(userId, data) {
        if (!userId) return;
        const current = this.sessionMemory.get(userId.toString()) || {};
        this.sessionMemory.set(userId.toString(), { ...current, ...data, lastActive: Date.now() });
    }

    /**
     * Retrieve long-term patterns
     */
    async getLongTermMemory(userId) {
        if (!userId) return null;
        try {
            const history = await History.find({ user: userId }).sort({ timestamp: -1 }).limit(10);
            
            if (!history || history.length === 0) return null;

            // Extract patterns: e.g., consistent 80C under-utilization
            const avg80C = history.reduce((sum, h) => sum + (h.snapshot.investments || 0), 0) / history.length;
            const ignored80C = history.every(h => (h.snapshot.investments || 0) < 150000);
            const ignored80D = history.every(h => (h.snapshot.insurance || 0) < 25000);

            return {
                avg80C,
                ignoredPatterns: {
                    section80C: ignored80C,
                    section80D: ignored80D
                },
                lastRegime: history[0].snapshot.activeRegime,
                trend: history.length > 1 ? (history[0].snapshot.income > history[1].snapshot.income ? "Rising Income" : "Stable Income") : "New Profile"
            };
        } catch (err) {
            console.error("Memory System Error:", err);
            return null;
        }
    }

    getSession(userId) {
        return this.sessionMemory.get(userId?.toString()) || {};
    }
}

module.exports = new MemorySystem();
