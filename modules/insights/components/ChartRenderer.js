// modules/insights/components/ChartRenderer.js
// NO importar D3 - se usa globalmente
// import * as d3 from 'd3';  <-- Eliminar esta línea

export class ChartRenderer {
  constructor() {
    // Rastrear event listeners para evitar duplicados
    this.resizeListeners = new Set();

        this.waterfallChartType = 'vertical'; // Opciones: 'vertical' o 'horizontal'
  }

  /**
   * Render channel cards grid matching exact design from image
   * @param {Array} channelsData - Channel data
   * @returns {string} HTML string for channel cards
   */
  renderChannelCards(channelsData) {
    return `
      <div class="channel-cards-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        ${channelsData.map(channel => this.renderSingleChannelCard(channel)).join('')}
      </div>
    `;
  }

  /**
   * Render individual channel card exactly matching the image design - CONDENSED
   * @param {Object} channel - Channel data
   * @returns {string} HTML string for channel card
   */
renderSingleChannelCard(channel) {
    const { name, iroas, status } = channel;
    // Get configuration with SVG icons based on status
    const channelConfig = this.getChannelConfigByStatus(name, status);
    
    return `
      <div class="channel-card bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
        <!-- Header with channel name and status icon - TEXTO TRUNCADO -->
        <div class="flex items-center justify-between mb-2 h-[24px]">
          <h4 class="font-medium text-gray-700 text-sm truncate pr-2" title="${name}">${name}</h4>
          <div class="flex-shrink-0">${channelConfig.statusIcon}</div>
        </div>
        <!-- iROAS value - large and prominent - ALTURA FIJA -->
        <div class="flex items-baseline gap-2 mb-2 h-[28px]">
          <span class="text-xl font-bold text-gray-900">${iroas ? iroas.toFixed(1) : '0.0'}</span>
          <span class="text-sm text-gray-500">iROAS</span>
        </div>
        <!-- Progress bar based on iROAS (max 5.0) -->
        <div class="progress-container">
          <div aria-valuemax="100" aria-valuemin="0" role="progressbar" data-state="determinate" data-max="100" class="relative w-full overflow-hidden rounded-full bg-gray-200 h-1.5">
            <div data-state="determinate" data-max="100" class="h-full bg-blue-300 transition-all duration-500" style="width: ${Math.min((iroas / 5) * 100, 100)}%"></div>
          </div>
        </div>
      </div>
    `;
  }


/**
   * Get configuration based on status (good/warning/poor)
   */
  getChannelConfigByStatus(name, status) {
    const getStatusIcon = (status) => {
      if (status === 'good') {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big h-5 w-5 text-green-400"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>`;
      } else if (status === 'warning') {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-circle h-5 w-5 text-yellow-400"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
      } else {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-x h-5 w-5 text-red-400"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg>`;
      }
    };

    return {
      statusIcon: getStatusIcon(status)
    };
  }
  /**
   * Get configuration based on performance metrics
   */
  getChannelConfig(name, performance) {
    // Determine icons based on performance thresholds
    const getStatusIcon = (perf) => {
      if (perf >= 70) {
        // High performance - green check
        return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big h-3 w-3 text-green-400"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>`;
      } else if (perf >= 50) {
        // Medium performance - yellow warning
        return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 text-yellow-400"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="m12 17.02.01 0"></path></svg>`;
      } else {
        // Low performance - red trending down
        return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-down h-3 w-3 text-red-400"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>`;
      }
    };

    const getTrendIcon = (perf) => {
      if (perf >= 60) {
        // Trending up
        return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-green-400"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>`;
      } else {
        // Trending down
        return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-down w-4 h-4 text-red-400"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>`;
      }
    };

    return {
      statusIcon: getStatusIcon(performance),
      trendIcon: getTrendIcon(performance)
    };
  }

  /**
   * Render iROAS chart using D3.js with professional tooltips
   * @param {Object} iroasData - iROAS data
   * @param {string} containerId - Container ID
   * @returns {string} HTML string for chart
   */
  renderIROASChart(iroasData, containerId) {
    // Default data if none provided
    const defaultData = {
      channels: ['Google Ads', 'Meta Ads', 'TikTok Ads', 'LinkedIn Ads'],
      values: [3.2, 2.8, 2.0, 1.8]
    };

    const data = iroasData || defaultData;
    const chartId = containerId || 'iroas-chart-' + Date.now();

    // Return HTML container and create D3 chart after DOM insertion
    const html = `
      <div id="${chartId}" class="iroas-chart bg-white rounded-xl border border-gray-200 p-6">
        <!-- Chart Header -->
        <div class="chart-header mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">Channel iROAS Performance</h3>
          <p class="text-sm text-gray-600">Incremental Return on Ad Spend by marketing channel</p>
        </div>
        
        <!-- D3 Chart Container - Full Width -->
        <div id="${chartId}-svg" class="chart-area w-full"></div>
      </div>
    `;

    // Create D3 chart after DOM insertion
    setTimeout(() => {
      this.createD3Chart(data, chartId);
    }, 300);

    return html;
  }

  /**
   * Create D3.js chart with professional interactions
   * @param {Object} data - Chart data
   * @param {string} chartId - Chart container ID
   */
 createD3Chart(data, chartId) {
    // Verificar que D3 esté disponible globalmente
    if (typeof d3 === 'undefined') {
      console.error('D3.js not loaded globally. Please include D3.js script in your HTML.');
      return;
    }

    const container = d3.select(`#${chartId}-svg`);
    if (container.empty()) {
      console.error(`Container #${chartId}-svg not found`);
      return;
    }

    // CLAVE: Limpiar contenedor antes de crear nuevo gráfico
    container.selectAll('*').remove();


// Chart dimensions - USANDO CLIENTWIDTH
const margin = { top: 20, right: 30, bottom: 100, left: 80 };
const parentElement = container.node().parentElement;
// clientWidth ya resta padding y border automáticamente
const width = parentElement.clientWidth - margin.left - margin.right - 20; // -20px extra de seguridad
const height = 400 - margin.top - margin.bottom;

// Create SVG
const svg = container
  .append('svg')
  .attr('width', width + margin.left + margin.right)  // 👈 Volver al width calculado
  .attr('height', height + margin.top + margin.bottom)
  .style('background', '#fff')
  .style('max-width', '100%')  // 👈 NUEVO: limitar al 100%
  .style('overflow', 'visible');  // 👈 NUEVO: permitir overflow solo del contenido interno

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
      .domain(data.channels)
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data.values) * 1.1])
      .range([height, 0]);

    // Create tooltip - CLAVE: Verificar si ya existe antes de crear
    let tooltip = d3.select(`#${chartId}-tooltip`);
    if (tooltip.empty()) {
      tooltip = d3.select(`#${chartId}`)
        .append('div')
        .attr('id', `${chartId}-tooltip`)
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

 // X-axis with wrapped text
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));
    
    // Style axis
    xAxis.selectAll('line').style('stroke', '#d1d5db');
    xAxis.select('.domain').style('stroke', '#9ca3af');
    
    // Wrap text labels
    xAxis.selectAll('text')
      .style('font-size', '11px')
      .style('fill', '#6b7280')
      .style('text-anchor', 'middle')
      .call(wrapText, xScale.bandwidth());
    
   // Function to wrap text (max 2 lines)
    function wrapText(textSelection, width) {
      textSelection.each(function() {
        const text = d3.select(this);
        const words = text.text().split(/\s+/);
        
        if (words.length > 1) {
          text.text('');
          
          // First line: first half of words
          const midPoint = Math.ceil(words.length / 2);
          const firstLine = words.slice(0, midPoint).join(' ');
          const secondLine = words.slice(midPoint).join(' ');
          
          text.append('tspan')
            .attr('x', 0)
            .attr('dy', '0.71em')
            .text(firstLine);
          
          if (secondLine) {
            text.append('tspan')
              .attr('x', 0)
              .attr('dy', '1.1em')
              .text(secondLine);
          }
        }
      });
    }

    // Y-axis
    g.append('g')
      .call(d3.axisLeft(yScale)
        .tickFormat(d => d.toFixed(1))
        .ticks(5))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#9ca3af');

   // Grid lines horizontales
    g.selectAll('.grid-line-horizontal')
      .data(yScale.ticks(5))
      .enter()
      .append('line')
      .attr('class', 'grid-line-horizontal')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .style('stroke-dasharray', '2,2')
      .style('stroke', '#d1d5db')
      .style('stroke-width', 1.5)
      .style('opacity', 0.6);

   // Grid lines verticales
    g.selectAll('.grid-line-vertical')
      .data(data.channels)
      .enter()
      .append('line')
      .attr('class', 'grid-line-vertical')
      .attr('x1', d => xScale(d) + xScale.bandwidth() / 2)
      .attr('x2', d => xScale(d) + xScale.bandwidth() / 2)
      .attr('y1', 0)
      .attr('y2', height)
      .style('stroke', '#9ca3af')
      .style('stroke-width', 1.5)
      .style('stroke-dasharray', '4,4')
      .style('opacity', 0.7);


// Background highlight rectangles (one for each bar)
    const highlights = g.selectAll('.bar-highlight')
      .data(data.channels)
      .enter()
      .append('rect')
      .attr('class', 'bar-highlight')
      .attr('x', d => xScale(d))
      .attr('y', 0)
      .attr('width', xScale.bandwidth())
      .attr('height', height)
      .style('fill', '#f3f4f6')
      .style('opacity', 0)
      .style('pointer-events', 'none');

    // Bars with interactions
    g.selectAll('.bar')

    // Bars with interactions
    g.selectAll('.bar')
      .data(data.channels)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d))
      .attr('y', height) // Start from bottom for animation
      .attr('width', xScale.bandwidth())
      .attr('height', 0) // Start with 0 height for animation
      .style('fill', '#99ccee') // Color base azul claro
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        const value = data.values[data.channels.indexOf(d)];
        const index = data.channels.indexOf(d);
        
        // Show background highlight for this bar
        d3.select(highlights.nodes()[index])
          .transition()
          .duration(200)
          .style('opacity', 1);
        
        // Show tooltip
        tooltip
          .style('opacity', 1)
          .html(`
            <div style="font-weight: 600; color: #111827; margin-bottom: 2px;">${d}</div>
            <div style="color: #0066cc;">iROAS: ${value.toFixed(1)}x</div>
          `)
          .style('left', (event.pageX - tooltip.node().offsetWidth/2) + 'px')
          .style('top', (event.pageY - 60) + 'px');
      })
     .on('mouseout', function(event, d) {
        const index = data.channels.indexOf(d);
        
        // Hide background highlight
        d3.select(highlights.nodes()[index])
          .transition()
          .duration(200)
          .style('opacity', 0);
        
        // Hide tooltip
        tooltip.style('opacity', 0);
      })
      // Animate bars appearing
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr('y', (d, i) => yScale(data.values[i]))
      .attr('height', (d, i) => height - yScale(data.values[i]));

 

    // CLAVE: Agregar resize listener solo una vez por chart
    this.addResizeListener(data, chartId);
  }

  /**
   * Agregar listener de resize de forma controlada para evitar duplicados
   * @param {Object} data - Chart data
   * @param {string} chartId - Chart container ID
   */
  addResizeListener(data, chartId) {
    // Evitar listeners duplicados
    if (this.resizeListeners.has(chartId)) {
      return;
    }

    const resizeHandler = () => {
      let resizeTimeout;
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Solo re-renderizar si el contenedor aún existe
        const container = d3.select(`#${chartId}-svg`);
        if (!container.empty()) {
          this.createD3Chart(data, chartId);
        }
      }, 300); // Debounce para evitar múltiples renders
    };

    window.addEventListener('resize', resizeHandler);
    this.resizeListeners.add(chartId);

    // Cleanup cuando el elemento se remueva del DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node.id === chartId) {
            window.removeEventListener('resize', resizeHandler);
            this.resizeListeners.delete(chartId);
            observer.disconnect();
          }
        });
      });
    });

    // Observar cambios en el DOM para cleanup automático
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * Método para limpiar todos los listeners (útil para destrucción de componente)
   */
  cleanup() {
    this.resizeListeners.clear();
  }



renderWaterfallChart(waterfallData, containerId, mappedChannels = []) {
    if (!waterfallData || waterfallData.length === 0) {
      return `<div class="bg-gray-50 p-8 rounded text-center text-gray-500">No waterfall data available</div>`;
    }

    const chartId = containerId || 'waterfall-chart-' + Date.now();

    // Calcular KPIs from waterfall data
    const totalIncremental = waterfallData.reduce((sum, d) => sum + d.contribution, 0);
    const marketingEfficiency = waterfallData.reduce((sum, d) => sum + d.percentage, 0);
    const topPerformer = waterfallData.reduce((max, d) => 
      d.contribution > max.contribution ? d : max
    , waterfallData[0]);

    // Return HTML container
 
    const html = `
      <div id="${chartId}" class="waterfall-chart bg-white rounded-xl border border-gray-200 p-6">
        <!-- Chart Header -->
        <div class="chart-header mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up w-5 h-5 text-blue-300">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
              <polyline points="16 7 22 7 22 13"></polyline>
            </svg>
            Revenue Waterfall Analysis
          </h3>
          <p class="text-sm text-gray-600">Incremental revenue contribution by marketing channel</p>
        </div>
        
        <!-- D3 Waterfall Chart Container -->
        <div id="${chartId}-svg" class="chart-area w-full mb-8"></div>

  <!-- KPI Cards inside the same container -->
        <div id="${chartId}-kpis" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Total Incremental -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-sm font-medium text-gray-600 mb-1">Total Incremental</h4>
            <p id="${chartId}-total" class="text-3xl font-bold text-blue-400 mb-1">$0</p>
            <p class="text-xs text-gray-500">Revenue from marketing</p>
          </div>

          <!-- Top Performer -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-sm font-medium text-gray-600 mb-1">Top Performer</h4>
            <p id="${chartId}-performer" class="text-3xl font-bold text-blue-400 mb-1 truncate" title="">N/A</p>
            <p id="${chartId}-performer-value" class="text-xs text-gray-500">Top performer</p>
          </div>
           <!-- Marketing Efficiency -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-sm font-medium text-gray-600 mb-1">Contribution Top Performer</h4>
            <p id="${chartId}-efficiency" class="text-3xl font-bold text-green-500 mb-1">0%</p>
            <p class="text-xs text-gray-500"> incremental</p>
          </div>
        </div>
      </div>
    `;
    // Create chart after DOM insertion - elegir versión según configuración
    setTimeout(() => {
      if (this.waterfallChartType === 'horizontal') {
        this.createHorizontalWaterfallChart(waterfallData, chartId);
      } else {
        this.createWaterfallD3Chart(waterfallData, chartId);
      }
    }, 300);

    return html;
  }


/**
 * Create D3.js Waterfall Chart - Vertical Cumulative Style
 * @param {Array} data - Waterfall data with component and contribution
 * @param {string} chartId - Chart container ID
 */
createWaterfallD3Chart(data, chartId) {
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

  // Preparar datos para waterfall acumulativo
  const processedData = this.prepareWaterfallData(data);
  
  console.log("📊 Waterfall cumulative data:", processedData);

  // Chart dimensions
// Chart dimensions - USANDO CLIENTWIDTH
const margin = { top: 20, right: 30, bottom: 100, left: 80 };
const parentElement = container.node().parentElement;
// clientWidth ya resta padding y border automáticamente
const width = parentElement.clientWidth - margin.left - margin.right - 25; // -20px extra de seguridad
  const height = 450 - margin.top - margin.bottom;

  // Create SVG
  const svg = container
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .style('background', '#fff');

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Create tooltip
  let tooltip = d3.select(`#${chartId}-tooltip`);
  if (tooltip.empty()) {
    tooltip = d3.select(`#${chartId}`)
      .append('div')
      .attr('id', `${chartId}-tooltip`)
      .style('position', 'absolute')
      .style('background', 'white')
      .style('border', '1px solid #d1d5db')
      .style('border-radius', '8px')
      .style('padding', '10px 14px')
      .style('font-size', '13px')
      .style('box-shadow', '0 4px 12px rgba(0, 0, 0, 0.15)')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000);
  }

  // Scales
  const xScale = d3.scaleBand()
    .domain(processedData.map(d => d.label))
    .range([0, width])
    .padding(0.2);

  const maxValue = d3.max(processedData, d => d.end);
  const yScale = d3.scaleLinear()
    .domain([0, maxValue * 1.1])
    .range([height, 0]);

  // Horizontal grid lines
  g.selectAll('.grid-line')
    .data(yScale.ticks(6))
    .enter()
    .append('line')
    .attr('class', 'grid-line')
    .attr('x1', 0)
    .attr('x2', width)
    .attr('y1', d => yScale(d))
    .attr('y2', d => yScale(d))
    .style('stroke', '#e5e7eb')
    .style('stroke-width', 1)
    .style('stroke-dasharray', '3,3');

  // X axis
  const xAxis = g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale));
  
  xAxis.selectAll('line').style('stroke', '#d1d5db');
  xAxis.select('.domain').style('stroke', '#9ca3af');
  
 xAxis.selectAll('text')
  .style('font-size', '11px')
  .style('fill', '#6b7280')
  .style('text-anchor', 'end')
  .attr('dx', '-.5em')
  .attr('dy', '.5em')
  .attr('transform', 'rotate(-45)')
  .each(function() {
    const self = d3.select(this);
    const originalText = self.text().replace(/_/g, ' ');
    const maxLength = 15; // Máximo 15 caracteres
    
    if (originalText.length > maxLength) {
      self.text(originalText.substring(0, maxLength) + '...')
        .append('title') // Tooltip con texto completo
        .text(originalText);
    } else {
      self.text(originalText);
    }
  });

  // Y axis
  const formatValue = (d) => {
    if (d >= 1000000) return '$' + (d / 1000000).toFixed(1) + 'M';
    if (d >= 1000) return '$' + (d / 1000).toFixed(0) + 'K';
    return '$' + d.toFixed(0);
  };

  g.append('g')
    .call(d3.axisLeft(yScale).tickFormat(formatValue).ticks(6))
    .selectAll('text')
    .style('font-size', '11px')
    .style('fill', '#6b7280');

  g.selectAll('.domain').style('stroke', '#9ca3af');
  g.selectAll('.tick line').style('stroke', '#d1d5db');

  // Conectores (líneas punteadas entre barras)
  processedData.forEach((d, i) => {
    if (i < processedData.length - 1) {
      const nextD = processedData[i + 1];
      
      g.append('line')
        .attr('class', 'connector-line')
        .attr('x1', xScale(d.label) + xScale.bandwidth())
        .attr('x2', xScale(nextD.label))
        .attr('y1', yScale(d.end))
        .attr('y2', yScale(nextD.start))
        .style('stroke', '#9ca3af')
        .style('stroke-width', 1.5)
        .style('stroke-dasharray', '5,5')
        .style('opacity', 0)
        .transition()
        .delay(i * 100 + 600)
        .duration(400)
        .style('opacity', 0.6);
    }
  });

  // Barras del waterfall
const bars = g.selectAll('.bar')
  .data(processedData)
  .enter()
  .append('rect')
  .attr('class', 'bar')
  .attr('x', d => xScale(d.label))
  .attr('width', xScale.bandwidth())
  .attr('y', height)
  .attr('height', 0)
  .style('fill', d => d.color)
  .style('stroke', d => d.strokeColor)
  .style('stroke-width', 1.5)
  .style('cursor', 'pointer')
  .style('rx', 4);

// Animación de barras - CORREGIDO para negativos
bars.transition()
  .duration(800)
  .delay((d, i) => i * 100)
  .attr('y', d => {
    if (d.type === 'total') {
      // Barra total: desde 0 hasta el final
      return yScale(d.end);
    } else if (d.type === 'base') {
      // Baseline: desde 0 hasta el valor base
      return yScale(d.end);
    } else {
      // Barras normales y negativas: empiezan donde terminó la anterior
      // Para positivos: y = end (arriba)
      // Para negativos: y = start (arriba, porque start > end)
      return d.value >= 0 ? yScale(d.end) : yScale(d.start);
    }
  })
  .attr('height', d => {
    if (d.type === 'total') {
      return height - yScale(d.end);
    } else if (d.type === 'base') {
      return height - yScale(d.end);
    } else {
      // Altura siempre positiva = diferencia absoluta
      return Math.abs(yScale(d.end) - yScale(d.start));
    }
  });

  // Etiquetas de valores sobre las barras
  const labels = g.selectAll('.value-label')
    .data(processedData)
    .enter()
    .append('text')
    .attr('class', 'value-label')
    .attr('x', d => xScale(d.label) + xScale.bandwidth() / 2)
    .attr('y', d => yScale(d.end) - 8)
    .attr('text-anchor', 'middle')
    .style('font-size', '11px')
    .style('font-weight', '600')
    .style('fill', '#374151')
    .style('opacity', 0)
    .text(d => {
      if (d.type === 'total') return formatValue(d.end);
      const sign = d.value >= 0 ? '+' : '';
      return sign + formatValue(d.value);
    });

  // Animación de etiquetas
  labels.transition()
    .delay((d, i) => i * 100 + 400)
    .duration(400)
    .style('opacity', 1);

  // Interacciones
  bars.on('mouseover', function(event, d) {
    d3.select(this)
      .transition()
      .duration(200)
      .style('opacity', 0.8)
      .style('stroke-width', 2.5);

    tooltip
      .style('opacity', 1)
      .html(`
        <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${d.label}</div>
        <div style="color: #6b7280; font-size: 12px; margin-bottom: 2px;">
          ${d.type === 'total' ? 'Total' : (d.value >= 0 ? 'Contribution' : 'Decrease')}: 
          <strong>${formatValue(Math.abs(d.value))}</strong>
        </div>
        ${d.type !== 'total' ? `<div style="color: #9ca3af; font-size: 11px;">Cumulative: ${formatValue(d.end)}</div>` : ''}
      `)
      .style('left', (event.pageX - tooltip.node().offsetWidth / 2) + 'px')
      .style('top', (event.pageY - 70) + 'px');
  })
  .on('mouseout', function() {
    d3.select(this)
      .transition()
      .duration(200)
      .style('opacity', 1)
      .style('stroke-width', 1.5);

    tooltip.style('opacity', 0);
  });

    this.addResizeListener(data, chartId);
}


/**
 * Prepare waterfall data for cumulative display
 * @param {Array} data - Raw waterfall data
 * @returns {Array} Processed data with start/end positions
 */
prepareWaterfallData(data) {
  const result = [];
  let cumulative = 0;

  // 1. Encontrar el baseline/intercept
  const baselineItem = data.find(d => 
    d.component.toLowerCase() === 'intercept' || 
    d.component.toLowerCase() === 'base revenue' ||
    d.component.toLowerCase() === 'base_revenue'
  );

  if (baselineItem) {
    const baseValue = Math.abs(baselineItem.contribution);
    result.push({
      label: 'Baseline',
      value: baseValue,
      start: 0,
      end: baseValue,
      type: 'base',
      color: '#94a3b8',
      strokeColor: '#64748b'
    });
    cumulative = baseValue;
  }

  // 2. Filtrar y ordenar canales (sin baseline, sin seasonality)
  const channels = data
    .filter(d => {
      const comp = d.component.toLowerCase();
      return comp !== 'intercept' && 
             comp !== 'base revenue' &&
             comp !== 'base_revenue' &&
             !comp.includes('seasonality') &&
             !comp.includes('sesasonality');
    })
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  // 3. Agregar cada canal como incremento/decremento
  channels.forEach(d => {
    const value = d.contribution;
    const start = cumulative;
    const end = cumulative + value;

    result.push({
      label: d.component.replace(/_/g, ' '),
      value: value,
      start: start,
      end: end,
      type: value >= 0 ? 'increase' : 'decrease',
      color: value >= 0 ? '#60a5fa' : '#f87171',
      strokeColor: value >= 0 ? '#3b82f6' : '#ef4444'
    });

    cumulative = end;
  });

  // 4. Agregar barra de total
  result.push({
    label: 'Total Revenue',
    value: cumulative,
    start: 0,
    end: cumulative,
    type: 'total',
    color: '#34d399',
    strokeColor: '#10b981'
  });

  return result;
}

/*prepareWaterfallData(data) {
  // 🧪 DATOS DE PRUEBA - ACUMULADO CORRECTO
  
  return [
    // Baseline
    {
      label: 'Baseline',
      value: 500,
      start: 0,
      end: 500,
      type: 'base',
      color: '#94a3b8',
      strokeColor: '#64748b'
    },
    // META Ads: 500 → 650
    {
      label: 'META Ads',
      value: 150,
      start: 500,
      end: 650,
      type: 'increase',
      color: '#60a5fa',
      strokeColor: '#3b82f6'
    },
    // Google Search: 650 → 850
    {
      label: 'Google Search',
      value: 200,
      start: 650,
      end: 850,
      type: 'increase',
      color: '#60a5fa',
      strokeColor: '#3b82f6'
    },
    // Display Ads: 850 → 670 (NEGATIVO)
    {
      label: 'Display Ads',
      value: -180,
      start: 850,
      end: 670,  // 850 - 180 = 670
      type: 'decrease',
      color: '#f87171',
      strokeColor: '#ef4444'
    },
    // TikTok Ads: 670 → 790 ✅ CORREGIDO
    {
      label: 'TikTok Ads',
      value: 120,
      start: 670,  // 👈 DEBE SER 670, no 600
      end: 790,
      type: 'increase',
      color: '#60a5fa',
      strokeColor: '#3b82f6'
    },
    // Email Marketing: 790 → 870
    {
      label: 'Email Marketing',
      value: 80,
      start: 790,
      end: 870,
      type: 'increase',
      color: '#60a5fa',
      strokeColor: '#3b82f6'
    },
    // Affiliate Marketing: 870 → 750 (NEGATIVO)
    {
      label: 'Affiliate Marketing',
      value: -120,
      start: 870,
      end: 750,  // 870 - 120 = 750
      type: 'decrease',
      color: '#f87171',
      strokeColor: '#ef4444'
    },
    // Total Revenue: 0 → 750
    {
      label: 'Total Revenue',
      value: 750,
      start: 0,
      end: 750,
      type: 'total',
      color: '#34d399',
      strokeColor: '#10b981'
    }
  ];
}*/
  

/**
   * Update waterfall KPI card values
   * @param {string} chartId - Chart container ID (waterfall-chart-main)
   * @param {Object} metricsData - Metrics data containing incrementalRevenue and topChannel
   */
  /*updateWaterfallKPIValues(chartId, metricsData,waterfallData) {
    const formatCurrency = (value) => {
      if (Math.abs(value) >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M';
      if (Math.abs(value) >= 1000) return '$' + (value / 1000).toFixed(0) + 'K';
      return '$' + value.toFixed(0);
    };
    
    setTimeout(() => {
      const totalEl = document.getElementById(`${chartId}-total`);
      const performerEl = document.getElementById(`${chartId}-performer`);
      const performerValueEl = document.getElementById(`${chartId}-performer-value`);
      
      if (totalEl && metricsData.incrementalRevenue) {
        totalEl.textContent = formatCurrency(metricsData.incrementalRevenue);
      }

      // Get Marketing Efficiency from top performer's percentage in waterfall data
      if (efficiencyEl && metricsData.topChannel && waterfallData) {
        const topPerformerData = waterfallData.find(d => 
          d.component.toLowerCase() === metricsData.topChannel.toLowerCase()
        );
        
        if (topPerformerData && topPerformerData.percentage !== undefined) {
          efficiencyEl.textContent = Math.abs(topPerformerData.percentage).toFixed(1) + '%';
        } else {
          efficiencyEl.textContent = '0%';
        }
      }
      
      if (performerEl && metricsData.topChannel) {
        performerEl.textContent = metricsData.topChannel;
        performerEl.setAttribute('title', metricsData.topChannel);
      }

      // Find top performer's contribution from waterfall data
      if (performerValueEl && metricsData.topChannel && waterfallData) {
        const topPerformerData = waterfallData.find(d => 
          d.component.toLowerCase() === metricsData.topChannel.toLowerCase()
        );
        
        if (topPerformerData && topPerformerData.contribution) {
          performerValueEl.textContent = formatCurrency(Math.abs(topPerformerData.contribution)) + ' incremental';
        } else {
          performerValueEl.textContent = 'Top performer';
        }
      }
    }, 100);
  }*/

updateWaterfallKPIValues(chartId, metricsData, waterfallData) {
    const formatCurrency = (value) => {
      if (Math.abs(value) >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M';
      if (Math.abs(value) >= 1000) return '$' + (value / 1000).toFixed(0) + 'K';
      return '$' + value.toFixed(0);
    };
    
    setTimeout(() => {
      const totalEl = document.getElementById(`${chartId}-total`);
      const efficiencyEl = document.getElementById(`${chartId}-efficiency`);
      const performerEl = document.getElementById(`${chartId}-performer`);
      const performerValueEl = document.getElementById(`${chartId}-performer-value`);
      
      // Update Total Incremental
      if (totalEl && metricsData.incrementalRevenue) {
        totalEl.textContent = formatCurrency(metricsData.incrementalRevenue);
      }
      
      // Find top performer data (used for both efficiency and performer cards)
      let topPerformerData = null;
      if (metricsData.topChannel && waterfallData) {
        topPerformerData = waterfallData.find(d => 
          d.component.toLowerCase() === metricsData.topChannel.toLowerCase()
        );
      }
      
      // Update Marketing Efficiency (percentage from top performer)
      if (efficiencyEl && topPerformerData && topPerformerData.percentage !== undefined) {
        efficiencyEl.textContent = Math.abs(topPerformerData.percentage).toFixed(1) + '%';
      }
      
      // Update Top Performer name
      if (performerEl && metricsData.topChannel) {
        performerEl.textContent = metricsData.topChannel;
        performerEl.setAttribute('title', metricsData.topChannel);
      }
      
      // Update Top Performer contribution
      if (performerValueEl && topPerformerData && topPerformerData.contribution) {
        performerValueEl.textContent = formatCurrency(Math.abs(topPerformerData.contribution)) + ' incremental';
      } else if (performerValueEl) {
        performerValueEl.textContent = 'Top performer';
      }
    }, 100);
  }
/**
   * Create horizontal bar chart with D3.js (ApexCharts style)
   * @param {Array} data - Waterfall data
   * @param {string} chartId - Chart container ID
   */
  createHorizontalWaterfallChart(data, chartId) {
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

    // Sort data by contribution (descending - largest to smallest for top-to-bottom display)
    const sortedData = [...data].sort((a, b) => b.percentage - a.percentage);

    // Rename intercept as Base Revenue
    sortedData.forEach(d => {
      if (d.component.toLowerCase() === 'intercept') {
        d.component = 'Base Revenue';
      }
    });

    console.log("📊 Horizontal bar chart data (ApexCharts style):", sortedData);

    // Chart dimensions
    const margin = { top: 20, right: 100, bottom: 40, left: 180 };
    const width = 900 - margin.left - margin.right;
    const height = Math.max(400, sortedData.length * 45) - margin.top - margin.bottom;

    // Create SVG
    const svg = container
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background', '#fff');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const yScale = d3.scaleBand()
      .domain(sortedData.map(d => d.component))
      .range([0, height])
      .padding(0.3);

    // Find max absolute value for symmetric scale (using percentage)
    const maxAbsValue = d3.max(sortedData, d => Math.abs(d.percentage));
    const xScale = d3.scaleLinear()
      .domain([-maxAbsValue * 1.15, maxAbsValue * 1.15])
      .range([0, width]);

// Vertical grid lines (dashed)
    g.selectAll('.grid-line-vertical')
      .data(xScale.ticks(6))
      .enter()
      .append('line')
      .attr('class', 'grid-line-vertical')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', height)
      .style('stroke', '#d1d5db')
      .style('stroke-width', 1)
      .style('stroke-dasharray', '4,4');

    // Horizontal grid lines (dashed)
    g.selectAll('.grid-line-horizontal')
      .data(sortedData)
      .enter()
      .append('line')
      .attr('class', 'grid-line-horizontal')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => yScale(d.component) + yScale.bandwidth() / 2)
      .attr('y2', d => yScale(d.component) + yScale.bandwidth() / 2)
      .style('stroke', '#d1d5db')
      .style('stroke-width', 1)
      .style('stroke-dasharray', '4,4')
      .style('opacity', 0.5);

// Zero line (solid, more visible)
    g.append('line')
      .attr('x1', xScale(0))
      .attr('x2', xScale(0))
      .attr('y1', 0)
      .attr('y2', height)
      .style('stroke', '#9ca3af')
      .style('stroke-width', 2);

    // X axis (bottom) - showing percentages
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d => d.toFixed(0) + '%')
        .ticks(6))
      .style('color', '#9ca3af')
      .selectAll('text')
      .style('font-size', '11px')
      .style('fill', '#6b7280');
      // X axis title
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + 38)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('font-weight', '600')
      .style('fill', '#374151')
      .text('Response Decomposition by Components');

   // Y axis (left) - channel names with truncation
    g.append('g')
      .call(d3.axisLeft(yScale))
      .style('color', '#e5e7eb')
      .selectAll('text')
      .style('font-size', '13px')
      .style('fill', '#374151')
      .style('font-weight', '500')
      .each(function() {
        const self = d3.select(this);
        const text = self.text();
        if (text.length > 20) {
          self.text(text.substring(0, 20) + '...')
            .append('title')
            .text(text);
        }
      });
      // Y axis title
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -160)
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('font-weight', '600')
      .style('fill', '#374151')
      .text('Components');

// Keep axis lines visible (solid)
    g.selectAll('.domain')
      .style('stroke', '#9ca3af')
      .style('stroke-width', 1.5);
    g.selectAll('.tick line')
      .style('stroke', '#d1d5db');

 // Create tooltip (white background style matching iROAS chart)
    let tooltip = d3.select(`#${chartId}-tooltip`);
    if (tooltip.empty()) {
      tooltip = d3.select(`#${chartId}`)
        .append('div')
        .attr('id', `${chartId}-tooltip`)
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

    // Draw bars with rounded corners (all bars in blue, sized by percentage)
    sortedData.forEach(d => {
      const isPositive = d.percentage >= 0;
      const barColor = '#99ccee'; // Blue color matching iROAS chart
      const barX = isPositive ? xScale(0) : xScale(d.percentage);
      const barWidth = Math.abs(xScale(d.percentage) - xScale(0));
      const barY = yScale(d.component);
      const barHeight = yScale.bandwidth();

 // Background highlight rectangle (hidden by default, shown on hover)
      const highlightBg = g.append('rect')
        .attr('x', 0)
        .attr('y', barY)
        .attr('width', width)
        .attr('height', barHeight)
        .style('fill', '#f3f4f6')
        .style('opacity', 0)
        .style('pointer-events', 'none');

// Rounded bar using path
      const radius = 4;
      const barPath = g.append('path')
        .attr('d', isPositive 
          ? `M ${barX} ${barY + radius}
             Q ${barX} ${barY}, ${barX + radius} ${barY}
             L ${barX + barWidth - radius} ${barY}
             Q ${barX + barWidth} ${barY}, ${barX + barWidth} ${barY + radius}
             L ${barX + barWidth} ${barY + barHeight - radius}
             Q ${barX + barWidth} ${barY + barHeight}, ${barX + barWidth - radius} ${barY + barHeight}
             L ${barX + radius} ${barY + barHeight}
             Q ${barX} ${barY + barHeight}, ${barX} ${barY + barHeight - radius}
             Z`
          : `M ${barX + radius} ${barY}
             L ${barX + barWidth - radius} ${barY}
             Q ${barX + barWidth} ${barY}, ${barX + barWidth} ${barY + radius}
             L ${barX + barWidth} ${barY + barHeight - radius}
             Q ${barX + barWidth} ${barY + barHeight}, ${barX + barWidth - radius} ${barY + barHeight}
             L ${barX + radius} ${barY + barHeight}
             Q ${barX} ${barY + barHeight}, ${barX} ${barY + barHeight - radius}
             L ${barX} ${barY + radius}
             Q ${barX} ${barY}, ${barX + radius} ${barY}
             Z`)
        .style('fill', barColor)
        .style('cursor', 'pointer')
        .style('opacity', 0);
      
      // Animate bar appearance
      barPath.transition()
        .duration(800)
        .style('opacity', 1);

      // Add interactions
      g.append('rect')
        .attr('x', 0)
        .attr('y', barY)
        .attr('width', width)
        .attr('height', barHeight)
        .style('fill', 'transparent')
        .style('cursor', 'pointer')
        .on('mouseover', function(event) {
          // Show background highlight
          highlightBg
            .transition()
            .duration(200)
            .style('opacity', 1);
          
          // Show tooltip
         tooltip
            .style('opacity', 1)
            .html(`
              <div style="font-weight: 600; color: #111827; margin-bottom: 2px;">${d.component}</div>
              <div style="color: #3b82f6; font-weight: 600;">
                ${(() => {
                  const absValue = Math.abs(d.contribution);
                  const sign = d.contribution < 0 ? '-' : '';
                  if (absValue >= 1000000) return sign + '$' + (absValue / 1000000).toFixed(2) + 'M';
                  if (absValue >= 1000) return sign + '$' + (absValue / 1000).toFixed(0) + 'K';
                  return sign + '$' + absValue.toFixed(0);
                })()}
              </div>
              <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">
                ${d.percentage.toFixed(2)}% of total
              </div>
            `)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 15) + 'px');
        })
       .on('mouseout', function() {
          // Hide background highlight
          highlightBg
            .transition()
            .duration(200)
            .style('opacity', 0);
          
          tooltip.style('opacity', 0);
        });

      // Value label at the end of bar showing "contribution (percentage%)"
      const labelX = isPositive 
        ? xScale(d.percentage) + 8 
        : xScale(d.percentage) - 8;
      
    g.append('text')
        .attr('x', labelX)
        .attr('y', barY + barHeight / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', isPositive ? 'start' : 'end')
        .style('font-size', '11px')
        .style('font-weight', '600')
        .style('fill', '#6b7280')
        .style('opacity', 0)
        .text(() => {
          const contrib = Math.abs(d.contribution);
          const pct = d.percentage;
          const sign = d.contribution < 0 ? '-' : '';
          const formattedContrib = contrib >= 1000000 
            ? '$' + (contrib / 1000000).toFixed(1) + 'M' 
            : contrib >= 1000 
              ? '$' + (contrib / 1000).toFixed(0) + 'K'
              : '$' + contrib.toFixed(0);
          return `${sign} ${formattedContrib} (${pct.toFixed(1)}%)`;
        })
        .transition()
        .duration(800)
        .style('opacity', 1);
    });

    // Calculate and update KPIs
    const totalIncremental = sortedData.reduce((sum, d) => sum + d.contribution, 0);
    const marketingEfficiency = sortedData.reduce((sum, d) => sum + d.percentage, 0);
    const topPerformer = sortedData.reduce((max, d) => 
      d.contribution > max.contribution ? d : max
    , sortedData[0] || { component: 'N/A', contribution: 0 });
    
    const formatCurrency = (value) => {
      if (Math.abs(value) >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M';
      if (Math.abs(value) >= 1000) return '$' + (value / 1000).toFixed(0) + 'K';
      return '$' + value.toFixed(0);
    };
  }


/**
   * Render Top Contributing Channels section
   * @param {Array} waterfallData - Waterfall decomposition data
   * @returns {string} HTML string for top channels
   */
/**
   * Render Top Contributing Channels section (separate container)
   * @param {Array} waterfallData - Waterfall decomposition data
   * @returns {string} HTML string for top channels section
   */
  renderTopContributingChannels(waterfallData) {
    if (!waterfallData || waterfallData.length === 0) {
      return '';
    }

    // Filter out intercept and seasonality, then sort by contribution (descending)
    const filteredAndSorted = waterfallData
      .filter(d => {
        const comp = d.component.toLowerCase();
        return comp !== 'intercept' && 
               comp !== 'yearly_seasonality' &&
               comp !== 'yearly_sesasonality' &&
               comp !== 'base revenue' &&
               comp !== 'base_revenue';
      })
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
      .slice(0, 3); // Top 3 only

    if (filteredAndSorted.length === 0) {
      return '';
    }

    // Colors for the badges
    const colors = ['#93c5fd', '#6ee7b7', '#fbbf24'];

    const formatCurrency = (value) => {
      const absValue = Math.abs(value);
      if (absValue >= 1000000) return '$' + (absValue / 1000000).toFixed(0) + 'M';
      if (absValue >= 1000) return '$' + (absValue / 1000).toFixed(0) + 'K';
      return '$' + absValue.toFixed(0);
    };

    return `
      <div class="top-contributing-channels bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-6">Top Contributing Channels</h3>
        
        <div class="space-y-4">
          ${filteredAndSorted.map((channel, index) => `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div class="flex items-center gap-4">
                <div class="w-3 h-3 rounded-full" style="background-color: ${colors[index]}"></div>
                <span class="font-semibold text-gray-900">${channel.component}</span>
                <span class="px-3 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded-full">#${index + 1}</span>
              </div>
              
              <div class="text-right">
                <p class="text-2xl font-bold text-blue-400">${formatCurrency(channel.contribution)}</p>
                <p class="text-sm text-gray-600">${Math.abs(channel.percentage).toFixed(1)}% of incremental</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }




}