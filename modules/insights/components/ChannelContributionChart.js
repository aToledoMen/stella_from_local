// modules/insights/components/ChannelContributionChart.js

/**
 * Component for rendering Channel Contribution Analysis chart
 * Displays a stacked area chart showing weekly channel contributions using D3.js
 */
export class ChannelContributionChart {
  constructor() {
    this.chartId = null;
  }

  /**
   * Render the complete chart container with D3 stacked area chart
   * @param {Array} weeklyData - Weekly contribution data by channel
   * @param {string} containerId - Container ID for the chart
   * @returns {string} HTML string for chart container
   */
  render(weeklyData, containerId = 'channel-contribution-chart') {
    this.chartId = containerId;

    const html = `
      <div id="${containerId}" class="channel-contribution-chart">
        <!-- D3 Chart Container -->
        <div id="${containerId}-svg" class="chart-area w-full"></div>
      </div>
    `;

    // Create D3 chart after DOM insertion
    setTimeout(() => {
      this.createStackedAreaChart(weeklyData, containerId);
    }, 100);

    return html;
  }




  /**
   * Create D3 stacked area chart matching the design
   * @param {Array} data - Weekly contribution data
   * @param {string} chartId - Chart container ID
   */
  /**
 * Create D3 stacked area chart matching the design
 * @param {Array} data - Weekly contribution data
 * @param {string} chartId - Chart container ID
 */
/**
 * Create D3 stacked area chart matching the design
 * @param {Array} data - Weekly contribution data
 * @param {string} chartId - Chart container ID
 */
createStackedAreaChart(data, chartId) {
  // Verify D3 is available
  if (typeof d3 === 'undefined') {
    console.error('D3.js not loaded');
    return;
  }

  const container = d3.select(`#${chartId}-svg`);
  if (container.empty()) {
    console.error(`Container #${chartId}-svg not found`);
    return;
  }

  // Clear container
  container.selectAll('*').remove();

  if (!data || data.length === 0) {
    container.append('div')
      .attr('class', 'text-center text-gray-500 py-8')
      .text('No contribution data available');
    return;
  }

  console.log("📊 Creating stacked area chart with data:", data);


  // Capture reference to 'this' for use in callbacks
  const self = this;

  // Chart dimensions - adjusted to make space for legend
  const margin = { top: 20, right: 150, bottom: 60, left: 60 };
  const containerWidth = container.node().parentElement.clientWidth;
  const width = (containerWidth > 0 ? containerWidth : 900) - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create SVG
  const svg = container
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .style('background', '#fff');

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Extract channels from data (all keys except 'week' and 'date')
  const channels = Object.keys(data[0]).filter(key => key !== 'week' && key !== 'date');
  
  console.log("📊 Channels found:", channels);

  // Define color palette with distinct colors for each channel
  const colorPalette = [
    '#93C5FD', '#6EE7B7', '#FCA5A5', '#86EFAC', '#A78BFA',
    '#818CF8', '#FCD34D', '#F9A8D4', '#A7F3D0', '#FDE68A'
  ];

  // Create color scale
  const color = d3.scaleOrdinal()
    .domain(channels)
    .range(colorPalette);

  // Stack the data
  const stack = d3.stack()
    .keys(channels)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

  const series = stack(data);

  // Scales
  const x = d3.scaleLinear()
    .domain([0, data.length - 1])
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
    .nice()
    .range([height, 0]);

  // Area generator with smooth curves
  const area = d3.area()
    .x((d, i) => x(i))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]))
    .curve(d3.curveMonotoneX);

 // Create tooltip with display instead of visibility
// Create tooltip with display instead of visibility
const tooltip = d3.select('body')
  .append('div')
  .attr('class', `chart-tooltip-${chartId}`)
  .style('position', 'fixed')  // ✅ CAMBIO: fixed en lugar de absolute
  .style('display', 'none')
  .style('background-color', 'white')
  .style('border', '1px solid #D1D5DB')
  .style('border-radius', '8px')
  .style('padding', '12px')
  .style('box-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)')
  .style('pointer-events', 'none')
  .style('z-index', '1000')
  .style('font-size', '13px')
  .style('min-width', '200px');

  // Draw areas
  const areas = g.selectAll('.area')
    .data(series)
    .enter()
    .append('path')
    .attr('class', 'area')
    .style('fill', d => color(d.key))
    .style('opacity', 0);

  // Animate areas
  areas.attr('d', area)
    .transition()
    .duration(1500)
    .ease(d3.easeCubicInOut)
    .style('opacity', 0.8);

  // Clip path animation
  const clipPath = g.append('defs')
    .append('clipPath')
    .attr('id', `clip-${chartId}`)
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 0)
    .attr('height', height);

  areas.attr('clip-path', `url(#clip-${chartId})`);

  clipPath.transition()
    .duration(1500)
    .ease(d3.easeCubicInOut)
    .attr('width', width);

  // X Axis with month labels
  const tickInterval = Math.max(1, Math.floor(data.length / 6));

  const xAxis = d3.axisBottom(x)
    .tickValues(d3.range(0, data.length, tickInterval))
    .tickFormat(i => {
      const row = data[Math.floor(i)];
      if (!row) return '';
      const dateStr = row.date || row.Date;
      if (dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short' });
      }
      return row.week || `Week ${Math.floor(i) + 1}`;
    });

  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .style('opacity', 0)
    .call(xAxis)
    .transition()
    .delay(400)
    .duration(600)
    .style('opacity', 1)
    .selectAll('text')
    .style('font-size', '12px')
    .style('fill', '#6B7280');

  // Y Axis with dollar formatting
  const yAxis = d3.axisLeft(y)
    .ticks(5)
    .tickFormat(d => {
      if (d >= 1000000) {
        return '$' + (d / 1000000).toFixed(1) + 'M';
      } else if (d >= 1000) {
        return '$' + (d / 1000).toFixed(0) + 'K';
      }
      return '$' + d.toFixed(0);
    });

  g.append('g')
    .attr('class', 'y-axis')
    .style('opacity', 0)
    .call(yAxis)
    .transition()
    .delay(400)
    .duration(600)
    .style('opacity', 1)
    .selectAll('text')
    .style('font-size', '12px')
    .style('fill', '#6B7280');

  // Style axes - darker grid lines
  g.selectAll('.domain')
    .style('stroke', '#D1D5DB');

  g.selectAll('.x-axis .tick line')
    .clone()
    .attr('y2', -height)
    .style('stroke', '#D1D5DB')
    .style('stroke-dasharray', '3,3')
    .style('stroke-opacity', 0.7);
  
  g.selectAll('.y-axis .tick line')
    .clone()
    .attr('x2', width)
    .style('stroke', '#D1D5DB')
    .style('stroke-dasharray', '3,3')
    .style('stroke-opacity', 0.7);

  // Add legend
  const legend = g.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width + 20}, 0)`)
    .style('opacity', 0);

  legend.transition()
    .delay(800)
    .duration(700)
    .ease(d3.easeCubicOut)
    .style('opacity', 1);

  channels.forEach((channel, i) => {
    const legendRow = legend.append('g')
      .attr('class', 'legend-item')
      .attr('transform', `translate(0, ${i * 25})`)
      .style('cursor', 'pointer');

    legendRow.append('rect')
      .attr('width', 14)
      .attr('height', 14)
      .attr('rx', 2)
      .style('fill', color(channel))
      .style('opacity', 0.8);

    legendRow.append('text')
      .attr('x', 22)
      .attr('y', 11)
      .style('font-size', '13px')
      .style('fill', '#374151')
      .style('font-weight', '500')
      .text(channel);

    legendRow.on('mouseover', function() {
      g.selectAll('.area')
        .style('opacity', d => d.key === channel ? 1 : 0.3);
    })
    .on('mouseout', function() {
      g.selectAll('.area')
        .style('opacity', 0.8);
    });
  });

  // Add interactive overlay AFTER animation completes
  setTimeout(() => {
    const focus = g.append('g')
      .attr('class', 'focus')
      .style('display', 'none');

    focus.append('line')
      .attr('class', 'tooltip-line')
      .style('stroke', '#6B7280')
      .style('stroke-width', '1.5px')
      .style('stroke-dasharray', '4,4')
      .attr('y1', 0)
      .attr('y2', height);

    g.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('pointer-events', 'all')

     .on('mouseover', function() {
  console.log('🖱️ Mouse over chart');
  focus.style('display', null);
  tooltip.style('display', 'block');
})
      .on('mouseout', function() {
  console.log('🖱️ Mouse out chart');
  focus.style('display', 'none');
  tooltip.style('display', 'none');
})
      .on('mousemove', function(event) {
  const mouse = d3.pointer(event, this);
  const mouseX = mouse[0];
  const xValue = x.invert(mouseX);
  const index = Math.round(xValue);
  
  if (index >= 0 && index < data.length) {
    const dataPoint = data[index];
    
    console.log('📊 Tooltip for:', dataPoint.week);
    
    focus.select('.tooltip-line')
      .attr('x1', x(index))
      .attr('x2', x(index));
    
    let tooltipHTML = `<div style="font-weight: 600; margin-bottom: 8px; color: #111827; border-bottom: 1px solid #E5E7EB; padding-bottom: 6px;">${dataPoint.week}</div>`;
    
    channels.forEach(channel => {
      const value = dataPoint[channel] || 0;
      const formattedValue = self.formatCurrency(value);
      tooltipHTML += `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px;">
          <div style="display: flex; align-items: center;">
            <div style="width: 12px; height: 12px; background-color: ${color(channel)}; border-radius: 2px; margin-right: 8px;"></div>
            <span style="color: #374151;">${channel}</span>
          </div>
          <span style="font-weight: 600; color: #111827; margin-left: 16px;">${formattedValue}</span>
        </div>
      `;
    });
    
    const total = channels.reduce((sum, channel) => sum + (dataPoint[channel] || 0), 0);
    const formattedTotal = self.formatCurrency(total);
    tooltipHTML += `
      <div style="display: flex; justify-content: space-between; margin-top: 10px; padding-top: 8px; border-top: 1px solid #E5E7EB; font-weight: 600;">
        <span style="color: #111827;">Total</span>
        <span style="color: #2563EB;">${formattedTotal}</span>
      </div>
    `;
    
    tooltip.html(tooltipHTML);
    
    // ✅ CON position: fixed, usa clientX/clientY
    const tooltipNode = tooltip.node();
    const tooltipWidth = tooltipNode.offsetWidth || 220;
    const tooltipHeight = tooltipNode.offsetHeight || 150;
    
    let tooltipX = event.clientX + 15;
    let tooltipY = event.clientY - tooltipHeight / 2;
    
    if (tooltipX + tooltipWidth > window.innerWidth - 20) {
      tooltipX = event.clientX - tooltipWidth - 15;
    }
    
    if (tooltipY < 10) {
      tooltipY = 10;
    } 
    else if (tooltipY + tooltipHeight > window.innerHeight - 10) {
      tooltipY = window.innerHeight - tooltipHeight - 10;
    }
    
    tooltip
      .style('left', tooltipX + 'px')
      .style('top', tooltipY + 'px');
  }
});
    console.log('✅ Interactive overlay added');
  }, 1600);

  // Hover effects on areas
  areas
    .on('mouseover', function() {
      d3.select(this).style('opacity', 1);
    })
    .on('mouseout', function() {
      d3.select(this).style('opacity', 0.8);
    });

  console.log("✅ Stacked area chart created successfully");
}

/**
 * Format currency values with K/M suffix
 * @param {number} value - Numeric value to format
 * @returns {string} Formatted currency string
 */
formatCurrency(value) {
  if (value >= 1000000) {
    return '$' + (value / 1000000).toFixed(1) + 'M';
  } else if (value >= 1000) {
    return '$' + (value / 1000).toFixed(0) + 'K';
  }
  return '$' + value.toFixed(0);
}

/**
 * Clean up tooltip when chart is destroyed
 */
cleanup() {
  d3.selectAll('.chart-tooltip').remove();
}


}