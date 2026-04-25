/**
 * Planning Engine
 * Multi-step reasoning to break down goals into actionable plans.
 */

class PlanningEngine {
    /**
     * Generate a multi-step plan based on goal and profile
     */
    generatePlan(goal, taxProfile, taxResult) {
        const plan = [];

        // Step 1: Data Analysis (Foundation)
        plan.push({
            step: 1,
            task: "Analyze Current Financial Snapshot",
            description: `Reviewing income of ₹${taxProfile.income?.toLocaleString()} and existing deductions.`,
            status: "completed"
        });

        // Step 2: Gap Identification
        const gaps = [];
        if (taxResult.deductions.section80C < 150000) gaps.push("80C under-utilized");
        if (taxResult.deductions.section80D < 25000) gaps.push("Health insurance optimization available");
        if (taxResult.deductions.nps80CCD < 50000) gaps.push("NPS Tier 1 benefits untapped");

        plan.push({
            step: 2,
            task: "Identify Optimization Gaps",
            description: gaps.length > 0 ? `Found ${gaps.length} areas for improvement: ${gaps.join(", ")}.` : "All major deduction channels are currently optimized.",
            status: gaps.length > 0 ? "action_required" : "completed"
        });

        // Step 3: Regime Evaluation
        plan.push({
            step: 3,
            task: "Comparative Regime Evaluation",
            description: `Agent analyzed Old vs New regimes. Recommended: ${taxResult.recommendedRegime} Regime.`,
            status: "completed"
        });

        // Step 4: Action Strategy
        plan.push({
            step: 4,
            task: "Generate Execution Strategy",
            description: "Calculating specific investment amounts and timing for maximum impact.",
            status: "pending"
        });

        // Step 5: Outcome Simulation
        plan.push({
            step: 5,
            task: "Simulate Final Outcomes",
            description: "Projecting tax liability after implementing recommendations.",
            status: "pending"
        });

        return plan;
    }

    /**
     * Generate a detailed 12-month tax roadmap
     */
    generateRoadmap(taxProfile, taxResult) {
        const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
        const roadmap = [];

        months.forEach((month, index) => {
            let action = "";
            let detail = "";

            switch (month) {
                case 'Apr':
                    action = "Yearly Goal Setting";
                    detail = `Analyze last year's returns and target ₹${(taxResult.savingsPotential || 0).toLocaleString()} savings.`;
                    break;
                case 'May':
                    action = "Verify TDS Mapping";
                    detail = "Check your first salary slip of the FY and ensure TDS is correctly mapped.";
                    break;
                case 'Jun':
                    action = "Start ELSS SIPs";
                    detail = "Start monthly SIPs for Section 80C to avoid March lumpsum payments.";
                    break;
                case 'Jul':
                    action = "ITR Filing Deadline";
                    detail = "Ensure previous year's tax returns are filed before July 31st.";
                    break;
                case 'Aug':
                    action = "Health Review (80D)";
                    detail = "Review insurance limits. Add top-ups for parents if required.";
                    break;
                case 'Sep':
                    action = "Advance Tax Check";
                    detail = "Ensure 45% of advance tax is paid by Sep 15th if liability > ₹10k.";
                    break;
                case 'Oct':
                    action = "Festive NPS Strategy";
                    detail = "Allocate bonus portions to NPS for the additional ₹50k benefit.";
                    break;
                case 'Nov':
                    action = "Rent Receipt Check";
                    detail = "Collect proofs for HRA/LTA claims to avoid mid-year office queries.";
                    break;
                case 'Dec':
                    action = "Mid-Year Correction";
                    detail = "Recalculate liability. Adjust investments if salary hike occurred.";
                    break;
                case 'Jan':
                    action = "Final Proof Submit";
                    detail = "Submit investment declarations to HR to prevent excess TDS.";
                    break;
                case 'Feb':
                    action = "NPS Tier 1 Lumpsum";
                    detail = "Final chance to put ₹50,000 in NPS for the additional deduction.";
                    break;
                case 'Mar':
                    action = "Year-End Compliance";
                    detail = "Final month to invest. Ensure all 80C/80D limits are utilized.";
                    break;
            }

            roadmap.push({ month, action, detail });
        });

        return roadmap;
    }
}

module.exports = new PlanningEngine();
