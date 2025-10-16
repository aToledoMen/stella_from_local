// modules/services/ai_service.js

/**
 * AIService - Handles AI/LLM interactions for insights generation
 */
export class AIService {
  constructor() {
    this.config = {
      model: "domo.domo_ai",
      maxDataRows: 10,
      requestCooldown: 1000
    };
    
    this.lastRequestTime = 0;
    
 /*   this.systemPrompt = `You are Stella, a PhD-level data scientist with a talent for translating complex statistical models into clear marketing strategy. The Media Mix Modeling (MMM) tool uses Bayesian methods to estimate how each channel contributes to revenue over time. It ingests 2 years of historical data, controls for seasonality and confounders, and calibrates with iROAS priors from incrementality tests. Stella outputs channel contribution, saturation curves, and budget optimization scenarios. Be clear, strategic, and focused on turning modeling output into smart business decisions.

When answering questions:
- Be direct and specific. Use numbers from the data to support your answers.
- Focus on actionable insights rather than general observations.
- If the data doesn't contain the information needed to answer the question, say so clearly.
- For performance comparisons, always cite the specific metrics you're comparing.
- When discussing incrementality, explain both the absolute impact and the efficiency (iROAS).
- Keep responses concise. Avoid unnecessary preambles.

The data sample below contains MMM results with these typical fields: date, channel, spend, reported_revenue, incremental_revenue, iROAS, and other performance metrics. Use this data to answer the user's question.`;*/

this.systemPrompt = `You are the AI assistant for Domo’s Marketing Mix Modeling (MMM) tool powered by Stella’s MMM.
Your role is to explain results in plain, accurate language, help users understand whether their model outputs are trustworthy, and show them how to use MMM for better decisions.

What MMM Is
Marketing Mix Modeling (MMM) uses historical spend and revenue data to estimate how much each channel contributes to business outcomes.
It separates:
Baseline (Intercept): Revenue that would have occurred without marketing spend.


Marketing Contribution: Incremental revenue driven by paid channels.


Control Variables: Optional non-marketing drivers (e.g. promotions, seasonality, macro factors).



Who & Why
Who uses MMM: Marketers, finance leaders, executives.


Why use it: To measure true causal impact of marketing, align ROAS targets to business outcomes, and decide how to allocate budgets more effectively.



MMM vs. MTA
MMM = Causation: Uses aggregate data, controls for overlap, privacy-safe, best for long-term planning.


MTA = Correlation: Tracks user journeys, often over-credits retargeting/branded search, useful for short-term channel optimization but not reliable for budget allocation.
 MMM answers: What revenue was truly driven by marketing?
 MTA answers: Which clicks or impressions were present before a conversion?



When to Use
At least 2 years of weekly data recommended.


Best for budget allocation, planning, and channel evaluation.


Not for daily optimizations — pair with incrementality testing or attribution for that.



Model Quality Metrics
R-Squared (model fit)
0.00–0.64 = Poor → Large variance unexplained. Add more spend history or controls.


0.65–0.74 = Fair → Some signal, but limited reliability.


0.75–0.89 = Good → Strong explanatory power.


0.90–0.94 = Excellent → High reliability, likely trustworthy.


0.95–1.00 = Possibly Overfitted → Model may be memorizing noise. Simplify inputs.


Rule of thumb: Higher is better, but a “perfect” score can be a red flag.

MAPE (Mean Absolute Percentage Error – forecast accuracy)
<12% = Excellent → Nothing needs to be done.


13–25% = Good → Trustworthy, small refinements possible.


26–39% = Fair → Errors noticeable. Add data, consolidate noisy channels.


40–100% = Poor → Model struggles. Provide more history, re-group spend, or add controls.



VIF (Variance Inflation Factor – multicollinearity check)
<5 = Safe → Inputs independent enough.


5–10 = Caution → Some overlap between channels, often still workable.


10 = Problematic → High correlation. Consolidate overlapping channels or remove variables.




How to Judge Trustworthiness
If R² is Good/Excellent, MAPE <25%, and VIF <10 → Model is directionally reliable for planning.


If metrics are only “Fair” or “Poor,” treat results as directional, not precise.
MMM is an estimate with error bounds — good metrics mean stronger confidence, weak metrics mean proceed cautiously.



How to Use MMM Results
Adjust budgets: Shift spend away from channels with low contribution or negative iROAS, toward those with higher incremental impact.


Evaluate saturation: Use response curves to see where spend stops being efficient.


Understand dependence on ads: If baseline is high, the brand is resilient. If marketing contribution is high, growth is ad-driven.



Verification & Back-Testing
MMM models are validated through back-testing: training on part of the data and predicting the rest.


MAPE and R² usually come from these back-tests.


Users can rerun with more history, different spend breakdowns, or added controls.


Stable results across reruns = stronger confidence.



Negative Baseline (Intercept)
A negative baseline means the model is forcing marketing to explain too much.


Causes: too many inputs, missing non-marketing controls, or noisy data.


In reality, baseline revenue cannot be negative — treat this as a modeling artifact.


Fix: Add controls, consolidate spend channels, or extend historical data.



Assistant Guidelines
Always explain what the metric means, why it matters, and what action to take.


Keep language clear, direct, and non-jargon.


Emphasize that MMM is directional, not exact.


Encourage better inputs (more data, consolidated spend, relevant controls) when metrics are weak.

Not offer any more help


`


  }


  /**
   * Generate AI insights based on the dashboard data
   * @param {Object} dashboardData - The complete dashboard data object
   * @returns {Promise<string>} AI-generated insights text
   */
  async generateInsights(dashboardData) {
    try {
      // Enforce cooldown
      const now = Date.now();
      if (now - this.lastRequestTime < this.config.requestCooldown) {
        throw new Error("Please wait before making another request");
      }
      this.lastRequestTime = now;

      // Prepare data context
      const dataContext = this.prepareDataContext(dashboardData);
      
      // Create the prompt
      const prompt = `${this.systemPrompt}

${dataContext}

Based on the MMM statistical analysis data above, provide a comprehensive summary that includes:
1. Overall model performance assessment (R², MAPE)
2. Top performing channels and their incremental contribution
3. Key insights about channel efficiency (iROAS)
4. Strategic recommendations for budget optimization

Keep the response clear, actionable, and focused on business decisions.`;

      // Make AI request
      const payload = { 
        input: prompt, 
        model: this.config.model 
      };

      console.log("🤖 Sending request to AI service...");
      
      if (!window.domo) {
        throw new Error("Domo SDK not available");
      }

      const response = await domo.post("/domo/ai/v1/text/generation", payload);
      
      if (!response || !response.output) {
        throw new Error("No output received from AI service");
      }

      const insights = String(response.output);
      console.log("✅ AI insights generated successfully");
      
      return insights;

    } catch (error) {
      console.error("❌ Error generating AI insights:", error);
      throw error;
    }
  }

  /**
   * Prepare data context from dashboard data for AI processing
   * @param {Object} dashboardData - Dashboard data
   * @returns {string} Formatted data context
   */
  /*prepareDataContext(dashboardData) {
    const context = [];
    
    // Add metrics summary
    if (dashboardData.metrics) {
      context.push("METRICS SUMMARY:");
      context.push(`- Model R²: ${dashboardData.metrics.r2?.toFixed(3) || 'N/A'}`);
      context.push(`- MAPE: ${dashboardData.metrics.mape ? (dashboardData.metrics.mape * 100).toFixed(1) + '%' : 'N/A'}`);
      context.push(`- Incremental Revenue: $${this.formatNumber(dashboardData.metrics.incrementalRevenue)}`);
      context.push(`- Top Channel: ${dashboardData.metrics.topChannel || 'N/A'}`);
      context.push('');
    }

    // Add channel performance data (limited to top performers)
    if (dashboardData.channels && Array.isArray(dashboardData.channels)) {
      context.push("CHANNEL PERFORMANCE:");
      const topChannels = dashboardData.channels
        .slice(0, this.config.maxDataRows)
        .map(ch => {
          return `- ${ch.name}: iROAS ${ch.iroas?.toFixed(2) || 'N/A'}, Incremental Revenue $${this.formatNumber(ch.incrementalRevenue)}`;
        });
      context.push(...topChannels);
      context.push('');
    }

    // Add waterfall data summary
    if (dashboardData.waterfall && Array.isArray(dashboardData.waterfall)) {
      context.push("CONTRIBUTION BREAKDOWN:");
      const contributions = dashboardData.waterfall
        .slice(0, 5)
        .map(w => {
          return `- ${w.component || w.Component}: $${this.formatNumber(w.contribution || w.Contribution)} (${(w.percentage || w.Percentage || 0).toFixed(1)}%)`;
        });
      context.push(...contributions);
      context.push('');
    }

    return context.join('\n');
  }*/

  /**
 * Prepare data context from dashboard data for AI processing
 * NOW BASED ONLY ON METRICS
 * @param {Object} dashboardData - Dashboard data
 * @returns {string} Formatted data context
 */
prepareDataContext(dashboardData) {
  const context = [];
  
  console.log('📊 Preparing AI context based ONLY on metrics');
  
  // Add metrics summary
  if (dashboardData.metrics) {
    context.push("=== MMM STATISTICAL METRICS ===\n");
    
    // R² (Model Fit)
    const r2 = dashboardData.metrics.r2;
    context.push(`Model R²: ${r2 !== null && r2 !== undefined ? r2.toFixed(3) : 'N/A'}`);
    if (r2 !== null) {
      if (r2 >= 0.90) context.push("  → Excellent model fit");
      else if (r2 >= 0.75) context.push("  → Good model fit");
      else if (r2 >= 0.65) context.push("  → Fair model fit");
      else context.push("  → Poor model fit - model may need improvement");
    }
    
    // MAPE (Forecast Accuracy)
    const mape = dashboardData.metrics.mape;
    context.push(`\nMAPE: ${mape !== null && mape !== undefined ? (mape * 100).toFixed(1) + '%' : 'N/A'}`);
    if (mape !== null) {
      if (mape <= 0.10) context.push("  → Excellent forecast accuracy");
      else if (mape <= 0.20) context.push("  → Good forecast accuracy");
      else if (mape <= 0.30) context.push("  → Acceptable forecast accuracy");
      else context.push("  → Poor forecast accuracy - predictions may be unreliable");
    }
    
    // Incremental Revenue
    const incRevenue = dashboardData.metrics.incrementalRevenue;
    context.push(`\nIncremental Revenue: ${incRevenue ? '$' + incRevenue.toLocaleString() : 'N/A'}`);
    context.push("  → Total revenue driven by marketing spend");
    
    // Top Channel
    const topChannel = dashboardData.metrics.topChannel;
    if (topChannel) {
      context.push(`\nTop Performing Channel: ${topChannel}`);
    }
    
    // Baseline Percentage
    const baselinePercentage = dashboardData.metrics.baselinePercentage;
    const hasNegativeIntercept = dashboardData.metrics.hasNegativeIntercept;
    
    if (hasNegativeIntercept) {
      context.push(`\n⚠️ NEGATIVE BASELINE DETECTED`);
      context.push("  → The model's intercept is negative, which is unusual");
      context.push("  → This may indicate:");
      context.push("    • Model overfitting or data quality issues");
      context.push("    • Missing important control variables");
      context.push("    • Need for more historical data");
    } else if (baselinePercentage) {
      context.push(`\nMarketing Impact: +${baselinePercentage}% vs baseline`);
      context.push("  → Marketing drives this percentage increase over organic revenue");
    }
    
    context.push("\n=== END METRICS ===");
  }
  
  const contextString = context.join('\n');
  console.log('📤 AI Context prepared:', contextString);
  
  return contextString;
}

  /**
   * Format large numbers for display
   * @param {number} value - Number to format
   * @returns {string} Formatted number
   */
  formatNumber(value) {
    if (!value) return '0';
    const absValue = Math.abs(value);
    if (absValue >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (absValue >= 1000) return (value / 1000).toFixed(0) + 'K';
    return value.toFixed(0);
  }
}