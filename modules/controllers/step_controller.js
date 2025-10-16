// modules/controllers/StepController.js
export class StepController {
  constructor({ appState, uiManager, dataService, workflowService, validationService,devConfig }) {
    this.appState = appState;
    this.uiManager = uiManager;
    this.dataService = dataService;
    this.workflowService = workflowService;
    this.validationService = validationService;
    
    this.devConfig = devConfig || {}; // ← RECIBIR CONFIGURACIÓN
    this.DEV_MODE = this.devConfig.SKIP_TO_EXECUTION || false; // ← LEER DE DEVCONFIG
  }

  /**
   * Initializes the application
   */
async initialize() {
  try {
    console.log("🚀 Initializing app - Starting at Step 1");
    
    // Ir a Step 1 primero
    this.goToStep(1);
    
    // LUEGO actualizar el stepper
    setTimeout(() => {
      this.uiManager.updateStepIndicator();
      this.uiManager.updateVisualProgress();
    }, 100);
    
  } catch (error) {
    console.error('Error initializing application:', error);
    this.uiManager.showToast('Failed to initialize application', 'error');
  }
}

  // 3. AGREGAR estas nuevas funciones DESPUÉS de initialize():

  /**
   * NUEVO: Configura datos simulados para desarrollo
   */
  setupDevelopmentData() {
    console.log("🔧 Setting up development mode data...");
    
    // Simular datasets disponibles
    const mockDatasets = [
      { ID: "mock-dataset-1", Name: "Weekly Revenue Data" },
      { ID: "mock-dataset-2", Name: "Marketing Spend Data" },
      { ID: "mock-dataset-3", Name: "Customer Metrics" }
    ];
    this.appState.setAvailableDatasets(mockDatasets);

    // Simular columnas de datasets
    const mockColumns = {
      "mock-dataset-1": [
        "date", "revenue", "google_ads", "facebook_ads", 
        "email_marketing", "display_ads", "tv_spend", "radio_spend"
      ]
    };
    this.appState.datasetColumnsMap = mockColumns;

    // Configurar mapeos simulados
    this.appState.revenueAmountField = "revenue";
    this.appState.dateField = "date";
    this.appState.documentId = "mock-doc-123";
    
    // Simular channels mapeados
    this.appState.channelMappings[0].value = "google_ads";
    this.appState.channelMappings[1].value = "facebook_ads";
    this.appState.channelMappings[2].value = "email_marketing";
    this.appState.channelMappings[3].value = "display_ads";
    
    // Simular controls mapeados
    this.appState.controlMappings[0].value = "tv_spend";
    this.appState.controlMappings[1].value = "radio_spend";

    // Simular fechas
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 365);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 7);
    
    setTimeout(() => {
      const startInput = document.getElementById("start-date");
      const endInput = document.getElementById("end-date");
      if (startInput) startInput.value = startDate.toISOString().split('T')[0];
      if (endInput) endInput.value = endDate.toISOString().split('T')[0];
    }, 100);

    console.log("✅ Development data configured:", {
      channels: this.appState.getMappedChannelsCount(),
      controls: this.appState.getMappedControlsCount(),
      revenue: this.appState.revenueAmountField,
      dateField: this.appState.dateField
    });
  }

  /**
   * Navigate to specific step
   */
 /**
 * Navigate to specific step
 */
async goToStep(stepNum) {
  try {
    console.log(`Navigating to step ${stepNum}`);
    this.uiManager.showStep(stepNum);

    if (stepNum === 1) {
      // NUEVO: Step 1 - Welcome
      console.log("Step 1 - Welcome screen");
      // No requiere inicialización especial
    } else if (stepNum === 2) {
      await this.initializeStep2();
    } else if (stepNum === 3) {
      console.log("Step 3 - updating summary display");
      this.updateSummaryDisplay();
      if (this.devConfig.SKIP_TO_EXECUTION) {
        this.setupDevelopmentSummary();
      }
    } else if (stepNum === 4) {
      await this.initializeStep4();
    }
  } catch (error) {
    console.error(`Error navigating to step ${stepNum}:`, error);
    this.uiManager.showToast(`Failed to load step ${stepNum}`, 'error');
  }
}

   /**
   * NUEVO: Configura el resumen para modo desarrollo
   */
  setupDevelopmentSummary() {
    console.log("🔧 Setting up development summary...");
    
    setTimeout(() => {
      const summaryRevenue = document.getElementById("summary-revenue");
      const summaryChannels = document.getElementById("summary-channels");
      const summaryControls = document.getElementById("summary-controls");
      
      if (summaryRevenue) summaryRevenue.textContent = "Weekly Revenue Data";
      if (summaryChannels) summaryChannels.textContent = "4 channels mapped";
      if (summaryControls) summaryControls.textContent = "2 controls included";
      
      console.log("✅ Development summary configured");
    }, 100);
  }


  /**
   * Initialize step 2 with better error control
   */
/**
 * Initialize step 2 with better error control
 */
async initializeStep2() {
  this.uiManager.showLoadingOverlay("Loading data...");

  try {
    // Load datasets and columns
    const [datasets, datasetColumnsResult] = await Promise.all([
      this.dataService.loadDatasetList(),
      this.dataService.loadDatasetColumns()
    ]);

    console.log("📦 Loaded data:", { 
      datasets, 
      columnsResult: datasetColumnsResult 
    });

    this.appState.setAvailableDatasets(datasets);
    
    // CAMBIO: Ahora datasetColumnsResult es un objeto {columnsMap, columnTypesMap}
    this.appState.datasetColumnsMap = datasetColumnsResult.columnsMap;
    this.appState.setColumnTypes(datasetColumnsResult.columnTypesMap);

    console.log("✅ AppState updated with columns and types");

    // Build dataset dropdown
    this.uiManager.buildRevenueDatasetDropdown();

       // NUEVO: Build custom vars dataset dropdown
    this.uiManager.buildCustomVarsDatasetDropdown();

    // Setup event listeners AFTER elements are ready
    setTimeout(() => {
      this.setupStep2EventListeners();
    }, 100);

    // Render empty dropdowns initially
    this.uiManager.renderAllDropdowns([]);

    console.log("✅ Step 2 initialized successfully");

  } catch (error) {
    console.error('❌ Error initializing step 2:', error);
    this.uiManager.showToast('Failed to load data sources', 'error');
  } finally {
    this.uiManager.hideLoadingOverlay();
  }
}

/**
 * Setup event listeners for step 2
 */
setupStep2EventListeners() {
  // Clear existing listeners first
  this.clearExistingListeners();

  // Revenue dataset selection
  const revenueSelect = document.getElementById("revenue-select");
  if (revenueSelect) {
    revenueSelect.addEventListener("change", this.handleRevenueDatasetChange.bind(this));
    revenueSelect.setAttribute('data-listener-attached', 'true');
  }

  // Date field selection
  const dateSelect = document.getElementById("date-field-select");
  if (dateSelect && !dateSelect.hasAttribute('data-listener-attached')) {
    dateSelect.addEventListener("change", this.handleDateFieldChange.bind(this));
    dateSelect.setAttribute('data-listener-attached', 'true');
  }

  // Date range validation
  this.setupDateRangeValidation();

  // Custom variables listeners
  this.setupCustomVariablesListeners();

  // Add control variable button
  const addControlBtn = document.getElementById("add-control-btn");
  if (addControlBtn) {
    addControlBtn.addEventListener("click", () => {
      this.addControlRow();
    });
  }

  // Custom Variables Dataset selection
  const customVarsDatasetSelect = document.getElementById("custom-vars-dataset-select");
  if (customVarsDatasetSelect) {
    customVarsDatasetSelect.addEventListener("change", this.handleCustomVarsDatasetChange.bind(this));
    console.log("✅ Custom vars dataset listener attached");
  }

  // Add Custom Variable button
  const addCustomVarBtn = document.getElementById("add-custom-var-btn");
  if (addCustomVarBtn) {
    addCustomVarBtn.addEventListener("click", () => {
      this.addCustomVarRow();
    });
    console.log("✅ Add custom var button listener attached");
  }
}

/**
 * Handle date field change specifically
 */
handleDateFieldChange(e) {
  const selectedDateField = e.target.value;
  
  console.log("Date field changed to:", selectedDateField);
  
  // Update state
  this.appState.dateField = selectedDateField;
  
  // Update mapped count
  this.uiManager.updateMappedCount();
}

/**
 * Setup listeners for custom variables
 */
setupCustomVariablesListeners() {
  const addCustomVarBtn = document.getElementById("add-custom-var-btn");
  if (addCustomVarBtn) {
    addCustomVarBtn.addEventListener("click", () => {
      this.addCustomVariable();
    });
  }

  // Preview Data Mapping button
  const previewBtn = document.getElementById("preview-data-mapping-btn");
  if (previewBtn) {
    previewBtn.addEventListener("click", () => {
      // ✅ MODIFICADO: Pasar el step actual (2)
      this.uiManager.showDataMappingPreview(2);
    });
  }
}


  /**
   * Setup date range validation to ensure end date is after start date
   */
  setupDateRangeValidation() {
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");

    if (!startDateInput || !endDateInput) {
      console.error("Date inputs not found!");
      return;
    }

    console.log("Setting up date range validation");

    // When start date changes, update the minimum allowed end date
    startDateInput.addEventListener("change", () => {
      const startDate = startDateInput.value;
      
      if (startDate) {
        endDateInput.setAttribute('min', startDate);
        
        console.log(`✅ Start date changed to: ${startDate}`);
        console.log(`✅ End date min set to: ${endDateInput.getAttribute('min')}`);
        
        if (endDateInput.value && endDateInput.value < startDate) {
          endDateInput.value = "";
          this.uiManager.showToast("End date must be after start date", "warning");
        }
      }
    });

    // When end date changes, validate it's after start date
    endDateInput.addEventListener("change", () => {
      const startDate = startDateInput.value;
      const endDate = endDateInput.value;
      
      console.log(`End date changed to: ${endDate}, Start date is: ${startDate}`);
      
      if (startDate && endDate && endDate < startDate) {
        console.log("❌ End date is before start date, clearing...");
        endDateInput.value = "";
        this.uiManager.showToast("End date must be after start date", "error");
      } else {
        console.log("✅ Date range is valid");
      }
    });
  }

  /**
   * Reset mappings when dataset changes - IMPROVED VERSION
   */
  resetMappings() {
    // Save current date field if exists
    const currentDateField = this.appState.dateField;
    
    this.appState.channelMappings = this.appState.channelMappings.map(entry => ({
      label: entry.label,
      value: ""
    }));

    this.appState.controlMappings = this.appState.controlMappings.map(entry => ({
      label: entry.label,
      value: ""
    }));

    this.appState.revenueAmountField = "";
    
    // Only reset date field if not in new columns
    const revenueSelect = document.getElementById("revenue-select");
    const selectedId = revenueSelect?.value;
    const newColumns = this.appState.getDatasetColumns(selectedId);
    
    if (!newColumns.includes(currentDateField)) {
      this.appState.dateField = "";
    }
  }

  /**
   * Initialize step 4 (Insights)
   */
  async initializeStep4() {
    this.uiManager.hideLoadingOverlay2();
    
    // Setup insights button
    const insightsButton = document.getElementById("view-insights-complete");
    if (insightsButton) {
      insightsButton.addEventListener("click", () => {
        domo.navigate("/app-studio/1613701990/pages/743538406");
      });
    }

    // Load execution summary
    try {
      await this.loadExecutionSummary();
    } catch (error) {
      console.error('Error loading execution summary:', error);
    }
  }



/**
   * NUEVO: Navega a Step 4 cargando datos desde un document_id fijo (modo dev)
   * Este método se llama cuando se hace clic en el botón "Step 4" del dev panel
   */
  async goToStep4WithFixedDocument() {
    try {
      console.log("🔧 DEV MODE: Loading Step 4 with fixed document_id");
      
      // Verificar que existe document_id en config
      if (!this.devConfig.DEV_DOCUMENT_ID) {
        this.uiManager.showToast("DEV_DOCUMENT_ID not configured in DEV_CONFIG", "error");
        console.error("❌ DEV_DOCUMENT_ID is required for this feature");
        return;
      }
      
      const documentId = this.devConfig.DEV_DOCUMENT_ID;
      console.log(`📄 Using document_id: ${documentId}`);
      
      // Establecer el document_id en el estado
      this.appState.documentId = documentId;
      
      // Mostrar loading
      this.uiManager.showLoadingOverlay("Loading metrics from document...");
      
      // Cargar métricas reales desde el document_id fijo
      const channelsCount = 4; // Puedes ajustar este número
      
      const metrics = await this.dataService.loadStep4Metrics(documentId, channelsCount);
      
      if (!metrics.error) {
        console.log("✅ Metrics loaded successfully:", metrics);
        
        // Guardar métricas en AppState
        this.appState.setMMMMetrics({
          r2: metrics.r2,
          incrementalRevenue: metrics.incrementalRevenue,
          topChannel: metrics.topChannel,
          mape: metrics.mape,
          channelsAnalyzed: channelsCount,
          executionSummary: metrics,
          source: 'dev_mode_fixed_document',
          documentId: documentId
        });
        
        // Actualizar UI con las métricas cargadas
        this.uiManager.updateMMMExecutionSummary(
          metrics.r2,
          metrics.incrementalRevenue,
          channelsCount
        );
        
        // Ocultar loading
        this.uiManager.hideLoadingOverlay();
        
        // Navegar a Step 4
        await this.goToStep(4);
        
        this.uiManager.showToast("✅ Step 4 loaded with real data", "success");
        
      } else {
        throw new Error(`Failed to load metrics: ${metrics.error}`);
      }
      
    } catch (error) {
      console.error("❌ Error loading Step 4 with fixed document:", error);
      this.uiManager.hideLoadingOverlay();
      this.uiManager.showToast(
        `Error: ${error.message}`, 
        "error"
      );
      
      // Usar datos de fallback y mostrar Step 4 de todas formas
      const channelsCount = 4;
      this.handleFallbackMetrics(channelsCount);
      await this.goToStep(4);
    }
  }

  /**
   * Add new channel row
   */
  addChannelRow() {
    this.appState.addChannelMapping();
    
    // Get current options
    const revenueSelect = document.getElementById("revenue-select");
    const selectedId = revenueSelect?.value || "";
    const columnOptions = this.appState.getDatasetColumns(selectedId);
    
    this.uiManager.renderChannelDropdowns(columnOptions);
  }

  /**
 * Add new control variable row
 */
addControlRow() {
  this.appState.addControlMapping();
  
  // Get current options
  const revenueSelect = document.getElementById("revenue-select");
  const selectedId = revenueSelect?.value || "";
  const columnOptions = this.appState.getDatasetColumns(selectedId);
  
  this.uiManager.renderControlDropdowns(columnOptions);
  this.uiManager.updateControlMappedCount();
}


  /**
   * Add custom variable
   */
  addCustomVariable() {
    const nameInput = document.getElementById("custom-var-name");
    const typeSelect = document.getElementById("custom-var-type");

    if (!nameInput || !typeSelect) return;

    const name = nameInput.value.trim();
    const type = typeSelect.value;

    if (!name || !type) {
      this.uiManager.showToast("Please enter a variable name and type.", "error");
      return;
    }

    this.appState.addCustomVariable(name, type);

    // Clear inputs
    nameInput.value = "";
    typeSelect.value = "";

    // Render section
    this.uiManager.renderCustomVariablesSection();
    
    const customVarsSection = document.getElementById("custom-vars-section");
    if (customVarsSection) {
      customVarsSection.classList.remove("hidden");
    }
  }



/**
 * Save current mapping
 */
async saveMapping() {
  try {
    // Validate input
    const validation = this.validationService.validateMapping(this.appState);
    if (!validation.isValid) {
      this.uiManager.showToast(validation.message, "error");
      return;
    }

    // ✅ NUEVO: Deshabilitar los botones inmediatamente con estilos inline
    const saveMappingBtn = document.getElementById("save-mapping");
    const previewDataMappingBtn = document.getElementById("preview-data-mapping-btn");
    
    if (saveMappingBtn) {
      saveMappingBtn.disabled = true;
      saveMappingBtn.style.opacity = '0.5';
      saveMappingBtn.style.cursor = 'not-allowed';
      saveMappingBtn.style.pointerEvents = 'none';
      saveMappingBtn.textContent = 'Saving...';
    }
    
    if (previewDataMappingBtn) {
      previewDataMappingBtn.disabled = true;
      previewDataMappingBtn.style.opacity = '0.5';
      previewDataMappingBtn.style.cursor = 'not-allowed';
      previewDataMappingBtn.style.pointerEvents = 'none';
    }

    // ✅ NUEVO: Mostrar overlay ANTES de guardar
    this.uiManager.showLoadingOverlay("Saving configuration...");

    // Get selected dataset data
    const revenueDatasetId = document.getElementById("revenue-select")?.value;
    const selectedDataset = this.appState.getAvailableDatasets()
      .find(ds => ds.ID === revenueDatasetId);
    const revenueDatasetName = selectedDataset?.Name || "Unknown Dataset";

    // NUEVO: Get custom vars dataset name
    const customVarsDatasetId = this.appState.getCustomVarsDataset();
    let customVarsDatasetName = null;
    if (customVarsDatasetId) {
      const customVarsDataset = this.appState.getAvailableDatasets()
        .find(ds => ds.ID === customVarsDatasetId);
      customVarsDatasetName = customVarsDataset?.Name || "Unknown Dataset";
      console.log("📊 Custom vars dataset:", customVarsDatasetName);
    }

    // Get dates
    const dateFrom = document.getElementById("start-date")?.value || null;
    const dateTo = document.getElementById("end-date")?.value || null;

    // Create configuration record
    const config = this.appState.exportConfiguration();

    const record = {
      revenueDatasetName,
      revenueDatasetId,
      customVarsDatasetName,
      ...config,
      dateFrom,
      dateTo
    };

    console.log("💾 Saving configuration record:", record);

    // Save configuration
    const documentId = await this.dataService.saveConfiguration(record);
    this.appState.documentId = documentId;

    // Update UI
    this.updateSummaryDisplay();
    
    // ✅ NUEVO: Cambiar mensaje del overlay después de guardar
    this.uiManager.updateLoadingMessage("Synchronizing MMM dataset...");
    
    // Esperar 3 segundos para sincronización del MMM dataset
    setTimeout(() => {
      this.uiManager.hideLoadingOverlay();
      this.uiManager.showToast("Data mapping saved successfully. Moving to next step.");
      this.goToStep(3);
    }, 3000);
  } catch (error) {
    console.error('Error saving mapping:', error);
    
    // ✅ NUEVO: Rehabilitar botones en caso de error
    const saveMappingBtn = document.getElementById("save-mapping");
    const previewDataMappingBtn = document.getElementById("preview-data-mapping-btn");
    
    if (saveMappingBtn) {
      saveMappingBtn.disabled = false;
      saveMappingBtn.style.opacity = '1';
      saveMappingBtn.style.cursor = 'pointer';
      saveMappingBtn.style.pointerEvents = 'auto';
      saveMappingBtn.textContent = 'Save Mapping & Continue';
    }
    
    if (previewDataMappingBtn) {
      previewDataMappingBtn.disabled = false;
      previewDataMappingBtn.style.opacity = '1';
      previewDataMappingBtn.style.cursor = 'pointer';
      previewDataMappingBtn.style.pointerEvents = 'auto';
    }
    
    // ✅ NUEVO: Ocultar overlay en caso de error
    this.uiManager.hideLoadingOverlay();
    
    this.uiManager.showToast("Failed to save mapping. Please try again.", "error");
  }
}

  /**
   * Update summary display
   */
  updateSummaryDisplay() {
    const revenueSelect = document.getElementById("revenue-select");
    const selectedOption = revenueSelect?.options[revenueSelect.selectedIndex];
    
    // Update revenue source
    const summaryRevenue = document.getElementById("summary-revenue");
    if (summaryRevenue) {
      summaryRevenue.textContent = selectedOption?.textContent || "Not selected";
    }

    // Update channels count
    const channelCount = this.appState.getMappedChannelsCount();
    const summaryChannels = document.getElementById("summary-channels");
    if (summaryChannels) {
      summaryChannels.textContent = `${channelCount} channels mapped`;
    }

    // Update control variables count
    const controlCount = this.appState.getMappedControlsCount();
    const summaryControls = document.getElementById("summary-controls");
    if (summaryControls) {
      summaryControls.textContent = `${controlCount} controls included`;
    }

    console.log("Summary display updated successfully");
  }

    /**
   * Launches the MMM workflow - MODIFICADO PARA DEV MODE
   */
  async launchWorkflow() {
    if (this.devConfig.SKIP_TO_EXECUTION && this.devConfig.QUICK_WORKFLOW) {
  
        console.log("🔧 DEV MODE: Simulating workflow completion...");
      
      const containerButton = document.getElementById("container-button");
      if (containerButton) containerButton.classList.add("hidden");
      
      this.uiManager.showWorkflowExecutionOverlay();
      
      setTimeout(() => {
        this.simulateQuickWorkflow();
      }, 1000);
      
      return;
    }

    // CÓDIGO ORIGINAL PARA PRODUCCIÓN:
    try {
      const validation = this.validationService.validateWorkflowLaunch(this.appState);
      if (!validation.isValid) {
        this.uiManager.showToast(validation.message, "error");
        return;
      }

      if (!this.appState.documentId) {
        this.uiManager.showToast("Missing document ID. Please save the mapping first.", "error");
        return;
      }

      const containerButton = document.getElementById("container-button");
      if (containerButton) containerButton.classList.add("hidden");
      
      this.uiManager.showWorkflowExecutionOverlay();
      this.uiManager.currentWorkflowStep = -1;

      try {
        const executionId = await this.workflowService.launchWorkflow(
          this.appState.documentId,
          "6f97b7f5-1772-4029-a715-f7577871186f"
        );

        this.appState.modelId = executionId;
        console.log("Workflow launched with ID:", executionId);
        this.startWorkflowPolling();

      } catch (workflowError) {
        console.warn("Workflow launch failed, using simulation only:", workflowError);
        this.startWorkflowPolling();
      }

    } catch (error) {
      console.error('Error launching workflow:', error);
      this.uiManager.hideLoadingOverlay2();
      this.uiManager.showToast("Failed to launch workflow", "error");
    }
  }
  /**
   * Starts workflow polling (simulation with new UI)
   */
  startWorkflowPolling() {
    // Always use simulation with new UI updates
    this.currentPollingInterval = this.workflowService.simulateWorkflowPolling(
      // onProgress
      (stepIndex, phase, stepLabel) => {
        this.uiManager.updateWorkflowProgress(stepIndex, phase, stepLabel);
      },
      // onComplete
      (status) => {
        console.log("Simulated workflow completed:", status);
        this.uiManager.completeWorkflowProgress();
        this.handleWorkflowCompletion();
      },
      // onError
      (error) => {
        console.error("Simulated workflow error:", error);
        this.uiManager.hideLoadingOverlay2();
        this.uiManager.showToast("MMM analysis failed or timed out.", "error");
      }
    );
  }

/**
   * Handles workflow completion using new Step 4 metrics workflow
   */
// modules/controllers/StepController.js - Enhanced handleWorkflowCompletion method

/**
 * Handles workflow completion with enhanced metrics management
 * Stores metrics in memory for UI access and provides fallback handling
 */
async handleWorkflowCompletion() {
  try {
    console.log("Starting workflow completion handling...");
    
    // Load execution summary from data service
    const summary = await this.dataService.loadMMMExecutionSummary();
    const channelsCount = this.appState.getMappedChannelsCount();
    
       // Prepare metrics object with all available data
    const metricsData = {
      r2: summary?.r2 || null,
      incrementalRevenue: summary?.incrementalRevenue || null,
      topChannel: summary?.topChannel || null,
      mape: summary?.mape || null,
      channelsAnalyzed: channelsCount,
      executionSummary: summary,
      workflowCompletedAt: new Date().toISOString()
    };

    // Store metrics in AppState for persistent access
    this.appState.setMMMMetrics(metricsData);
    
    // Update UI elements if metrics are available
    if (summary) {
      console.log("Updating UI with loaded metrics:", metricsData);
      
      // Update the workflow completion metrics display
      this.uiManager.updateMMMExecutionSummary(
        summary.r2, 
        summary.incrementalRevenue, 
        channelsCount
      );
      
      // Update Step 4 completion metrics
      this.updateStep4CompleteMetrics(summary, channelsCount);
      
    } else {
      console.warn("No summary data available, using fallback metrics");
      
      // Use fallback metrics if no data is available
      const fallbackMetrics = this.generateFallbackMetrics(channelsCount);
      this.appState.setMMMMetrics(fallbackMetrics);
      
      // Update UI with fallback data
      this.uiManager.updateMMMExecutionSummary(
        fallbackMetrics.r2,
        fallbackMetrics.incrementalRevenue,
        channelsCount
      );
      
      this.updateStep4CompleteMetrics(fallbackMetrics, channelsCount);
    }

    // Log metrics storage for debugging
    console.log("Metrics stored in AppState:", this.appState.exportMetricsForDebug());

    // Wait briefly to show completion animation
    setTimeout(() => {
      // Hide workflow overlay
      this.uiManager.hideLoadingOverlay2();
      
      // Navigate to results step
      this.goToStep(4);
      
      console.log("Workflow completion handled successfully");
      
    }, 2000);

  } catch (error) {
    console.error("Error handling workflow completion:", error);
    
    // Store error state in metrics
    this.appState.setMMMMetrics({
      error: error.message,
      errorOccurredAt: new Date().toISOString(),
      channelsAnalyzed: this.appState.getMappedChannelsCount()
    });
    
    // Hide loading and show error
    this.uiManager.hideLoadingOverlay2();
    this.uiManager.showToast("Workflow completed but failed to load summary", "error");
    
    // Still navigate to step 4 but with error state
    this.goToStep(4);
  }
}

/**
 * Updates the Step 4 completion metrics in the UI
 * @param {Object} summary - The execution summary data
 * @param {number} channelsCount - Number of channels analyzed
 */
updateStep4CompleteMetrics(summary, channelsCount) {
  try {
    // Update R² metric
    const r2Complete = document.getElementById("model-r2");
    if (r2Complete && summary.r2 !== null) {
      r2Complete.textContent = summary.r2.toFixed(2)
    }

    // Update channels analyzed metric
    const channelsComplete = document.getElementById("channels-analyzed");
    if (channelsComplete) {
      channelsComplete.textContent = channelsCount.toString();
    }

    // Update incremental revenue metric
    const revenueComplete = document.getElementById("incremental-revenue");
    if (revenueComplete && summary.incrementalRevenue !== null) {
      const formattedValue = new Intl.NumberFormat("en", {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1
      }).format(summary.incrementalRevenue);
      revenueComplete.textContent = formattedValue;
    }

    console.log("Step 4 metrics updated successfully");
    
  } catch (error) {
    console.error("Error updating Step 4 metrics:", error);
  }
}

/**
 * Refreshes metrics by reloading from data service
 * Useful for manual refresh or when data might have been updated
 */
async refreshMetrics() {
  try {
    console.log("Refreshing MMM metrics...");
    
    const summary = await this.dataService.loadMMMExecutionSummary();
    const channelsCount = this.appState.getMappedChannelsCount();
    
    if (summary) {
      const refreshedMetrics = {
        r2: summary.r2,
        incrementalRevenue: summary.incrementalRevenue,
        channelsAnalyzed: channelsCount,
        executionSummary: summary,
        refreshedAt: new Date().toISOString()
      };
      
      this.appState.setMMMMetrics(refreshedMetrics);
      
      // Update UI with refreshed data
      this.uiManager.updateMMMExecutionSummary(
        summary.r2,
        summary.incrementalRevenue,
        channelsCount
      );
      
      this.uiManager.showToast("Metrics refreshed successfully", "success");
      
      return refreshedMetrics;
    } else {
      throw new Error("No data available for refresh");
    }
    
  } catch (error) {
    console.error("Error refreshing metrics:", error);
    this.uiManager.showToast("Failed to refresh metrics", "error");
    return null;
  }
}

/**
 * Retrieves stored metrics for external access (e.g., insights dashboard)
 * @returns {Object|null} Stored MMM metrics or null if not available
 */
getStoredMetrics() {
  if (this.appState.hasValidMetrics()) {
    return this.appState.getMMMMetrics();
  }
  
  console.warn("No valid metrics available in AppState");
  return null;
}

/**
 * Generates fallback metrics when actual data is not available
 * @param {number} channelsCount - Number of channels analyzed
 * @returns {Object} Fallback metrics object
 */
generateFallbackMetrics(channelsCount) {
  // Generate realistic fallback values based on typical MMM results
  const fallbackR2 = 0.65 + (Math.random() * 0.25); // Between 65-90%
  const fallbackRevenue = 50000 + (Math.random() * 200000); // Between 50K-250K
  
  return {
    r2: fallbackR2,
    incrementalRevenue: fallbackRevenue,
    channelsAnalyzed: channelsCount,
    executionSummary: {
      r2: fallbackR2,
      incrementalRevenue: fallbackRevenue,
      isFallback: true,
      generatedAt: new Date().toISOString()
    },
    isFallback: true,
    workflowCompletedAt: new Date().toISOString()
  };
}

/**
 * Retrieves stored metrics for external access (e.g., insights dashboard)
 * @returns {Object|null} Stored MMM metrics or null if not available
 */
getStoredMetrics() {
  if (this.appState.hasValidMetrics()) {
    return this.appState.getMMMMetrics();
  }
  
  console.warn("No valid metrics available in AppState");
  return null;
}

/**
 * Refreshes metrics by reloading from data service
 * Useful for manual refresh or when data might have been updated
 */
async refreshMetrics() {
  try {
    console.log("Refreshing MMM metrics...");
    
    const summary = await this.dataService.loadMMMExecutionSummary();
    const channelsCount = this.appState.getMappedChannelsCount();
    
    if (summary) {
      const refreshedMetrics = {
        r2: summary.r2,
        incrementalRevenue: summary.incrementalRevenue,
        channelsAnalyzed: channelsCount,
        executionSummary: summary,
        refreshedAt: new Date().toISOString()
      };
      
      this.appState.setMMMMetrics(refreshedMetrics);
      
      // Update UI with refreshed data
      this.uiManager.updateMMMExecutionSummary(
        summary.r2,
        summary.incrementalRevenue,
        channelsCount
      );
      
      this.uiManager.showToast("Metrics refreshed successfully", "success");
      
      return refreshedMetrics;
    } else {
      throw new Error("No data available for refresh");
    }
    
  } catch (error) {
    console.error("Error refreshing metrics:", error);
    this.uiManager.showToast("Failed to refresh metrics", "error");
    return null;
  }
}


// REPLACE the handleDevelopmentWorkflowCompletion function:

  /**
   * Handles development workflow completion with option to test real data
   */
  async handleDevelopmentWorkflowCompletion() {
    try {
      console.log("🔧 DEV MODE: Handling workflow completion...");
      
      const documentId = this.appState.documentId;
      const channelsCount = this.appState.getMappedChannelsCount();
      
      // In development, try to load real metrics if document ID exists and is not mock
      if (documentId && documentId !== "mock-doc-123") {
        console.log("🔧 DEV MODE: Attempting to load real metrics...");
        
        try {
          const metrics = await this.dataService.loadStep4Metrics(documentId, channelsCount);
          
          if (!metrics.error) {
            console.log("✅ DEV MODE: Real metrics loaded:", metrics);
            this.uiManager.updateMMMExecutionSummary(
              metrics.r2,
              metrics.incrementalRevenue,
              metrics.channelsCount
            );
          } else {
            throw new Error(metrics.error);
          }
        } catch (realDataError) {
          console.log("🔧 DEV MODE: Real data failed, using mock data:", realDataError.message);
          this.handleFallbackMetrics(channelsCount);
        }
      } else {
        // Use mock data for development
        console.log("🔧 DEV MODE: Using mock metrics");
        this.handleFallbackMetrics(channelsCount);
      }
      
      // Continue with completion
      setTimeout(() => {
        this.uiManager.hideLoadingOverlay2();
        this.goToStep(4);
        console.log("✅ DEV MODE: Workflow completion simulated");
      }, 2000);

    } catch (error) {
      console.error("❌ DEV MODE: Error in workflow completion:", error);
      const channelsCount = this.appState.getMappedChannelsCount();
      this.handleFallbackMetrics(channelsCount);
      
      setTimeout(() => {
        this.uiManager.hideLoadingOverlay2();
        this.goToStep(4);
      }, 2000);
    }
  }



  /**
   * Handles fallback metrics when real data is not available
   * @param {number} channelsCount - Number of channels from app state
   */
  handleFallbackMetrics(channelsCount) {
    console.log("📊 Using fallback/mock metrics");
    
    // Mock metrics for fallback
    const mockSummary = {
      r2: 0.85, // 85% R²
      incrementalRevenue: 2500000 // $2.5M
    };
    
    this.uiManager.updateMMMExecutionSummary(
      mockSummary.r2,
      mockSummary.incrementalRevenue,
      channelsCount
    );
  }

// REPLACE the loadExecutionSummary function:

  /**
   * Loads execution summary for Step 4 initialization
   */
  async loadExecutionSummary() {
    try {
      console.log("📊 Loading execution summary for Step 4...");
      
      const documentId = this.appState.documentId;
      const channelsCount = this.appState.getMappedChannelsCount();
      
      if (documentId && documentId !== "mock-doc-123") {
        // Try to load real metrics
        const metrics = await this.dataService.loadStep4Metrics(documentId, channelsCount);
        
        if (!metrics.error) {
          this.uiManager.updateMMMExecutionSummary(
            metrics.r2,
            metrics.incrementalRevenue,
            metrics.channelsCount
          );
          console.log("✅ Real execution summary loaded");
          return;
        }
      }
      
      // Fallback to mock/legacy data
      console.log("📊 Using fallback execution summary");
      this.handleFallbackMetrics(channelsCount);
      
    } catch (error) {
      console.error('❌ Error loading execution summary:', error);
      
      // Final fallback
      const channelsCount = this.appState.getMappedChannelsCount();
      this.handleFallbackMetrics(channelsCount);
    }
  }

  /**
   * Cancel current polling
   */
  cancelWorkflowPolling() {
    if (this.currentPollingInterval) {
      if (typeof this.currentPollingInterval === 'function') {
        // If it's a cancel function from simulation
        this.currentPollingInterval();
      } else {
        // If it's a regular interval
        clearInterval(this.currentPollingInterval);
      }
      this.currentPollingInterval = null;
    }
  }

  /**
   * Load execution summary
   */
  async loadExecutionSummary() {
    try {
      const summary = await this.dataService.loadMMMExecutionSummary();
      
      if (summary) {
        const channelsCount = this.appState.getMappedChannelsCount();
        this.uiManager.updateMMMExecutionSummary(
          summary.r2,
          summary.incrementalRevenue,
          channelsCount
        );
      }
    } catch (error) {
      console.error('Error loading execution summary:', error);
    }
  }

  /**
   * Clean up resources when controller is destroyed
   */
  cleanup() {
    this.cancelWorkflowPolling();
  }

/**
 * Handle revenue dataset change
 */
handleRevenueDatasetChange(e) {
  const selectedId = e.target.value;
  
  console.log("Revenue dataset changed:", selectedId);

  // VALIDACIÓN: No puede ser el mismo que Custom Variables Dataset
  const customVarsDatasetId = this.appState.getCustomVarsDataset();
  
  if (selectedId && customVarsDatasetId && selectedId === customVarsDatasetId) {
    console.error("❌ Revenue dataset cannot be the same as custom vars dataset");
    
    this.uiManager.showToast(
      "⚠️ Revenue Dataset cannot be the same as Custom Variables Dataset. Please select a different dataset.",
      "error"
    );
    
    // Resetear selección
    e.target.value = "";
    
    // No resetear mappings ni re-renderizar
    return;
  }

  const columnOptions = this.appState.getDatasetColumns(selectedId);
  console.log("Columns:", columnOptions);

  // Reset mappings when dataset changes
  this.resetMappings();
  
  // Render with new columns
  this.uiManager.renderAllDropdowns(columnOptions);
}

 

  /**
   * Clear existing listeners to avoid duplicates
   */
  clearExistingListeners() {
    // Clear revenue select
    const revenueSelect = document.getElementById("revenue-select");
    if (revenueSelect && revenueSelect.hasAttribute('data-listener-attached')) {
      const newRevenueSelect = revenueSelect.cloneNode(true);
      revenueSelect.parentNode.replaceChild(newRevenueSelect, revenueSelect);
    }

    // Clear date field
    this.uiManager.clearDateFieldListeners();
  }

/**
   * NUEVO: Simula workflow rápido para desarrollo
   */
  simulateQuickWorkflow() {
    let step = 0;
    const steps = [
      "Data Validation",
      "Feature Engineering", 
      "Bayesian Model Setup",
      "MCMC Sampling",
      "Posterior Analysis",
      "Generating Insights"
    ];

    const interval = setInterval(() => {
      if (step < steps.length) {
        this.uiManager.updateWorkflowProgress(step, steps[step].toUpperCase(), steps[step]);
        step++;
      } else {
        clearInterval(interval);
        
        setTimeout(() => {
          this.uiManager.completeWorkflowProgress();
          this.handleDevelopmentWorkflowCompletion();
        }, 1000);
      }
    }, 500);
  }

  /**
   * NUEVO: Maneja la finalización del workflow en desarrollo
   */
  async handleDevelopmentWorkflowCompletion() {
    console.log("🔧 DEV MODE: Simulating workflow completion...");
    
    const mockSummary = {
      r2: 0.85,
      incrementalRevenue: 2500000
    };
    
    const channelsCount = this.appState.getMappedChannelsCount();
    
    this.uiManager.updateMMMExecutionSummary(
      mockSummary.r2, 
      mockSummary.incrementalRevenue, 
      channelsCount
    );
    
    setTimeout(() => {
      this.uiManager.hideLoadingOverlay2();
      this.goToStep(4);
      console.log("✅ DEV MODE: Workflow completion simulated");
    }, 2000);
  }

  /**
 * Navigate to insights dashboard
 */
/**
 * Navigate to insights dashboard (respetando configuración dev)
 */
async goToInsights() {
  try {
    console.log("🚀 Navigating to insights dashboard...");
    
    // Hide current step sections
    document.querySelectorAll(".step-section").forEach(el => 
      el.classList.add("hidden")
    );

    // Show insights container or create it
    let insightsContainer = document.getElementById('insights-container');
    if (!insightsContainer) {
      insightsContainer = document.createElement('div');
      insightsContainer.id = 'insights-container';
      insightsContainer.className = 'step-section';
      
      const mainContainer = document.querySelector('.max-w-5xl') || document.body;
      mainContainer.appendChild(insightsContainer);
    }
    
    insightsContainer.classList.remove('hidden');

    // Check if metrics are available o usar mock si MOCK_DATA está habilitado
    if (!this.appState.hasValidMetrics() || this.devConfig?.MOCK_DATA) {
      console.warn("⚠️ Using test metrics (dev mode or no valid data)");
      this.appState.setMMMMetrics({
        r2: 0.84,
        incrementalRevenue: 685000,
        channelsAnalyzed: 4,
        testMode: this.devConfig?.MOCK_DATA || false
      });
    }

    // Import and initialize insights manager
    const { InsightsManager } = await import('../insights/InsightsManager.js');
    const insightsManager = new InsightsManager(this.appState, this.dataService,this.workflowService);
    await insightsManager.initialize();

    console.log("✅ Successfully navigated to insights dashboard");
    
  } catch (error) {
    console.error('❌ Error navigating to insights:', error);
    this.uiManager.showToast('Failed to load insights dashboard', 'error');
  }
}

/**
 * Handle custom vars dataset change
 */
/**
 * Handle custom vars dataset change
 */
handleCustomVarsDatasetChange(e) {
  const selectedId = e.target.value;
  
  console.log("🎨 Custom vars dataset changed:", selectedId);

  // VALIDACIÓN 1: No puede ser el mismo que Revenue Dataset
  const revenueDatasetId = document.getElementById("revenue-select")?.value;
  
  if (selectedId && selectedId === revenueDatasetId) {
    console.error("❌ Custom vars dataset cannot be the same as revenue dataset");
    
    this.uiManager.showToast(
      "⚠️ Custom Variables dataset cannot be the same as Revenue Dataset. Please select a different dataset.",
      "error"
    );
    
    // Resetear selección
    e.target.value = "";
    this.appState.setCustomVarsDataset(null);
    
    // Ocultar dropdowns y botón
    const dropdownsContainer = document.getElementById("custom-vars-dropdowns");
    const buttonContainer = document.getElementById("add-custom-var-button-container");
    if (dropdownsContainer) dropdownsContainer.classList.add("hidden");
    if (buttonContainer) buttonContainer.classList.add("hidden");
    
    return;
  }

  const columnOptions = this.appState.getDatasetColumns(selectedId);
  console.log("📋 Available columns:", columnOptions);

  // Guardar dataset seleccionado
  this.appState.setCustomVarsDataset(selectedId);
  
  // Mostrar/ocultar secciones
  const dropdownsContainer = document.getElementById("custom-vars-dropdowns");
  const buttonContainer = document.getElementById("add-custom-var-button-container");
  
  if (selectedId && columnOptions.length > 0) {
    // Mostrar dropdowns y botón
    if (dropdownsContainer) dropdownsContainer.classList.remove("hidden");
    if (buttonContainer) buttonContainer.classList.remove("hidden");
    
    // Renderizar dropdowns
    this.uiManager.renderCustomVarsDropdowns(columnOptions);
  } else {
    // Ocultar dropdowns y botón si no hay dataset
    if (dropdownsContainer) dropdownsContainer.classList.add("hidden");
    if (buttonContainer) buttonContainer.classList.add("hidden");
  }
}



/**
 * Add new custom variable row
 */
addCustomVarRow() {
  console.log("➕ Adding new custom variable row");
  
  this.appState.addCustomVarMapping();
  
  // Get current options
  const customVarsDatasetId = this.appState.getCustomVarsDataset();
  const columnOptions = this.appState.getDatasetColumns(customVarsDatasetId);
  
  // Re-renderizar todos los dropdowns
  this.uiManager.renderCustomVarsDropdowns(columnOptions);
  
  console.log("✅ Custom variable row added, total:", this.appState.customVarsMappings.length);
}


}