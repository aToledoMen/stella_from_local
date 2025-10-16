// modules/insights/components/CorrelationMatrixComponent.js

/**
 * CorrelationMatrixComponent
 * Renders a correlation matrix heatmap for marketing channels and control variables
 */
export class CorrelationMatrixComponent {
  constructor() {
    this.chartId = 'correlation-matrix-' + Date.now();
  }

  /**
   * Render Correlation Matrix visualization
   * @param {Array} correlationData - Correlation matrix data
   * @returns {string} HTML string for correlation matrix heatmap
   */
  render(correlationData) {
    if (!correlationData || correlationData.length === 0) {
      return `
        <div class="bg-gray-50 p-8 rounded-lg text-center">
          <p class="text-gray-600">No correlation data available</p>
        </div>
      `;
    }

    const html = `
      <div id="${this.chartId}" class="correlation-matrix-chart bg-white rounded-xl border border-gray-200 p-6">
        <!-- Chart Header -->
        <div class="chart-header mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">Correlation Matrix</h3>
          <p class="text-sm text-gray-600">Pairwise correlation between channels and control variables</p>
        </div>

        <!-- D3 Chart Container -->
        <div id="${this.chartId}-svg" class="chart-area w-full flex justify-center"></div>

        <!-- Legend -->
        <div class="flex items-center justify-center gap-6 mt-6 text-sm">
          <div class="flex items-center gap-2">
            <div class="w-12 h-3 rounded" style="background: linear-gradient(to right, #ef4444, #fbbf24, #34d399);"></div>
            <span class="text-gray-600">Correlation: -1.0 to +1.0</span>
          </div>
        </div>
      </div>
    `;

    // Create chart after DOM insertion
    setTimeout(() => {
      this.createCorrelationMatrix(correlationData);
    }, 300);

    return html;
  }

  /**
   * Create Correlation Matrix heatmap with D3
   * @param {Array} data - Correlation data in format [{variable1, variable2, correlation}]
   */
  createCorrelationMatrix(data) {
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

    console.log('📊 Correlation Matrix Data:', data);

    // Extract unique variables (ordered)
    const variablesSet = new Set();
    data.forEach(d => {
      variablesSet.add(d.Variable_1 || d.variable_1);
      variablesSet.add(d.Variable_2 || d.variable_2);
    });
    const variables = Array.from(variablesSet);

    console.log('📊 Variables found:', variables);

    // Create correlation matrix structure
    const matrix = {};
    variables.forEach(v1 => {
      matrix[v1] = {};
      variables.forEach(v2 => {
        matrix[v1][v2] = 0; // Default to 0
      });
    });

    // Fill matrix with correlation values
    data.forEach(d => {
      const var1 = d.Variable_1 || d.variable_1;
      const var2 = d.Variable_2 || d.variable_2;
      const corr = parseFloat(d.Correlation || d.correlation || 0);

      if (matrix[var1] && matrix[var2] !== undefined) {
        matrix[var1][var2] = corr;
        matrix[var2][var1] = corr; // Symmetric
      }
    });

    // Set diagonal to 1 (variable with itself)
    variables.forEach(v => {
      matrix[v][v] = 1.0;
    });

    console.log('📊 Correlation Matrix:', matrix);

    // Chart dimensions - Compact but visually appealing
    const cellSize = 45; // Reduced cell size for compactness
    const margin = { top: 100, right: 40, bottom: 40, left: 140 }; // Reduced margins
    const width = variables.length * cellSize;
    const height = variables.length * cellSize;

    // Create SVG
    const svg = container
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background', '#fff');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Color scale (red-yellow-green gradient)
    const colorScale = d3.scaleLinear()
      .domain([-1, 0, 1])
      .range(['#ef4444', '#fbbf24', '#34d399']);

    // Scales for positioning
    const xScale = d3.scaleBand()
      .domain(variables)
      .range([0, width])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(variables)
      .range([0, height])
      .padding(0.05);

    // Create tooltip
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

    // Draw cells
    variables.forEach((yVar, i) => {
      variables.forEach((xVar, j) => {
        const correlation = matrix[yVar][xVar];
        const cellColor = colorScale(correlation);

        const cell = g.append('rect')
          .attr('x', xScale(xVar))
          .attr('y', yScale(yVar))
          .attr('width', xScale.bandwidth())
          .attr('height', yScale.bandwidth())
          .attr('rx', 4)
          .style('fill', cellColor)
          .style('stroke', '#fff')
          .style('stroke-width', 2)
          .style('cursor', 'pointer')
          .style('opacity', 0);

        // Animate cell appearance
        cell.transition()
          .delay((i * variables.length + j) * 10)
          .duration(400)
          .style('opacity', 1);

        // Text label inside cell
        const label = g.append('text')
          .attr('x', xScale(xVar) + xScale.bandwidth() / 2)
          .attr('y', yScale(yVar) + yScale.bandwidth() / 2)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'middle')
          .style('font-size', '10px') // Slightly smaller for compact cells
          .style('font-weight', '600')
          .style('fill', Math.abs(correlation) > 0.5 ? '#fff' : '#111827')
          .style('pointer-events', 'none')
          .style('opacity', 0)
          .text(correlation.toFixed(2));

        label.transition()
          .delay((i * variables.length + j) * 10 + 400)
          .duration(300)
          .style('opacity', 1);

        // Interaction area
        g.append('rect')
          .attr('x', xScale(xVar))
          .attr('y', yScale(yVar))
          .attr('width', xScale.bandwidth())
          .attr('height', yScale.bandwidth())
          .style('fill', 'transparent')
          .style('cursor', 'pointer')
          .on('mouseover', function(event) {
            cell.style('stroke', '#111827').style('stroke-width', 3);

            let strength = 'Weak';
            let strengthColor = '#6b7280';
            const absCorr = Math.abs(correlation);

            if (absCorr >= 0.7) {
              strength = 'Strong';
              strengthColor = '#dc2626';
            } else if (absCorr >= 0.4) {
              strength = 'Moderate';
              strengthColor = '#f59e0b';
            }

            const direction = correlation >= 0 ? 'Positive' : 'Negative';

            tooltip
              .style('opacity', 1)
              .html(`
                <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">
                  ${yVar} × ${xVar}
                </div>
                <div style="color: #6b7280; font-size: 12px; margin-bottom: 2px;">
                  Correlation: <strong>${correlation.toFixed(3)}</strong>
                </div>
                <div style="color: ${strengthColor}; font-size: 11px; font-weight: 600;">
                  ${strength} ${direction}
                </div>
              `)
              .style('left', (event.pageX + 15) + 'px')
              .style('top', (event.pageY - 15) + 'px');
          })
          .on('mouseout', function() {
            cell.style('stroke', '#fff').style('stroke-width', 2);
            tooltip.style('opacity', 0);
          });
      });
    });

    // X axis labels (top) - rotated for better visibility
    g.selectAll('.x-label')
      .data(variables)
      .enter()
      .append('text')
      .attr('class', 'x-label')
      .attr('x', d => xScale(d) + xScale.bandwidth() / 2)
      .attr('y', -10)
      .attr('text-anchor', 'start')
      .attr('transform', d => {
        const x = xScale(d) + xScale.bandwidth() / 2;
        return `rotate(-55, ${x}, -10)`;
      })
      .style('font-size', '10px') // Smaller for compactness
      .style('font-weight', '600')
      .style('fill', '#374151')
      .text(d => d);

    // Y axis labels (left) - aligned to the right with more space
    g.selectAll('.y-label')
      .data(variables)
      .enter()
      .append('text')
      .attr('class', 'y-label')
      .attr('x', -12)
      .attr('y', d => yScale(d) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .style('font-size', '10px') // Smaller for compactness
      .style('font-weight', '600')
      .style('fill', '#374151')
      .text(d => d);
  }
}
