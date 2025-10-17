// modules/insights/components/TabContentRenderer.js



// modules/insights/components/TabContentRenderer.js
import { StatisticalMetricCards } from './StatisticalMetricCards.js';
import { ChannelContributionChart } from './ChannelContributionChart.js';
import { BudgetOptimizerComponent } from './BudgetOptimizerComponent.js';
import { VIFResultsComponent } from './VIFResultsComponent.js';
import { CorrelationMatrixComponent } from './CorrelationMatrixComponent.js';


export class TabContentRenderer {
constructor(chartRenderer) {
this.chartRenderer = chartRenderer;
this.statisticalMetricCards = new StatisticalMetricCards();
this.channelContributionChart = new ChannelContributionChart();
this.budgetOptimizer = new BudgetOptimizerComponent();
this.vifResultsComponent = new VIFResultsComponent();
this.correlationMatrixComponent = new CorrelationMatrixComponent();
}
/**
 * Render Channel Performance tab content matching the design
 * @param {Object} data - Dashboard data
 * @returns {string} HTML string for tab content
 */
 renderChannelPerformance(data) {
return `
 <!-- Sub-navigation matching the design -->
 <div class="sub-navigation mb-8">
 <div class="flex space-x-6">
 <button id="performance-view-btn" class="view-toggle-btn justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-white hover:opacity-80 h-9 rounded-md px-3 flex items-center space-x-2 border border-gray-300" style="background-color: #9ec2e6;" data-view="performance">
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chart-column w-4 h-4">
 <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
 <path d="M18 17V9"></path>
 <path d="M13 17V5"></path>
 <path d="M8 17v-3"></path>
 </svg>
 <span>Performance View</span>
 </button>
 <button id="contribution-view-btn" class="view-toggle-btn justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-gray-100 text-gray-600 hover:bg-gray-200 h-9 rounded-md px-3 flex items-center space-x-2 border border-gray-300" data-view="contribution">
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw w-4 h-4">
 <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
 <path d="M21 3v5h-5"></path>
 <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
 <path d="M3 21v-5h5"></path>
 </svg>
 <span>Contribution View</span>
 </button>
 </div>
 </div>
 <!-- Dynamic Content Area -->
 <div id="view-content-area">
   <!-- Channel Performance Cards -->
   ${this.chartRenderer.renderChannelCards(data.channels)}
   <!-- iROAS Chart -->
   ${this.chartRenderer.renderIROASChart(data.iroas, 'iroas-chart-canvas')}
 </div>
 `;
}
/**
 * Render placeholder for other tabs with better styling
 * @param {string} tabName - Name of the tab
 * @param {string} icon - Icon for the tab
 * @returns {string} HTML string for placeholder
 */
 renderPlaceholder(tabName, icon) {
return `
 <div class="tab-placeholder text-center py-16">
 <div class="bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
 <span class="text-4xl">${icon}</span>
 </div>
 <h3 class="text-xl font-semibold text-gray-900 mb-3">${tabName}</h3>
 <p class="text-gray-600 mb-4">This section is coming in Phase 2</p>
 <div class="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
 <p class="text-sm text-blue-800">
 <strong>Coming soon:</strong> Detailed ${tabName.toLowerCase()} insights with interactive visualizations
 </p>
 </div>
 </div>
 `;
}


/**
 * Render Statistical Analysis tab
 * @param {Object} data - Dashboard data
 * @returns {string} HTML string for statistical analysis tab
 */
renderStatisticalAnalysis(data) {
  console.log('📊 Rendering Statistical Analysis tab with data:', data.metrics);
  console.log('📊 Contribution data available:', data.contribution);

  return `
    <div class="statistical-analysis-tab">
      <!-- Main Container with Title -->
      <div class="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <!-- Header Section -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">MMM Statistical Analysis</h2>
          <p class="text-gray-600">Model performance and statistical confidence metrics</p>
        </div>

           <!-- Statistical Metrics Cards -->
          ${this.statisticalMetricCards.render(data.metrics)}
        </div>

     <!-- AI Insights Section (Inicialmente oculto) -->
<div id="ai-insights-section" class="bg-white rounded-xl border border-gray-200 p-8 mb-8 hidden">
  <!-- Header Section with Close Button -->
  <div class="mb-6 flex items-start justify-between">
    <div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        <span class="inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#99ccee" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" x2="12" y1="19" y2="22"></line>
          </svg>
          AI Insights
        </span>
      </h2>
      <p class="text-gray-600">Stella's analysis of your MMM results</p>
    </div>

    <!-- Hide Section Button -->
    <button
      id="hide-ai-insights-btn"
      class="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
      title="Hide AI Insights section"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 6 6 18"></path>
        <path d="m6 6 12 12"></path>
      </svg>
      <span class="text-sm font-medium">Hide</span>
    </button>
  </div>

  <!-- AI Content Container -->
  <div id="ai-insights-content" class="prose max-w-none">
    <!-- AI generated content will be inserted here -->
    <div class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2" style="border-color: #99ccee;"></div>
      <span class="ml-3 text-gray-600">Generating insights...</span>
    </div>
  </div>
</div>

        <!-- VIF / Correlation Matrix Section (Multicollinearity Analysis) -->
        <div id="multicollinearity-section" class="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <!-- Header Section with Hide Button -->
          <div class="mb-4 flex items-start justify-between">
            <div>
              <h2 class="text-xl font-bold text-gray-900 mb-1">Multicollinearity Analysis</h2>
              <p class="text-sm text-gray-600">Variance Inflation Factor and variable correlation analysis</p>
            </div>

            <!-- Hide Section Button -->
            <button
              id="toggle-multicollinearity-btn"
              class="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Hide Multicollinearity section"
            >
              <svg id="multicollinearity-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m18 15-6-6-6 6"></path>
              </svg>
              <span id="multicollinearity-btn-text" class="font-medium">Hide</span>
            </button>
          </div>

          <!-- Collapsible Content Area -->
          <div id="multicollinearity-content">
            <!-- Sub-navigation matching Channel Performance design -->
            <div class="sub-navigation mb-6">
              <div class="flex space-x-6">
                <button id="vif-view-btn" class="vif-view-toggle-btn justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-white hover:opacity-80 h-9 rounded-md px-3 flex items-center space-x-2 border border-gray-300" style="background-color: #9ec2e6;" data-vif-view="vif">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bar-chart w-4 h-4">
                    <line x1="12" x2="12" y1="20" y2="10"></line>
                    <line x1="18" x2="18" y1="20" y2="4"></line>
                    <line x1="6" x2="6" y1="20" y2="16"></line>
                  </svg>
                  <span>Variance Inflation Factor</span>
                </button>
                <button id="correlation-view-btn" class="vif-view-toggle-btn justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-gray-100 text-gray-600 hover:bg-gray-200 h-9 rounded-md px-3 flex items-center space-x-2 border border-gray-300" data-vif-view="correlation">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-grid-3x3 w-4 h-4">
                    <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                    <path d="M3 9h18"></path>
                    <path d="M3 15h18"></path>
                    <path d="M9 3v18"></path>
                    <path d="M15 3v18"></path>
                  </svg>
                  <span>Correlation Matrix</span>
                </button>
              </div>
            </div>

            <!-- Dynamic Content Area -->
            <div id="vif-view-content-area">
              ${data.vifResults ? this.vifResultsComponent.render(data.vifResults) :
    '<div class="bg-gray-50 p-8 rounded-lg text-center"><p class="text-gray-600">Loading VIF data...</p></div>'}
            </div>
          </div>
        </div>

      <!-- Channel Contribution Analysis Section -->
      <div id="channel-contribution-section" class="bg-white rounded-xl border border-gray-200 p-8">
        <!-- Header Section with Hide Button -->
        <div class="mb-6 flex items-start justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Channel Contribution Analysis</h2>
            <p class="text-gray-600">How each channel contributes to total incremental revenue</p>
          </div>

          <!-- Hide Section Button -->
          <button
            id="toggle-channel-contribution-btn"
            class="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Hide Channel Contribution section"
          >
            <svg id="channel-contribution-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m18 15-6-6-6 6"></path>
            </svg>
            <span id="channel-contribution-btn-text" class="font-medium">Hide</span>
          </button>
        </div>

        <!-- Collapsible Content Area -->
        <div id="channel-contribution-content">
          <!-- Channel Contribution Chart -->
          ${this.channelContributionChart.render(data.contribution, 'contribution-chart-statistical')}
        </div>
      </div>
    </div>
  `;
}



/**
 * Render Budget Allocation tab
 */
 renderBudgetAllocation(data) {
return this.renderPlaceholder('Budget Allocation', '💰');
}
/**
 * Render Budget Optimizer tab
 */
 renderBudgetOptimizer(data) {
  console.log('🔧 Rendering Budget Optimizer tab');
  return this.budgetOptimizer.render(data);  }

}