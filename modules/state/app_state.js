// modules/state/AppState.js
export class AppState {
  constructor() {
    this.reset();
  }

  reset() {
    this.currentStep = 1;
    this.revenueAmountField = "";
    this.dateField = "";
    this.documentId = null;
    this.modelId = null;
    
    this.channelMappings = this.getDefaultChannelMappings();
    this.controlMappings = this.getDefaultControlMappings();
    this.customVars = [];
    
    this.datasetColumnsMap = {};
     this.columnTypesMap = {}; // NUEVO: mapa de tipos de columnas
    this.availableDatasetList = [];
    this.iroasPriors = {} 

  // NEW: Budget Optimizer parameters
  this.budgetOptimizerParams = {
    total_budget: null,
    timeframe: 'quarter',
    objective: 'maximize-revenue',
    channel_constraints: [],
    saved: false,
    lastUpdated: null
  };



     // NEW: MMM Metrics Management
    this.mmmMetrics = {
      r2: null,                    // Model R-squared value
      incrementalRevenue: null,    // Total incremental revenue calculated
      channelsAnalyzed: null,      // Number of channels included in analysis
      executionSummary: null,      // Full execution summary object
      lastUpdated: null,           // Timestamp of last metrics update
      isLoaded: false              // Flag indicating if metrics have been loaded
    };

    // NUEVO: Custom Variables con dataset
  this.customVarsDatasetId = null;
  this.customVarsMappings = [
  { type: "numeric", value: "" },
  { type: "numeric", value: "" },
  { type: "binary", value: "" },
  { type: "binary", value: "" }
];
  }


  /**
   * Sets the complete MMM metrics object
   * @param {Object} metrics - Object containing MMM analysis results
   * @param {number} metrics.r2 - Model R-squared value (0-1)
   * @param {number} metrics.incrementalRevenue - Total incremental revenue
   * @param {number} metrics.channelsAnalyzed - Number of channels analyzed
   * @param {Object} metrics.executionSummary - Complete analysis summary
   */
  setMMMMetrics(metrics) {
    this.mmmMetrics = {
      ...this.mmmMetrics,
      ...metrics,
      lastUpdated: new Date().toISOString(),
      isLoaded: true
    };
    
    console.log("MMM Metrics stored in AppState:", this.mmmMetrics);
  }

  /**
   * Retrieves the complete MMM metrics object
   * @returns {Object} Current MMM metrics
   */
  getMMMMetrics() {
    return this.mmmMetrics;
  }

  /**
   * Updates a specific metric value
   * @param {string} key - The metric key to update
   * @param {*} value - The new value for the metric
   */
  updateMetric(key, value) {
    if (this.mmmMetrics.hasOwnProperty(key)) {
      this.mmmMetrics[key] = value;
      this.mmmMetrics.lastUpdated = new Date().toISOString();
    }
  }

  /**
   * Checks if valid metrics have been loaded
   * @returns {boolean} True if metrics are loaded and valid
   */
  hasValidMetrics() {
    return this.mmmMetrics.isLoaded && 
           this.mmmMetrics.r2 !== null && 
           this.mmmMetrics.incrementalRevenue !== null;
  }


  /**
   * Clears all stored metrics (useful for new analysis)
   */
  clearMetrics() {
    this.mmmMetrics = {
      r2: null,
      incrementalRevenue: null,
      channelsAnalyzed: null,
      executionSummary: null,
      lastUpdated: null,
      isLoaded: false
    };
  }

  /**
   * Exports metrics data for debugging purposes
   * @returns {Object} Debug information including metrics and context
   */
  exportMetricsForDebug() {
    return {
      metrics: this.mmmMetrics,
      mappedChannels: this.getMappedChannelsCount(),
      timestamp: new Date().toISOString()
    };
  }



  getDefaultChannelMappings() {
    const channelLabels = [
      'Channel 1', 'Channel 2', 'Channel 3', 'Channel 4',
      'Channel 5', 'Channel 6', 'Channel 7',
      'Channel 8', 'Channel 9', 'Channel 10'
    ];
    
    return channelLabels.map(label => ({
      label,
      value: ""
    }));
  }

  getDefaultControlMappings() {
    const controlVars = [
      'Variable 1', 'Variable 2', 'Variable 3', 
      'Variable 4', 'Variable 5', 'Variable 6'
    ];
    
    return controlVars.map(label => ({
      label,
      value: ""
    }));
  }

  // Getters para acceso controlado
  getCurrentStep() {
    return this.currentStep;
  }

  setCurrentStep(step) {
    this.currentStep = step;
  }

  getMappedChannelsCount() {
    return this.channelMappings.filter(entry => 
      entry.value && entry.value !== "No mapping"
    ).length;
  }

  getMappedControlsCount() {
    return this.controlMappings.filter(entry => 
      entry.value && entry.value !== ""
    ).length;
  }

  getUsedColumns() {
    const used = new Set();

    // Añadir columnas de marketing channels
    this.channelMappings.forEach(entry => {
      if (entry.value) used.add(entry.value);
    });

    // Añadir columnas de variables de control
    this.controlMappings.forEach(entry => {
      if (entry.value) used.add(entry.value);
    });

    // Añadir campos de revenue y fecha
    if (this.revenueAmountField) used.add(this.revenueAmountField);
    if (this.dateField) used.add(this.dateField);

    return used;
  }

  addChannelMapping() {
    const newLabel = `Channel ${this.channelMappings.length + 1}`;
    this.channelMappings.push({ label: newLabel, value: "" });
  }

  updateChannelMapping(index, value) {
    if (this.channelMappings[index]) {
      this.channelMappings[index].value = value;
    }
  }

 addControlMapping() {
  const newLabel = `Variable ${this.controlMappings.length + 1}`;
  this.controlMappings.push({ label: newLabel, value: "" });
}

  updateControlMapping(index, value) {
    if (this.controlMappings[index]) {
      this.controlMappings[index].value = value;
    }
  }

  addCustomVariable(name, type) {
    if (!this.customVars) this.customVars = [];
    
    this.customVars.push({
      label: name,
      type: type,
      values: []
    });
  }

  removeCustomVariable(index) {
    if (this.customVars && this.customVars[index]) {
      this.customVars.splice(index, 1);
    }
  }

 

  updateCustomVariableValue(varIndex, weekIndex, value) {
    if (this.customVars[varIndex]) {
      if (!this.customVars[varIndex].values) {
        this.customVars[varIndex].values = [];
      }
      this.customVars[varIndex].values[weekIndex] = value;
    }
  }

  setDatasetColumns(datasetId, columns) {
    this.datasetColumnsMap[datasetId] = columns;
  }

  getDatasetColumns(datasetId) {
    return this.datasetColumnsMap[datasetId] || [];
  }

  setAvailableDatasets(datasets) {
    this.availableDatasetList = datasets;
  }

  getAvailableDatasets() {
    return this.availableDatasetList;
  }

 /**
 * Exporta la configuración actual incluyendo custom variables e iROAS
 */
exportConfiguration() {
  const selectedChannels = this.channelMappings
    .filter(entry => entry.value && entry.value !== "No mapping")
    .map(entry => entry.value);

  const selectedControls = this.controlMappings
    .filter(entry => entry.value && entry.value !== "No mapping")
    .map(entry => entry.value);
  
  // Limpiar priors antes de exportar
  this.cleanupIROASPriors();

  // NUEVO: Exportar custom variables mapeadas
  const mappedCustomVars = this.customVarsMappings
    .filter(mapping => mapping.value && mapping.value !== "")
    .map(mapping => ({
      type: mapping.type,
      column: mapping.value
    }));

  console.log("📤 Exporting configuration:", {
    channels: selectedChannels.length,
    controls: selectedControls.length,
    customVarsDataset: this.customVarsDatasetId,
    customVariables: mappedCustomVars.length,
    iroasPriors: Object.keys(this.iroasPriors || {}).length
  });

  return {
    revenueAmountField: this.revenueAmountField,
    dateField: this.dateField,
    channels: selectedChannels,
    controls: selectedControls,
    customVarsDataset: this.customVarsDatasetId,  // NUEVO: ID del dataset
    customVariables: mappedCustomVars,            // NUEVO: Array de variables mapeadas
    iroasPriors: this.iroasPriors || {},          // Ya existía
    createdAt: new Date().toISOString()
  };
}

  /**
 * Obtiene los priors de iROAS para un channel específico
 */
getIROASPrior(channelValue) {
  return this.iroasPriors[channelValue] || null;
}

/**
 * Establece el prior de iROAS para un channel
 */
setIROASPrior(channelValue, iroasValue) {
  if (!this.iroasPriors) this.iroasPriors = {};
  this.iroasPriors[channelValue] = iroasValue;
}

/**
 * Limpia priors de channels que ya no están mapeados
 */
cleanupIROASPriors() {
  if (!this.iroasPriors) return;
  
  const mappedChannelValues = this.channelMappings
    .filter(entry => entry.value && entry.value !== "No mapping")
    .map(entry => entry.value);
  
  // Eliminar priors de channels que ya no existen
  Object.keys(this.iroasPriors).forEach(channelValue => {
    if (!mappedChannelValues.includes(channelValue)) {
      delete this.iroasPriors[channelValue];
    }
  });
}


//NUEVO: Setter para tipos de columnas
  setColumnTypes(columnTypesMap) {
    this.columnTypesMap = columnTypesMap;
    console.log("✅ Column types set in AppState");
  }

  // NUEVO: Getter para obtener el tipo de una columna
  getColumnType(datasetId, columnName) {
  const type = this.columnTypesMap[datasetId]?.[columnName];
  console.log(`🔍 Getting type for ${datasetId}/${columnName}:`, type);
  return type || null;
    }

  // NUEVO: Validar si una columna es numérica
  isNumericColumn(datasetId, columnName) {
    const type = this.getColumnType(datasetId, columnName);
    return type === 'DECIMAL' || type === 'LONG' || type === 'DOUBLE';
  }

  // NUEVO: Validar si una columna es de fecha
  isDateColumn(datasetId, columnName) {
    const type = this.getColumnType(datasetId, columnName);
    return type === 'DATE' || type === 'DATETIME';
  }


  // NUEVO: Métodos para custom variables con dataset
setCustomVarsDataset(datasetId) {
  this.customVarsDatasetId = datasetId;
  console.log("✅ Custom vars dataset set:", datasetId);
}

getCustomVarsDataset() {
  return this.customVarsDatasetId;
}

getCustomVarsMappings() {
  return this.customVarsMappings;
}

updateCustomVarMapping(index, field, value) {
  if (this.customVarsMappings[index]) {
    this.customVarsMappings[index][field] = value;
    console.log(`✏️ Updated custom var ${index}: ${field} = ${value}`);
  }
}

/**
 * Valida el tipo de columna para custom variables
 */
validateCustomVarType(datasetId, columnName, expectedType) {
  const columnType = this.getColumnType(datasetId, columnName);
  
  console.log(`🔍 Validating custom var: column="${columnName}", expectedType="${expectedType}", actualType="${columnType}"`);
  
  if (expectedType === "numeric") {
    // Para numeric, debe ser DECIMAL, LONG o DOUBLE
    const isValid = columnType === 'DECIMAL' || columnType === 'LONG' || columnType === 'DOUBLE';
    console.log(`🔢 Numeric validation result: ${isValid}`);
    return isValid;
  } else if (expectedType === "binary") {
    // Para binary, también debe ser numérico (valores 1 o 0)
    const isValid = columnType === 'DECIMAL' || columnType === 'LONG' || columnType === 'DOUBLE';
    console.log(`🔀 Binary validation result: ${isValid}`);
    return isValid;
  }
  
  return false;
}

/**
 * Agrega un nuevo mapping de custom variable
 */
addCustomVarMapping() {
  const newMapping = { type: "numeric", value: "" };
  this.customVarsMappings.push(newMapping);
  console.log("➕ Added new custom var mapping, total:", this.customVarsMappings.length);
}


/**
 * Obtiene las columnas ya usadas en custom variables
 */
getUsedCustomVarsColumns() {
  const used = new Set();
  
  this.customVarsMappings.forEach(mapping => {
    if (mapping.value && mapping.value !== "") {
      used.add(mapping.value);
    }
  });
  
  console.log("🔒 Used custom vars columns:", Array.from(used));
  return used;
}



/**
 * Set Budget Optimizer parameters
 * @param {Object} params - Budget optimizer parameters
 */
setBudgetOptimizerParams(params) {
  this.budgetOptimizerParams = {
    ...this.budgetOptimizerParams,
    ...params,
    lastUpdated: new Date().toISOString()
  };
  console.log('📊 Budget Optimizer params stored in AppState:', this.budgetOptimizerParams);
}

/**
 * Get Budget Optimizer parameters
 * @returns {Object} Current budget optimizer parameters
 */
getBudgetOptimizerParams() {
  return this.budgetOptimizerParams;
}

/**
 * Mark Budget Optimizer parameters as saved
 */
markBudgetOptimizerAsSaved() {
  this.budgetOptimizerParams.saved = true;
  this.budgetOptimizerParams.lastUpdated = new Date().toISOString();
  console.log('✅ Budget Optimizer params marked as saved');
}

/**
 * Check if Budget Optimizer parameters have been saved
 * @returns {boolean}
 */
isBudgetOptimizerSaved() {
  return this.budgetOptimizerParams.saved === true;
}




}

