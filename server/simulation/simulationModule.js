/**
 * Scenario Simulation Module (UPGRADED)
 * Routes requests to the Agentic Scenario Intelligence Engine.
 */
const coordinator = require('../scenario-intelligence/coordinator');

class SimulationModule {
    async runWhatIf(taxProfile, params = {}) {
        try {
            return await coordinator.process(taxProfile, params);
        } catch (error) {
            console.error("Scenario Intelligence Error:", error);
            return {
                scenarios: [],
                error: "Failed to process intelligence engine."
            };
        }
    }
}

module.exports = new SimulationModule();
