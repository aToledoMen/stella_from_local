// modules/insights/components/StatisticalMetricCards.js

/**
 * Component for rendering statistical analysis metric cards
 * Displays Model R², MAPE, and Total Incremental metrics
 * Uses MMM-specific quality thresholds
 */
export class StatisticalMetricCards {
  /**
   * Render all three statistical metric cards
   * @param {Object} metrics - Statistical metrics data
   * @param {number} metrics.r2 - Model R-squared value (0-1)
   * @param {number} metrics.mape - Mean Absolute Percentage Error (0-1)
   * @param {number} metrics.incrementalRevenue - Total incremental revenue
   * @returns {string} HTML string for statistical metrics cards
   */
  render(metrics) {
    const { r2, mape, incrementalRevenue,baselinePercentage,hasNegativeIntercept } = metrics;

  // MODIFICAR ESTE LOG:
  console.log('📊 StatisticalMetricCards rendering with metrics:', { 
    r2, 
    mape, 
    incrementalRevenue, 
    baselinePercentage,  // ← AGREGAR ESTO
    hasNegativeIntercept
  });
    return `
      <div class="statistical-metrics-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        ${this.renderR2Card(r2)}
        ${this.renderMAPECard(mape)}
        ${this.renderIncrementalCard(incrementalRevenue, baselinePercentage, hasNegativeIntercept)}      
    </div>

         <!-- AI Insights Button - Aligned Right -->
    <div class="flex justify-end mb-4">
      <button
        id="show-ai-insights-btn"
        class="inline-flex items-center gap-2 px-6 py-3 text-white font-medium rounded-lg hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        style="background-color: #99ccee;"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" x2="12" y1="19" y2="22"></line>
        </svg>
        <span>Cortex Analysis</span>
      </button>
    </div>
    `;

    
  }

  /**
   * Render Model R² card
   * @param {number} r2Value - R-squared value (0-1)
   * @returns {string} HTML for R² card
   */
  renderR2Card(r2Value) {
    const r2Display = r2Value !== null && r2Value !== undefined 
      ? r2Value.toFixed(2) // Format as 0.xxx
      : 'N/A';
    const varianceExplained = r2Value !== null && r2Value !== undefined 
      ? Math.round(r2Value * 100) 
      : 0;
    const qualityLabel = this.getR2QualityLabel(r2Value);
    const qualityColor = this.getR2QualityColor(r2Value);

    return `
      <div class="stat-card bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
        <!-- Header -->
        <div class="mb-4">
          <h3 class="text-xl font-semibold text-gray-900">Model R²</h3>
        </div>

        <!-- Main Value - Centered -->
        <div class="mb-3 text-center">
          <div class="text-4xl font-bold mb-2" style="color: #99CCEE;">
            ${r2Display !== 'N/A' ? r2Display : '—'}
          </div>
          <div class="text-sm font-medium text-gray-600">Variance Explained</div>
        </div>

        <!-- Quality Badge - Centered -->
        <div class="mb-4 text-center">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${qualityColor}">
            ${qualityLabel}
          </span>
        </div>

        <!-- Description - Centered -->
        <p class="text-sm text-gray-600 leading-relaxed text-center">
          ${varianceExplained}% of revenue variation explained
        </p>
      </div>
    `;
  }

  /**
   * Render MAPE card
   * @param {number} mapeValue - MAPE value (0-1)
   * @returns {string} HTML for MAPE card
   */
  renderMAPECard(mapeValue) {
    const mapePercentage = mapeValue !== null && mapeValue !== undefined 
      ? (mapeValue * 100).toFixed(1) 
      : 'N/A';
    const qualityLabel = this.getMAPEQualityLabel(mapeValue);
    const qualityColor = this.getMAPEQualityColor(mapeValue);

    return `
      <div class="stat-card bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
        <!-- Header -->
        <div class="mb-4">
          <h3 class="text-xl font-semibold text-gray-900">MAPE</h3>
        </div>

        <!-- Main Value - Centered -->
        <div class="mb-3 text-center">
          <div class="text-4xl font-bold text-green-500 mb-2">
            ${mapePercentage !== 'N/A' ? mapePercentage + '%' : '—'}
          </div>
          <div class="text-sm font-medium text-gray-600">Mean Absolute Percentage Error</div>
        </div>

        <!-- Quality Badge - Centered -->
        <div class="mb-4 text-center">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${qualityColor}">
            ${qualityLabel}
          </span>
        </div>

        <!-- Description - Centered -->
        <p class="text-sm text-gray-600 leading-relaxed text-center">
          Predictions within ${mapePercentage !== 'N/A' ? mapePercentage : '—'}% of actual
        </p>
      </div>
    `;
  }

  /**
   * Render Total Incremental card
   * @param {number} incrementalValue - Incremental revenue value
   * @returns {string} HTML for incremental card
   */
  renderIncrementalCard(incrementalValue, baselinePercentage=null, hasNegativeIntercept=false) {
  const formattedValue = this.formatCurrency(incrementalValue);
  
  console.log('💰 renderIncrementalCard - hasNegativeIntercept:', hasNegativeIntercept);
  
  // Decidir qué mostrar en el badge
  let badgeContent = '';
  
  if (hasNegativeIntercept) {
    // Si el intercept es negativo, mostrar un ícono en lugar del badge
     badgeContent = `
    <div class="mb-4 text-center">
      <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-orange-50 text-orange-700 border border-orange-200">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
          <path d="M12 9v4"></path>
          <path d="M12 17h.01"></path>
        </svg>
        Negative Intercept
      </span>
    </div>
    `;
  } else {
  // Si el intercept es positivo, mostrar el badge normal
  let baselineComparison = '+15% vs baseline';
  if (baselinePercentage !== null && baselinePercentage !== undefined) {
    baselineComparison = `+${baselinePercentage}% vs baseline`;
  }
  badgeContent = `
    <div class="mb-4 text-center">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
        ${baselineComparison}
      </span>
    </div>
  `;
}
  
  return `
    <div class="stat-card bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
      <!-- Header -->
      <div class="mb-4">
        <h3 class="text-xl font-semibold text-gray-900">Total Incremental</h3>
      </div>

      <!-- Main Value - Centered -->
      <div class="mb-3 text-center">
        <div class="text-4xl font-bold mb-2" style="color: #99CCEE;">
          ${formattedValue}
        </div>
        <div class="text-sm font-medium text-gray-600">Marketing Contribution</div>
      </div>

      <!-- Badge or Icon (conditional) -->
      ${badgeContent}

      <!-- Description - Centered -->
      <p class="text-sm text-gray-600 leading-relaxed text-center">
        Revenue above organic growth
      </p>
    </div>
  `;
}

 /**
 * Get quality label for R² value (MMM-specific thresholds)
 * @param {number} r2 - R-squared value (0-1)
 * @returns {string} Quality label
 */
getR2QualityLabel(r2) {
  if (r2 === null || r2 === undefined) return 'No data';
  if (r2 >= 0.95) return 'Possibly Overfitted';  // 95-100% - May indicate overfitting
  if (r2 >= 0.90) return 'Excellent';            // 90-94% - Excellent fit
  if (r2 >= 0.75) return 'Good';                 // 75-89% - Good fit
  if (r2 >= 0.65) return 'Fair';                 // 65-74% - Fair fit
  return 'Poor';                                 // 0-64% - Poor fit
}

/**
 * Get quality color classes for R² value (MMM-specific)
 * @param {number} r2 - R-squared value (0-1)
 * @returns {string} Tailwind CSS classes
 */
getR2QualityColor(r2) {
  if (r2 === null || r2 === undefined) return 'bg-gray-100 text-gray-700 border border-gray-300';
  if (r2 >= 0.95) return 'bg-yellow-50 text-yellow-700 border border-yellow-200';   // Possibly Overfitted
  if (r2 >= 0.90) return 'bg-green-50 text-green-700 border border-green-200';      // Excellent
  if (r2 >= 0.75) return 'bg-blue-50 text-blue-700 border border-blue-200';         // Good
  if (r2 >= 0.65) return 'bg-orange-50 text-orange-700 border border-orange-200';   // Fair
  return 'bg-red-50 text-red-700 border border-red-200';                            // Poor
}
  /**
 * Get quality label for MAPE value (MMM-specific thresholds)
 * @param {number} mape - MAPE value (0-1)
 * @returns {string} Quality label
 */
getMAPEQualityLabel(mape) {
  if (mape === null || mape === undefined) return 'No data';
  if (mape < 0.12) return 'Excellent';         // <12% - Excellent predictions
  if (mape <= 0.25) return 'Good';             // 13-25% - Good predictions
  if (mape <= 0.39) return 'Fair';             // 26-39% - Fair predictions
  return 'Poor';                               // 40-100% - Poor predictions
}

/**
 * Get quality color classes for MAPE value (MMM-specific)
 * @param {number} mape - MAPE value (0-1)
 * @returns {string} Tailwind CSS classes
 */
getMAPEQualityColor(mape) {
  if (mape === null || mape === undefined) return 'bg-gray-100 text-gray-700 border border-gray-300';
  if (mape < 0.12) return 'bg-green-50 text-green-700 border border-green-200';        // Excellent
  if (mape <= 0.25) return 'bg-blue-50 text-blue-700 border border-blue-200';          // Good
  if (mape <= 0.39) return 'bg-orange-50 text-orange-700 border border-orange-200';    // Fair
  return 'bg-red-50 text-red-700 border border-red-200';                               // Poor
}

  /**
   * Format currency value for display
   * @param {number} value - Currency value
   * @returns {string} Formatted currency string
   */
  formatCurrency(value) {
    if (value === null || value === undefined) return 'N/A';
    
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return '$' + (value / 1000000).toFixed(1) + 'M';
    }
    if (absValue >= 1000) {
      return '$' + (value / 1000).toFixed(0) + 'K';
    }
    return '$' + value.toFixed(0);
  }
}