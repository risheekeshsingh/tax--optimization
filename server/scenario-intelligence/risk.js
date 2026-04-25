/**
 * Risk & Warning Analyzer
 * Detects potential pitfalls in tax scenarios.
 */

class RiskAnalyzer {
    analyze(scenario, originalProfile) {
        const alerts = [];

        if (scenario.id === 'JOB_SWITCH') {
            alerts.push({
                type: "WARNING",
                message: "Switching jobs mid-year may lead to dual taxation if previous salary isn't disclosed to the new employer.",
                severity: "High"
            });
            alerts.push({
                type: "INFO",
                message: "Ensure you collect Form 12B from your previous employer to avoid TDS under-calculation.",
                severity: "Medium"
            });
        }

        if (scenario.result.taxDifference > 50000) {
            alerts.push({
                type: "ALERT",
                message: "Significant tax liability increase detected. Consider immediate voluntary tax payments to avoid Section 234 interest.",
                severity: "High"
            });
        }

        if (scenario.profile.investments < 50000 && scenario.profile.income > 1500000) {
            alerts.push({
                type: "RISK",
                message: "Under-utilization of 80C at high income levels detected. This is the most common reason for tax over-payment.",
                severity: "Medium"
            });
        }

        return alerts;
    }
}

module.exports = new RiskAnalyzer();
