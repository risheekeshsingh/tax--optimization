/**
 * Scenario Engine
 * Core logic for simulating tax scenarios.
 */
const { calculateFullTax } = require('../services/universalTaxEngine');

class ScenarioEngine {
    simulate(taxProfile, type, params = {}) {
        let scenarioProfile = { ...taxProfile };
        let name = "";

        switch (type) {
            case 'INCREMENT':
                const hike = params.percentage || 20;
                scenarioProfile.income = (Number(taxProfile.income) || 0) * (1 + hike / 100);
                name = `${hike}% Salary Increment`;
                break;
            case 'JOB_SWITCH':
                const hikeSwitch = params.percentage || 30;
                scenarioProfile.income = (Number(taxProfile.income) || 0) * (1 + hikeSwitch / 100);
                // Job switch might involve loss of some deductions or change in city
                scenarioProfile.cityCategory = params.cityCategory || taxProfile.cityCategory;
                name = `Job Switch (${hikeSwitch}% Hike)`;
                break;
            case 'INVESTMENT_BOOST':
                scenarioProfile.investments = 150000;
                scenarioProfile.insurance = 25000;
                scenarioProfile.nps = 50000;
                name = "Maximized Deductions";
                break;
            case 'COMBINED':
                // Simulate Increment + Investment Boost
                scenarioProfile.income = (Number(taxProfile.income) || 0) * (1 + (params.percentage || 20) / 100);
                scenarioProfile.investments = 150000;
                scenarioProfile.insurance = 25000;
                scenarioProfile.nps = 50000;
                name = "Increment + Full Optimization";
                break;
            default:
                name = "Base Scenario";
                break;
        }

        const result = calculateFullTax(scenarioProfile);
        const baseResult = calculateFullTax(taxProfile);
        
        return {
            id: type,
            name: name,
            description: result.savingsPotential > 0 
                ? `Optimize for ₹${result.savingsPotential.toLocaleString()} savings.` 
                : "Your current tax strategy is efficient for this scenario.",
            profile: scenarioProfile,
            result: result,
            impact: result.finalTax - baseResult.finalTax,
            newTax: result.finalTax,
            savingsPotential: result.savingsPotential,
            
            // Fields for handleApplySimulation
            newIncome: scenarioProfile.income,
            newInvestments: scenarioProfile.investments,
            newNPS: scenarioProfile.nps,
            newRegime: result.recommendedRegime
        };
    }

    runAll(taxProfile, params = {}) {
        return [
            this.simulate(taxProfile, 'INCREMENT', { percentage: params.incrementPct || 20 }),
            this.simulate(taxProfile, 'JOB_SWITCH', { percentage: params.jobHikePct || 30 }),
            this.simulate(taxProfile, 'INVESTMENT_BOOST'),
            this.simulate(taxProfile, 'COMBINED', { percentage: params.incrementPct || 20 })
        ];
    }
}

module.exports = new ScenarioEngine();
