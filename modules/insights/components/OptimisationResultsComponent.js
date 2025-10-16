// modules/insights/components/OptimisationResultsComponent.js

/**
 * Component for rendering the Optimisation Results section after workflow completion
 * Displays Budget Allocation and Revenue Projection tabs with detailed results
 */
export class OptimisationResultsComponent {
  constructor() {
    this.d3Chart = null;
  }

  /**
   * Render the complete Optimisation Results section
   * @param {Object} data - Results data including channel allocations
   * @returns {string} HTML string for the results section
   */
  render(data) {
    const channelAllocations = data?.channelAllocations || [];
    
    if (!channelAllocations || channelAllocations.length === 0) {
      return ''; // Don't show section if no data
    }

    return `
      <div id="optimisation-results-section" class="bg-white rounded-xl border border-gray-200 p-8 mt-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Optimisation Results</h2>
        
       

        <!-- Tab Content -->
        <div id="optimisation-result-content">
          ${this.renderBudgetAllocationTab(channelAllocations)}
        </div>
      </div>
    `;
  }

  /**
   * Render Budget Allocation tab content
   * @param {Array} channelAllocations - Array of channel allocation objects
   * @returns {string} HTML for budget allocation visualization
   */
renderBudgetAllocationTab(channelAllocations) {
  return `
    <div class="budget-allocation-content">
      <!-- D3 Chart Container -->
      <div class="mb-8">
        <div id="optimisation-d3-chart" class="chart-area w-full"></div>
      </div>

      <!-- Channel Details Ranking -->
      <div class="space-y-3">
        ${channelAllocations.map(channel => {
          const percentChange = channel.change_pct || 0;
          
          // Normalize very small values to exactly 0
          let rounded = Number(percentChange.toFixed(1));
          if (Object.is(rounded, -0) || Math.abs(rounded) < 0.05) {
            rounded = 0;
          }
          
          const sign = rounded > 0 ? '+' : '';
          const changeText = `${sign}${rounded}%`;
          
          return `
            <div class="flex items-center justify-between py-4 px-6 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
              <div class="flex items-center gap-3">
                <span class="text-base font-medium text-gray-900">${channel.name}</span>
              </div>
              <div class="flex items-center gap-4">
                <span class="text-sm text-gray-600">
                  $${this.formatNumber(channel.currentAllocation)} → $${this.formatNumber(channel.newAllocation)}
                </span>
                <span class="text-xs font-semibold bg-slate-500 text-white px-4 py-1.5 rounded-full min-w-[70px] text-center">
                  ${changeText}
                </span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}


  /**
   * Format number with commas
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  formatNumber(num) {
    return Math.round(num).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }
}