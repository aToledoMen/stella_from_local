// modules/services/ValidationService.js
export class ValidationService {
  constructor() {
    this.minChannels = 2;
    this.minControls = 0;
  }

  /**
   * Valida el mapeo completo antes de guardar
   */
  validateMapping(appState) {
  const validations = [
    this.validateChannelMappings(appState),
    this.validateRevenueMapping(appState),
    this.validateDatasetSelection(),
    this.validateDateRange(),
    this.validateDateField(appState),
    this.validateCustomVariables(appState)  // NUEVO
  ];

  const failedValidation = validations.find(v => !v.isValid);
  
  return failedValidation || { isValid: true, message: "All validations passed" };
}

  /**
   * Valida que se hayan mapeado suficientes canales
   */
  validateChannelMappings(appState) {
    const mappedCount = appState.getMappedChannelsCount();
    
    if (mappedCount < this.minChannels) {
      return {
        isValid: false,
        message: `Please map at least ${this.minChannels} marketing channels before continuing.`
      };
    }

    return { isValid: true };
  }

  /**
   * Valida que se haya seleccionado un campo de revenue
   */
  validateRevenueMapping(appState) {
    if (!appState.revenueAmountField || appState.revenueAmountField === "No mapping") {
      return {
        isValid: false,
        message: "Please select a Revenue Amount column."
      };
    }

    return { isValid: true };
  }

  /**
   * Valida que se haya seleccionado un dataset de revenue
   */
  validateDatasetSelection() {
    const revenueDatasetId = document.getElementById("revenue-select")?.value;
    
    if (!revenueDatasetId || revenueDatasetId === "No mapping") {
      return {
        isValid: false,
        message: "Please select a valid revenue dataset."
      };
    }

    return { isValid: true };
  }

  /**
   * Valida el rango de fechas
   */
  validateDateRange() {
    const dateFrom = document.getElementById("start-date")?.value;
    const dateTo = document.getElementById("end-date")?.value;

    if (!dateFrom || !dateTo) {
      return {
        isValid: false,
        message: "Please select both start and end dates."
      };
    }

    if (new Date(dateFrom) > new Date(dateTo)) {
      return {
        isValid: false,
        message: "Start date cannot be after end date."
      };
    }

    return { isValid: true };
  }

  /**
   * Valida que se haya seleccionado un campo de fecha
   */
  validateDateField(appState) {
    if (!appState.dateField || appState.dateField === "No mapping") {
      return {
        isValid: false,
        message: "Please select a valid Date Field column."
      };
    }

    return { isValid: true };
  }

  /**
   * Valida variables personalizadas
   */
/**
 * Valida custom variables - ACTUALIZADO para dataset
 */
validateCustomVariables(appState) {
  const customVarsDatasetId = appState.getCustomVarsDataset();
  
  // Si NO hay dataset seleccionado, está OK (es opcional)
  if (!customVarsDatasetId) {
    console.log("✅ No custom vars dataset selected (optional)");
    return { isValid: true };
  }

  // Si HAY dataset seleccionado, DEBE mapear al menos 1 variable
  const mappedCustomVarsCount = appState.customVarsMappings.filter(
    mapping => mapping.value && mapping.value !== ""
  ).length;

  if (mappedCustomVarsCount === 0) {
    console.error("❌ Custom vars dataset selected but no variables mapped");
    return {
      isValid: false,
      message: "You have selected a Custom Variables dataset but haven't mapped any variables. Please map at least one variable or deselect the dataset."
    };
  }

  console.log(`✅ Custom vars validation passed (${mappedCustomVarsCount} mapped)`);
  return { isValid: true };
}

  /**
   * Valida que no haya columnas duplicadas en los mapeos
   */
  validateNoDuplicateColumns(appState) {
    const usedColumns = appState.getUsedColumns();
    const columnArray = Array.from(usedColumns);
    
    // Contar ocurrencias de cada columna
    const columnCounts = {};
    columnArray.forEach(col => {
      columnCounts[col] = (columnCounts[col] || 0) + 1;
    });

    // Buscar duplicados
    const duplicates = Object.keys(columnCounts).filter(col => columnCounts[col] > 1);
    
    if (duplicates.length > 0) {
      return {
        isValid: false,
        message: `The following columns are mapped multiple times: ${duplicates.join(', ')}`
      };
    }

    return { isValid: true };
  }

  /**
   * Valida la configuración antes de lanzar el workflow
   */
  validateWorkflowLaunch(appState) {
    if (!appState.documentId) {
      return {
        isValid: false,
        message: "Missing document ID. Please save the mapping first."
      };
    }

    const mappingValidation = this.validateMapping(appState);
    if (!mappingValidation.isValid) {
      return mappingValidation;
    }

    return { isValid: true };
  }

  /**
   * Valida formato de fechas
   */
  validateDateFormat(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * Valida que el rango de fechas tenga suficientes datos
   */
  validateDateRangeForAnalysis() {
    const dateFrom = document.getElementById("start-date")?.value;
    const dateTo = document.getElementById("end-date")?.value;

    if (!dateFrom || !dateTo) {
      return {
        isValid: false,
        message: "Date range is required for analysis."
      };
    }

    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    const diffTime = Math.abs(end - start);
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));

    if (diffWeeks < 8) {
      return {
        isValid: false,
        message: "Analysis requires at least 8 weeks of data. Please select a longer date range."
      };
    }

    if (diffWeeks > 208) { // ~4 años
      return {
        isValid: false,
        message: "Date range is too long. Please select a range of 4 years or less."
      };
    }

    return { isValid: true };
  }

  /**
   * Valida que los datos del dataset estén disponibles
   */
  validateDatasetAvailability(datasetId, appState) {
    const dataset = appState.getAvailableDatasets().find(ds => ds.ID === datasetId);
    
    if (!dataset) {
      return {
        isValid: false,
        message: "Selected dataset is no longer available."
      };
    }

    const columns = appState.getDatasetColumns(datasetId);
    if (!columns || columns.length === 0) {
      return {
        isValid: false,
        message: "No columns available for selected dataset."
      };
    }

    return { isValid: true };
  }

  /**
   * Valida la integridad completa del estado de la aplicación
   */
  validateAppStateIntegrity(appState) {
    const validations = [
      this.validateMapping(appState),
      this.validateCustomVariables(appState),
      this.validateNoDuplicateColumns(appState),
      this.validateDateRangeForAnalysis()
    ];

    const failedValidation = validations.find(v => !v.isValid);
    return failedValidation || { isValid: true, message: "Application state is valid" };
  }
}