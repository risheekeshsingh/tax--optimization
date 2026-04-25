/**
 * Monitoring & Trigger Engine
 * Continuously evaluates progress and triggers proactive alerts.
 */

class MonitorEngine {
    evaluate(taxProfile, taxResult, goal) {
        const alerts = [];
        const { deductions } = taxResult;

        // Progress Tracking
        const target80C = 150000;
        const current80C = deductions.section80C;
        const utilization80C = (current80C / target80C) * 100;

        if (utilization80C < 50) {
            alerts.push({
                severity: "Warning",
                message: "You are significantly behind your 80C tax-saving target.",
                trigger: "LOW_UTILIZATION_80C",
                suggestion: "Consider monthly SIPs in ELSS funds."
            });
        } else if (utilization80C < 100) {
            alerts.push({
                severity: "Info",
                message: "80C target not fully utilized. ₹" + (target80C - current80C).toLocaleString() + " remaining.",
                trigger: "GAP_IN_80C"
            });
        }

        // NPS Check
        if (deductions.nps80CCD === 0 && Number(taxProfile.income) > 1000000) {
            alerts.push({
                severity: "Critical",
                message: "High income detected but NPS (80CCD) benefits are 0%. Missing ₹50,000 extra deduction.",
                trigger: "MISSING_NPS"
            });
        }

        // Deadline check (simulated)
        const currentMonth = new Date().getMonth(); // 0-11
        if (currentMonth >= 0 && currentMonth <= 2) { // Jan, Feb, Mar
            alerts.push({
                severity: "High",
                message: "Tax season ending soon. Complete your investments before March 31st.",
                trigger: "DEADLINE_APPROACHING"
            });
        }

        return alerts;
    }
}

module.exports = new MonitorEngine();
