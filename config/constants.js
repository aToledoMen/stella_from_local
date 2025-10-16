// config/constants.js
export const APP_CONFIG = {
  // Configuración de pasos del wizard
  STEPS: ['Welcome', 'Field Mapping', 'Model Run', 'Insights', 'Settings'],
  
  // Configuración de Domo
  DOMO: {
    COLLECTION_ID: "6f97b7f5-1772-4029-a715-f7577871186f", //
    DATASTORE_ID: "ef9c09f4-1edc-4edb-a92d-a787f2066bb8", //datastoreID in the collection
    COLLECTION_NAME: "MMM_VariablesAppDB",
    VARIABLES_ID: "8bb2a5f4-1927-4d74-b60e-3c6afe16d11b",
    STELLA_PARAMETERS_COLLECTION_ID : "f5f0dc69-f187-436e-af96-b6eafcfc4803",
    DATA_SERVICE_DATASTORE_ID : "a976dcca-45ca-4ea1-881f-95904cae377d",
    BUDGET_OPTIMIZER_COLLECTION_NAME: "StellaBudgetOptimizer" ,
    BUDGET_OPTIMIZER_COLLECTION_ID: "bab9aee1-f74a-4476-9d50-a0879c1b52d0" ,
  },

  // Configuración de Workflow
  WORKFLOW: {
    ACCOUNT: "remoteWorkflowRunner",
    DOMAIN: "stellaheystella.domo.com",
    WORKFLOW_ID: "e7ecfdec-d7aa-4cde-9592-f2e39aa42b62",
    WORKFLOW_VERSION: "1.0.11",
    BASE_URL: "custom-emea-new",
    CLIENT_ID: "b87fa35c-7f19-4c85-807c-bbee7d79a4c0",
    SECRET_ID: "61630b341b88f0584865ca6ae42fc45bff64b22831e0e2845e832d9023a97dd2",
    DEVELOPER_TOKEN : "DDCIb756ffb9626c01a0b8680bcff87cc93ac39f6ca970f2f31c"
  },

   BUDGET_OPTIMIZER: {
      WORKFLOW_ID: "6ae11ee9-2e69-4462-9768-40cc73bfd5d4",
      WORKFLOW_VERSION: "1.0.0" // Ajusta si tiene otra versión
    },

  // Configuración de MMM
  MMM: {
    MIN_CHANNELS: 2,
    MIN_WEEKS: 8,
    MAX_WEEKS: 208, // ~4 años
    POLLING_INTERVAL: 3000, // 3 segundos
    MAX_POLLING_ATTEMPTS: 40,
    SIMULATION_INTERVAL: 6000 // 6 segundos por fase en simulación
  },

  // Páginas de navegación
  NAVIGATION: {
    INSIGHTS_PAGE: "/app-studio/1613701990/pages/743538406"
  }
};

export const CHANNEL_LABELS = [
  'Channel 1', 'Channel 2', 'Channel 3', 'Channel 4',
  'Channel 5', 'Channel 6', 'Channel 7',
  'Channel 8', 'Channel 9', 'Channel 10'
];

export const CONTROL_VARIABLES = [
  'Variable 1', 'Variable 2', 'Variable 3', 
  'Variable 4', 'Variable 5', 'Variable 6'
];

export const MMM_STEPS = [
  "Data Validation",
  "Feature Engineering",
  "Bayesian Model Setup", 
  "MCMC Sampling",
  "Posterior Analysis",
  "Generating Insights"
];

export const PHASE_MAPPING = {
  "DATA_VALIDATION": 0,
  "FEATURE_ENGINEERING": 1,
  "BAYESIAN_MODEL_SETUP": 2,
  "MCMC_SAMPLING": 3,
  "POSTERIOR_ANALYSIS": 4,
  "GENERATING_INSIGHTS": 5
};

export const STEP_PERCENTAGES = [10, 30, 50, 70, 85, 95];

// API Endpoints
export const API_ENDPOINTS = {
  DATASETS: '/data/v1/datasets',
  DATASET_COLUMNS: '/data/v1/revenueColumnsDataset?',
  METRICS_SUMMARY: '/data/v1/metricsSummary',
  COLLECTION_DOCUMENTS: `/domo/datastores/v2/collections/${APP_CONFIG.DOMO.COLLECTION_NAME}/documents`,
  COLLECTION_SYNC: '/domo/codeengine/v2/packages/syncCollection',
  WORKFLOW_START: '/domo/codeengine/v2/packages/startWorkflowInRemoteInstance',
  WORKFLOW_STATUS: (modelId) => `/api/workflow/v1/instances/${modelId}/status`,
  EXECUTION_STATUS: (executionId) => `/domo/codeengine/v2/executions/${executionId}`
};

// Tipos de variables personalizadas
export const CUSTOM_VARIABLE_TYPES = {
  NUMERIC: 'numeric',
  BINARY: 'binary'
};

// Estados del workflow
export const WORKFLOW_STATUSES = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELED: 'CANCELED',
  TIMEOUT: 'TIMEOUT'
};

// Configuración de UI
export const UI_CONFIG = {
  TOAST_DURATION: 4000, // 4 segundos
  LOADING_MESSAGES: {
    DEFAULT: "Processing...",
    LOADING_DATA: "Loading data...",
    SAVING_MAPPING: "Saving mapping...",
    LAUNCHING_WORKFLOW: "Launching MMM Analysis..."
  },
  
  // Clases CSS comunes
  CSS_CLASSES: {
    DROPDOWN: "w-full border rounded px-3 py-2 text-sm",
    BUTTON_PRIMARY: "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg",
    BUTTON_SECONDARY: "bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded",
    BUTTON_SUCCESS: "bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg",
    CARD: "bg-white rounded-lg shadow-md p-6 mb-6",
    INPUT: "w-full border border-gray-300 rounded-md px-3 py-2"
  }
};

// Mensajes de validación
export const VALIDATION_MESSAGES = {
  MIN_CHANNELS: (min) => `Please map at least ${min} marketing channels before continuing.`,
  REVENUE_REQUIRED: "Please select a Revenue Amount column.",
  DATASET_REQUIRED: "Please select a valid revenue dataset.",
  DATE_RANGE_REQUIRED: "Please select both start and end dates.",
  INVALID_DATE_RANGE: "Start date cannot be after end date.",
  DATE_FIELD_REQUIRED: "Please select a valid Date Field column.",
  MISSING_DOCUMENT_ID: "Missing document ID. Please save the mapping first.",
  INSUFFICIENT_DATE_RANGE: "Analysis requires at least 8 weeks of data. Please select a longer date range.",
  EXCESSIVE_DATE_RANGE: "Date range is too long. Please select a range of 4 years or less.",
  CUSTOM_VAR_INCOMPLETE: "Please fill all variable values before saving.",
  DUPLICATE_COLUMNS: (columns) => `The following columns are mapped multiple times: ${columns.join(', ')}`
};

// Configuración de desarrollo/debug
export const DEBUG_CONFIG = {
  ENABLE_CONSOLE_LOGS: true,
  ENABLE_WORKFLOW_SIMULATION: true,
  SKIP_TO_EXECUTION: true,           // ← YA EXISTE
  MOCK_DATA: true,                   // ← YA EXISTE  
  ENABLE_INSIGHTS_DEV: true,         // ← AGREGAR ESTA LÍNEA
  LOG_LEVEL: 'info'
};

// Configuración de formato
export const FORMAT_CONFIG = {
  DATE_LOCALE: 'en-US',
  DATE_OPTIONS: { month: 'short', day: 'numeric' },
  NUMBER_LOCALE: 'en',
  COMPACT_NUMBER_OPTIONS: {
    notation: "compact",
    compactDisplay: "short", 
    maximumFractionDigits: 1
  }
};