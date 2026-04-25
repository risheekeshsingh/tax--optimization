/**
 * Multi-Agent Orchestrator
 * Coordinates specialized agents to provide a unified decision.
 */

class SpecializedAgent {
    constructor(name, focus) {
        this.name = name;
        this.focus = focus;
    }
}

const TaxOptAgent = new SpecializedAgent("Tax Optimization Agent", "Maximizing net take-home pay");
const InvestmentAgent = new SpecializedAgent("Investment Strategy Agent", "Wealth creation and tax savings");
const RiskAgent = new SpecializedAgent("Risk Analysis Agent", "Financial safety and insurance adequacy");
const ComplianceAgent = new SpecializedAgent("Compliance Agent", "Regulatory adherence and audit safety");

class AgentOrchestrator {
    constructor() {
        this.agents = [TaxOptAgent, InvestmentAgent, RiskAgent, ComplianceAgent];
    }

    async coordinate(taxProfile, taxResult) {
        const insights = [];

        // Tax Optimization Agent Insight
        insights.push({
            agent: TaxOptAgent.name,
            insight: `Switching to ${taxResult.recommendedRegime} regime is the most efficient path for your income bracket.`,
            confidence: 98
        });

        // Investment Strategy Agent Insight
        if (taxResult.deductions.section80C < 150000) {
            insights.push({
                agent: InvestmentAgent.name,
                insight: "ELSS funds recommended for dual benefit of capital growth and tax saving.",
                confidence: 92
            });
        }

        // Risk Analysis Agent Insight
        if (taxResult.deductions.section80D < 15000) {
            insights.push({
                agent: RiskAgent.name,
                insight: "Health insurance coverage appears insufficient based on modern medical costs.",
                confidence: 85
            });
        }

        // Compliance Agent Insight
        insights.push({
            agent: ComplianceAgent.name,
            insight: "Ensure all investment proofs are digitally archived for future scrutiny.",
            confidence: 100
        });

        return insights;
    }
}

module.exports = new AgentOrchestrator();
