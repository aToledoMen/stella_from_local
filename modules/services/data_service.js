
import { APP_CONFIG } from '../../config/constants.js';
// modules/services/DataService.js
export class DataService {
  constructor() {
    this.datastoreId = APP_CONFIG.DOMO.DATA_SERVICE_DATASTORE_ID;
  }
  /**
   * Carga la lista de datasets disponibles desde la API de Domo
   */
  async loadDatasetList() {
    try {
      const rows = await domo.get('/data/v1/datasets', {
        format: 'array-of-objects'
      });

      return rows.filter(r => r.Name && r.ID);
    } catch (err) {
      console.error("Error loading datasets list:", err);
      throw new Error("Failed to load datasets");
    }
  }

  /**
   * Carga las columnas disponibles para cada dataset
   */
/**
 * Carga las columnas disponibles para cada dataset CON SUS TIPOS
 */
async loadDatasetColumns() {
  try {
    const rows = await domo.get('/data/v1/revenueColumnsDataset?', {
      format: 'array-of-objects'
    });

    const columnsMap = {};
    const columnTypesMap = {}; // NUEVO

    rows.forEach(row => {
      const datasetId = row.DatasetID;
      const columnName = row.ColumnName;
      const columnType = row.ColumnType; // NUEVO
      
      // Guardar columnas
      if (!columnsMap[datasetId]) {
        columnsMap[datasetId] = [];
      }
      columnsMap[datasetId].push(columnName);

      // NUEVO: Guardar tipos
      if (!columnTypesMap[datasetId]) {
        columnTypesMap[datasetId] = {};
      }
      columnTypesMap[datasetId][columnName] = columnType;
    });

    console.log("✅ Dataset columns loaded:", columnsMap);
    console.log("✅ Column types loaded:", columnTypesMap);

    // CAMBIO IMPORTANTE: devolver objeto con ambos mapas
    return { 
      columnsMap, 
      columnTypesMap 
    };
  } catch (err) {
    console.error("❌ Error loading dataset columns:", err);
    throw new Error("Failed to load dataset columns");
  }
}

  /**
   * Guarda la configuración en la colección de Domo
   */
  async saveConfiguration(configData) {
    try {
      const payload = {
        content: configData
      };

      // Guardar en la colección
      const response = await domo.post(
        `/domo/datastores/v2/collections/MMM_VariablesAppDB/documents`, 
        payload
      );

      console.log("Configuration saved to collection:", response.id);

      // Sincronizar colección
      const codeEngineParams = {
        "datastoreId": this.datastoreId
      };

      await domo.post(
        `/domo/codeengine/v2/packages/syncCollection`, 
        codeEngineParams
      );

      console.log("Collection synchronized");
      
      return response.id || response.documentId;
    } catch (err) {
      console.error("Error saving configuration:", err);
      throw new Error("Failed to save configuration");
    }
  }



  /**
   * Searches for documents in the Stella_Parameters collection using Code Engine
   * 
   * @param {string} documentId - The document ID to search for
   * @param {string} datasetName - The dataset name to filter by (default: "metrics_summary_data")
   * @returns {Promise<Object>} Object containing documentFound flag, metricsDatasetId, and documentData
   * @throws {Error} When document search fails or no documents are found
   */
  async searchAppDBDocuments(documentId, datasetName = "metrics_summary_data") {
    try {
      console.log(`🔍 Searching for document: ${documentId}, dataset: ${datasetName}`);
      
      const codeEngineParams = {
          collectionId: APP_CONFIG.DOMO.STELLA_PARAMETERS_COLLECTION_ID,
          criteria: {
            "content.Dataset": datasetName  
          }
        }

      console.log("📋 Search parameters:", JSON.stringify(codeEngineParams, null, 2));

      const response = await domo.post(
        `/domo/codeengine/v2/packages/searchAppDBDocuments`, 
        codeEngineParams
      );

      console.log("📄 Search AppDB response:", response);
      
      if (response && response.result && response.result.length > 0) {
        const doc = response.result[0];
        
        const metricsDatasetId = this.extractMetricsDatasetId(doc);
        
        if (!metricsDatasetId) {
          throw new Error(`Dataset ID not found in document for dataset: ${datasetName}`);
        }
        
        return {
          documentFound: true,
          metricsDatasetId: metricsDatasetId,
          documentData: doc
        };
      }
      
      throw new Error(`No ${datasetName} document found for Document_ID: ${documentId}`);
      
    } catch (error) {
      console.error("❌ Error searching AppDB documents:", error);
      throw new Error(`Failed to search AppDB documents: ${error.message}`);
    }
  }



  /**
   * Extracts the dataset ID from a Stella_Parameters document
   * The dataset ID is located at content.Dataset_ID
   * 
   * @param {Object} document - The document object from Stella_Parameters collection
   * @returns {string|null} The dataset ID or null if not found
   */
  extractMetricsDatasetId(document) {
    try {
      console.log("🔍 Extracting dataset ID from document...");
      console.log("📋 Document structure:", JSON.stringify(document, null, 2));
      
      // The dataset ID is specifically located at content.Dataset_ID
      const datasetId = document.content?.Dataset_ID;
      
      if (datasetId && typeof datasetId === 'string') {
        console.log(`📊 Found dataset ID: ${datasetId}`);
        return datasetId;
      }

      console.error("⚠️ Dataset ID not found at content.Dataset_ID");
      console.log("📋 Available document keys:", Object.keys(document));
      if (document.content) {
        console.log("📋 Available content keys:", Object.keys(document.content));
      }
      
      return null;
      
    } catch (error) {
      console.error("❌ Error extracting dataset ID:", error);
      return null;
    }
  }


//2. getMetricsFromDataset() - AQUÍ se extraen R2 e Incremental Revenue
// =====================================================================
  /**
   * Queries the metrics dataset using Code Engine queryWithSql function
   * 
   * @param {string} datasetId - The dataset ID containing metrics_summary_data
   * @returns {Promise<Object>} Object containing r2 and incrementalRevenue values
   * @throws {Error} When dataset query fails or required metrics are not found
   */
 
  async getMetricsFromDataset(datasetId) {
    try {
      console.log(`📊 Querying metrics from dataset: ${datasetId}`);
      
      const sqlQuery = `
        SELECT metric, value
        FROM table
        WHERE metric IN ('r_squared', 'incremental_revenue','top_channel','mape')
      `;

      const codeEngineParams = {
        dataset: datasetId,
        sql: sqlQuery
      };

      console.log("📋 Code Engine parameters:", JSON.stringify(codeEngineParams, null, 2));

      const response = await domo.post(
        `/domo/codeengine/v2/packages/queryWithSql`,
        codeEngineParams
      );

      console.log("📈 Code Engine response:", response);

      // Handle the specific response format: {results: Array}
      if (!response.results || !Array.isArray(response.results) || response.results.length === 0) {
        throw new Error("No metrics data returned from SQL query");
      }

      const metricsData = response.results;
      console.log("📊 Metrics data:", metricsData);

      // Extract metrics - format: [{metric: 'r_squared', value: '0.56'}, {metric: 'incremental_revenue', value: '46458878'}]
      let r2 = null;
      let incrementalRevenue = null;
      let topChannel = null;
      let mape = null;

      metricsData.forEach(row => {
        console.log(`🔍 Processing row:`, row);
        
        if (row.metric === 'r_squared') {
          r2 = parseFloat(row.value);
          console.log("📊 Found R2:", r2);
        } else if (row.metric === 'incremental_revenue') {
          incrementalRevenue = parseFloat(row.value);
          console.log("💰 Found Incremental Revenue:", incrementalRevenue);
        } else if (row.metric === 'top_channel') {
          topChannel = row.value; // String, no parseFloat
          console.log("🏆 Found Top Channel:", topChannel);
        } else if (row.metric === 'mape') {
          mape = parseFloat(row.value);
          console.log("📈 Found MAPE:", mape);
        }
      });

      const result = {
        r2: r2,
        incrementalRevenue: incrementalRevenue,
        topChannel: topChannel,
        mape: mape,
        rawData: metricsData,
        source: 'code_engine_sql'
      };

      console.log("✅ Metrics extraction successful:", result);
      return result;

    } catch (error) {
      console.error("❌ Error querying metrics:", error);
      
      return {
        r2: null,
        incrementalRevenue: null,
        rawData: null,
        source: 'code_engine_sql',
        error: error.message
      };
    }
  }

  /**
   * Carga el resumen de ejecución MMM desde un dataset
   */
 // REEMPLAZAR en modules/services/data_service.js:

  /**
   * Loads MMM execution summary - Updated to use new Step 4 workflow
   * 
   * @param {string} documentId - Optional document ID, if not provided tries legacy method
   * @returns {Promise<Object|null>} Metrics object or null if loading fails
   */
  async loadMMMExecutionSummary(documentId = null) {
    try {
      // Try to get document ID from parameter or app state
      const currentDocumentId = documentId || (typeof window !== 'undefined' && window.appState?.documentId);
      
      if (currentDocumentId && currentDocumentId !== "mock-doc-123") {
        // Use new Step 4 workflow with real document ID
        console.log("📊 Using new Step 4 metrics workflow for loadMMMExecutionSummary");
        const channelsCount = (typeof window !== 'undefined' && window.appState?.getMappedChannelsCount()) || 4;
        
        const result = await this.loadStep4Metrics(currentDocumentId, channelsCount);
        
        if (!result.error) {
          console.log("✅ loadMMMExecutionSummary: Using real metrics from Step 4 workflow");
          return result;
        } else {
          console.log("⚠️ loadMMMExecutionSummary: Step 4 workflow failed, using fallback");
        }
      }
      
      // Fallback to legacy method only if new method fails or no document ID
      console.log("📊 Using legacy metrics method (fallback)");
      const data = await domo.get('/data/v1/metricsSummary');
      
      if (!data || !data.length) {
        return null;
      }

      const getValue = (metricName) => {
        const match = data.find(row => row.metric === metricName);
        return match?.value ?? null;
      };

      const legacyResult = {
        r2: getValue("r_squared"),
        incrementalRevenue: getValue("incremental_revenue"),
        source: 'legacy_method'
      };
      
      console.log("📊 loadMMMExecutionSummary: Using legacy metrics");
      return legacyResult;
      
    } catch (err) {
      console.error("❌ Error loading MMM execution summary:", err);
      return null;
    }
  }

  /**
   * Obtiene documentos existentes de la colección
   */
  async getExistingDocuments() {
    try {
      const data = await domo.get(
        `/domo/datastores/v1/collections/MMM_VariablesAppDB/documents/`
      );
      return data;
    } catch (err) {
      console.error("Error getting existing documents:", err);
      return [];
    }
  }


async loadStep4Metrics(documentId, channelsCount) {
  const searchResult = await this.searchAppDBDocuments(documentId, "metrics_summary_data");
  const metricsResult = await this.getMetricsFromDataset(searchResult.metricsDatasetId); // ← AQUÍ
  return metricsResult;
}

  /**
   * Formatea números grandes en notación compacta
   */
  formatCompactNumber(value) {
    return new Intl.NumberFormat("en", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1
    }).format(value);
  }

  /**
   * Valida la estructura de datos antes de guardar
   */
  validateConfigurationData(configData) {
    const requiredFields = [
      'revenueAmountField', 
      'dateField', 
      'channels'
    ];

    for (const field of requiredFields) {
      if (!configData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!Array.isArray(configData.channels) || configData.channels.length < 2) {
      throw new Error("At least 2 channels are required");
    }

    return true;
  }


/**
   * Load channel performance data from dataset using document_id
   * Similar workflow to loadStep4Metrics but for channel_performance_data
   * 
   * @param {string} documentId - The document ID to search for
   * @returns {Promise<Array>} Array of channel performance objects
   */
  async loadChannelPerformanceFromDataset(documentId) {
    try {
      console.log(`📊 Loading channel performance for document: ${documentId}`);
      
      // Step 1: Search for the document with dataset name "channel_performance_data"
      const searchResult = await this.searchAppDBDocuments(documentId, "channel_performance_data");
      
      // Step 2: Extract the dataset ID
      const channelDatasetId = searchResult.metricsDatasetId;
      console.log(`📊 Channel dataset ID: ${channelDatasetId}`);
      
      // Step 3: Query the dataset for all channel data
      const sqlQuery = `
        SELECT *
        FROM table
      `;
      
      const codeEngineParams = {
        dataset: channelDatasetId,
        sql: sqlQuery
      };
      
      console.log("📋 Querying channel performance dataset...");
      
      const response = await domo.post(
        `/domo/codeengine/v2/packages/queryWithSql`,
        codeEngineParams
      );
      
      if (!response.results || !Array.isArray(response.results)) {
        throw new Error("No channel performance data returned");
      }
      
      console.log(`✅ Loaded ${response.results.length} channels from dataset`);
      console.log("📊 Channel data sample:", response.results[0]);
      
      return response.results;
      
    } catch (error) {
      console.error("❌ Error loading channel performance data:", error);
      return null;
    }
  }


/**
 * Load channel performance data for insights (respeta MOCK_DATA)
 */
async loadChannelPerformanceData() {
  try {
    // Si MOCK_DATA está habilitado, usar datos simulados
    const { DEBUG_CONFIG } = await import('../../config/constants.js');
    if (DEBUG_CONFIG.MOCK_DATA) {
      console.log("🔄 Using mock channel performance data (MOCK_DATA=true)");
      return null; // Trigger mock data in processor
    }

    // Intentar cargar datos reales
    console.log("📊 Attempting to load real channel performance data...");
    const data = await domo.get('/data/v1/channelPerformance');
    return data;
  } catch (error) {
    console.log("🔄 Falling back to mock channel performance data");
    return null;
  }
}

/**
 * Load statistical analysis data (respeta MOCK_DATA)
 */
async loadStatisticalAnalysisData() {
  try {
    const { DEBUG_CONFIG } = await import('../../config/constants.js');
    if (DEBUG_CONFIG.MOCK_DATA) {
      console.log("🔄 Using mock statistical data (MOCK_DATA=true)");
      return null;
    }

    console.log("📈 Attempting to load real statistical analysis data...");
    const data = await domo.get('/data/v1/statisticalAnalysis');
    return data;
  } catch (error) {
    console.log("🔄 Falling back to mock statistical data");
    return null;
  }
}


/**
 * Load budget allocation recommendations (respeta MOCK_DATA)
 */
/*async loadBudgetAllocationData() {
  try {
    const { DEBUG_CONFIG } = await import('../../config/constants.js');
    if (DEBUG_CONFIG.MOCK_DATA) {
      console.log("🔄 Using mock budget data (MOCK_DATA=true)");
      return null;
    }

    console.log("💰 Attempting to load real budget allocation data...");
    const data = await domo.get('/data/v1/budgetAllocation');
    return data;
  } catch (error) {
    console.log("🔄 Falling back to mock budget data");
    return null;
  }
}*/

/**
   * Load waterfall decomposition data from dataset using document_id
   * 
   * @param {string} documentId - The document ID to search for
   * @returns {Promise<Array>} Array of waterfall decomposition data
   */
  async loadWaterfallDecompositionData(documentId) {
    try {
      console.log(`📊 Loading waterfall decomposition for document: ${documentId}`);
      
      // Step 1: Search for the document with dataset name "waterfall_decomposition_df"
      const searchResult = await this.searchAppDBDocuments(documentId, "waterfall_decomposition_data");
      
      // Step 2: Extract the dataset ID
      const waterfallDatasetId = searchResult.metricsDatasetId;
      console.log(`📊 Waterfall dataset ID: ${waterfallDatasetId}`);
      
      // Step 3: Query the dataset for all waterfall data
      const sqlQuery = `
        SELECT *
        FROM table
      `;
      
      const codeEngineParams = {
        dataset: waterfallDatasetId,
        sql: sqlQuery
      };
      
      console.log("📋 Querying waterfall decomposition dataset...");
      
      const response = await domo.post(
        `/domo/codeengine/v2/packages/queryWithSql`,
        codeEngineParams
      );
      
      if (!response.results || !Array.isArray(response.results)) {
        throw new Error("No waterfall decomposition data returned");
      }
      
      console.log(`✅ Loaded ${response.results.length} waterfall steps from dataset`);
      console.log("📊 Waterfall data sample:", response.results[0]);
      
      return response.results;
      
    } catch (error) {
      console.error("❌ Error loading waterfall decomposition data:", error);
      return null;
    }
  }


/**
 * Load contribution breakdown over time data from dataset using document_id
 * 
 * @param {string} documentId - The document ID to search for
 * @returns {Promise<Array>} Array of weekly contribution data by channel
 */
async loadContributionBreakdownData(documentId) {
  try {
    console.log(`📊 Loading contribution breakdown for document: ${documentId}`);
    
    // Step 1: Search for the document with dataset name "contribution_breakdown_over_time_data"
    const searchResult = await this.searchAppDBDocuments(documentId, "contribution_breakdown_over_time_data");
    
    // Step 2: Extract the dataset ID
    const contributionDatasetId = searchResult.metricsDatasetId;
    console.log(`📊 Contribution breakdown dataset ID: ${contributionDatasetId}`);
    
    // Step 3: Query the dataset for all contribution data
    const sqlQuery = `
      SELECT *
      FROM table
    `;
    
    const codeEngineParams = {
      dataset: contributionDatasetId,
      sql: sqlQuery
    };
    
    console.log("📋 Querying contribution breakdown dataset...");
    
    const response = await domo.post(
      `/domo/codeengine/v2/packages/queryWithSql`,
      codeEngineParams
    );
    
    if (!response.results || !Array.isArray(response.results)) {
      throw new Error("No contribution breakdown data returned");
    }
    
    console.log(`✅ Loaded ${response.results.length} contribution records from dataset`);
    console.log("📊 Contribution data sample:", response.results[0]);
    
    return response.results;
    
  } catch (error) {
    console.error("❌ Error loading contribution breakdown data:", error);
    return null;
  }
}


// modules/services/data_service.js
// AÑADIR ESTE MÉTODO A LA CLASE DataService

/**
 * Load budget allocation data from dataset using document_id
 * Dataset name: budget_optimization_data
 * 
 * @param {string} documentId - The document ID to search for
 * @returns {Promise<Object>} Budget allocation data with channels
 */
async loadBudgetAllocationData(documentId) {
  try {
    console.log(`💰 Loading budget allocation for document: ${documentId}`);
    
    // Step 1: Search for the document with dataset name "budget_optimization_data"
    const searchResult = await this.searchAppDBDocuments(documentId, "budget_optimization_data");
    
    // Step 2: Extract the dataset ID
    const budgetDatasetId = searchResult.metricsDatasetId;
    console.log(`💰 Budget allocation dataset ID: ${budgetDatasetId}`);
    
    // Step 3: Query the dataset for all budget allocation data
    const sqlQuery = `
      SELECT *
      FROM table
    `;
    
    const codeEngineParams = {
      dataset: budgetDatasetId,
      sql: sqlQuery
    };
    
    console.log("📋 Querying budget allocation dataset...");
    
    const response = await domo.post(
      `/domo/codeengine/v2/packages/queryWithSql`,
      codeEngineParams
    );
    
    if (!response.results || !Array.isArray(response.results)) {
      throw new Error("No budget allocation data returned");
    }
    
    console.log(`✅ Loaded ${response.results.length} channels from budget dataset`);
    console.log("💰 Budget data sample:", response.results[0]);
    
    return {
      channels: response.results,
      loadedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error("❌ Error loading budget allocation data:", error);
    return null;
  }
}


/**
 * Save Budget Optimizer parameters to AppDB
 * @param {Object} params - Budget optimizer parameters
 * @param {string} params.document_id - Reference to MMM configuration document
 * @param {number} params.total_budget - Total budget amount
 * @param {string} params.timeframe - Timeframe (quarter/year)
 * @param {string} params.objective - Optimization objective
 * @param {Array} params.channel_constraints - Array of channel constraints
 * @returns {Promise<string>} Document ID of saved parameters
 */
async saveBudgetOptimizerParams(params) {
  try {
    console.log('💾 Saving Budget Optimizer parameters:', params);

    // Import collection name
    const BUDGET_OPTIMIZER_COLLECTION_NAME = "StellaBudgetOptimizer";

    // Prepare document for AppDB - ensure all fields are present
    const document = {
      document_id: String(params.document_id || 'unknown'),
      total_budget: Number(params.total_budget || 0),
      timeframe: String(params.timeframe || 'quarter'),
      objective: String(params.objective || 'maximize-revenue'),
      channel_constraints: params.channel_constraints || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📋 Formatted document to save:', document);

    // Save to AppDB collection
    const url = `/domo/datastores/v2/collections/${BUDGET_OPTIMIZER_COLLECTION_NAME}/documents`;
    console.log('📡 Posting to URL:', url);
    const payload = {
        content: document
      };   
    const response = await domo.post(url, payload);


    console.log('✅ Budget Optimizer parameters saved successfully. Response:', response);

    // Return the document ID from response
    const savedId = response.id || response._id || response.document_id || 'saved';
    console.log('📝 Saved document ID:', savedId);
    
    return savedId;

  } catch (error) {
    console.error('❌ Error saving Budget Optimizer parameters:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response
    });
    throw error;
  }
}


/**
 * Load Budget Optimizer results from optimization_details_df dataset
 * @param {string} documentId - MMM configuration document ID
 * @returns {Promise<Object>} Optimization results with projected revenue and lift
 */
async loadBudgetOptimizerResults(documentId) {
  try {
    console.log('📥 Loading Budget Optimizer results for document:', documentId);
    
    // Step 1: Search for optimization_details_df dataset ID in Stella_Parameters
    const searchParams = {
      collectionId: APP_CONFIG.DOMO.STELLA_PARAMETERS_COLLECTION_ID,
      criteria: {
        "content.Dataset": "optimization_details_df",
      }
    };

    console.log('🔍 Searching Stella_Parameters:', searchParams);

    const searchResponse = await domo.post(
      '/domo/codeengine/v2/packages/searchAppDBDocuments',
      searchParams
    );

    console.log('📄 Search response:', searchResponse);

    if (!searchResponse?.result || searchResponse.result.length === 0) {
      throw new Error('optimization_details_df dataset not found in Stella_Parameters');
    }

    const optimizationDatasetId = searchResponse.result[0]?.content?.Dataset_ID;
    
    if (!optimizationDatasetId) {
      throw new Error('Dataset_ID not found for optimization_details_df');
    }

    console.log('✅ Found optimization dataset ID:', optimizationDatasetId);

    // Step 2: Query the optimization dataset to get results
    const queryParams = {
      dataset: optimizationDatasetId,
      sql: `SELECT 
              optimized_revenue,
              revenue_lift
            FROM table
            LIMIT 1`
    };

    console.log('📊 Querying optimization dataset:', queryParams);

    const queryResponse = await domo.post(
      '/domo/codeengine/v2/packages/queryWithSql',
      queryParams
    );

    console.log('📈 Query response:', queryResponse);

    if (!queryResponse?.results || queryResponse.results.length === 0) {
      throw new Error('No results found in optimization_details_df dataset');
    }

    const resultRow = queryResponse.results[0];

    const optimizationResults = {
      projectedRevenue: resultRow.optimized_revenue || 0,
      revenueLift: resultRow.revenue_lift || 0,
      averageROAS: 3.5, // Mock for now as requested
      datasetId: optimizationDatasetId
    };

    console.log('✅ Budget Optimizer results loaded:', optimizationResults);

    return optimizationResults;

  } catch (error) {
    console.error('❌ Error loading Budget Optimizer results:', error);
    throw error;
  }
}



/**
 * Load channel allocations from allocation_summary_df dataset
 * @param {string} documentId - MMM configuration document ID
 * @returns {Promise<Array>} Array of channel allocation objects
 */
async loadChannelAllocations(documentId) {
  try {
    console.log('📥 Loading channel allocations for document:', documentId);
    
    // Step 1: Search for allocation_summary_df dataset ID in Stella_Parameters
    const searchParams = {
      collectionId: APP_CONFIG.DOMO.STELLA_PARAMETERS_COLLECTION_ID,
      criteria: {
        "content.Dataset": "allocation_summary_df"
        }
    };

    console.log('🔍 Searching Stella_Parameters for allocation_summary_df:', searchParams);

    const searchResponse = await domo.post(
      '/domo/codeengine/v2/packages/searchAppDBDocuments',
      searchParams
    );

    console.log('📄 Search response:', searchResponse);

    if (!searchResponse?.result || searchResponse.result.length === 0) {
      throw new Error('allocation_summary_df dataset not found in Stella_Parameters');
    }

    const allocationDatasetId = searchResponse.result[0]?.content?.Dataset_ID;
    
    if (!allocationDatasetId) {
      throw new Error('Dataset_ID not found for allocation_summary_df');
    }

    console.log('✅ Found allocation dataset ID:', allocationDatasetId);

    // Step 2: Query the allocation dataset to get channel data
    const queryParams = {
      dataset: allocationDatasetId,
      sql: `SELECT  channel, "Current Allocation", "Optimized Allocation","Allocation Change (%)" FROM table ORDER BY "Optimized Allocation" DESC`
    };

    console.log('📊 Querying allocation dataset:', queryParams);

    const queryResponse = await domo.post(
      '/domo/codeengine/v2/packages/queryWithSql',
      queryParams
    );

    console.log('📈 Query response:', queryResponse);

    if (!queryResponse?.results || queryResponse.results.length === 0) {
      throw new Error('No results found in allocation_summary_df dataset');
    }

    // Transform results to match expected format
    const channelAllocations = queryResponse.results.map(row => ({
      name:  row['Channel'] ,
      currentAllocation: row['Current Allocation'] || 0,
      newAllocation: row['Optimized Allocation'] || 0,
      change_pct: row['Allocation Change (%)'] || 0
    }));

    console.log('✅ Channel allocations loaded:', channelAllocations);

    return channelAllocations;

  } catch (error) {
    console.error('❌ Error loading channel allocations:', error);
    throw error;
  }
}

/**
   * Load VIF (Variance Inflation Factor) results from dataset
   * @param {string} documentId - MMM configuration document ID
   * @returns {Promise<Array>} Array of VIF results with variable name, value, and 
  type
   */
  async loadVIFResults(documentId) {
    try {
      console.log('📊 Loading VIF results for document:', documentId);

      // Step 1: Search for vif_results_data dataset in Stella_Parameters
      const searchResult = await this.searchAppDBDocuments(documentId,
  "Stella VIF Results");

      // Step 2: Extract the dataset ID
      const vifDatasetId = searchResult.metricsDatasetId;
      console.log('📊 VIF dataset ID:', vifDatasetId);

      // Step 3: Query the dataset for all VIF data
      const sqlQuery = `
        SELECT *
        FROM table
        ORDER BY VIF DESC
      `;

      const codeEngineParams = {
        dataset: vifDatasetId,
        sql: sqlQuery
      };

      console.log('📋 Querying VIF results dataset...');

      const response = await domo.post(
        '/domo/codeengine/v2/packages/queryWithSql',
        codeEngineParams
      );

      if (!response.results || !Array.isArray(response.results)) {
        throw new Error('No VIF results data returned');
      }

      console.log(`✅ Loaded ${response.results.length} VIF records from dataset`);
      console.log('📊 VIF data sample:', response.results[0]);

      return response.results;

    } catch (error) {
      console.error('❌ Error loading VIF results:', error);
      return null;
    }
  }

  /**
   * Load Correlation Matrix from dataset
   * @param {string} documentId - MMM configuration document ID
   * @returns {Promise<Array>} Array of correlation values between variables
   */
  async loadCorrelationMatrix(documentId) {
    try {
      console.log('📊 Loading Correlation Matrix for document:', documentId);

      // Step 1: Search for correlation_matrix_data dataset in Stella_Parameters
      const searchResult = await this.searchAppDBDocuments(documentId, "Stella Correlation Matrix ");

      // Step 2: Extract the dataset ID
      const correlationDatasetId = searchResult.metricsDatasetId;
      console.log('📊 Correlation Matrix dataset ID:', correlationDatasetId);

      // Step 3: Query the dataset for all correlation data
      const sqlQuery = `
        SELECT *
        FROM table
      `;

      const codeEngineParams = {
        dataset: correlationDatasetId,
        sql: sqlQuery
      };

      console.log('📋 Querying Correlation Matrix dataset...');

      const response = await domo.post(
        '/domo/codeengine/v2/packages/queryWithSql',
        codeEngineParams
      );

      if (!response.results || !Array.isArray(response.results)) {
        throw new Error('No Correlation Matrix data returned');
      }

      console.log(`✅ Loaded ${response.results.length} correlation records from dataset`);
      console.log('📊 Correlation data sample:', response.results[0]);

      return response.results;

    } catch (error) {
      console.error('❌ Error loading Correlation Matrix:', error);
      return null;
    }
  }

}