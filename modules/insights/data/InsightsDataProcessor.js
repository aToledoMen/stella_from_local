// modules/insights/data/InsightsDataProcessor.js
export class InsightsDataProcessor {
  /**
   * Process raw data into dashboard-ready format
   * @param {Object} rawData - Raw data from various sources
   * @returns {Object} Processed dashboard data
   */
  processInsightsData(rawData) {
    const { metrics, channels, waterfall, contribution, statistical, budget, budgetAllocation, vifResults, correlationMatrix } = rawData;

    console.log("🔄 Processing insights data:", rawData);

    const processedData = {
      metrics: this.processMetrics(metrics, waterfall),
      channels: this.processChannelData(channels),
      iroas: this.processIROASData(channels),
      waterfall: waterfall || null,
      contribution: this.processContributionData(contribution),
      statistical: this.processStatisticalData(statistical),
      budget: this.processBudgetData(budget),
      budgetAllocation: budgetAllocation || null,
      vifResults: vifResults || null,
      correlationMatrix: correlationMatrix || null,
      topChannel: this.identifyTopChannel(channels)
    };

    console.log("✅ Data processing complete:", processedData);
    return processedData;
  }

  /**
 * Process metrics data from AppState
 * @param {Object} metrics - Raw metrics from AppState
 * @param {Array} waterfallData - Waterfall decomposition data for baseline calculation
 * @returns {Object} Processed metrics
 */
processMetrics(metrics, waterfallData = null) {
  // Calculate baseline comparison if waterfall data is available


  console.log('🔍 processMetrics called with:');
  console.log('  - metrics:', metrics);
  console.log('  - waterfallData:', waterfallData);
  console.log('  - waterfallData is array?', Array.isArray(waterfallData));
  console.log('  - waterfallData length:', waterfallData?.length);
  
  let baselinePercentage = null;
  let hasNegativeIntercept = false; // ← NUEVO FLAG

  
  if (waterfallData && Array.isArray(waterfallData) && metrics?.incrementalRevenue) {
    // Find intercept/base revenue in waterfall data
    const interceptRow = waterfallData.find(row => {
      const component = (row.component || row.Component || '').toLowerCase();
      return component === 'intercept' || 
             component === 'base revenue' || 
             component === 'base_revenue';
    });
    

if (interceptRow) {
  const baseRevenueRaw = parseFloat(interceptRow.contribution || interceptRow.Contribution || 0);
  
  const baseRevenue = Math.abs(baseRevenueRaw);  const incrementalRevenue = metrics.incrementalRevenue;
  
  console.log(`💰 Base Revenue (raw): ${baseRevenueRaw}`);
  console.log(`💰 Base Revenue (absolute): ${baseRevenue}`);
  console.log(`💰 Incremental Revenue: ${incrementalRevenue}`);
  console.log(`⚠️ Intercept is negative?: ${hasNegativeIntercept}`);
  
  if (baseRevenue > 0) {
    // Calculate percentage: (incremental / base) * 100
    baselinePercentage = ((incrementalRevenue / baseRevenue) * 100).toFixed(1);
    console.log(`✅✅✅ BASELINE CALCULATED: ${baselinePercentage}%`);
  } else {
    console.warn('⚠️ Base revenue is 0 after taking absolute value:', baseRevenue);
  }
}
  }
  
  return {
    incrementalRevenue: metrics?.incrementalRevenue || 685000,
    r2: metrics?.r2 || 0.84,
    topChannel: metrics?.topChannel || null,
    mape: metrics?.mape || null,
    channelsAnalyzed: metrics?.channelsAnalyzed || 4,
    lastUpdated: metrics?.lastUpdated || new Date().toISOString(),
    isLoaded: metrics?.isLoaded || false,
    baselinePercentage: baselinePercentage,  // Add calculated percentage,
    hasNegativeIntercept: hasNegativeIntercept  // ← AGREGAR FLAG
  };
}

  /**
   * Process channel performance data
   * @param {Array} channels - Raw channel data
   * @returns {Array} Processed channel data
   */
  processChannelData(channels) {
    // Return processed data if available, otherwise use mock data
    if (channels && Array.isArray(channels) && channels.length > 0) {
      console.log("📊 Processing real channel data from dataset:", channels);
      
      // Process real data from dataset
      return channels.map(channel => ({
        name: channel.Channel || 'Unknown Channel',
        iroas: channel.iROAS || 0,
        incrementalRevenue: channel['Incremental Revenue'] || 0,
        confidence: channel.Confidence || 'N/A',
        // Determinar status basado en iROAS
        status: channel.iROAS >= 3 ? 'good' : channel.iROAS >= 2 ? 'warning' : 'poor',
        trend: 'neutral' // Por ahora neutral, se puede calcular después si hay datos históricos
      }));
    }

    // Mock data based on common MMM patterns
    console.log("📊 Using mock channel data for testing");
    return [
      { 
        name: 'Google Ads', 
        performance: 78, 
        confidence: 95, 
        trend: 'up', 
        status: 'good', 
        lift: '+12.4%',
        iroas: 3.2,
        contribution: 35.2,
        spend: 120000,
        incrementalRevenue: 384000
      },
      { 
        name: 'Meta Ads', 
        performance: 65, 
        confidence: 89, 
        trend: 'down', 
        status: 'warning', 
        lift: '+8.7%',
        iroas: 2.8,
        contribution: 28.5,
        spend: 95000,
        incrementalRevenue: 266000
      }
    ];
  }

  /**
   * Normalize individual channel data
   * @param {Object} channel - Raw channel data
   * @returns {Object} Normalized channel data
   */
  normalizeChannelData(channel) {
    return {
      name: channel.name || 'Unknown Channel',
      performance: this.normalizePercentage(channel.performance || channel.efficiency),
      confidence: this.normalizePercentage(channel.confidence || channel.confidenceInterval),
      trend: this.determineTrend(channel.trend || channel.direction),
      status: this.determineStatus(channel.performance || channel.efficiency),
      lift: this.formatLift(channel.lift || channel.incrementalLift),
      iroas: channel.iroas || channel.incrementalROAS || 0,
      contribution: channel.contribution || channel.revenueContribution || 0,
      spend: channel.spend || channel.investment || 0,
      incrementalRevenue: channel.incrementalRevenue || channel.incrementalValue || 0
    };
  }

  /**
   * Process iROAS data for chart visualization
   * @param {Array} channels - Channel data with iROAS values
   * @returns {Object} Chart-ready iROAS data
   */
  processIROASData(channels) {
    const processedChannels = this.processChannelData(channels);
    
    return {
      channels: processedChannels.map(c => c.name),
      values: processedChannels.map(c => c.iroas),
      labels: processedChannels.map(c => c.name),
      colors: this.generateColors(processedChannels.length)
    };
  }

  /**
   * Process statistical analysis data
   * @param {Object} statistical - Raw statistical data
   * @returns {Object} Processed statistical data
   */
  processStatisticalData(statistical) {
    if (statistical && typeof statistical === 'object') {
      return {
        r2: statistical.r2 || 0.84,
        mape: statistical.mape || 8.5,
        dwStatistic: statistical.dwStatistic || statistical.durbinWatson || 1.95,
        pValues: statistical.pValues || [0.001, 0.003, 0.015, 0.042],
        confidenceIntervals: this.processConfidenceIntervals(statistical.confidenceIntervals),
        modelQuality: this.assessModelQuality(statistical.r2 || 0.84),
        residualAnalysis: statistical.residualAnalysis || null
      };
    }

    // Mock statistical data
    console.log("📈 Using mock statistical data");
    return {
      r2: 0.84,
      mape: 8.5,
      dwStatistic: 1.95,
      pValues: [0.001, 0.003, 0.015, 0.042],
      confidenceIntervals: [
        { channel: 'Google Ads', lower: 0.65, upper: 0.91, confidence: 95 },
        { channel: 'Meta Ads', lower: 0.52, upper: 0.78, confidence: 89 },
        { channel: 'TikTok Ads', lower: 0.31, upper: 0.59, confidence: 82 },
        { channel: 'LinkedIn Ads', lower: 0.22, upper: 0.48, confidence: 76 }
      ],
      modelQuality: 'good',
      residualAnalysis: null
    };
  }

  /**
   * Process budget allocation data
   * @param {Object} budget - Raw budget data
   * @returns {Object} Processed budget data
   */
  processBudgetData(budget) {
    if (budget && typeof budget === 'object') {
      return {
        currentAllocation: this.normalizeBudgetAllocation(budget.currentAllocation),
        recommendedAllocation: this.normalizeBudgetAllocation(budget.recommendedAllocation),
        expectedIncrease: budget.expectedIncrease || 0,
        roiImprovement: budget.roiImprovement || 0,
        totalBudget: budget.totalBudget || 1000000,
        optimizationOpportunity: this.calculateOptimizationOpportunity(budget)
      };
    }

    // Mock budget data
    console.log("💰 Using mock budget data");
    return {
      currentAllocation: [
        { channel: 'Google Ads', percentage: 40, amount: 400000 },
        { channel: 'Meta Ads', percentage: 35, amount: 350000 },
        { channel: 'TikTok Ads', percentage: 15, amount: 150000 },
        { channel: 'LinkedIn Ads', percentage: 10, amount: 100000 }
      ],
      recommendedAllocation: [
        { channel: 'Google Ads', percentage: 45, amount: 450000 },
        { channel: 'Meta Ads', percentage: 30, amount: 300000 },
        { channel: 'TikTok Ads', percentage: 20, amount: 200000 },
        { channel: 'LinkedIn Ads', percentage: 5, amount: 50000 }
      ],
      expectedIncrease: 125000,
      roiImprovement: 0.18,
      totalBudget: 1000000,
      optimizationOpportunity: 'high'
    };
  }

  /**
   * Identify the top performing channel
   * @param {Array} channels - Channel data
   * @returns {Object} Top channel data
   */
  identifyTopChannel(channels) {
    const processedChannels = this.processChannelData(channels);
    
    if (!processedChannels || processedChannels.length === 0) {
      return { name: 'Google Ads', performance: 78 };
    }
    
    return processedChannels.reduce((top, channel) => 
      channel.performance > top.performance ? channel : top
    );
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Normalize percentage values to 0-100 range
   * @param {number} value - Raw percentage value
   * @returns {number} Normalized percentage (0-100)
   */
  normalizePercentage(value) {
    if (!value) return 0;
    return Math.min(Math.max(value, 0), 100);
  }

  /**
   * Determine trend direction from various input formats
   * @param {string|number} trend - Raw trend data
   * @returns {string} Normalized trend: 'up', 'down', 'neutral'
   */
  determineTrend(trend) {
    if (typeof trend === 'string') {
      const lowerTrend = trend.toLowerCase();
      if (['up', 'increase', 'positive', 'rising'].includes(lowerTrend)) return 'up';
      if (['down', 'decrease', 'negative', 'falling'].includes(lowerTrend)) return 'down';
      return 'neutral';
    }
    if (typeof trend === 'number') {
      return trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral';
    }
    return 'neutral';
  }

  /**
   * Determine status based on performance score
   * @param {number} performance - Performance percentage
   * @returns {string} Status: 'good', 'warning', 'poor'
   */
  determineStatus(performance) {
    if (performance >= 70) return 'good';
    if (performance >= 50) return 'warning';
    return 'poor';
  }

  /**
   * Format lift percentage with proper sign
   * @param {number} lift - Raw lift value
   * @returns {string} Formatted lift string
   */
  formatLift(lift) {
    if (!lift && lift !== 0) return 'N/A';
    const sign = lift >= 0 ? '+' : '';
    return `${sign}${lift.toFixed(1)}%`;
  }

  /**
   * Generate color palette for charts
   * @param {number} count - Number of colors needed
   * @returns {Array} Array of hex color strings
   */
  generateColors(count) {
    const baseColors = [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#EF4444', // Red
      '#99ccee', // Domo Blue
      '#06B6D4', // Cyan
      '#F97316', // Orange
      '#84CC16'  // Lime
    ];
    
    return Array.from({ length: count }, (_, i) => 
      baseColors[i % baseColors.length]
    );
  }

  /**
   * Process confidence intervals with validation
   * @param {Array} intervals - Raw confidence interval data
   * @returns {Array} Processed confidence intervals
   */
  processConfidenceIntervals(intervals) {
    if (!intervals || !Array.isArray(intervals)) {
      // Return mock data matching our channels
      return [
        { channel: 'Google Ads', lower: 0.65, upper: 0.91, confidence: 95 },
        { channel: 'Meta Ads', lower: 0.52, upper: 0.78, confidence: 89 },
        { channel: 'TikTok Ads', lower: 0.31, upper: 0.59, confidence: 82 },
        { channel: 'LinkedIn Ads', lower: 0.22, upper: 0.48, confidence: 76 }
      ];
    }
    
    return intervals.map(interval => ({
      channel: interval.channel || 'Unknown',
      lower: Math.max(0, interval.lower || 0),
      upper: Math.min(1, interval.upper || 1),
      confidence: Math.min(100, Math.max(0, interval.confidence || 95))
    }));
  }

  /**
   * Assess model quality based on R² score
   * @param {number} r2 - R-squared value (0-1)
   * @returns {string} Quality assessment
   */
  assessModelQuality(r2) {
    if (r2 >= 0.85) return 'excellent';
    if (r2 >= 0.70) return 'good';
    if (r2 >= 0.50) return 'fair';
    return 'poor';
  }

  /**
   * Normalize budget allocation ensuring percentages sum to 100
   * @param {Array} allocation - Raw allocation data
   * @returns {Array} Normalized allocation data
   */
  normalizeBudgetAllocation(allocation) {
    if (!allocation || !Array.isArray(allocation)) return [];
    
    // Calculate total percentage
    const totalPercentage = allocation.reduce((sum, item) => sum + (item.percentage || 0), 0);
    const normalizationFactor = totalPercentage > 0 ? 100 / totalPercentage : 1;
    
    return allocation.map(item => ({
      channel: item.channel || 'Unknown',
      percentage: Math.round((item.percentage || 0) * normalizationFactor),
      amount: item.amount || 0
    }));
  }

  /**
   * Calculate optimization opportunity level
   * @param {Object} budget - Budget data
   * @returns {string} Optimization level: 'high', 'medium', 'low'
   */
  calculateOptimizationOpportunity(budget) {
    const expectedIncrease = budget.expectedIncrease || 0;
    const totalBudget = budget.totalBudget || 1000000;
    const improvementPercentage = (expectedIncrease / totalBudget) * 100;
    
    if (improvementPercentage >= 15) return 'high';
    if (improvementPercentage >= 8) return 'medium';
    return 'low';
  }

  /**
   * Debug method to validate processed data
   * @param {Object} processedData - Processed dashboard data
   * @returns {Object} Validation results
   */
  validateProcessedData(processedData) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check required fields
    const requiredFields = ['metrics', 'channels', 'iroas', 'statistical', 'budget'];
    requiredFields.forEach(field => {
      if (!processedData[field]) {
        validation.errors.push(`Missing required field: ${field}`);
        validation.isValid = false;
      }
    });

    // Check metrics validity
    if (processedData.metrics) {
      if (processedData.metrics.r2 < 0 || processedData.metrics.r2 > 1) {
        validation.warnings.push('R² value outside expected range (0-1)');
      }
      if (processedData.metrics.incrementalRevenue < 0) {
        validation.warnings.push('Negative incremental revenue detected');
      }
    }

    // Check channels data
    if (processedData.channels && Array.isArray(processedData.channels)) {
      if (processedData.channels.length === 0) {
        validation.warnings.push('No channel data available');
      }
    }

    return validation;
  }


/**
 * Process contribution breakdown data for stacked area chart
 * @param {Array} contribution - Raw contribution data from dataset
 * @returns {Array} Processed contribution data grouped by week
 */
processContributionData(contribution) {
  
if (contribution && Array.isArray(contribution) && contribution.length > 0) {
  console.log("📊 Processing real contribution breakdown data from dataset:", contribution);
  console.log("📊 Sample row:", contribution[0]);
  
  // Check if data is unpivoted (has Channel column)
  const firstRow = contribution[0];
  const isUnpivoted = 'Channel' in firstRow || 'channel' in firstRow;
  
  console.log("📊 Format detected:", isUnpivoted ? "UNPIVOTED (Date, Channel, Value)" : "PIVOTED");
  
  if (isUnpivoted) {
    // Transform unpivoted to pivoted format
    console.log("🔄 Transforming unpivoted data to pivoted...");
    
    const grouped = {};
    
    contribution.forEach(row => {
      const date = row.date || row.Date;
      const channel = row.Channel || row.channel;
      const value = parseFloat(row.Value || row.value || 0);
      
      if (!date || !channel) {
        console.warn("⚠️ Skipping row with missing date or channel:", row);
        return;
      }
      
      if (!grouped[date]) {
        grouped[date] = { date: date };
      }
      
      grouped[date][channel] = value;
    });
    
    // Convert to array - this becomes the new contribution array
    contribution = Object.values(grouped);
    
    console.log("✅ Transformed to pivoted format, sample:", contribution[0]);
  }
    
    // Sort by date to ensure correct order
    const sortedData = [...contribution].sort((a, b) => {
      const dateA = new Date(a.date || a.Date);
      const dateB = new Date(b.date || b.Date);
      return dateA - dateB;
    });
    
          // Transform data for D3 stacked area chart
      const result = sortedData.map((row, index) => {
        const transformedRow = {};
        
        // Keep original date for month labels
        const dateValue = row.date || row.Date;
        if (dateValue) {
          transformedRow.date = dateValue; // Keep original date
          transformedRow.week = `Week ${index + 1}`;
        } else {
          transformedRow.week = `Week ${index + 1}`;
        }
      
      // Copy all channel columns (everything except date/week fields)
      Object.keys(row).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (lowerKey !== 'date' && lowerKey !== 'week' && lowerKey !== 'period') {
          // Use the channel name as-is from the dataset
          const value = parseFloat(row[key]);
          transformedRow[key] = isNaN(value) ? 0 : value;
        }
      });
      
      return transformedRow;
    });
    
    console.log("✅ Processed contribution data:", result);
    console.log("📊 Number of weeks:", result.length);
    console.log("📊 Channels found:", Object.keys(result[0]).filter(k => k !== 'week'));
    console.log("📊 First week data:", result[0]);
    return result;
  }
  
  // Mock data for testing
  console.log("📊 Using mock contribution data");
  return [
    { week: 'Week 1', 'Google Ads': 45, 'Meta Ads': 30, 'Email': 20, 'Display': 15 },
    { week: 'Week 2', 'Google Ads': 48, 'Meta Ads': 28, 'Email': 22, 'Display': 18 },
    { week: 'Week 3', 'Google Ads': 42, 'Meta Ads': 32, 'Email': 18, 'Display': 20 },
    { week: 'Week 4', 'Google Ads': 50, 'Meta Ads': 25, 'Email': 15, 'Display': 22 },
    { week: 'Week 5', 'Google Ads': 55, 'Meta Ads': 35, 'Email': 25, 'Display': 20 },
    { week: 'Week 6', 'Google Ads': 60, 'Meta Ads': 30, 'Email': 20, 'Display': 25 }
  ];
}




}