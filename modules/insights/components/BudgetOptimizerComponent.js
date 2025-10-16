// modules/insights/components/BudgetOptimizerComponent.js

/**
 * Component for rendering the Budget Optimizer interface
 * Handles the optimization parameters form and results display
 */
export class BudgetOptimizerComponent {
  constructor() {
    this.isOptimizing = false;
    this.optimizationResults = null;
  }

  /**
   * Render the complete Budget Optimizer tab
   * @param {Object} data - Dashboard data containing channels info
   * @returns {string} HTML string for the optimizer interface
   */
  render(data) {
    const channels = data?.channels || [];
    
    return `
      <div class="budget-optimizer-container">
        <!-- Header Section -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Budget Optimiser</h2>
              <p class="text-gray-600">Use MMM insights to optimise your budget allocation for maximum ROI</p>
            </div>
          </div>
        </div>

        <!-- Top Row: Optimization Parameters and Expected Results -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          <!-- Left Column: Optimization Parameters -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Optimisation Parameters</h3>
            
            <!-- Total Budget -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Total Budget</label>
              <input 
                type="number" 
                id="optimizer-total-budget"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="300000"
                value="300000"
                min="0"
              >
            </div>

            <!-- Timeframe -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
              <select 
                id="optimizer-timeframe"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="quarter">Quarter (3 months)</option>
                <option value="year">Year (12 months)</option>
              </select>
            </div>

            <!-- Optimization Objective (Disabled) -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Optimisation Objective</label>
              <select 
                id="optimizer-objective"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                disabled
              >
                <option value="maximize-revenue">Maximize Revenue</option>
              </select>
              <p class="mt-1 text-xs text-gray-500">Additional objectives coming in future versions</p>
            </div>
          </div>

          <!-- Right Column: Expected Results -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Expected Results</h3>
            
            <!-- Results Content Area -->
            <div id="optimizer-results-content">
              ${this.renderResultsPlaceholder()}
            </div>
          </div>
        </div>

        <!-- Full Width: Channel Constraints -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Channel Constraints</h3>
            <p class="text-sm text-gray-600 mt-1">Set minimum and maximum spend limits for each channel</p>
          </div>

          <!-- Channel Constraints List -->
          <div id="channel-constraints-list" class="space-y-6">
            ${this.renderChannelConstraints(channels)}
          </div>
        </div>

       <!-- Run Optimisation Button (Centered) -->
        <div class="flex justify-center">
          <button 
            id="run-optimization-btn"
            class="text-white bg-[#99ccee]  hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Run Optimisation</span>
          </button>
        </div>
    `;
  }

  /**
   * Render channel constraints inputs for each channel
   * @param {Array} channels - Array of channel objects
   * @returns {string} HTML for channel constraints
   */
  renderChannelConstraints(channels) {
    if (!channels || channels.length === 0) {
      return `
        <div class="text-center py-8 text-gray-500">
          <p>No channels available. Please complete the MMM analysis first.</p>
        </div>
      `;
    }

    return channels.map((channel, index) => {
      // Get the actual channel name from the data
      const channelName = channel.channel_name || channel.name || `Channel ${index + 1}`;
      const iroas = channel.iroas || channel.iROAS || 0;
      
      return `
        <div class="border border-gray-200 rounded-lg p-4" data-channel-index="${index}">
          <!-- Channel Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gray-900">${channelName}</span>
              <span class="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                iROAS: ${iroas.toFixed(1)}x
              </span>
            </div>
           <label class="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              class="use-default-constraints-checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              data-channel="${channelName}"
              checked
            >
            <span class="text-sm text-gray-600">Use Default Constraints (70% to 150% of current spend)</span>
          </label>
          </div>

          <!-- Min and Max Spend Inputs -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Spend</label>
              <input 
                type="number" 
                class="channel-min-spend w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-channel="${channelName}"
                placeholder="5000"
                value="5000"
                min="0"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Maximum Spend</label>
              <input 
                type="number" 
                class="channel-max-spend w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-channel="${channelName}"
                placeholder="80000"
                value="80000"
                min="0"
              >
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Render placeholder state when no optimization has been run
   * @returns {string} HTML for placeholder
   */
  renderResultsPlaceholder() {
    return `
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
        </div>
        <p class="text-gray-600 text-lg">Run optimisation to see projected results</p>
      </div>
    `;
  }

  /**
   * Render loading state during optimization
   * @param {number} progress - Progress percentage (0-100)
   * @returns {string} HTML for loading state
   */
  renderLoadingState(progress = 0) {
    return `
      <div class="flex flex-col items-center justify-center py-16">
        <!-- Loading Icon -->
        <div class="relative mb-6">
          <div class="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
          <div class="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
        </div>
        
        <!-- Status Text -->
        <p class="text-lg font-medium text-gray-700 mb-2">Optimising...</p>
        <p class="text-sm text-gray-500 mb-4">Calculating optimal allocations... (${progress}%)</p>
        
        <!-- Progress Bar -->
        <div class="w-full max-w-md bg-gray-200 rounded-full h-2">
          <div 
            class="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style="width: ${progress}%"
          ></div>
        </div>
      </div>
    `;
  }

/**
 * Render optimization results in Expected Results panel
 * @param {Object} results - Optimization results data
 * @returns {string} HTML for results display
 */
renderResults(results) {
  return `
    <div class="space-y-4">
      <!-- Top Row: Projected Revenue and Revenue Lift side by side -->
      <div class="grid grid-cols-2 gap-4">
        <!-- Projected Revenue Card -->
        <div class="bg-green-50 border border-green-200 rounded-xl p-6">
          <p class="text-sm font-medium text-green-700 mb-1">Projected Revenue</p>
          <p class="text-3xl font-bold text-green-900">$${this.formatNumber(results.projectedRevenue)}</p>
        </div>

        <!-- Revenue Lift Card -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <p class="text-sm font-medium text-blue-700 mb-1">Revenue Lift</p>
          <p class="text-3xl font-bold text-blue-900">+${results.revenueLift.toFixed(1)}%</p>
        </div>
      </div>

      <!-- Bottom Row: Average ROAS (light gray) -->
      <div class="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <p class="text-sm font-medium text-gray-700 mb-1">Average ROAS</p>
        <p class="text-2xl font-bold text-gray-900">${results.averageROAS.toFixed(2)}x</p>
      </div>
    </div>
  `;
}

  /**
   * Render detailed optimization results section (shown below the main form)
   * @param {Object} results - Optimization results with channel allocations
   * @returns {string} HTML for detailed results section
   */
  renderDetailedResults(results) {
    return `
      <div class="bg-white rounded-xl border border-gray-200 p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Optimisation Results</h2>
        
        <!-- Tab Navigation -->
        <div class="border-b border-gray-200 mb-6">
          <nav class="flex space-x-8">
            <button 
              class="optimization-result-tab border-b-2 border-blue-500 text-blue-600 py-3 px-1 font-medium text-sm"
              data-tab="budget-allocation"
            >
              Budget Allocation
            </button>
            <button 
              class="optimization-result-tab border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-3 px-1 font-medium text-sm"
              data-tab="revenue-projection"
            >
              Revenue Projection
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div id="optimization-result-content">
          ${this.renderBudgetAllocationTab(results)}
        </div>
      </div>
    `;
  }

  /**
   * Render Budget Allocation tab content
   * @param {Object} results - Optimization results
   * @returns {string} HTML for budget allocation visualization
   */
  renderBudgetAllocationTab(results) {
    const maxAllocation = Math.max(...results.channelAllocations.map(c => c.newAllocation));
    
    return `
      <div class="budget-allocation-content">
        <!-- Chart Container -->
        <div class="mb-8">
          <canvas id="budget-allocation-chart" class="w-full" height="300"></canvas>
        </div>

        <!-- Channel Details Table -->
        <div class="space-y-3">
          ${results.channelAllocations.map(channel => {
            const percentChange = ((channel.newAllocation - channel.currentAllocation) / channel.currentAllocation * 100);
            const isPositive = percentChange > 0;
            const changeColor = isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
            
            return `
              <div class="flex items-center justify-between py-3 border-b border-gray-100">
                <span class="font-medium text-gray-900">${channel.name}</span>
                <div class="flex items-center gap-4">
                  <span class="text-sm text-gray-600">
                    $${this.formatNumber(channel.currentAllocation)} → $${this.formatNumber(channel.newAllocation)}
                  </span>
                  <span class="text-sm font-medium ${changeColor} px-3 py-1 rounded-full">
                    ${isPositive ? '+' : ''}${percentChange.toFixed(1)}%
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
   * Render Revenue Projection tab content
   * @param {Object} results - Optimization results
   * @returns {string} HTML for revenue projection
   */
  renderRevenueProjectionTab(results) {
    return `
      <div class="revenue-projection-content">
        <div class="text-center py-16">
          <p class="text-gray-500">Revenue projection visualization coming soon</p>
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
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }
}