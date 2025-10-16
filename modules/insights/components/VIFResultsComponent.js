// modules/insights/components/VIFResultsComponent.js

export class VIFResultsComponent {
  constructor() {
    this.chartId = 'vif-chart-' + Date.now();
  }

  /**
   * Render VIF Results visualization
   * @param {Array} vifData - VIF results data
   * @returns {string} HTML string for VIF chart
   */
  render(vifData) {
    if (!vifData || vifData.length === 0) {
      return `
        <div class="bg-gray-50 p-8 rounded-lg text-center">
          <p class="text-gray-600">No VIF data available</p>
        </div>
      `;
    }

    const html = `
      <div id="${this.chartId}" class="vif-chart bg-white rounded-xl border border-gray-200 p-4">
        <!-- Chart Header -->
        <div class="chart-header mb-4">
          <h3 class="text-base font-semibold text-gray-900 mb-1">Variance Inflation Factor by Variable</h3>
          <p class="text-xs text-gray-600">VIF values indicate multicollinearity between variables</p>
        </div>

        <!-- D3 Chart Container -->
        <div id="${this.chartId}-svg" class="chart-area w-full"></div>

        <!-- Legend -->
        <div class="flex items-center justify-end gap-4 mt-3 text-xs">
          <div class="flex items-center gap-1.5">
            <div class="w-2.5 h-2.5 rounded" style="background-color: #34d399;"></div>
            <span class="text-gray-600">Channel</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-2.5 h-2.5 rounded" style="background-color: #60a5fa;"></div>
            <span class="text-gray-600">Control</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-orange-500 font-semibold text-sm">---</span>
            <span class="text-gray-600">Moderate (5)</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-red-500 font-semibold text-sm">---</span>
            <span class="text-gray-600">High (10)</span>
          </div>
        </div>
      </div>
    `;

    // Create chart after DOM insertion
    setTimeout(() => {
      this.createVIFChart(vifData);
    }, 300);

    return html;
  }

  /**
   * Create VIF horizontal bar chart with D3
   * @param {Array} data - VIF data
   */
  createVIFChart(data) {
    if (typeof d3 === 'undefined') {
      console.error('D3.js not loaded');
      return;
    }

    const container = d3.select(`#${this.chartId}-svg`);
    if (container.empty()) {
      console.error(`Container #${this.chartId}-svg not found`);
      return;
    }

    // Clear container
    container.selectAll('*').remove();

    // Sort data by VIF value descending
    const sortedData = [...data].sort((a, b) => b.VIF - a.VIF);

    console.log('📊 VIF Chart Data:', sortedData);

    // Chart dimensions - Compact size
    const margin = { top: 15, right: 80, bottom: 35, left: 160 };
    const parentElement = container.node().parentElement;
    const width = parentElement.clientWidth - margin.left - margin.right - 20;
    const height = Math.max(300, sortedData.length * 28) - margin.top - margin.bottom; // Reduced bar spacing

    // Create SVG
    const svg = container
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background', '#fff')
      .style('max-width', '100%');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const yScale = d3.scaleBand()
      .domain(sortedData.map(d => d.Feature))
      .range([0, height])
      .padding(0.3);

    const maxVif = d3.max(sortedData, d => d.VIF);
    const xScale = d3.scaleLinear()
      .domain([0, Math.max(maxVif * 1.1, 11)])
      .range([0, width]);

    // Grid lines
    g.selectAll('.grid-line')
      .data(xScale.ticks(6))
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', height)
      .style('stroke', '#e5e7eb')
      .style('stroke-width', 1)
      .style('stroke-dasharray', '3,3');

    // Reference lines
    // Moderate line (VIF = 5)
    g.append('line')
      .attr('x1', xScale(5))
      .attr('x2', xScale(5))
      .attr('y1', 0)
      .attr('y2', height)
      .style('stroke', '#f59e0b')
      .style('stroke-width', 2)
      .style('stroke-dasharray', '8,4');

    // High line (VIF = 10)
    g.append('line')
      .attr('x1', xScale(10))
      .attr('x2', xScale(10))
      .attr('y1', 0)
      .attr('y2', height)
      .style('stroke', '#dc2626')
      .style('stroke-width', 2)
      .style('stroke-dasharray', '8,4');

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .style('color', '#9ca3af')
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', '#6b7280');

    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .style('fill', '#374151')
      .text('VIF Value');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .style('color', '#9ca3af')
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', '#374151')
      .style('font-weight', '500');

    g.selectAll('.domain').style('stroke', '#9ca3af');
    g.selectAll('.tick line').style('stroke', '#d1d5db');

    // Tooltip
    let tooltip = d3.select(`#${this.chartId}-tooltip`);
    if (tooltip.empty()) {
      tooltip = d3.select(`#${this.chartId}`)
        .append('div')
        .attr('id', `${this.chartId}-tooltip`)
        .style('position', 'absolute')
        .style('background', 'white')
        .style('border', '1px solid #d1d5db')
        .style('border-radius', '8px')
        .style('padding', '8px 12px')
        .style('font-size', '13px')
        .style('box-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('z-index', 1000);
    }

    // Draw bars
    sortedData.forEach(d => {
      const barY = yScale(d.Feature);
      const barHeight = yScale.bandwidth();
      const barWidth = xScale(d.VIF);

      // Determine color based on type
      const isChannel = d.Type && d.Type.toLowerCase() === 'channel';
      const barColor = isChannel ? '#34d399' : '#60a5fa';

      // Determine fill color based on VIF value
      let fillColor = barColor;
      if (d.VIF >= 10) {
        fillColor = '#fbbf24'; // Orange for high VIF
      } else if (d.VIF >= 5) {
        fillColor = barColor; // Keep original color
      }

      // Background highlight
      const highlightBg = g.append('rect')
        .attr('x', 0)
        .attr('y', barY)
        .attr('width', width)
        .attr('height', barHeight)
        .style('fill', '#f3f4f6')
        .style('opacity', 0)
        .style('pointer-events', 'none');

      // Bar
      const bar = g.append('rect')
        .attr('x', 0)
        .attr('y', barY)
        .attr('width', 0)
        .attr('height', barHeight)
        .attr('rx', 4)
        .style('fill', fillColor)
        .style('cursor', 'pointer');

      // Animate bar
      bar.transition()
        .duration(800)
        .attr('width', barWidth);

      // Value label
      const label = g.append('text')
        .attr('x', barWidth + 8)
        .attr('y', barY + barHeight / 2)
        .attr('dy', '0.35em')
        .style('font-size', '10px')
        .style('font-weight', '600')
        .style('fill', '#374151')
        .style('opacity', 0)
        .text(d.VIF.toFixed(1));

      label.transition()
        .delay(800)
        .duration(400)
        .style('opacity', 1);

      // Interaction area
      g.append('rect')
        .attr('x', 0)
        .attr('y', barY)
        .attr('width', width)
        .attr('height', barHeight)
        .style('fill', 'transparent')
        .style('cursor', 'pointer')
        .on('mouseover', function(event) {
          highlightBg.transition().duration(200).style('opacity', 1);

          let status = 'Low';
          let statusColor = '#10b981';
          if (d.VIF >= 10) {
            status = 'High';
            statusColor = '#dc2626';
          } else if (d.VIF >= 5) {
            status = 'Moderate';
            statusColor = '#f59e0b';
          }

          tooltip
            .style('opacity', 1)
            .html(`
              <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">
                ${d.Feature} (${d.Type || 'Unknown'})
              </div>
              <div style="color: #6b7280; font-size: 12px; margin-bottom: 2px;">
                VIF: <strong>${d.VIF.toFixed(2)}</strong>
              </div>
              <div style="color: ${statusColor}; font-size: 11px; font-weight: 600;">
                ${status} multicollinearity
              </div>
            `)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 15) + 'px');
        })
        .on('mouseout', function() {
          highlightBg.transition().duration(200).style('opacity', 0);
          tooltip.style('opacity', 0);
        });
    });
  }
}
