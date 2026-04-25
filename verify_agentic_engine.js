// Verification script for Agentic AI Engine

async function verifyAgenticEngine() {
    console.log("🚀 Verifying Agentic AI Engine...");
    
    const payload = {
        income: 1200000,
        investments: 50000,
        insurance: 10000,
        nps: 0,
        activeRegime: 'OLD'
    };

    try {
        // We need a token or bypass auth for testing if possible, 
        // but let's assume we can hit the logic directly via a local test of the coordinator.
        const agenticCoordinator = require('./server/agent-core/agenticCoordinator');
        
        console.log("--- Testing AgenticCoordinator.process ---");
        const result = await agenticCoordinator.process(payload, null);
        
        console.log("Goal:", result.goal);
        console.log("Confidence:", result.confidence + "%");
        console.log("Plan Steps:", result.plan.length);
        console.log("Actions:", result.actions.length);
        console.log("Insights:", result.insights.length);
        console.log("Alerts:", result.alerts.length);
        console.log("Simulations:", result.simulations.length);

        const mandatoryFields = ['goal', 'plan', 'actions', 'insights', 'alerts', 'simulations', 'confidence'];
        const missing = mandatoryFields.filter(f => result[f] === undefined);

        if (missing.length === 0) {
            console.log("✅ SUCCESS: All mandatory agentic fields present.");
        } else {
            console.log("❌ FAILURE: Missing fields:", missing.join(', '));
        }

        // Check legacy compatibility
        const legacyFields = ['taxableIncome', 'taxLiability', 'savingsPotential', 'taxScore', 'timeline'];
        const missingLegacy = legacyFields.filter(f => result[f] === undefined);
        
        if (missingLegacy.length === 0) {
            console.log("✅ SUCCESS: All legacy fields present for UI compatibility.");
        } else {
            console.log("⚠️ WARNING: Missing legacy fields:", missingLegacy.join(', '));
        }

    } catch (error) {
        console.error("❌ Error during verification:", error);
    }
}

verifyAgenticEngine();
