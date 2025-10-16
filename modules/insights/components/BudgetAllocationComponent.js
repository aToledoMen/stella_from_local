// modules/insights/components/BudgetAllocationComponent.js

/**
 * Component for rendering the Budget Allocation interface
 * Uses the same styling as existing metric cards and charts
 */
export class BudgetAllocationComponent {
  constructor() {
    this.d3Chart = null;
  }

  /**
   * Render the complete Budget Allocation tab
   * @param {Object} data - Budget allocation data from dataset + channel performance for iROAS
   * @returns {string} HTML string for the allocation interface
   */
  render(data) {
    const budgetData = data?.budgetAllocation || null;
    const channelData = data?.channels || [];
    
    if (!budgetData || !budgetData.channels || budgetData.channels.length === 0) {
      return this.renderEmptyState();
    }

    // Merge budget data with iROAS from channel performance
    const enrichedChannels = this.mergeChannelData(budgetData.channels, channelData);
    const kpis = this.calculateKPIs(enrichedChannels);

    return `
      <div class="budget-allocation-container">
        <!-- Header Section -->
        <!-- KPI Cards - Same style as metric cards -->
        <div id="budget-allocation-kpis" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          ${this.renderKPICard('Total Budget', this.formatCurrency(kpis.totalBudget), this.getTotalBudgetIcon())}
          ${this.renderKPICard('Recommended Allocation', this.formatCurrency(kpis.recommendedAllocation), this.getRecommendedIcon())}
          ${this.renderKPICard('Unallocated', this.formatCurrency(kpis.unallocated), this.getUnallocatedIcon())}
        </div>

        <!-- Model Recommended Budget Allocation Section -->
        <div class="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <div class="mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Model Recommended Budget Allocation</h3>
            <p class="text-sm text-gray-600 mt-1">Allocations based on incremental ROAS (iROAS) from your Marketing Mix Model</p>
          </div>

          <!-- Channel Rankings -->
          <div class="space-y-4">
            ${this.renderChannelRankings(enrichedChannels, kpis.recommendedAllocation)}
          </div>
        </div>

        <!-- D3 Chart Section - Same style as iROAS chart -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="chart-header mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-blue-300">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              Recommended Budget by Channel
            </h3>
            <p class="text-sm text-gray-600">Optimized allocation for maximum ROI</p>
          </div>
          
          <!-- D3 Chart Container -->
          <div id="budget-allocation-d3-chart" class="chart-area w-full"></div>
        </div>
      </div>
    `;
  }

  /**
   * Merge budget data with iROAS from channel performance data
   * @param {Array} budgetChannels - Channels from budget dataset
   * @param {Array} performanceChannels - Channels from performance dataset
   * @returns {Array} Enriched channel data
   */
  mergeChannelData(budgetChannels, performanceChannels) {
    return budgetChannels.map(budgetChannel => {
      const channelName = budgetChannel.Channel || budgetChannel.channel;
      
      // Find matching channel in performance data
      const perfChannel = performanceChannels.find(ch => 
        (ch.channel_name || ch.name || ch.Channel) === channelName
      );
      
      return {
        name: channelName,
        optimized_budget: budgetChannel.optimized_budget || 0,
        current_budget: budgetChannel.current_budget || 0,
        change_pct: budgetChannel.change_pct || 0,
        iroas: perfChannel ? (perfChannel.iroas || perfChannel.iROAS || 0) : 0
      };
    });
  }

  /**
   * Get Total Budget icon SVG - same as existing metric cards
   * @returns {string} SVG icon
   */
  getTotalBudgetIcon() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-blue-300">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    `;
  }

  /**
   * Get Recommended Allocation icon SVG
   * @returns {string} SVG icon
   */
  getRecommendedIcon() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-green-300">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2"></circle>
        </svg>
    `;
  }

  /**
   * Get Unallocated icon SVG
   * @returns {string} SVG icon
   */
  getUnallocatedIcon() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-blue-300">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
        <polyline points="16 7 22 7 22 13"></polyline>
      </svg>
    `;
  }

  /**
   * Calculate KPIs from budget data
   * @param {Array} channels - Enriched channel data
   * @returns {Object} Calculated KPIs
   */
  calculateKPIs(channels) {
    const totalBudget = channels.reduce((sum, ch) => sum + (ch.current_budget || 0), 0);
    const recommendedAllocation = channels.reduce((sum, ch) => sum + (ch.optimized_budget || 0), 0);
    const unallocated = totalBudget - recommendedAllocation;

    return {
      totalBudget: totalBudget,
      recommendedAllocation: recommendedAllocation,
      unallocated: unallocated
    };
  }

  /**
   * Render a KPI card - SAME STYLE as MetricCardsComponent
   * @param {string} title - KPI title
   * @param {string} value - KPI value (already formatted)
   * @param {string} iconSvg - SVG icon HTML
   * @returns {string} HTML for KPI card
   */
  renderKPICard(title, value, iconSvg) {
    return `
      <div class="metric-card bg-white rounded-xl border border-gray-100 px-6 py-3 shadow-sm hover:shadow-md transition-all duration-200">
        <!-- Icon and Value in same line -->
        <div class="flex items-center gap-2 mb-1">
          ${iconSvg}
          <span class="text-sm font-bold text-gray-800 truncate max-w-[200px]" title="${value}">${value}</span>
        </div>
        <!-- Title below -->
        <div class="text-sm font-medium text-gray-600">${title}</div>
      </div>
    `;
  }

  /**
   * Render channel rankings list
   * @param {Array} channels - Enriched channel data
   * @param {number} totalAllocation - Total recommended allocation for percentage calculation
   * @returns {string} HTML for channel rankings
   */
  renderChannelRankings(channels, totalAllocation) {
    // Sort channels by optimized budget (highest first)
    const sortedChannels = [...channels].sort((a, b) => 
      (b.optimized_budget || 0) - (a.optimized_budget || 0)
    );

    return sortedChannels.map(channel => {

  // Get the raw percentage change value from the channel object,
// fallback to 0 if undefined or null
const rawChangePct = channel.change_pct ?? 0;

let rounded = Number(rawChangePct.toFixed(1));
// 2️⃣ Normaliza -0.0 a 0
if (Object.is(rounded, -0)) {
  rounded = 0;
}

const sign = rounded > 0 ? '+' : '';
const changeText = `${sign}${rounded}% vs current`;


// Normalize very small values and negative zero to exactly 0
// This avoids displaying "-0.0%" or similar cases
/*const changePct = Math.abs(rawChangePct) < 0.0000001 ? 0 : rawChangePct;

// Determine the sign to display:
// '+' for positive numbers, nothing for 0 or negative values
let sign = '';
if (changePct > 1) {
  sign = '+';
} else if (changePct <  0.003) {
  sign = ''; // negative sign will be included by toFixed()
} else {
  sign = ''; // no sign for exact zero
}

// Ensure display value is exactly zero if very small (e.g., -0.00001)
const displayValue = Math.abs(changePct) < 0.0000001 ? 0 : changePct;

// Format the final text string to display in the UI
const changeText = `${sign}${displayValue.toFixed(1)}% vs current`;*/


      return `
        <div class="flex items-center justify-between py-4 px-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <div class="flex items-center gap-3">
            <span class="text-base text-sm  text-gray-900">${channel.name}</span>
            <span class="text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
              iROAS: ${channel.iroas.toFixed(1)}x
            </span>
          </div>
          <div class="text-right">
            <div class="text-sm font-bold text-gray-900">$ ${this.formatNumber(channel.optimized_budget)}</div>
   <div class="text-xs text-gray-500">${changeText}</div>          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Render empty state when no data available
   * @returns {string} HTML for empty state
   */
  renderEmptyState() {
    return `
      <div class="budget-allocation-container">
        <div class="text-center py-16">
          <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No Budget Allocation Data</h3>
          <p class="text-gray-600 mb-4">Budget allocation data is not yet available. Please complete the MMM analysis first.</p>
        </div>
      </div>
    `;
  }
 

  
/**
 * Render D3 grouped bar chart - Current vs Recommended Budget
 * @param {Array} channels - Enriched channel data
 */
/*renderD3Chart(channels) {
  const chartId = 'budget-allocation-d3-chart';
  const container = d3.select(`#${chartId}`);
  
  if (container.empty()) {
    console.error('D3 chart container not found');
    return;
  }

  // Clear existing chart
  container.selectAll('*').remove();

  // Sort channels by optimized budget (highest first)
  const sortedChannels = [...channels].sort((a, b) => 
    (b.optimized_budget || 0) - (a.optimized_budget || 0)
  );

  // Chart dimensions - responsive to container
  const margin = { top: 40, right: 120, bottom: 80, left: 70 };
  const parentWidth = container.node().parentElement.clientWidth;
  const containerWidth = parentWidth > 0 ? Math.min(parentWidth, parentWidth - 40) : 750;
  const width = containerWidth - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create SVG
  const svg = container
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .style('background', '#fff');

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // X Scale for channel groups
  const x0 = d3.scaleBand()
    .domain(sortedChannels.map(d => d.name))
    .range([0, width])
    .padding(0.2);

  // X Scale for bars within each group (current vs recommended)
  const x1 = d3.scaleBand()
    .domain(['current', 'recommended'])
    .range([0, x0.bandwidth()])
    .padding(0.1);

  // Y Scale
  const maxBudget = d3.max(sortedChannels, d => 
    Math.max(d.current_budget || 0, d.optimized_budget || 0)
  ) || 100000;
  
  const yScale = d3.scaleLinear()
    .domain([0, maxBudget * 1.2])
    .range([height, 0]);

  // Color scheme - UPDATED COLORS
  const colors = {
    current: '#D1D5DB',      // Lighter gray for current
    recommended: '#9ec2e6'   // Domo blue for recommended
  };

  // Grid lines (horizontal only) - DASHED
  g.append('g')
    .attr('class', 'grid')
    .style('stroke', '#e5e7eb')
    .style('stroke-width', '1')
    .style('stroke-dasharray', '3,3')
    .call(d3.axisLeft(yScale)
      .ticks(6)
      .tickSize(-width)
      .tickFormat(''))
    .select('.domain')
    .remove();

  // X Axis - horizontal with wrapped labels
  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x0))
    .style('color', '#e5e7eb')
    .selectAll('text')
    .remove();
  
  // Add custom axis labels with wrapping
  g.selectAll('.x-axis-label')
    .data(sortedChannels)
    .enter()
    .append('text')
    .attr('class', 'x-axis-label')
    .attr('x', d => x0(d.name) + x0.bandwidth() / 2)
    .attr('y', height + 10)
    .style('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('fill', '#374151')
    .style('font-weight', '500')
    .each(function(d) {
      const textEl = d3.select(this);
      const fullText = d.name;
      const words = fullText.split(/\s+/);

      if (words.length === 1) {
        textEl.append('tspan')
          .attr('x', x0(d.name) + x0.bandwidth() / 2)
          .attr('dy', '0.71em')
          .text(fullText);
      } else {
        const mid = Math.ceil(words.length / 2);
        const line1 = words.slice(0, mid).join(' ');
        const line2 = words.slice(mid).join(' ');

        textEl.append('tspan')
          .attr('x', x0(d.name) + x0.bandwidth() / 2)
          .attr('dy', '0.71em')
          .text(line1);

        textEl.append('tspan')
          .attr('x', x0(d.name) + x0.bandwidth() / 2)
          .attr('dy', '1.1em')
          .text(line2);
      }
    });

  // Y Axis
  g.append('g')
    .call(d3.axisLeft(yScale)
      .tickFormat(d => '$' + (d / 1000) + 'K')
      .ticks(6))
    .style('color', '#e5e7eb')
    .selectAll('text')
    .style('font-size', '11px')
    .style('fill', '#6b7280');

  g.selectAll('.domain')
    .style('stroke', '#9ca3af')
    .style('stroke-width', 1.5);
  
  g.selectAll('.tick line')
    .style('stroke', '#d1d5db')
    .style('stroke-dasharray', '3,3');

  // Create tooltip
  let tooltip = d3.select('#budget-allocation-tooltip');
  if (tooltip.empty()) {
    tooltip = container
      .append('div')
      .attr('id', 'budget-allocation-tooltip')
      .style('position', 'absolute')
      .style('background', 'white')
      .style('border', '1px solid #d1d5db')
      .style('border-radius', '8px')
      .style('padding', '8px 12px')
      .style('font-size', '14px')
      .style('box-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000);
  }

  const self = this;

  // Draw grouped bars for each channel
  sortedChannels.forEach(channel => {
    const channelGroup = g.append('g')
      .attr('transform', `translate(${x0(channel.name)},0)`);

    // Current Budget Bar (Light Gray)
    const currentBudget = channel.current_budget || 0;
    const currentBarHeight = height - yScale(currentBudget);
    const currentBarY = yScale(currentBudget);

    const currentHighlight = channelGroup.append('rect')
      .attr('x', x1('current'))
      .attr('y', 0)
      .attr('width', x1.bandwidth())
      .attr('height', height)
      .style('fill', '#f3f4f6')
      .style('opacity', 0)
      .style('pointer-events', 'none');

    channelGroup.append('rect')
      .attr('x', x1('current'))
      .attr('y', currentBarY)
      .attr('width', x1.bandwidth())
      .attr('height', currentBarHeight)
      .style('fill', colors.current)
      .style('cursor', 'pointer')
      .on('mouseover', function(event) {
        currentHighlight.transition().duration(200).style('opacity', 1);
     // Calculate change percentage
    let changePct = currentBudget > 0 
      ? ((recommendedBudget - currentBudget) / currentBudget * 100)
      : 0;
    
    // Round to 1 decimal
    let roundedChangePct = Number(changePct.toFixed(1));
    
   // Normalize very small values (including -0.0, -0.00001, etc.) to exactly 0
    if (Math.abs(roundedChangePct) < 0.05) {
      roundedChangePct = 0;
    } 
        // Determine sign: '+' for positive, nothing for 0 or negative
    const changeSign = roundedChangePct > 0 ? '+' : '';
    
    tooltip
      .style('opacity', 1)
      .html(`
        <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${channel.name}</div>
        <div style="color: #6b7280; font-size: 12px; margin-bottom: 2px;">Recommended Budget</div>
        <div style="color: #9ec2e6; font-weight: 600; font-size: 16px; margin-bottom: 4px;">
          $${self.formatNumber(recommendedBudget)}
        </div>
        <div style="color: ${roundedChangePct >= 0 ? '#10b981' : '#ef4444'}; font-size: 11px; font-weight: 500;">
          ${changeSign}${roundedChangePct}% vs current
        </div>
      `)
      .style('left', (event.pageX + 15) + 'px')
      .style('top', (event.pageY - 15) + 'px');
  })
  .on('mouseout', function() {
    recommendedHighlight.transition().duration(200).style('opacity', 0);
    tooltip.transition().duration(200).style('opacity', 0);
  });

    // Value label for current budget
    if (currentBudget > 0) {
      channelGroup.append('text')
        .attr('x', x1('current') + x1.bandwidth() / 2)
        .attr('y', currentBarY - 6)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('font-weight', '600')
        .style('fill', '#6b7280')
        .style('pointer-events', 'none')
        .text('$' + self.formatNumber(currentBudget));
    }

    // Recommended Budget Bar (Domo Blue)
    const recommendedBudget = channel.optimized_budget || 0;
    const recommendedBarHeight = height - yScale(recommendedBudget);
    const recommendedBarY = yScale(recommendedBudget);

    const recommendedHighlight = channelGroup.append('rect')
      .attr('x', x1('recommended'))
      .attr('y', 0)
      .attr('width', x1.bandwidth())
      .attr('height', height)
      .style('fill', '#dbeafe')
      .style('opacity', 0)
      .style('pointer-events', 'none');

    channelGroup.append('rect')
      .attr('x', x1('recommended'))
      .attr('y', recommendedBarY)
      .attr('width', x1.bandwidth())
      .attr('height', recommendedBarHeight)
      .style('fill', colors.recommended)
      .style('cursor', 'pointer')
      .on('mouseover', function(event) {
        recommendedHighlight.transition().duration(200).style('opacity', 1);
        
        const changePct = currentBudget > 0 
          ? ((recommendedBudget - currentBudget) / currentBudget * 100).toFixed(1)
          : 0;
        const changeSign = changePct > 0 ? '+' : '';
        
        tooltip
          .style('opacity', 1)
          .html(`
            <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${channel.name}</div>
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 2px;">Recommended Budget</div>
            <div style="color: #9ec2e6; font-weight: 600; font-size: 16px; margin-bottom: 4px;">
              $${self.formatNumber(recommendedBudget)}
            </div>
            <div style="color: ${changePct >= 0 ? '#10b981' : '#ef4444'}; font-size: 11px; font-weight: 500;">
              ${changeSign}${changePct}% vs current
            </div>
          `)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 15) + 'px');
      })
      .on('mouseout', function() {
        recommendedHighlight.transition().duration(200).style('opacity', 0);
        tooltip.transition().duration(200).style('opacity', 0);
      });

    // Value label for recommended budget
    if (recommendedBudget > 0) {
      channelGroup.append('text')
        .attr('x', x1('recommended') + x1.bandwidth() / 2)
        .attr('y', recommendedBarY - 6)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('font-weight', '600')
        .style('fill', '#1f2937')
        .style('pointer-events', 'none')
        .text('$' + self.formatNumber(recommendedBudget));
    }
  });

  // Add Legend - SMALLER FONT SIZE
  const legend = svg.append('g')
    .attr('transform', `translate(${width + margin.left + 20}, ${margin.top})`);

  // Current Budget Legend
  legend.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 16)
    .attr('height', 16)
    .attr('rx', 2)
    .style('fill', colors.current);

  legend.append('text')
    .attr('x', 22)
    .attr('y', 12)
    .style('font-size', '11px')  // Reduced from 12px
    .style('fill', '#374151')
    .text('Current');

  // Recommended Budget Legend
  legend.append('rect')
    .attr('x', 0)
    .attr('y', 25)
    .attr('width', 16)
    .attr('height', 16)
    .attr('rx', 2)
    .style('fill', colors.recommended);

  legend.append('text')
    .attr('x', 22)
    .attr('y', 37)
    .style('font-size', '11px')  // Reduced from 12px
    .style('fill', '#374151')
    .text('Recommended');
}*/

/**
 * Render D3 grouped bar chart - Current vs Recommended Budget
 * @param {Array} channels - Enriched channel data
 */
renderD3Chart(channels) {
  const chartId = 'budget-allocation-d3-chart';
  const container = d3.select(`#${chartId}`);
  
  if (container.empty()) {
    console.error('D3 chart container not found');
    return;
  }

  // Clear existing chart
  container.selectAll('*').remove();

  // Sort channels by optimized budget (highest first)
  const sortedChannels = [...channels].sort((a, b) => 
    (b.optimized_budget || 0) - (a.optimized_budget || 0)
  );

  // Chart dimensions - responsive to container
  const margin = { top: 40, right: 120, bottom: 80, left: 70 };
  const parentWidth = container.node().parentElement.clientWidth;
  const containerWidth = parentWidth > 0 ? Math.min(parentWidth, parentWidth - 40) : 750;
  const width = containerWidth - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create SVG
  const svg = container
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .style('background', '#fff');

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // X Scale for channel groups
  const x0 = d3.scaleBand()
    .domain(sortedChannels.map(d => d.name))
    .range([0, width])
    .padding(0.2);

  // X Scale for bars within each group (current vs recommended)
  const x1 = d3.scaleBand()
    .domain(['current', 'recommended'])
    .range([0, x0.bandwidth()])
    .padding(0.1);

  // Y Scale
  const maxBudget = d3.max(sortedChannels, d => 
    Math.max(d.current_budget || 0, d.optimized_budget || 0)
  ) || 100000;
  
  const yScale = d3.scaleLinear()
    .domain([0, maxBudget * 1.2])
    .range([height, 0]);

  // Color scheme
  const colors = {
    current: '#D1D5DB',      // Lighter gray for current
    recommended: '#9ec2e6'   // Domo blue for recommended
  };

  // Grid lines (horizontal only) - DASHED
  g.append('g')
    .attr('class', 'grid')
    .style('stroke', '#e5e7eb')
    .style('stroke-width', '1')
    .style('stroke-dasharray', '3,3')
    .call(d3.axisLeft(yScale)
      .ticks(6)
      .tickSize(-width)
      .tickFormat(''))
    .select('.domain')
    .remove();

  // X Axis - horizontal with wrapped labels
  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x0))
    .style('color', '#e5e7eb')
    .selectAll('text')
    .remove();
  
  // Add custom axis labels with wrapping
  g.selectAll('.x-axis-label')
    .data(sortedChannels)
    .enter()
    .append('text')
    .attr('class', 'x-axis-label')
    .attr('x', d => x0(d.name) + x0.bandwidth() / 2)
    .attr('y', height + 10)
    .style('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('fill', '#374151')
    .style('font-weight', '500')
    .each(function(d) {
      const textEl = d3.select(this);
      const fullText = d.name;
      const words = fullText.split(/\s+/);

      if (words.length === 1) {
        textEl.append('tspan')
          .attr('x', x0(d.name) + x0.bandwidth() / 2)
          .attr('dy', '0.71em')
          .text(fullText);
      } else {
        const mid = Math.ceil(words.length / 2);
        const line1 = words.slice(0, mid).join(' ');
        const line2 = words.slice(mid).join(' ');

        textEl.append('tspan')
          .attr('x', x0(d.name) + x0.bandwidth() / 2)
          .attr('dy', '0.71em')
          .text(line1);

        textEl.append('tspan')
          .attr('x', x0(d.name) + x0.bandwidth() / 2)
          .attr('dy', '1.1em')
          .text(line2);
      }
    });

  // Y Axis
  g.append('g')
    .call(d3.axisLeft(yScale)
      .tickFormat(d => '$' + (d / 1000) + 'K')
      .ticks(6))
    .style('color', '#e5e7eb')
    .selectAll('text')
    .style('font-size', '11px')
    .style('fill', '#6b7280');

  g.selectAll('.domain')
    .style('stroke', '#9ca3af')
    .style('stroke-width', 1.5);
  
  g.selectAll('.tick line')
    .style('stroke', '#d1d5db')
    .style('stroke-dasharray', '3,3');

  // Create tooltip
  let tooltip = d3.select('#budget-allocation-tooltip');
  if (tooltip.empty()) {
    tooltip = container
      .append('div')
      .attr('id', 'budget-allocation-tooltip')
      .style('position', 'absolute')
      .style('background', 'white')
      .style('border', '1px solid #d1d5db')
      .style('border-radius', '8px')
      .style('padding', '8px 12px')
      .style('font-size', '14px')
      .style('box-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000);
  }

  const self = this;

  // Draw grouped bars for each channel
  sortedChannels.forEach(channel => {
    const channelGroup = g.append('g')
      .attr('transform', `translate(${x0(channel.name)},0)`);

    // Current Budget Bar (Light Gray)
    const currentBudget = channel.current_budget || 0;
    const currentBarHeight = height - yScale(currentBudget);
    const currentBarY = yScale(currentBudget);

    // Background highlight for current bar
    const currentHighlight = channelGroup.append('rect')
      .attr('class', 'bar-highlight-current')
      .attr('x', x1('current'))
      .attr('y', 0)
      .attr('width', x1.bandwidth())
      .attr('height', height)
      .style('fill', '#f3f4f6')
      .style('opacity', 0)
      .style('pointer-events', 'none');

    // Current bar
    channelGroup.append('rect')
      .attr('class', 'bar-current')
      .attr('x', x1('current'))
      .attr('y', currentBarY)
      .attr('width', x1.bandwidth())
      .attr('height', currentBarHeight)
      .style('fill', colors.current)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event) {
        // Hide all highlights first
        g.selectAll('.bar-highlight-current').style('opacity', 0);
        g.selectAll('.bar-highlight-recommended').style('opacity', 0);
        
        // Show only this highlight
        currentHighlight.style('opacity', 1);
        
        tooltip
          .style('opacity', 1)
          .html(`
            <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${channel.name}</div>
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 2px;">Current Budget</div>
            <div style="color: #9CA3AF; font-weight: 600; font-size: 16px;">
              $${self.formatNumber(currentBudget)}
            </div>
          `)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 15) + 'px');
      })
      .on('mouseleave', function() {
        currentHighlight.style('opacity', 0);
        tooltip.style('opacity', 0);
      });

    // Value label for current budget
    if (currentBudget > 0) {
      channelGroup.append('text')
        .attr('x', x1('current') + x1.bandwidth() / 2)
        .attr('y', currentBarY - 6)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('font-weight', '600')
        .style('fill', '#6b7280')
        .style('pointer-events', 'none')
        .text('$' + self.formatNumber(currentBudget));
    }

    // Recommended Budget Bar (Domo Blue)
    const recommendedBudget = channel.optimized_budget || 0;
    const recommendedBarHeight = height - yScale(recommendedBudget);
    const recommendedBarY = yScale(recommendedBudget);

    // Background highlight for recommended bar
    const recommendedHighlight = channelGroup.append('rect')
      .attr('class', 'bar-highlight-recommended')
      .attr('x', x1('recommended'))
      .attr('y', 0)
      .attr('width', x1.bandwidth())
      .attr('height', height)
      .style('fill', '#dbeafe')
      .style('opacity', 0)
      .style('pointer-events', 'none');

    // Recommended bar
    channelGroup.append('rect')
      .attr('class', 'bar-recommended')
      .attr('x', x1('recommended'))
      .attr('y', recommendedBarY)
      .attr('width', x1.bandwidth())
      .attr('height', recommendedBarHeight)
      .style('fill', colors.recommended)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event) {
        // Hide all highlights first
        g.selectAll('.bar-highlight-current').style('opacity', 0);
        g.selectAll('.bar-highlight-recommended').style('opacity', 0);
        
        // Show only this highlight
        recommendedHighlight.style('opacity', 1);
        
        // Calculate change percentage
        let changePct = currentBudget > 0 
          ? ((recommendedBudget - currentBudget) / currentBudget * 100)
          : 0;
        
        // Round to 1 decimal
        let roundedChangePct = Number(changePct.toFixed(1));
        
        // Normalize very small values (including -0.0, -0.00001, etc.) to exactly 0
        if (Math.abs(roundedChangePct) < 0.05) {
          roundedChangePct = 0;
        }
        
        // Determine sign: '+' for positive, nothing for 0 or negative
        const changeSign = roundedChangePct > 0 ? '+' : '';
        
        tooltip
          .style('opacity', 1)
          .html(`
            <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${channel.name}</div>
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 2px;">Recommended Budget</div>
            <div style="color: #9ec2e6; font-weight: 600; font-size: 16px; margin-bottom: 4px;">
              $${self.formatNumber(recommendedBudget)}
            </div>
            <div style="color: ${roundedChangePct >= 0 ? '#10b981' : '#ef4444'}; font-size: 11px; font-weight: 500;">
              ${changeSign}${roundedChangePct}% vs current
            </div>
          `)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 15) + 'px');
      })
      .on('mouseleave', function() {
        recommendedHighlight.style('opacity', 0);
        tooltip.style('opacity', 0);
      });

    // Value label for recommended budget
    if (recommendedBudget > 0) {
      channelGroup.append('text')
        .attr('x', x1('recommended') + x1.bandwidth() / 2)
        .attr('y', recommendedBarY - 6)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('font-weight', '600')
        .style('fill', '#1f2937')
        .style('pointer-events', 'none')
        .text('$' + self.formatNumber(recommendedBudget));
    }
  });

  // Add Legend - SMALLER FONT SIZE
  const legend = svg.append('g')
    .attr('transform', `translate(${width + margin.left + 20}, ${margin.top})`);

  // Current Budget Legend
  legend.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 16)
    .attr('height', 16)
    .attr('rx', 2)
    .style('fill', colors.current);

  legend.append('text')
    .attr('x', 22)
    .attr('y', 12)
    .style('font-size', '11px')
    .style('fill', '#374151')
    .text('Current');

  // Recommended Budget Legend
  legend.append('rect')
    .attr('x', 0)
    .attr('y', 25)
    .attr('width', 16)
    .attr('height', 16)
    .attr('rx', 2)
    .style('fill', colors.recommended);

  legend.append('text')
    .attr('x', 22)
    .attr('y', 37)
    .style('font-size', '11px')
    .style('fill', '#374151')
    .text('Recommended');
}
  
/**
 * Format currency value
 * @param {number} value - Currency value
 * @returns {string} Formatted currency
 */
formatCurrency(value) {
  // Handle zero case - no dollar sign
  if (Math.abs(value) < 0.01) {
    return '$ 0';
  }
  
  if (value >= 1000000) {
    return '$' + (value / 1000000).toFixed(2) + 'M';
  } else if (value >= 1000) {
    return '$' + (value / 1000).toFixed(0) + 'K';
  }
  return '$' + value.toFixed(0);
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