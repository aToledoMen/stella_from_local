// modules/insights/InsightsManager.js
// modules/insights/InsightsManager.js
import { MetricCardsComponent } from './components/MetricCardsComponent.js';
import { TabNavigationComponent } from './components/TabNavigationComponent.js';
import { ChartRenderer } from './components/ChartRenderer.js';
import { TabContentRenderer } from './components/TabContentRenderer.js';
import { StatisticalMetricCards } from './components/StatisticalMetricCards.js'; 
import { InsightsDataProcessor } from './data/InsightsDataProcessor.js';
import { AIService } from '../services/ai_service.js';
import { BudgetAllocationComponent } from './components/BudgetAllocationComponent.js';
import { OptimisationResultsComponent } from './components/OptimisationResultsComponent.js';

export class InsightsManager {
  constructor(appState, dataService,workflowService) {
    this.appState = appState;
    this.dataService = dataService;
    this.workflowService=workflowService;
    this.currentTab = 'channel-performance';
    this.dashboardData = null;

    console.log('🔧 InsightsManager constructor - workflowService:', this.workflowService);
    console.log('🔧 workflowService methods:', this.workflowService ? Object.getOwnPropertyNames(Object.getPrototypeOf(this.workflowService)) : 'undefined');
    
    
    // Initialize components
    this.metricCards = new MetricCardsComponent();
    this.tabNavigation = new TabNavigationComponent();
    this.chartRenderer = new ChartRenderer();
    this.tabContentRenderer = new TabContentRenderer(this.chartRenderer);
    this.dataProcessor = new InsightsDataProcessor();
    this.aiService = new AIService();
    this.handleAIButtonClick = this.handleAIButtonClick.bind(this);
    this.budgetAllocationComponent = new BudgetAllocationComponent();
    this.optimisationResultsComponent = new OptimisationResultsComponent(); // 👈 AÑADIR ESTA LÍNEA
  }

  /**
   * Initialize the insights dashboard
   */
  async initialize() {
    try {
      console.log("🚀 Initializing MMM Insights Dashboard...");
      
      // Show loading state
      this.showLoadingState();
      
      // Load and process dashboard data
      await this.loadDashboardData();
      
      // Render the complete dashboard
      this.renderDashboard();
      
      // Setup event listeners
      this.setupEventListeners();
      
      console.log("✅ Insights dashboard initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing insights dashboard:", error);
      this.showErrorState();
    }
  }

  /**
   * Show loading state while dashboard initializes
   */
  showLoadingState() {
    const container = this.getOrCreateContainer();
    container.innerHTML = `
      <div class="loading-state flex items-center justify-center min-h-96">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style="border-color: #99ccee;"></div>
          <p class="text-gray-600">Loading MMM Insights...</p>
        </div>
      </div>
    `;
  }

  /**
   * Load all necessary data for the dashboard
   */
async loadDashboardData() {
    try {
      // Get stored metrics from AppState
      const storedMetrics = this.appState.getMMMMetrics();
      console.log("📊 Loaded stored metrics:", storedMetrics);
      
      // Get document ID for loading channel data
      const documentId = this.appState.documentId;
      
      // Load channel data from dataset if document ID exists
      let channelData = null;
      if (documentId && documentId !== "mock-doc-123") {
        console.log("📊 Loading channel performance from dataset...");
        channelData = await this.dataService.loadChannelPerformanceFromDataset(documentId).catch(() => null);
      }

      // Load waterfall decomposition data if document ID exists
      let waterfallData = null;
      if (documentId && documentId !== "mock-doc-123") {
        console.log("📊 Loading waterfall decomposition from dataset...");
        waterfallData = await this.dataService.loadWaterfallDecompositionData(documentId).catch(() => null);
      }
      

      // Load contribution breakdown over time data if document ID exists
      let contributionData = null;
      if (documentId && documentId !== "mock-doc-123") {
        console.log("📊 Loading contribution breakdown from dataset...");
        contributionData = await this.dataService.loadContributionBreakdownData(documentId).catch(() => null);
      }

       // Load budget allocation data 
    let budgetAllocationData = null;
    if (documentId && documentId !== "mock-doc-123") {
      console.log("💰 Loading budget allocation from dataset...");
      budgetAllocationData = await this.dataService.loadBudgetAllocationData(documentId).catch(() => null);
    }

     // Load VIF results data
    let vifResultsData = null;
    if (documentId && documentId !== "mock-doc-123") {
      console.log("📊 Loading VIF results from dataset...");
      vifResultsData = await this.dataService.loadVIFResults(documentId).catch(() =>
  null);
    }

    // Load Correlation Matrix data
    let correlationMatrixData = null;
    if (documentId && documentId !== "mock-doc-123") {
      console.log("📊 Loading Correlation Matrix from dataset...");
      correlationMatrixData = await this.dataService.loadCorrelationMatrix(documentId).catch(() => null);
    }



      // Load additional insights data (with fallbacks)
      const [statisticalData, budgetData] = await Promise.all([
        this.dataService.loadStatisticalAnalysisData().catch(() => null),
        this.dataService.loadBudgetAllocationData().catch(() => null)
      ]);

      // Process and combine all data
      this.dashboardData = this.dataProcessor.processInsightsData({
        metrics: storedMetrics,
        channels: channelData,
        waterfall: waterfallData,
        contribution: contributionData,
        statistical: statisticalData,
        budget: budgetData,
        budgetAllocation: budgetAllocationData,
        vifResults: vifResultsData,
        correlationMatrix: correlationMatrixData
      });

      console.log("🔍 DEBUG - Processed channels:", this.dashboardData.channels);
       console.log("🔍 DEBUG - Waterfall data:", this.dashboardData.waterfall);
      console.log("🔍 DEBUG - Contribution data:", this.dashboardData.contribution);
      console.log("🔍 DEBUG - Budget Allocation data:", this.dashboardData.budgetAllocationData);

      console.log("📈 Dashboard data processed:", this.dashboardData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      throw error;
    }
  }

  /**
   * Render the complete dashboard structure matching the design
   */
  renderDashboard() {
    const container = this.getOrCreateContainer();
    
    container.innerHTML = `
      <div class="insights-dashboard max-w-7xl mx-auto px-6 py-8">
        <!-- Header Section -->
        <div class="dashboard-header mb-10">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">MMM Insights & Recommendations</h1>
              <p class="text-gray-600">Your marketing mix analysis is complete. Explore insights and get actionable recommendations.</p>
            </div>

            <!-- Export Button -->
            <button id="export-to-png-btn" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              Export PNG
            </button>
          </div>
          
          <!-- Top Metric Cards -->
          <div id="metric-cards-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Metric cards will be rendered here -->
          </div>
        </div>

        <!-- Tab Navigation -->
        <div id="tab-navigation">
          <!-- Tab navigation will be rendered here -->
        </div>

        <!-- Tab Content Area -->
        <div id="tab-content" class="min-h-96">
          <!-- Tab content will be rendered here -->
        </div>
      </div>
    `;

    // Render individual components
    this.renderMetricCards();
    this.renderTabNavigation();
    this.renderCurrentTab();
  }

  /**
   * Render the top metric cards exactly matching the new image design
   */
  renderMetricCards() {
    const container = document.getElementById('metric-cards-container');
    if (!container || !this.dashboardData) return;

    const cards = [
      {
        title: 'Incremental Revenue',
        value: this.formatCurrency(this.dashboardData.metrics.incrementalRevenue),
        icon: '📈'
      },
      {
        title: 'Model R²',
        value: this.dashboardData.metrics.r2 ? this.dashboardData.metrics.r2.toFixed(2) : 'N/A',       
         icon: '🎯'
      },
      {
        title: 'Top Channel',
        value: this.dashboardData.metrics.topChannel || 'N/A',
        icon: '🏆'
      },
           {
        title: 'MAPE',
        value: this.dashboardData.metrics.mape ? `${(this.dashboardData.metrics.mape * 100).toFixed(1)}%` : 'N/A',
        icon: '📊'
      }
    ];

    container.innerHTML = cards.map(card => this.metricCards.render(card)).join('');
  }

  /**
   * Render tab navigation
   */
  renderTabNavigation() {
    const container = document.getElementById('tab-navigation');
    if (!container) return;

    const tabs = [
      { id: 'channel-performance', label: 'Channel Performance', icon: '📊' },
      { id: 'statistical-analysis', label: 'Statistical Analysis', icon: '📈' },
      { id: 'budget-allocation', label: 'Budget Allocation', icon: '💰' },
      { id: 'budget-optimizer', label: 'Budget Optimizer', icon: '⚡' }
    ];

    container.innerHTML = this.tabNavigation.render(tabs, this.currentTab);
  }

/**
 * Render current active tab content
 */
renderCurrentTab() {
  const container = document.getElementById('tab-content');
  if (!container || !this.dashboardData) return;

  let content = '';
  
  switch (this.currentTab) {
    case 'channel-performance':
      content = this.tabContentRenderer.renderChannelPerformance(this.dashboardData);
      break;
    case 'statistical-analysis':
      content = this.tabContentRenderer.renderStatisticalAnalysis(this.dashboardData);
      break;
    case 'budget-allocation':
      content = this.budgetAllocationComponent.render(this.dashboardData);
      break;
    case 'budget-optimizer':
      content = this.tabContentRenderer.renderBudgetOptimizer(this.dashboardData);
      break;
    default:
      content = this.tabContentRenderer.renderChannelPerformance(this.dashboardData);
  }

  container.innerHTML = content;

  // Initialize charts after rendering
  if (this.currentTab === 'budget-allocation' && this.dashboardData.budgetAllocation) {
    setTimeout(() => {
      const enrichedChannels = this.budgetAllocationComponent.mergeChannelData(
        this.dashboardData.budgetAllocation.channels,
        this.dashboardData.channels
      );
      this.budgetAllocationComponent.renderD3Chart(enrichedChannels);
    }, 100);
  }

  // Initialize Budget Optimizer constraints state
  if (this.currentTab === 'budget-optimizer') {
    setTimeout(() => {
      this.initializeChannelConstraintsState();
    }, 100);
  }
}
  /**
   * Initialize charts after tab content is rendered
   */
  initializeChartsInCurrentTab() {
    // Wait for DOM to be ready, then initialize charts
    setTimeout(() => {
      if (this.currentTab === 'channel-performance') {
        this.initializeIROASChart();
      }
    }, 100);
  }

  /**
   * Initialize iROAS chart with exact colors from the image
   */
  initializeIROASChart() {
    const canvas = document.getElementById('iroas-chart-canvas');
    if (!canvas || !window.Chart) {
      console.warn("Chart.js not available or canvas not found");
      return;
    }

    const ctx = canvas.getContext('2d');
    const data = this.dashboardData.iroas;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.channels,
        datasets: [{
          label: 'iROAS',
          data: data.values,
          backgroundColor: '#60A5FA', // Exact blue color from image
          borderColor: '#3B82F6',
          borderWidth: 0,
          borderRadius: 4,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: '#60A5FA',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return `iROAS: ${context.parsed.y.toFixed(1)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 4, // Match the scale from the image
            ticks: {
              stepSize: 0.8,
              color: '#6B7280',
              font: {
                size: 12
              }
            },
            grid: {
              color: '#F3F4F6',
              drawBorder: false
            },
            title: {
              display: false
            }
          },
          x: {
            ticks: {
              color: '#6B7280',
              font: {
                size: 12,
                weight: 500
              }
            },
            grid: {
              display: false
            }
          }
        },
        layout: {
          padding: {
            top: 20,
            bottom: 10
          }
        }
      }
    });
  }

  /**
   * Switch to different tab
   */
  switchTab(tabId) {
    console.log(`🔄 Switching to tab: ${tabId}`);
    this.currentTab = tabId;
    this.renderTabNavigation();
    this.renderCurrentTab();
  }

  /**
   * Setup event listeners for the dashboard
   */
  setupEventListeners() {
    // Tab navigation clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-tab-id]') || e.target.closest('[data-tab-id]')) {
        const button = e.target.matches('[data-tab-id]') ? e.target : e.target.closest('[data-tab-id]');
        const tabId = button.getAttribute('data-tab-id');
        this.switchTab(tabId);
      }

      // View toggle buttons (Performance View / Contribution View)
      if (e.target.matches('.view-toggle-btn') || e.target.closest('.view-toggle-btn')) {
        const button = e.target.matches('.view-toggle-btn') ? e.target : e.target.closest('.view-toggle-btn');
        const viewType = button.getAttribute('data-view');
        this.switchView(viewType);
      }

      // VIF view toggle buttons (VIF / Correlation Matrix)
      if (e.target.matches('.vif-view-toggle-btn') || e.target.closest('.vif-view-toggle-btn')) {
        const button = e.target.matches('.vif-view-toggle-btn') ? e.target : e.target.closest('.vif-view-toggle-btn');
        const vifViewType = button.getAttribute('data-vif-view');
        this.switchVIFView(vifViewType);
      }

      // Back to workflow button
      if (e.target.matches('#back-to-workflow') || e.target.closest('#back-to-workflow')) {
        this.goBackToWorkflow();
      }

      // Refresh button clicks
      if (e.target.matches('[data-action="refresh"]')) {
        this.refreshDashboard();
      }

        document.body.addEventListener('click', this.handleAIButtonClick);

        if (e.target.matches('#run-optimization-btn') || e.target.closest('#run-optimization-btn')) {
      console.log('🎯 Run Optimization button clicked');
      this.handleOptimizationRequest();
    }
// Budget Optimizer: Run Optimization button
    if (e.target.matches('#run-optimization-btn') || e.target.closest('#run-optimization-btn')) {
      console.log('🎯 Run Optimization button clicked');
      this.handleOptimizationRequest();
    }

    // Export to PNG button
    if (e.target.matches('#export-to-png-btn') || e.target.closest('#export-to-png-btn')) {
      console.log('📸 Export to PNG button clicked');
      this.handleExportToPNG();
    }

    });


  // 👇 AÑADIR ESTE NUEVO EVENT LISTENER
  document.addEventListener('change', (e) => {
    // Handle "Use Default Constraints" checkbox
    if (e.target.matches('.use-default-constraints-checkbox')) {
      const channelName = e.target.getAttribute('data-channel');
      const useDefault = e.target.checked;
      
      console.log(`📋 Use Default Constraints changed for ${channelName}:`, useDefault);
      
      // Find the corresponding min/max inputs
      const minSpendInput = document.querySelector(`.channel-min-spend[data-channel="${channelName}"]`);
      const maxSpendInput = document.querySelector(`.channel-max-spend[data-channel="${channelName}"]`);
      
      if (minSpendInput && maxSpendInput) {
        if (useDefault) {
          // Disable inputs and clear values
          minSpendInput.disabled = true;
          maxSpendInput.disabled = true;
          minSpendInput.style.opacity = '0.5';
          maxSpendInput.style.opacity = '0.5';
          minSpendInput.style.cursor = 'not-allowed';
          maxSpendInput.style.cursor = 'not-allowed';
        } else {
          // Enable inputs
          minSpendInput.disabled = false;
          maxSpendInput.disabled = false;
          minSpendInput.style.opacity = '1';
          maxSpendInput.style.opacity = '1';
          minSpendInput.style.cursor = 'text';
          maxSpendInput.style.cursor = 'text';
        }
      }
    }
  });
    
  }

  /**
   * Go back to the main workflow (Step 4)
   */
  goBackToWorkflow() {
    const insightsContainer = document.getElementById('insights-container');
    if (insightsContainer) {
      insightsContainer.classList.add('hidden');
    }

    // Show Step 4 again
    const step4 = document.getElementById('step-4');
    if (step4) {
      step4.classList.remove('hidden');
    }

    console.log("🔙 Returned to workflow Step 4");
  }

  /**
   * Refresh dashboard data
   */
  async refreshDashboard() {
    try {
      console.log("🔄 Refreshing dashboard data...");
      await this.loadDashboardData();
      this.renderMetricCards();
      this.renderCurrentTab();
      console.log("✅ Dashboard refreshed successfully");
    } catch (error) {
      console.error("❌ Error refreshing dashboard:", error);
    }
  }

  /**
   * Get or create the main insights container
   */
  getOrCreateContainer() {
    let container = document.getElementById('insights-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'insights-container';
      container.className = 'step-section';
      
      // Find the main container and append
      const mainContainer = document.querySelector('.max-w-5xl') || document.body;
      mainContainer.appendChild(container);
    }
    return container;
  }

  /**
   * Show error state when initialization fails
   */
  showErrorState() {
    const container = this.getOrCreateContainer();
    container.innerHTML = `
      <div class="error-state text-center p-8">
        <div class="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Unable to Load Insights</h2>
        <p class="text-gray-600 mb-4">There was an error loading the dashboard data.</p>
        <div class="flex gap-4 justify-center">
          <button onclick="location.reload()" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Retry
          </button>
          <button id="back-to-workflow-error" class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700">
            Back to Analysis
          </button>
        </div>
      </div>
    `;

    // Setup error state back button
    document.getElementById('back-to-workflow-error')?.addEventListener('click', () => {
      this.goBackToWorkflow();
    });
  }

  // Utility methods
  formatCurrency(value) {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 0
    }).format(value);
  }

  formatPercentage(value) {
    if (!value) return '0%';
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      maximumFractionDigits: 0
    }).format(value);
  }

/**
   * Switch between Performance View and Contribution View
   * @param {string} viewType - 'performance' or 'contribution'
   */
  switchView(viewType) {
    console.log(`🔄 Switching to ${viewType} view`);
    
    // Update button styles
    const performanceBtn = document.getElementById('performance-view-btn');
    const contributionBtn = document.getElementById('contribution-view-btn');
    
    if (viewType === 'performance') {
      // Activate Performance View
      performanceBtn.className = 'view-toggle-btn justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-white hover:opacity-80 h-9 rounded-md px-3 flex items-center space-x-2 border border-gray-300';
      performanceBtn.style.backgroundColor = '#9ec2e6';
      performanceBtn.querySelector('svg').setAttribute('stroke', 'white');
      
      // Deactivate Contribution View
      contributionBtn.className = 'view-toggle-btn justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-gray-100 text-gray-600 hover:bg-gray-200 h-9 rounded-md px-3 flex items-center space-x-2 border border-gray-300';
      contributionBtn.style.backgroundColor = '';
      contributionBtn.querySelector('svg').setAttribute('stroke', 'currentColor');
      
      // Render Performance View content
      this.renderPerformanceViewContent();
      
    } else if (viewType === 'contribution') {
      // Activate Contribution View
      contributionBtn.className = 'view-toggle-btn justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-white hover:opacity-80 h-9 rounded-md px-3 flex items-center space-x-2 border border-gray-300';
      contributionBtn.style.backgroundColor = '#9ec2e6';
      contributionBtn.querySelector('svg').setAttribute('stroke', 'white');
      
      // Deactivate Performance View
      performanceBtn.className = 'view-toggle-btn justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-gray-100 text-gray-600 hover:bg-gray-200 h-9 rounded-md px-3 flex items-center space-x-2 border border-gray-300';
      performanceBtn.style.backgroundColor = '';
      performanceBtn.querySelector('svg').setAttribute('stroke', 'currentColor');
      
      // Render Contribution View content
      this.renderContributionViewContent();
    }
  }

  /**
   * Render Performance View content
   */
  renderPerformanceViewContent() {
    const container = document.getElementById('view-content-area');
    if (!container) return;
    
    container.innerHTML = `
      <!-- Channel Performance Cards -->
      ${this.chartRenderer.renderChannelCards(this.dashboardData.channels)}
      <!-- iROAS Chart -->
      ${this.chartRenderer.renderIROASChart(this.dashboardData.iroas, 'iroas-chart-canvas')}
    `;
  }



/**
   * Render Contribution View content
   */
 renderContributionViewContent() {
    const container = document.getElementById('view-content-area');
    if (!container) {
      console.error("Container 'view-content-area' not found");
      return;
    }
    
    console.log("📊 Rendering contribution view with waterfall data:", this.dashboardData.waterfall);
    
    // Get mapped channels from Step 2
    const mappedChannels = this.appState.channelMappings
      .filter(ch => ch.value && ch.value !== "No mapping")
      .map(ch => ch.value.toLowerCase());
    
    console.log("📊 Mapped channels from Step 2:", mappedChannels);
    
    // Render the waterfall chart (KPIs are now inside)
    container.innerHTML = `
      <div class="contribution-view">
        ${this.chartRenderer.renderWaterfallChart(this.dashboardData.waterfall, 'waterfall-chart-main', mappedChannels)}
        ${this.chartRenderer.renderTopContributingChannels(this.dashboardData.waterfall)}
      </div>
      `;
    
    // Update KPI values from metrics data
    setTimeout(() => {
      const metricsData = {
        incrementalRevenue: this.dashboardData.metrics.incrementalRevenue,
        topChannel: this.dashboardData.metrics.topChannel
      };
      
       // Pass waterfall data to get top performer's contribution
      this.chartRenderer.updateWaterfallKPIValues(
        'waterfall-chart-main', 
        metricsData, 
        this.dashboardData.waterfall
      );
    }, 500);
  }

/**
 * Switch between VIF and Correlation Matrix views
 * @param {string} vifViewType - 'vif' or 'correlation'
 */
switchVIFView(vifViewType) {
  console.log(`🔄 Switching to ${vifViewType} view`);

  // Update button styles
  const vifBtn = document.getElementById('vif-view-btn');
  const correlationBtn = document.getElementById('correlation-view-btn');

  if (vifViewType === 'vif') {
    // Activate VIF View
    vifBtn.className = 'vif-view-toggle-btn justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-white hover:opacity-80 h-9 rounded-md px-3 flex items-center space-x-2 border border-gray-300';
    vifBtn.style.backgroundColor = '#9ec2e6';
    vifBtn.querySelector('svg').setAttribute('stroke', 'white');

    // Deactivate Correlation View
    correlationBtn.className = 'vif-view-toggle-btn justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-gray-100 text-gray-600 hover:bg-gray-200 h-9 rounded-md px-3 flex items-center space-x-2 border border-gray-300';
    correlationBtn.style.backgroundColor = '';
    correlationBtn.querySelector('svg').setAttribute('stroke', 'currentColor');

    // Render VIF View content
    this.renderVIFViewContent();

  } else if (vifViewType === 'correlation') {
    // Activate Correlation View
    correlationBtn.className = 'vif-view-toggle-btn justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-white hover:opacity-80 h-9 rounded-md px-3 flex items-center space-x-2 border border-gray-300';
    correlationBtn.style.backgroundColor = '#9ec2e6';
    correlationBtn.querySelector('svg').setAttribute('stroke', 'white');

    // Deactivate VIF View
    vifBtn.className = 'vif-view-toggle-btn justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-gray-100 text-gray-600 hover:bg-gray-200 h-9 rounded-md px-3 flex items-center space-x-2 border border-gray-300';
    vifBtn.style.backgroundColor = '';
    vifBtn.querySelector('svg').setAttribute('stroke', 'currentColor');

    // Render Correlation View content
    this.renderCorrelationViewContent();
  }
}

/**
 * Render VIF View content
 */
renderVIFViewContent() {
  const container = document.getElementById('vif-view-content-area');
  if (!container) return;

  const vifData = this.dashboardData?.vifResults;

  if (!vifData || vifData.length === 0) {
    container.innerHTML = '<div class="bg-gray-50 p-8 rounded-lg text-center"><p class="text-gray-600">No VIF data available</p></div>';
    return;
  }

  container.innerHTML = this.tabContentRenderer.vifResultsComponent.render(vifData);
}

/**
 * Render Correlation Matrix View content
 */
renderCorrelationViewContent() {
  const container = document.getElementById('vif-view-content-area');
  if (!container) return;

  const correlationData = this.dashboardData?.correlationMatrix;

  if (!correlationData || correlationData.length === 0) {
    container.innerHTML = '<div class="bg-gray-50 p-8 rounded-lg text-center"><p class="text-gray-600">No correlation data available</p></div>';
    return;
  }

  container.innerHTML = this.tabContentRenderer.correlationMatrixComponent.render(correlationData);
}

/**
 * Handle Cortex Analysis button click
 */
async handleShowAIInsights() {
  try {
    console.log('🤖 Generating AI insights...');
    
    const button = document.getElementById('show-ai-insights-btn');
    const section = document.getElementById('ai-insights-section');
    const content = document.getElementById('ai-insights-content');
    
    if (!button || !section || !content) {
      console.error('AI Insights elements not found');
      return;
    }

    // Disable button and show loading
    button.disabled = true;
    button.innerHTML = `
      <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Generating...</span>
    `;
    
    // Show section with loading state
    section.classList.remove('hidden');
    content.innerHTML = `
      <div class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2" style="border-color: #99ccee;"></div>
        <span class="ml-3 text-gray-600">Generating insights...</span>
      </div>
    `;
    
    // Scroll to section
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Generate AI insights
    const insights = await this.aiService.generateInsights(this.dashboardData);
    
    // Display insights with improved formatting
      if (window.marked && typeof window.marked.parse === 'function') {
        const htmlContent = window.marked.parse(insights);
        content.innerHTML = `<div class="ai-insights-formatted">${htmlContent}</div>`;
      } else {
        const formattedText = this.formatAIInsightsText(insights);
        content.innerHTML = `<div class="ai-insights-formatted">${formattedText}</div>`;
      }

// Apply custom styles
this.applyAIInsightsStyles();
    
    // Update button to "Regenerate"
    button.disabled = false;
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 2v6h-6"></path>
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
        <path d="M3 22v-6h6"></path>
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
      </svg>
      <span>Regenerate Insights</span>
    `;
    
    console.log('✅ AI insights generated successfully');
    
  } catch (error) {
    console.error('❌ Error generating AI insights:', error);
    
    const button = document.getElementById('show-ai-insights-btn');
    const content = document.getElementById('ai-insights-content');
    
    if (content) {
      content.innerHTML = `
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800 font-medium mb-2">Failed to generate insights</p>
          <p class="text-red-600 text-sm">${error.message || 'An error occurred while generating insights'}</p>
        </div>
      `;
    }
    
    if (button) {
      button.disabled = false;
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" x2="12" y1="19" y2="22"></line>
        </svg>
        <span>Try Again</span>
      `;
    }
  }
}


 /* Handle clicks on AI Insights button using event delegation
 */
handleAIButtonClick(e) {
  // Verificar si el click fue en el botón SHOW AI INSIGHTS
  const showButton = e.target.closest('#show-ai-insights-btn');
  if (showButton) {
    e.preventDefault();
    console.log('🤖 AI Insights button clicked');
    this.handleShowAIInsights();
    return;
  }

  // Verificar si el click fue en el botón HIDE AI INSIGHTS
  const hideButton = e.target.closest('#hide-ai-insights-btn');
  if (hideButton) {
    e.preventDefault();
    console.log('👁️ Hide AI Insights button clicked');
    this.handleHideAIInsights();
    return;
  }

  // Verificar si el click fue en el botón TOGGLE MULTICOLLINEARITY
  const toggleMulticollinearityBtn = e.target.closest('#toggle-multicollinearity-btn');
  if (toggleMulticollinearityBtn) {
    e.preventDefault();
    console.log('📊 Toggle Multicollinearity button clicked');
    this.handleToggleMulticollinearity();
    return;
  }

  // Verificar si el click fue en el botón TOGGLE CHANNEL CONTRIBUTION
  const toggleChannelContributionBtn = e.target.closest('#toggle-channel-contribution-btn');
  if (toggleChannelContributionBtn) {
    e.preventDefault();
    console.log('📊 Toggle Channel Contribution button clicked');
    this.handleToggleChannelContribution();
    return;
  }
}


/**
 * Handle Hide AI Insights button click
 */
handleHideAIInsights() {
  const section = document.getElementById('ai-insights-section');
  const button = document.getElementById('show-ai-insights-btn');

  if (section) {
    // Smooth fade out animation
    section.style.opacity = '1';
    section.style.transition = 'opacity 0.3s ease-out';
    section.style.opacity = '0';

    setTimeout(() => {
      section.classList.add('hidden');
      section.style.opacity = '1'; // Reset for next time
    }, 300);

    console.log('👁️ AI Insights section hidden');
  }

  // Reset the show button to initial state
  if (button) {
    button.disabled = false;
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" x2="12" y1="19" y2="22"></line>
      </svg>
      <span>Cortex Analysis</span>
    `;
  }
}

/**
 * Handle Toggle Multicollinearity section button click
 */
handleToggleMulticollinearity() {
  const content = document.getElementById('multicollinearity-content');
  const btnText = document.getElementById('multicollinearity-btn-text');
  const icon = document.getElementById('multicollinearity-icon');

  if (!content || !btnText || !icon) {
    console.error('Multicollinearity elements not found');
    return;
  }

  // Check if currently hidden
  const isHidden = content.style.display === 'none';

  if (isHidden) {
    // Show content
    content.style.display = 'block';
    btnText.textContent = 'Hide';
    // Chevron up icon
    icon.innerHTML = '<path d="m18 15-6-6-6 6"></path>';
    console.log('📊 Multicollinearity section expanded');
  } else {
    // Hide content with smooth animation
    content.style.transition = 'opacity 0.3s ease-out';
    content.style.opacity = '0';

    setTimeout(() => {
      content.style.display = 'none';
      content.style.opacity = '1'; // Reset for next time
      btnText.textContent = 'Show';
      // Chevron down icon
      icon.innerHTML = '<path d="m6 9 6 6 6-6"></path>';
      console.log('📊 Multicollinearity section collapsed');
    }, 300);
  }
}

/**
 * Handle Toggle Channel Contribution section button click
 */
handleToggleChannelContribution() {
  const content = document.getElementById('channel-contribution-content');
  const btnText = document.getElementById('channel-contribution-btn-text');
  const icon = document.getElementById('channel-contribution-icon');

  if (!content || !btnText || !icon) {
    console.error('Channel Contribution elements not found');
    return;
  }

  // Check if currently hidden
  const isHidden = content.style.display === 'none';

  if (isHidden) {
    // Show content
    content.style.display = 'block';
    btnText.textContent = 'Hide';
    // Chevron up icon
    icon.innerHTML = '<path d="m18 15-6-6-6 6"></path>';
    console.log('📊 Channel Contribution section expanded');
  } else {
    // Hide content with smooth animation
    content.style.transition = 'opacity 0.3s ease-out';
    content.style.opacity = '0';

    setTimeout(() => {
      content.style.display = 'none';
      content.style.opacity = '1'; // Reset for next time
      btnText.textContent = 'Show';
      // Chevron down icon
      icon.innerHTML = '<path d="m6 9 6 6 6-6"></path>';
      console.log('📊 Channel Contribution section collapsed');
    }, 300);
  }
}

/**
 * Export current tab content to PNG
 */
async handleExportToPNG() {
  try {
    console.log('📸 Starting PNG export...');

    const button = document.getElementById('export-to-png-btn');
    if (!button) return;

    // Get the entire insights dashboard to export
    const dashboard = document.querySelector('.insights-dashboard');
    if (!dashboard) {
      console.error('❌ Dashboard not found');
      return;
    }

    // Show loading state
    const originalButtonHTML = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `
      <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Exporting...</span>
    `;

    // Wait a bit for button to update
    await new Promise(resolve => setTimeout(resolve, 100));

    // Get scroll position and temporarily scroll to top
    const originalScrollY = window.scrollY;
    window.scrollTo(0, 0);

    // Wait for scroll to complete
    await new Promise(resolve => setTimeout(resolve, 200));

    // Configure html2canvas with minimal modifications
    const canvas = await html2canvas(dashboard, {
      backgroundColor: '#ffffff',
      scale: 1.5, // Good quality without being too heavy
      logging: false,
      useCORS: true,
      allowTaint: false,
      scrollY: -window.scrollY,
      scrollX: -window.scrollX,
      windowHeight: document.documentElement.scrollHeight,
      onclone: (clonedDoc) => {
        // ===== HIDE ELEMENTS FOR EXPORT =====

        // Hide Export PNG button
        const exportBtn = clonedDoc.getElementById('export-to-png-btn');
        if (exportBtn) {
          exportBtn.style.display = 'none';
        }

        // Hide all Hide/Show buttons
        const hideShowButtons = [
          clonedDoc.getElementById('toggle-multicollinearity-btn'),
          clonedDoc.getElementById('toggle-channel-contribution-btn'),
          clonedDoc.getElementById('hide-ai-insights-btn')
        ];

        hideShowButtons.forEach(btn => {
          if (btn) {
            btn.style.display = 'none';
          }
        });

        // Hide tab navigation
        const tabNavigation = clonedDoc.getElementById('tab-navigation');
        if (tabNavigation) {
          tabNavigation.style.display = 'none';
        }

        // ===== ENSURE CONTENT IS VISIBLE =====

        // Ensure all collapsed sections are visible for export
        const multicollinearity = clonedDoc.getElementById('multicollinearity-content');
        if (multicollinearity && multicollinearity.style.display === 'none') {
          multicollinearity.style.display = 'block';
        }

        const channelContribution = clonedDoc.getElementById('channel-contribution-content');
        if (channelContribution && channelContribution.style.display === 'none') {
          channelContribution.style.display = 'block';
        }

        // Ensure SVG elements render correctly
        const svgs = clonedDoc.querySelectorAll('svg');
        svgs.forEach(svg => {
          if (svg.style.display === 'none') {
            svg.style.display = 'block';
          }
        });

        // ===== FIX METRIC CARDS CLIPPING FOR EXPORT =====
        const metricCardsContainer = clonedDoc.getElementById('metric-cards-container');
        if (metricCardsContainer) {
          metricCardsContainer.style.overflow = 'visible';

          // Target all spans with truncate class (the values)
          const valueSpans = metricCardsContainer.querySelectorAll('span.truncate');
          valueSpans.forEach(span => {
            const textContent = span.textContent || '';

            // If text is short (numbers like $61M, 0.32, 51.0%), show full
            if (textContent.length < 20) {
              span.classList.remove('truncate');
              span.style.overflow = 'visible';
              span.style.textOverflow = 'clip';
              span.style.whiteSpace = 'nowrap';
              span.style.maxWidth = 'none';
            } else {
              // For long text, manually truncate to 17 chars + "..."
              span.classList.remove('truncate');
              span.textContent = textContent.substring(0, 17) + '...';
              span.style.overflow = 'visible';
              span.style.whiteSpace = 'nowrap';
              span.style.maxWidth = 'none';
            }
          });

          // Ensure metric cards themselves have overflow visible
          const metricCards = metricCardsContainer.querySelectorAll('.metric-card');
          metricCards.forEach(card => {
            card.style.overflow = 'visible';
          });
        }

        // ===== FIX CHANNEL CARDS CLIPPING (PERFORMANCE VIEW) =====
        const channelCards = clonedDoc.querySelectorAll('.channel-card');
        channelCards.forEach(card => {
          // Ensure card itself has visible overflow
          card.style.overflow = 'visible';

          // Find the h4 element with truncate class (channel name)
          const channelNameHeader = card.querySelector('h4.truncate');
          if (channelNameHeader) {
            const textContent = channelNameHeader.textContent || '';

            // Get parent container (the flex container with icon)
            const flexContainer = channelNameHeader.parentElement;
            if (flexContainer) {
              flexContainer.style.overflow = 'visible';
              flexContainer.style.height = 'auto'; // Remove fixed height
              flexContainer.style.minHeight = '24px'; // Use min-height instead
            }

            // Remove truncate class and padding-right
            channelNameHeader.classList.remove('truncate');
            channelNameHeader.style.paddingRight = '0'; // Remove pr-2 to avoid pushing icon

            // If text is short, show full
            if (textContent.length < 20) {
              channelNameHeader.style.overflow = 'visible';
              channelNameHeader.style.textOverflow = 'clip';
              channelNameHeader.style.whiteSpace = 'nowrap';
              channelNameHeader.style.maxWidth = 'calc(100% - 35px)'; // Reserve space for icon
              channelNameHeader.style.flexGrow = '0'; // Don't grow
              channelNameHeader.style.flexShrink = '1'; // Allow shrinking if needed
            } else {
              // For long text, manually truncate to 23 chars + "..."
              channelNameHeader.textContent = textContent.substring(0, 23) + '...';
              channelNameHeader.style.overflow = 'visible';
              channelNameHeader.style.whiteSpace = 'nowrap';
              channelNameHeader.style.maxWidth = 'calc(100% - 35px)'; // Reserve space for icon
              channelNameHeader.style.flexGrow = '0'; // Don't grow
              channelNameHeader.style.flexShrink = '1'; // Allow shrinking if needed
            }
          }
        });
      }
    });

    // Restore scroll position
    window.scrollTo(0, originalScrollY);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create image blob');
      }

      // Generate filename with current tab and date
      const tabName = this.getActiveTabName();
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const filename = `mmm-${tabName}-${date}.png`;

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log(`✅ PNG exported successfully: ${filename}`);

      // Restore button state
      button.disabled = false;
      button.innerHTML = originalButtonHTML;
    }, 'image/png');

  } catch (error) {
    console.error('❌ Error exporting to PNG:', error);

    // Restore button state
    const button = document.getElementById('export-to-png-btn');
    if (button) {
      button.disabled = false;
      button.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
        </svg>
        Export PNG
      `;
    }

    // Show error message to user
    alert('Failed to export image. Please try again.');
  }
}

/**
 * Get the name of the currently active tab
 */
getActiveTabName() {
  const tabMap = {
    'channel-performance': 'channel-performance',
    'statistical-analysis': 'statistical-analysis',
    'budget-allocation': 'budget-allocation',
    'budget-optimizer': 'budget-optimizer'
  };

  return tabMap[this.currentTab] || 'insights';
}

// 5. AGREGAR MÉTODO: handleShowAIInsights
/**
 * Generate and display AI insights
 */
/*async handleShowAIInsights() {
  try {
    console.log('🤖 Starting AI insights generation...');
    
    const button = document.getElementById('show-ai-insights-btn');
    const section = document.getElementById('ai-insights-section');
    const content = document.getElementById('ai-insights-content');
    
    if (!button) {
      console.error('❌ Button not found');
      return;
    }
    
    if (!section) {
      console.error('❌ AI Insights section not found');
      return;
    }
    
    if (!content) {
      console.error('❌ AI Insights content container not found');
      return;
    }

    console.log('✅ All elements found, proceeding...');

    // Disable button and show loading state
    button.disabled = true;
    button.innerHTML = `
      <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Generating...</span>
    `;
    
    // Show section with loading state
    section.classList.remove('hidden');
    content.innerHTML = `
      <div class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2" style="border-color: #99ccee;"></div>
        <span class="ml-3 text-gray-600">Generating insights...</span>
      </div>
    `;
    
    // Scroll to section smoothly
    setTimeout(() => {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    
    console.log('🤖 Calling AI service...');
    
    // Generate AI insights
    const insights = await this.aiService.generateInsights(this.dashboardData);
    
    console.log('✅ AI insights received');
    
    // Display insights with markdown support if available
    if (window.marked && typeof window.marked.parse === 'function') {
      content.innerHTML = window.marked.parse(insights);
    } else {
      content.innerHTML = `<div class="whitespace-pre-wrap text-gray-700 leading-relaxed">${insights}</div>`;
    }
    
    // Update button to "Regenerate"
    button.disabled = false;
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 2v6h-6"></path>
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
        <path d="M3 22v-6h6"></path>
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
      </svg>
      <span>Regenerate Insights</span>
    `;
    
    console.log('✅ AI insights displayed successfully');
    
  } catch (error) {
    console.error('❌ Error generating AI insights:', error);
    
    const button = document.getElementById('show-ai-insights-btn');
    const content = document.getElementById('ai-insights-content');
    
    if (content) {
      content.innerHTML = `
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800 font-medium mb-2">⚠️ Failed to generate insights</p>
          <p class="text-red-600 text-sm">${error.message || 'An error occurred while generating insights. Please try again.'}</p>
        </div>
      `;
    }
    
    if (button) {
      button.disabled = false;
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" x2="12" y1="19" y2="22"></line>
        </svg>
        <span>Try Again</span>
      `;
    }
  }
}*/

// 6. AGREGAR método de limpieza (opcional, buena práctica)
/**
 * Cleanup event listeners
 */
cleanup() {
  document.body.removeEventListener('click', this.handleAIButtonClick);
}


/**
 * Format AI insights text when markdown is not available
 */
formatAIInsightsText(text) {
  // Convertir líneas numeradas a listas
  text = text.replace(/^(\d+)\.\s+(.+)$/gm, '<li class="ml-4 mb-2"><strong>$1.</strong> $2</li>');
  
  // Convertir **texto** en negritas
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Convertir líneas vacías en párrafos
  text = text.replace(/\n\n/g, '</p><p class="mb-4">');
  
  // Envolver en párrafo
  text = `<p class="mb-4">${text}</p>`;
  
  return text;
}

/**
 * Apply custom CSS styles to AI Insights section
 */
applyAIInsightsStyles() {
  if (document.getElementById('ai-insights-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'ai-insights-styles';
  style.textContent = `
    .ai-insights-formatted {
      font-size: 0.9rem;
      line-height: 1.7;
      color: #374151;
    }
    
    .ai-insights-formatted h1,
    .ai-insights-formatted h2 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #1f2937;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 0.5rem;
    }
    
    .ai-insights-formatted h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
      margin-top: 1.25rem;
      margin-bottom: 0.5rem;
    }
    
    .ai-insights-formatted h1:first-child,
    .ai-insights-formatted h2:first-child {
      margin-top: 0;
    }
    
    .ai-insights-formatted p {
      margin-bottom: 1rem;
      color: #4b5563;
    }
    
    .ai-insights-formatted strong {
      font-weight: 600;
      color: #1f2937;
    }
    
    .ai-insights-formatted ul,
    .ai-insights-formatted ol {
      margin-left: 1.5rem;
      margin-bottom: 1rem;
    }
    
    .ai-insights-formatted li {
      margin-bottom: 0.5rem;
      color: #4b5563;
    }
    
    .ai-insights-formatted li strong {
      color: #99ccee;
    }

    .ai-insights-formatted code {
      background-color: #f3f4f6;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      font-size: 0.85em;
      color: #99ccee;
    }
  `;
  
  document.head.appendChild(style);
}








/**
 * Handle budget optimization request
 * Collects form data, saves parameters, and triggers optimization workflow
 */
async handleOptimizationRequest() {
  try {
    console.log("🚀 Starting budget optimization...");

    // Disable button and show overlay
    this.disableOptimizationButton();
    this.showOptimizationWorkflowOverlay();

     // Clear previous results in Expected Results section
    this.clearExpectedResults();
    
    // Validate that dashboard data is loaded
    if (!this.dashboardData || !this.dashboardData.channels) {
      this.showToast("Dashboard data not loaded. Please refresh the page.", "error");
      console.error('❌ Dashboard data missing:', this.dashboardData);
      return;
    }
    
    console.log('✅ Dashboard data available:', {
      channels: this.dashboardData.channels?.length || 0,
      hasChannels: !!this.dashboardData.channels
    });
    
    // Get form values
    const totalBudget = document.getElementById('optimizer-total-budget')?.value;
    const timeframe = document.getElementById('optimizer-timeframe')?.value;
    const objective = document.getElementById('optimizer-objective')?.value;

    // Validate inputs
    if (!totalBudget || totalBudget <= 0) {
      this.showToast("Please enter a valid total budget", "error");
      return;
    }

    // Validate that we have a document_id (from MMM configuration)
    if (!this.appState.documentId) {
      this.showToast("Please complete the MMM analysis first before optimizing budget", "error");
      return;
    }

    // Collect channel constraints
    const channelConstraints = this.collectChannelConstraints();

    // Prepare optimization parameters
    const optimizationParams = {
      document_id: this.appState.documentId,
      total_budget: parseFloat(totalBudget),
      timeframe: timeframe,
      objective: objective,
      channel_constraints: channelConstraints
    };

    console.log("💾 Budget Optimizer parameters to save:", optimizationParams);

    // Store in AppState
    this.appState.setBudgetOptimizerParams(optimizationParams);

    // Show loading toast
    this.showToast("Saving budget optimizer parameters...", "info");

    // Save to AppDB
    const budgetOptimizerDocId = await this.dataService.saveBudgetOptimizerParams(optimizationParams);
    
    // Mark as saved in AppState
    this.appState.markBudgetOptimizerAsSaved();

    console.log("✅ Budget Optimizer parameters saved with ID:", budgetOptimizerDocId);
    this.showToast("Parameters saved! Launching optimization workflow...", "success");

    // Launch Budget Optimizer Workflow
    console.log("🔥 Launching Budget Optimizer workflow...");
    
    try {
      const executionId = await this.workflowService.launchBudgetOptimizerWorkflow(
        this.appState.documentId,
        budgetOptimizerDocId
      );

      console.log("✅ Budget Optimizer workflow launched:", executionId);
      this.showToast("Optimization workflow started successfully!", "success");
      
      
      // Poll workflow status
      this.pollBudgetOptimizerWorkflow(executionId);

    } catch (workflowError) {
      console.error("❌ Workflow launch failed:", workflowError);
      this.showToast("Workflow launch failed. Showing mock results instead.", "error");
      
      // Fallback to mock optimization
      const results = await this.runOptimizationWorkflow(optimizationParams);
      this.showOptimizationResults(results);
      this.showDetailedOptimizationResults(results);
    }

  } catch (error) {
    console.error("❌ Error during optimization:", error);
    this.showToast("Failed to save parameters or run optimization. Please try again.", "error");
    this.resetOptimizationUI();
  }
}


/**
 * Collect channel-specific constraints from the form
 * @returns {Array} Array of channel constraint objects
 */
collectChannelConstraints() {
  const constraints = [];
  const channels = this.dashboardData?.channels || [];

  console.log('🔍 Collecting channel constraints...');
  console.log('📊 Available channels:', channels);

  channels.forEach((channel, index) => {
    const channelName = channel.channel_name || channel.name || `Channel ${index + 1}`;
    
    console.log(`\n🔎 Processing channel: "${channelName}"`);
    
    // Check if "Use Default Constraints" is checked
    const useDefaultCheckbox = document.querySelector(`.use-default-constraints-checkbox[data-channel="${channelName}"]`);
    const useDefault = useDefaultCheckbox?.checked || false;
    
    console.log('  Use Default Constraints:', useDefault);
    
    let minSpend = 0;
    let maxSpend = 0;
    
    if (!useDefault) {
  // If NOT using defaults, get custom values from inputs
  const minSpendInput = document.querySelector(`.channel-min-spend[data-channel="${channelName}"]`);
  const maxSpendInput = document.querySelector(`.channel-max-spend[data-channel="${channelName}"]`);
  
  minSpend = parseFloat(minSpendInput?.value) || 0;
  maxSpend = parseFloat(maxSpendInput?.value) || 0;
  
  console.log('  Custom Min spend:', minSpend);
  console.log('  Custom Max spend:', maxSpend);
} else {
  // If using defaults, will be filtered out (not sent to workflow)
  console.log('  Using default constraints (will be excluded from payload)');
}

    const constraint = {
      channelName: channelName,
      minSpend: minSpend,
      maxSpend: maxSpend,
      useDefaultConstraints: useDefault,
      currentSpend: channel.spend || channel.investment || 60000,
      iroas: channel.iroas || channel.iROAS || 0
    };

    console.log('  ✅ Constraint created:', constraint);
    constraints.push(constraint);
  });

 // Filter out channels with "Use Default Constraints" checked
const filteredConstraints = constraints.filter(constraint => !constraint.useDefaultConstraints);

console.log('\n📋 All constraints:', constraints);
console.log('📋 Filtered constraints (only custom):', filteredConstraints);

return filteredConstraints;
}

/**
 * Show loading state in optimizer results area
 */
showOptimizationLoading() {
  const resultsContent = document.getElementById('optimizer-results-content');
  if (!resultsContent) return;

  const optimizer = this.tabContentRenderer.budgetOptimizer;
  
  // Start at 0% and animate
  let progress = 0;
  resultsContent.innerHTML = optimizer.renderLoadingState(progress);

  // Simulate progress updates
  this.optimizationProgressInterval = setInterval(() => {
    progress += 11;
    if (progress >= 99) {
      progress = 99;
      clearInterval(this.optimizationProgressInterval);
    }
    resultsContent.innerHTML = optimizer.renderLoadingState(progress);
  }, 500);
}


/**
 * Run optimization workflow
 * @param {Object} params - Optimization parameters
 * @returns {Promise<Object>} Optimization results
 */
async runOptimizationWorkflow(params) {
  // TODO: Replace with actual workflow call
  console.log("📊 Running optimization with params:", params);
  
  // Simulate workflow execution time
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Generate results based on actual channels and constraints
  const results = this.generateOptimizationResults(params);

  return results;
}


/**
 * Generate optimization results (mock for now, will be replaced by workflow)
 * @param {Object} params - Optimization parameters
 * @returns {Object} Optimization results
 */
generateOptimizationResults(params) {
  const channels = this.dashboardData?.channels || [];
  
  // Validate that we have channels data
  if (!channels || channels.length === 0) {
    console.error('❌ No channels data available');
    throw new Error('No channels data available. Please ensure MMM analysis has been completed.');
  }
  
  console.log('💡 Generating optimization results...');
  console.log('  Channels available:', channels.length);
  console.log('  Params received:', params);
  
  const totalBudget = params.total_budget || params.totalBudget || 0;
  const channelConstraints = params.channel_constraints || params.channelConstraints || [];

  console.log('  Total budget:', totalBudget);
  console.log('  Channel constraints:', channelConstraints);

  // Generate allocations based on iROAS (simplified algorithm)
  const channelAllocations = channels.map((channel, index) => {
    const channelName = channel.channel_name || channel.name || `Channel ${index + 1}`;
    
    // Find constraint for this channel
    const constraint = channelConstraints.find(c => c.channelName === channelName);
    
    console.log(`  Processing ${channelName}:`, {
      constraint: constraint,
      channelData: channel
    });
    
    const iroas = channel.iroas || channel.iROAS || 3.0;
    
    // Simple allocation: distribute based on iROAS weighted
    const baseAllocation = totalBudget / channels.length;
    const weight = iroas / 5.0; // Normalize
    const newAllocation = Math.min(
      Math.max(baseAllocation * weight, constraint?.minSpend || 5000),
      constraint?.maxSpend || 80000
    );

    return {
      name: channelName,
      currentAllocation: constraint?.currentSpend || channel.spend || 60000,
      newAllocation: Math.round(newAllocation),
      iroas: iroas
    };
  });

  // Normalize allocations to match total budget
  const totalAllocated = channelAllocations.reduce((sum, c) => sum + c.newAllocation, 0);
  const adjustmentFactor = totalBudget / totalAllocated;
  
  channelAllocations.forEach(channel => {
    channel.newAllocation = Math.round(channel.newAllocation * adjustmentFactor);
  });

  // Calculate metrics
  const projectedRevenue = totalBudget * 3.86; // Mock multiplier
  const currentRevenue = channelAllocations.reduce((sum, c) => sum + (c.currentAllocation * 3.0), 0);
  const revenueLift = ((projectedRevenue - currentRevenue) / currentRevenue) * 100;
  const averageROAS = projectedRevenue / totalBudget;

  const results = {
    projectedRevenue: projectedRevenue,
    revenueLift: revenueLift,
    averageROAS: averageROAS,
    channelAllocations: channelAllocations,
    totalBudget: totalBudget
  };

  console.log('✅ Optimization results generated:', results);

  return results;
}


/**
 * Show optimization results in Expected Results panel
 * @param {Object} results - Optimization results data
 */
showOptimizationResults(results) {
  if (this.optimizationProgressInterval) {
    clearInterval(this.optimizationProgressInterval);
  }

  const resultsContent = document.getElementById('optimizer-results-content');
  if (!resultsContent) return;

  const optimizer = this.tabContentRenderer.budgetOptimizer;
  resultsContent.innerHTML = optimizer.renderResults(results);
}

/**
 * Show detailed optimization results section below the form
 * @param {Object} results - Optimization results data
 */
showDetailedOptimizationResults(results) {
  const resultsSection = document.getElementById('optimization-results-section');
  if (!resultsSection) return;

  const optimizer = this.tabContentRenderer.budgetOptimizer;
  resultsSection.innerHTML = optimizer.renderDetailedResults(results);
  resultsSection.classList.remove('hidden');

  // Initialize the chart after rendering
  setTimeout(() => {
    this.renderBudgetAllocationChart(results);
    this.setupOptimizationResultsTabs();
  }, 100);
}

/**
 * Render budget allocation chart using Chart.js
 * @param {Object} results - Optimization results
 */
renderBudgetAllocationChart(results) {
  const canvas = document.getElementById('budget-allocation-chart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // Destroy existing chart if it exists
  if (this.budgetAllocationChart) {
    this.budgetAllocationChart.destroy();
  }

  const channelNames = results.channelAllocations.map(c => c.name);
  const currentAllocations = results.channelAllocations.map(c => c.currentAllocation);
  const newAllocations = results.channelAllocations.map(c => c.newAllocation);

  this.budgetAllocationChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: channelNames,
      datasets: [
        {
          label: 'Current Allocation',
          data: currentAllocations,
          backgroundColor: '#E5E7EB',
          borderRadius: 6,
          barThickness: 40
        },
        {
          label: 'Optimized Allocation',
          data: newAllocations,
          backgroundColor: '#93C5FD',
          borderRadius: 6,
          barThickness: 40
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + (value / 1000) + 'K';
            }
          },
          grid: {
            color: '#F3F4F6'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

/**
 * Setup event listeners for optimization results tabs
 */
setupOptimizationResultsTabs() {
  document.querySelectorAll('.optimization-result-tab').forEach(button => {
    button.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;
      
      // Update active tab styling
      document.querySelectorAll('.optimization-result-tab').forEach(btn => {
        btn.classList.remove('border-blue-500', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-gray-500');
      });
      
      e.target.classList.remove('border-transparent', 'text-gray-500');
      e.target.classList.add('border-blue-500', 'text-blue-600');
      
      // Switch tab content
      const contentContainer = document.getElementById('optimization-result-content');
      if (!contentContainer) return;
      
      const optimizer = this.tabContentRenderer.budgetOptimizer;
      const results = this.currentOptimizationResults;
      
      if (tabName === 'budget-allocation') {
        contentContainer.innerHTML = optimizer.renderBudgetAllocationTab(results);
        setTimeout(() => this.renderBudgetAllocationChart(results), 100);
      } else if (tabName === 'revenue-projection') {
        contentContainer.innerHTML = optimizer.renderRevenueProjectionTab(results);
      }
    });
  });
}

/**
 * Reset optimization UI to initial state
 */
resetOptimizationUI() {
  if (this.optimizationProgressInterval) {
    clearInterval(this.optimizationProgressInterval);
  }

  const resultsContent = document.getElementById('optimizer-results-content');
  if (resultsContent) {
    const optimizer = this.tabContentRenderer.budgetOptimizer;
    resultsContent.innerHTML = optimizer.renderResultsPlaceholder();
  }

  const resultsSection = document.getElementById('optimization-results-section');
  if (resultsSection) {
    resultsSection.classList.add('hidden');
  }
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, info)
 */
showToast(message, type = 'info') {
  const toast = document.createElement('div');
  const bgColor = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500';
  
  toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}


/**
 * Poll Budget Optimizer workflow execution status
 * @param {string} executionId - Workflow execution ID
 */
/**
 * Poll Budget Optimizer workflow execution status using Code Engine
 * @param {string} executionId - Workflow execution ID
 */
pollBudgetOptimizerWorkflow(executionId) {
  console.log('📊 Starting to poll Budget Optimizer workflow:', executionId);
  
  let pollCount = 0;
  const maxPolls = 60; // 60 polls * 5 seconds = 5 minutes max
  
  const pollInterval = setInterval(async () => {
    pollCount++;
    
    try {
      // Use Code Engine getWorkflowExecution
      const statusData = await this.workflowService.getBudgetOptimizerExecutionStatus(executionId);
      const currentStatus = statusData?.status?.toLowerCase();
      
      console.log(`📡 Poll ${pollCount}/${maxPolls} - Status: ${currentStatus}`);
      
      if (currentStatus === 'completed') {
        clearInterval(pollInterval);
        console.log('✅ Budget Optimizer workflow completed!');
        this.showToast("Optimization completed! Loading results...", "success");
        
        // Load results from workflow output
        await this.loadBudgetOptimizerResults(executionId, statusData);
        
      } else if (['failed', 'canceled', 'timeout', 'error'].includes(currentStatus)) {
        clearInterval(pollInterval);
        console.error(`❌ Workflow ${currentStatus}`);
        
        // Hide overlay and enable button
          this.hideOptimizationWorkflowOverlay();
          this.enableOptimizationButton();    

            this.showToast(`Workflow ${currentStatus}. Showing mock results.`, "error");    
        // Fallback to mock results
        const params = this.appState.getBudgetOptimizerParams();
        const results = await this.runOptimizationWorkflow(params);
        this.showOptimizationResults(results);
        this.showDetailedOptimizationResults(results);
        
      } else if (pollCount >= maxPolls) {
        clearInterval(pollInterval);
        console.error('❌ Workflow polling timeout');
        // Hide overlay and enable button
        
  

        this.showToast("Workflow timeout. Showing mock results.", "error");
        
        // Fallback to mock results
        const params = this.appState.getBudgetOptimizerParams();
        const results = await this.runOptimizationWorkflow(params);
        this.showOptimizationResults(results);
        this.showDetailedOptimizationResults(results);

        // Hide overlay and enable button
        this.hideOptimizationWorkflowOverlay();
        this.enableOptimizationButton();
      }
      
    } catch (error) {
      console.error('❌ Error polling workflow status:', error);
      
      if (pollCount >= 3) { // After 3 failed attempts, give up
        clearInterval(pollInterval);
        this.showToast("Error checking workflow status. Showing mock results.", "error");
        
        // Fallback to mock results
        const params = this.appState.getBudgetOptimizerParams();
        const results = await this.runOptimizationWorkflow(params);
        this.showOptimizationResults(results);
        this.showDetailedOptimizationResults(results);
      }
    }
    
  }, 5000); // Poll every 5 seconds
}

/**
 * Load Budget Optimizer results from workflow execution
 * @param {string} executionId - Workflow execution ID
 * @param {Object} statusData - Execution status data
 */
async loadBudgetOptimizerResults(executionId, statusData) {
  try {
    console.log('📥 Loading Budget Optimizer results from execution:', executionId);
    console.log('📊 Status data:', statusData);
    
    // Load real results from optimization_details_df dataset
    const documentId = this.appState.documentId;
    
    if (!documentId) {
      throw new Error('Document ID not found. Cannot load optimization results.');
    }

    console.log('🔍 Loading results from dataset for document:', documentId);

    // Load optimization metrics and channel allocations in parallel
    const [optimizationData, channelAllocations] = await Promise.all([
      this.dataService.loadBudgetOptimizerResults(documentId),
      this.dataService.loadChannelAllocations(documentId)
    ]);
    
    console.log('✅ Optimization data loaded:', optimizationData);
    console.log('✅ Channel allocations loaded:', channelAllocations);

    // Combine results
    const combinedResults = {
      projectedRevenue: optimizationData.projectedRevenue,
      revenueLift: optimizationData.revenueLift,
      averageROAS: optimizationData.averageROAS,
      channelAllocations: channelAllocations,
      totalBudget: this.appState.getBudgetOptimizerParams().total_budget
    };

    console.log('📊 Final combined results:', combinedResults);

    this.currentOptimisationResults = combinedResults;

    // Display results in Expected Results panel
    this.showOptimizationResults(combinedResults);
    
    // Display detailed results section below with tabs
    this.showDetailedOptimisationResults(combinedResults);

    // Hide overlay and enable button AFTER results are displayed
    console.log('✅ Results displayed, hiding overlay');
    this.hideOptimizationWorkflowOverlay();
    this.enableOptimizationButton();
    
  } catch (error) {
    console.error('❌ Error loading Budget Optimizer results:', error);
    
    // ALWAYS hide overlay and enable button, even on error
    this.hideOptimizationWorkflowOverlay();
    this.enableOptimizationButton();
    
    this.showToast("Error loading results from dataset. Showing mock results.", "error");
    
    // Fallback to mock results
    try {
      const params = this.appState.getBudgetOptimizerParams();
      const results = await this.runOptimizationWorkflow(params);
      this.showOptimizationResults(results);
      this.showDetailedOptimisationResults(results);
    } catch (fallbackError) {
      console.error('❌ Even fallback failed:', fallbackError);
      this.resetOptimizationUI();
    }
  }
}


/**
 * Show loading overlay during optimization workflow
 */
showOptimizationWorkflowOverlay() {
  // Create overlay if it doesn't exist
  let overlay = document.getElementById('optimization-workflow-overlay');
  
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'optimization-workflow-overlay';
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
    overlay.innerHTML = `
      <div class="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <!-- Loading Icon -->
        <div class="flex justify-center mb-6">
          <div class="relative">
            <div class="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div class="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
        </div>
        
        <!-- Status Text -->
        <h3 class="text-xl font-bold text-gray-900 text-center mb-2">Optimizing Budget</h3>
        <p id="optimization-phase-text" class="text-sm text-gray-600 text-center mb-4">
          Initializing optimization...
        </p>
        
        <!-- Progress indicator -->
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div id="optimization-progress-bar" class="bg-blue-500 h-2 rounded-full transition-all duration-500" style="width: 0%"></div>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
  }
  
  overlay.classList.remove('hidden');
  
  // Start phase animation
  this.startOptimizationPhases();
}

/**
 * Hide loading overlay
 */
hideOptimizationWorkflowOverlay() {
  const overlay = document.getElementById('optimization-workflow-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
  
  // Clear phase interval if running
  if (this.optimizationPhaseInterval) {
    clearInterval(this.optimizationPhaseInterval);
    this.optimizationPhaseInterval = null;
  }
}

/**
 * Cycle through optimization phases
 */
startOptimizationPhases() {
  const phases = [
    'Analyzing Channel Data',
    'Processing iROAS Values',
    'Calculating Optimal Allocations',
    'Applying Constraints',
    'Validating Results',
    'Generating Recommendations'
  ];
  
  let currentPhaseIndex = 0;
  const phaseText = document.getElementById('optimization-phase-text');
  const progressBar = document.getElementById('optimization-progress-bar');
  
  // Update initial phase
  if (phaseText) {
    phaseText.textContent = phases[0];
  }
  if (progressBar) {
    progressBar.style.width = '0%';
  }
  
  // Cycle through phases
  this.optimizationPhaseInterval = setInterval(() => {
    currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
    
    if (phaseText) {
      phaseText.textContent = phases[currentPhaseIndex];
    }
    
    if (progressBar) {
      const progress = ((currentPhaseIndex + 1) / phases.length) * 100;
      progressBar.style.width = `${progress}%`;
    }
  }, 30000); // 
}

/**
 * Disable Run Optimization button
 */
disableOptimizationButton() {
  const button = document.getElementById('run-optimization-btn');
  if (button) {
    button.disabled = true;
    button.style.opacity = '0.5';
    button.style.cursor = 'not-allowed';
    button.innerHTML = `
      <svg class="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Running Optimization...</span>
    `;
  }
}

/**
 * Enable Run Optimization button
 */
enableOptimizationButton() {
  const button = document.getElementById('run-optimization-btn');
  if (button) {
    button.disabled = false;
    button.style.opacity = '1';
    button.style.cursor = 'pointer';
    button.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>Run Optimisation</span>
    `;
  }
}


/**
 * Clear Expected Results section and Optimisation Results section
 */
clearExpectedResults() {
  // Clear Expected Results panel
  const resultsContent = document.getElementById('optimizer-results-content');
  if (resultsContent) {
    const optimizer = this.tabContentRenderer.budgetOptimizer;
    resultsContent.innerHTML = optimizer.renderResultsPlaceholder();
  }
  
  // Clear Optimisation Results section
  const optimisationResultsContainer = document.getElementById('optimisation-results-container');
  if (optimisationResultsContainer) {
    optimisationResultsContainer.innerHTML = '';
  }
  
  // Also clear the section if it exists directly
  const optimisationResultsSection = document.getElementById('optimisation-results-section');
  if (optimisationResultsSection) {
    optimisationResultsSection.remove();
  }
  
  console.log('🧹 Expected Results and Optimisation Results sections cleared');
}


/**
 * Show detailed optimisation results section below the form
 * @param {Object} results - Optimisation results with channel allocations
 */
showDetailedOptimisationResults(results) {
  console.log('📊 Showing detailed optimisation results');
  
  // Find or create container after the Run Optimisation button
  let resultsContainer = document.getElementById('optimisation-results-section');
  
  if (!resultsContainer) {
    // Create container after the button
    const buttonContainer = document.querySelector('#run-optimization-btn')?.parentElement;
    if (buttonContainer) {
      resultsContainer = document.createElement('div');
      resultsContainer.id = 'optimisation-results-container';
      buttonContainer.parentElement.insertBefore(resultsContainer, buttonContainer.nextSibling);
    }
  }
  
  if (!resultsContainer) {
    console.error('❌ Could not find container for optimisation results');
    return;
  }
  
  // Render the results section
  resultsContainer.innerHTML = this.optimisationResultsComponent.render(results);
  
  // Initialize the D3 chart after rendering
  setTimeout(() => {
    this.renderOptimisationD3Chart(results.channelAllocations);
    this.setupOptimisationResultsTabs();
  }, 100);
}

/**
 * Setup event listeners for optimisation results tabs
 */
setupOptimisationResultsTabs() {
  document.querySelectorAll('.optimisation-result-tab').forEach(button => {
    button.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;
      
      console.log('🔄 Switching optimisation results tab to:', tabName);
      
      // Update active tab styling
      document.querySelectorAll('.optimisation-result-tab').forEach(btn => {
        btn.classList.remove('border-blue-500', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-gray-500');
      });
      
      e.target.classList.remove('border-transparent', 'text-gray-500');
      e.target.classList.add('border-blue-500', 'text-blue-600');
      
      // Switch tab content
      const contentContainer = document.getElementById('optimisation-result-content');
      if (!contentContainer) return;
      
      // Get current results from the last optimization
      const results = this.currentOptimisationResults;
      
      if (tabName === 'budget-allocation') {
        contentContainer.innerHTML = this.optimisationResultsComponent.renderBudgetAllocationTab(results?.channelAllocations || []);
        setTimeout(() => this.renderOptimisationD3Chart(results?.channelAllocations || []), 100);
      } else if (tabName === 'revenue-projection') {
        contentContainer.innerHTML = this.optimisationResultsComponent.renderRevenueProjectionTab();
      }
    });
  });
}


/**
 * Render D3 grouped bar chart for Optimisation Results
 * @param {Array} channelAllocations - Array of channel allocation objects
 */
renderOptimisationD3Chart(channelAllocations) {
  const chartId = 'optimisation-d3-chart';
  const container = d3.select(`#${chartId}`);
  
  if (container.empty()) {
    console.error('D3 chart container not found');
    return;
  }

  // Clear existing chart
  container.selectAll('*').remove();

  // Sort channels by optimized allocation (highest first)
  const sortedChannels = [...channelAllocations].sort((a, b) => 
    (b.newAllocation || 0) - (a.newAllocation || 0)
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

  // X Scale for bars within each group (current vs optimized)
  const x1 = d3.scaleBand()
    .domain(['current', 'optimized'])
    .range([0, x0.bandwidth()])
    .padding(0.1);

  // Y Scale
  const maxAllocation = d3.max(sortedChannels, d => 
    Math.max(d.currentAllocation || 0, d.newAllocation || 0)
  ) || 100000;
  
  const yScale = d3.scaleLinear()
    .domain([0, maxAllocation * 1.2])
    .range([height, 0]);

  // Color scheme
  const colors = {
    current: '#D1D5DB',      // Light gray for current
    optimized: '#9ec2e6'     // Domo blue for optimized
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
  let tooltip = d3.select('#optimisation-allocation-tooltip');
  if (tooltip.empty()) {
    tooltip = container
      .append('div')
      .attr('id', 'optimisation-allocation-tooltip')
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

  // Helper function to format numbers
  const formatNumber = (num) => {
    return Math.round(num).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // Draw grouped bars for each channel
  sortedChannels.forEach(channel => {
    const channelGroup = g.append('g')
      .attr('transform', `translate(${x0(channel.name)},0)`);

    // Current Allocation Bar (Light Gray)
    const currentAllocation = channel.currentAllocation || 0;
    const currentBarHeight = height - yScale(currentAllocation);
    const currentBarY = yScale(currentAllocation);

    const currentHighlight = channelGroup.append('rect')
      .attr('class', 'bar-highlight-current')
      .attr('x', x1('current'))
      .attr('y', 0)
      .attr('width', x1.bandwidth())
      .attr('height', height)
      .style('fill', '#f3f4f6')
      .style('opacity', 0)
      .style('pointer-events', 'none');

    channelGroup.append('rect')
      .attr('class', 'bar-current')
      .attr('x', x1('current'))
      .attr('y', currentBarY)
      .attr('width', x1.bandwidth())
      .attr('height', currentBarHeight)
      .style('fill', colors.current)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event) {
        g.selectAll('.bar-highlight-current').style('opacity', 0);
        g.selectAll('.bar-highlight-optimized').style('opacity', 0);
        
        currentHighlight.style('opacity', 1);
        
        tooltip
          .style('opacity', 1)
          .html(`
            <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${channel.name}</div>
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 2px;">Current Allocation</div>
            <div style="color: #9CA3AF; font-weight: 600; font-size: 16px;">
              $${formatNumber(currentAllocation)}
            </div>
          `)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 15) + 'px');
      })
      .on('mouseleave', function() {
        currentHighlight.style('opacity', 0);
        tooltip.style('opacity', 0);
      });

    // Value label for current allocation
    if (currentAllocation > 0) {
      channelGroup.append('text')
        .attr('x', x1('current') + x1.bandwidth() / 2)
        .attr('y', currentBarY - 6)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('font-weight', '600')
        .style('fill', '#6b7280')
        .style('pointer-events', 'none')
        .text('$' + formatNumber(currentAllocation));
    }

    // Optimized Allocation Bar (Domo Blue)
    const optimizedAllocation = channel.newAllocation || 0;
    const optimizedBarHeight = height - yScale(optimizedAllocation);
    const optimizedBarY = yScale(optimizedAllocation);

    const optimizedHighlight = channelGroup.append('rect')
      .attr('class', 'bar-highlight-optimized')
      .attr('x', x1('optimized'))
      .attr('y', 0)
      .attr('width', x1.bandwidth())
      .attr('height', height)
      .style('fill', '#dbeafe')
      .style('opacity', 0)
      .style('pointer-events', 'none');

    channelGroup.append('rect')
      .attr('class', 'bar-optimized')
      .attr('x', x1('optimized'))
      .attr('y', optimizedBarY)
      .attr('width', x1.bandwidth())
      .attr('height', optimizedBarHeight)
      .style('fill', colors.optimized)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event) {
        g.selectAll('.bar-highlight-current').style('opacity', 0);
        g.selectAll('.bar-highlight-optimized').style('opacity', 0);
        
        optimizedHighlight.style('opacity', 1);
        
        const changePct = currentAllocation > 0 
          ? ((optimizedAllocation - currentAllocation) / currentAllocation * 100).toFixed(1)
          : 0;
        
        let rounded = Number(changePct);
        if (Object.is(rounded, -0) || Math.abs(rounded) < 0.05) {
          rounded = 0;
        }
        
        const changeSign = rounded > 0 ? '+' : '';
        
        tooltip
          .style('opacity', 1)
          .html(`
            <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${channel.name}</div>
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 2px;">Optimized Allocation</div>
            <div style="color: #9ec2e6; font-weight: 600; font-size: 16px; margin-bottom: 4px;">
              $${formatNumber(optimizedAllocation)}
            </div>
            <div style="color: ${rounded >= 0 ? '#10b981' : '#ef4444'}; font-size: 11px; font-weight: 500;">
              ${changeSign}${rounded}% vs current
            </div>
          `)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 15) + 'px');
      })
      .on('mouseleave', function() {
        optimizedHighlight.style('opacity', 0);
        tooltip.style('opacity', 0);
      });

    // Value label for optimized allocation
    if (optimizedAllocation > 0) {
      channelGroup.append('text')
        .attr('x', x1('optimized') + x1.bandwidth() / 2)
        .attr('y', optimizedBarY - 6)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('font-weight', '600')
        .style('fill', '#1f2937')
        .style('pointer-events', 'none')
        .text('$' + formatNumber(optimizedAllocation));
    }
  });

  // Add Legend
  const legend = svg.append('g')
    .attr('transform', `translate(${width + margin.left + 20}, ${margin.top})`);

  // Current Allocation Legend
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

  // Optimized Allocation Legend
  legend.append('rect')
    .attr('x', 0)
    .attr('y', 25)
    .attr('width', 16)
    .attr('height', 16)
    .attr('rx', 2)
    .style('fill', colors.optimized);

  legend.append('text')
    .attr('x', 22)
    .attr('y', 37)
    .style('font-size', '11px')
    .style('fill', '#374151')
    .text('Optimized');
}



/**
 * Initialize channel constraint inputs state based on checkbox
 */
initializeChannelConstraintsState() {
  const checkboxes = document.querySelectorAll('.use-default-constraints-checkbox');
  
  checkboxes.forEach(checkbox => {
    const channelName = checkbox.getAttribute('data-channel');
    const useDefault = checkbox.checked;
    
    const minSpendInput = document.querySelector(`.channel-min-spend[data-channel="${channelName}"]`);
    const maxSpendInput = document.querySelector(`.channel-max-spend[data-channel="${channelName}"]`);
    
    if (minSpendInput && maxSpendInput) {
      if (useDefault) {
        minSpendInput.disabled = true;
        maxSpendInput.disabled = true;
        minSpendInput.style.opacity = '0.5';
        maxSpendInput.style.opacity = '0.5';
        minSpendInput.style.cursor = 'not-allowed';
        maxSpendInput.style.cursor = 'not-allowed';
      }
    }
  });
  
  console.log('✅ Channel constraints state initialized');
}


}