# Stella MMM - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Core Modules](#core-modules)
5. [Services](#services)
6. [Components](#components)
7. [Data Flow](#data-flow)
8. [Configuration](#configuration)
9. [Development Guide](#development-guide)
10. [API Integration](#api-integration)

---

## Project Overview

**Stella MMM** is a Domo Custom App that provides Marketing Mix Modeling (MMM) capabilities directly within the Domo platform. It allows users to:

- Map marketing channel data and revenue metrics
- Execute Bayesian MMM analysis via Domo Workflows
- Visualize channel performance, incrementality, and ROI
- Optimize budget allocation based on statistical insights
- Generate AI-powered recommendations via OpenAI integration

### Key Technologies
- **Frontend**: Vanilla JavaScript (ES6 Modules), Tailwind CSS
- **Charts**: D3.js for advanced visualizations, Chart.js for standard charts
- **Backend Integration**: Domo Code Engine, Domo AppDB Collections
- **AI Integration**: OpenAI API (via Domo AI Service)
- **Export**: html2canvas for PNG export

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         app.js                              │
│                   (Application Entry Point)                 │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──► AppState (State Management)
             ├──► UIManager (UI Orchestration)
             ├──► StepController (Flow Control)
             └──► Services (Data, Workflow, Validation, AI)
                  │
                  ├──► DataService ──► Domo APIs
                  ├──► WorkflowService ──► Code Engine
                  ├──► ValidationService
                  └──► AIService ──► OpenAI
```

### Module Architecture

```
Stella-from-Local/
│
├── app.js                          # Main entry point
├── index.html                      # HTML structure
├── app.css                         # Global styles
│
├── config/
│   └── constants.js                # App-wide configuration
│
├── modules/
│   ├── state/
│   │   └── app_state.js            # Centralized state management
│   │
│   ├── controllers/
│   │   └── step_controller.js      # Multi-step workflow control
│   │
│   ├── services/
│   │   ├── data_service.js         # Domo data API integration
│   │   ├── workflow_service.js     # Code Engine workflow management
│   │   ├── validation_service.js   # Input validation logic
│   │   └── ai_service.js          # OpenAI integration
│   │
│   ├── ui/
│   │   └── ui_manager.js           # UI rendering and updates
│   │
│   └── insights/
│       ├── InsightsManager.js      # Dashboard orchestrator
│       ├── components/             # Reusable UI components
│       │   ├── ChartRenderer.js
│       │   ├── MetricCardsComponent.js
│       │   ├── StatisticalMetricCards.js
│       │   ├── TabContentRenderer.js
│       │   ├── TabNavigationComponent.js
│       │   ├── BudgetOptimizerComponent.js
│       │   └── ...
│       └── data/
│           └── InsightsDataProcessor.js  # Data transformation
```

---

## Project Structure

### Root Files

| File | Purpose |
|------|---------|
| `app.js` | Application entry point, initializes all services and controllers |
| `index.html` | Main HTML structure with 4-step wizard UI |
| `app.css` | Global CSS styles and custom Tailwind configurations |
| `manifest.json` | Domo Custom App configuration (datasets, collections, packages) |

### Configuration

#### `config/constants.js`
Centralized configuration for:
- Domo collection IDs and datastore IDs
- Workflow configuration (IDs, versions, domain)
- MMM parameters (min channels, date ranges, polling intervals)
- API endpoints
- UI constants (messages, CSS classes)
- Validation rules
- Debug/development settings

**Key Configuration Objects**:
- `APP_CONFIG` - Core app settings
- `APP_CONFIG.DOMO` - Domo-specific IDs
- `APP_CONFIG.WORKFLOW` - Workflow execution settings
- `APP_CONFIG.MMM` - MMM model parameters
- `API_ENDPOINTS` - REST API paths
- `VALIDATION_MESSAGES` - User-facing validation text

---

## Core Modules

### 1. AppState (`modules/state/app_state.js`)

**Purpose**: Centralized state management for the entire application.

**Key Responsibilities**:
- Store user mappings (channels, controls, custom variables)
- Track current wizard step
- Manage dataset selections and field mappings
- Store MMM metrics and results
- Manage budget optimizer parameters
- Provide getters/setters for state access

**Key Properties**:
```javascript
{
  currentStep: 1,
  revenueAmountField: "",
  dateField: "",
  documentId: null,
  modelId: null,
  channelMappings: [...],
  controlMappings: [...],
  customVarsMappings: [...],
  mmmMetrics: {
    r2, incrementalRevenue, channelsAnalyzed, ...
  },
  budgetOptimizerParams: {...},
  iroasPriors: {}
}
```

**Key Methods**:
- `reset()` - Reset all state to defaults
- `setMMMMetrics(metrics)` - Store MMM analysis results
- `getMMMMetrics()` - Retrieve stored metrics
- `hasValidMetrics()` - Check if valid metrics exist
- `getChannelMappingPayload()` - Format data for API submission
- `getMappedChannelsCount()` - Get count of mapped channels

---

### 2. StepController (`modules/controllers/step_controller.js`)

**Purpose**: Orchestrate the 4-step wizard flow and coordinate services.

**Key Responsibilities**:
- Control navigation between steps (Welcome → Mapping → Execution → Insights)
- Validate user inputs before step transitions
- Trigger workflow execution
- Poll workflow status
- Handle workflow completion and errors
- Coordinate between UI, services, and state

**Key Methods**:
- `initialize()` - Set up the app, load saved data
- `goToStep(stepNumber)` - Navigate to specific step with validation
- `saveMapping()` - Validate and save user mappings to Domo AppDB
- `launchWorkflow()` - Execute MMM workflow via Code Engine
- `startWorkflowPolling()` - Poll workflow status until completion
- `handleWorkflowCompletion()` - Process results and transition to insights
- `goToInsights()` - Navigate to insights dashboard

**Step Flow**:
```
Step 1: Welcome
    ↓
Step 2: Field Mapping (channels, controls, revenue, dates)
    ↓ (Save to AppDB)
Step 3: Model Run (launch workflow, poll status)
    ↓ (Workflow completes)
Step 4: Insights Dashboard (visualize results)
```

---

### 3. UIManager (`modules/ui/ui_manager.js`)

**Purpose**: Manage all UI rendering, updates, and user interactions.

**Key Responsibilities**:
- Render dropdowns (datasets, columns, channels, controls)
- Update step progress bar
- Show/hide loading overlays
- Display toast notifications
- Render workflow execution progress (6 phases)
- Update metric cards dynamically
- Handle data mapping previews
- Manage iROAS priors UI

**Key Methods**:
- `showLoadingOverlay(message)` / `hideLoadingOverlay()`
- `showToast(message, type)` - Display success/error notifications
- `showStep(stepNumber)` - Display specific wizard step
- `renderDatasetDropdown()` - Populate dataset selectors
- `renderChannelDropdowns()` - Generate channel mapping UI
- `renderIROASPriorsSection()` - Display iROAS input fields
- `showWorkflowExecutionOverlay()` - Display workflow progress modal
- `updateWorkflowProgress(step, phase, label)` - Update progress UI
- `completeWorkflowProgress()` - Mark workflow as complete

**UI Components**:
- Step progress tracker
- Loading overlays (general + workflow-specific)
- Toast notifications
- Dynamic dropdown generation
- Data mapping preview modal
- Workflow execution progress display

---

## Services

### 1. DataService (`modules/services/data_service.js`)

**Purpose**: Handle all data interactions with Domo APIs and AppDB.

**Key Methods**:

#### Dataset Operations
- `getDatasets()` - Fetch list of available Domo datasets
- `getDatasetColumns(datasetId)` - Fetch columns for a dataset
- `checkIfDatasetExists(datasetId)` - Validate dataset availability

#### AppDB Operations
- `saveMapping(payload)` - Save user mappings to Domo AppDB collection
- `updateDocument(documentId, updates)` - Update existing document
- `getDocumentById(documentId)` - Retrieve saved configuration
- `searchDocuments(query)` - Search AppDB documents

#### Insights Data
- `getExecutionSummary(documentId)` - Fetch MMM results by document ID
- `fetchInsightsData(documentId)` - Retrieve all insights-related datasets

**Data Flow**:
```
User Input → AppState → DataService → Domo API/AppDB → Response → AppState
```

---

### 2. WorkflowService (`modules/services/workflow_service.js`)

**Purpose**: Manage Code Engine workflow execution and status polling.

**Key Methods**:

#### Workflow Execution
- `launchMMMWorkflow(documentId)` - Start remote MMM workflow
  - Builds workflow payload
  - Calls Code Engine API
  - Returns execution ID

#### Status Polling
- `pollMMMWorkflow(executionId, onProgress, onComplete, onError)`
  - Polls every 5 seconds
  - Updates UI with current phase
  - Handles completion/failure

- `getMMMWorkflowExecutionStatus(executionId)` - Get current workflow status

**Workflow Phases** (mapped to UI steps):
1. DATA_VALIDATION
2. FEATURE_ENGINEERING
3. BAYESIAN_MODEL_SETUP
4. MCMC_SAMPLING
5. POSTERIOR_ANALYSIS
6. GENERATING_INSIGHTS

**Status Codes**:
- `RUNNING` / `IN_PROGRESS` - Workflow executing
- `COMPLETED` - Success
- `FAILED` / `CANCELED` / `TIMEOUT` / `ERROR` - Failure states

---

### 3. ValidationService (`modules/services/validation_service.js`)

**Purpose**: Validate user inputs before saving or executing workflows.

**Key Methods**:

- `validateStep2()` - Validate field mappings
  - Check revenue dataset selected
  - Check revenue amount field
  - Check date field
  - Validate date range (8-208 weeks)
  - Ensure minimum 2 channels mapped
  - Check for duplicate column mappings

- `validateDateRange(startDate, endDate)` - Validate date selection
  - Ensure start < end
  - Check minimum 8 weeks
  - Check maximum 208 weeks (~4 years)

- `validateChannelMappings(channelMappings)` - Ensure minimum channels

**Validation Rules** (from `constants.js`):
- Minimum 2 marketing channels
- Minimum 8 weeks of data
- Maximum 208 weeks (4 years)
- No duplicate column mappings
- Required: revenue dataset, revenue amount, date field

---

### 4. AIService (`modules/services/ai_service.js`)

**Purpose**: Generate AI-powered insights using OpenAI API.

**Key Methods**:

- `generateInsights(mmmData)` - Generate AI analysis
  - Sends MMM results to OpenAI
  - Returns formatted markdown insights

- `buildPrompt(mmmData)` - Construct GPT prompt
  - Includes metrics (R², MAPE, incremental revenue)
  - Includes channel performance data
  - Requests actionable recommendations

**Prompt Structure**:
```
You are a marketing analytics expert analyzing MMM results.

Data provided:
- Model R²: X
- MAPE: Y%
- Total Incremental: $Z
- Channels: [...]

Please provide:
1. Executive Summary
2. Key Findings
3. Channel-Specific Insights
4. Actionable Recommendations
```

---

## Components

### Insights Dashboard (`modules/insights/`)

#### InsightsManager.js
**Purpose**: Orchestrate the entire insights dashboard.

**Key Responsibilities**:
- Load and process MMM results data
- Initialize tab navigation
- Render metric cards
- Coordinate chart rendering
- Handle AI insights generation
- Manage PNG export functionality

**Key Methods**:
- `initialize(documentId)` - Load data and render dashboard
- `loadData(documentId)` - Fetch all insights datasets
- `renderDashboard(data)` - Render full dashboard
- `handleShowAIInsights()` - Trigger AI insights generation
- `handleExportToPNG()` - Export dashboard to PNG

---

#### Components (modules/insights/components/)

##### ChartRenderer.js
**Purpose**: Render D3.js and Chart.js visualizations.

**Charts**:
- **Channel Performance Cards** - iROAS, incremental revenue, confidence
- **iROAS Bar Chart** - Horizontal bar chart comparing channel iROAS
- **Waterfall Chart** - Revenue decomposition (base + channels)
- **Contribution Stacked Area Chart** - Weekly channel contribution over time

**Key Methods**:
- `renderChannelCards(channels)` - Render performance cards
- `renderIROASChart(data, canvasId)` - Bar chart
- `renderWaterfallChart(data, containerId)` - D3 waterfall
- `renderContributionChart(data, containerId)` - D3 stacked area

##### StatisticalMetricCards.js
**Purpose**: Render MMM quality metrics.

**Metrics Displayed**:
1. **Model R²** - Variance explained (0-1 scale)
   - Quality labels: Excellent (>0.90), Good (0.75-0.89), Fair (0.65-0.74), Poor (<0.65), Possibly Overfitted (>0.95)

2. **MAPE** (Mean Absolute Percentage Error)
   - Quality labels: Excellent (<12%), Good (13-25%), Fair (26-39%), Poor (>40%)

3. **Total Incremental Revenue**
   - Formatted as $XM or $XK
   - Shows baseline comparison if available
   - Warning badge if negative intercept detected

**Key Methods**:
- `render(metrics)` - Render all three cards
- `renderR2Card(r2Value)` - R² card with quality badge
- `renderMAPECard(mapeValue)` - MAPE card
- `renderIncrementalCard(value, baseline, hasNegativeIntercept)` - Incremental revenue card

##### MetricCardsComponent.js
**Purpose**: Render high-level summary metrics at top of dashboard.

**Metrics**:
- Incremental Revenue
- Model R²
- Top Channel
- Channels Analyzed

##### TabContentRenderer.js
**Purpose**: Render content for each dashboard tab.

**Tabs**:
1. **Channel Performance** - Performance view + Contribution view
2. **Statistical Analysis** - Metrics, AI Insights, Multicollinearity, Channel Contribution
3. **Budget Optimizer** - Budget allocation recommendations

**Key Methods**:
- `renderChannelPerformance(data)` - Channel tab
- `renderStatisticalAnalysis(data)` - Statistical tab with sub-sections
- `renderBudgetOptimizer(data)` - Budget tab

##### BudgetOptimizerComponent.js
**Purpose**: Render budget optimization results and recommendations.

**Features**:
- Current vs Recommended allocation comparison
- Expected revenue increase
- Channel-specific recommendations
- Constraint input for re-optimization

##### VIFResultsComponent.js
**Purpose**: Display Variance Inflation Factor analysis.

**Features**:
- VIF scores for each variable
- Color-coded severity (green/yellow/red)
- Multicollinearity warnings

##### CorrelationMatrixComponent.js
**Purpose**: Render correlation matrix heatmap.

**Features**:
- D3-based heatmap visualization
- Color gradient for correlation strength
- Tooltip with exact correlation values

---

#### Data Processing (modules/insights/data/)

##### InsightsDataProcessor.js
**Purpose**: Transform raw API data into dashboard-ready format.

**Key Methods**:
- `processInsightsData(rawData)` - Main processing pipeline
- `processMetrics(metrics, waterfallData)` - Calculate baseline comparison
- `processChannelData(channels)` - Normalize channel performance
- `processContributionData(contribution)` - Transform for stacked area chart
- `processIROASData(channels)` - Prepare iROAS chart data
- `generateColors(count)` - Color palette for charts

**Data Transformations**:
- Convert unpivoted to pivoted format for contribution chart
- Calculate baseline percentage from waterfall intercept
- Normalize channel performance scores
- Format currency values ($M, $K)

---

## Data Flow

### 1. Application Initialization

```
1. User opens app
2. app.js → DOMContentLoaded
3. Initialize services (DataService, WorkflowService, etc.)
4. Initialize AppState
5. Initialize UIManager
6. Initialize StepController
7. StepController.initialize()
   - Check DEV_CONFIG.SKIP_TO_EXECUTION
   - If false: goToStep(1) - Welcome screen
   - If true: Load saved state → goToStep(3) - Model Execution
8. Render initial UI
```

### 2. Field Mapping Flow (Step 2)

```
1. User selects revenue dataset
   → DataService.getDatasetColumns(datasetId)
   → UIManager populates column dropdowns

2. User maps fields (revenue amount, date, channels, controls)
   → AppState stores mappings
   → UIManager updates "X mapped" counter

3. User enters iROAS priors (optional)
   → AppState.iroasPriors updated

4. User clicks "Save Mapping & Continue"
   → StepController.saveMapping()
   → ValidationService.validateStep2()
   → If valid:
      - DataService.saveMapping(payload)
      - AppState.documentId = responseId
      - goToStep(3)
```

### 3. Workflow Execution Flow (Step 3)

```
1. User clicks "Run Stella MMM Analysis"
   → StepController.launchWorkflow()

2. WorkflowService.launchMMMWorkflow(documentId)
   → POST /domo/codeengine/v2/packages/startWorkflowInRemoteInstance
   → Response: { modelId, executionId }
   → AppState.modelId = executionId

3. StepController.startWorkflowPolling()
   → WorkflowService.pollMMMWorkflow(executionId, callbacks)

4. Every 5 seconds:
   → WorkflowService.getMMMWorkflowExecutionStatus(executionId)
   → If RUNNING: Update UI with current phase (1-6)
   → If COMPLETED: Execute onComplete callback
   → If FAILED: Execute onError callback

5. On completion:
   → StepController.handleWorkflowCompletion()
   → DataService.getExecutionSummary(documentId)
   → AppState.setMMMMetrics(metrics)
   → UIManager.completeWorkflowProgress()
   → goToStep(4)
```

### 4. Insights Dashboard Flow (Step 4)

```
1. User clicks "View Insights & Recommendations"
   → StepController.goToInsights()

2. InsightsManager.initialize(documentId)

3. InsightsManager.loadData(documentId)
   → DataService.fetchInsightsData(documentId)
   → Fetch datasets:
      - Execution Summary
      - Channel Performance
      - Waterfall Decomposition
      - Contribution Breakdown
      - VIF Results
      - Correlation Matrix
      - Budget Allocation

4. InsightsDataProcessor.processInsightsData(rawData)
   → Transform raw data for charts

5. InsightsManager.renderDashboard(processedData)
   → Render tabs
   → Render metric cards
   → Render charts

6. User clicks "Cortex Analysis"
   → AIService.generateInsights(mmmData)
   → POST to OpenAI API
   → Display formatted insights

7. User clicks "Export PNG"
   → InsightsManager.handleExportToPNG()
   → html2canvas captures dashboard
   → Download PNG file
```

---

## Configuration

### Development Configuration (`app.js`)

```javascript
const DEV_CONFIG = {
  SKIP_TO_EXECUTION: false,  // Skip to Step 3 for testing
  MOCK_DATA: false,           // Use mock data instead of API
  QUICK_WORKFLOW: false,      // Simulate fast workflow
  ENABLE_INSIGHTS_DEV: false, // Dev mode for insights
  DEV_DOCUMENT_ID: "..."      // Hardcoded document for testing
};
```

**Development Shortcuts** (when `SKIP_TO_EXECUTION: true`):
- Dev panel appears with buttons: Step 2, Step 3, Step 4, Quick Run
- `window.debugApp()` - Print current state
- `window.switchToProd()` - Disable dev mode
- `window.debugIROAS()` - Test iROAS rendering

---

### Domo Configuration

#### Collections (AppDB)
1. **MMM_VariablesAppDB** - Stores user mappings
   - Collection ID: `6f97b7f5-1772-4029-a715-f7577871186f`
   - Stores: Revenue dataset, channels, controls, dates, iROAS priors

2. **Stella_Parameters** - Stores parameter metadata
   - Collection ID: `f5f0dc69-f187-436e-af96-b6eafcfc4803`

3. **StellaBudgetOptimizer** - Stores budget optimizer params
   - Collection ID: `bab9aee1-f74a-4476-9d50-a0879c1b52d0`

#### Workflows
1. **MMM Analysis Workflow**
   - Workflow ID: `e7ecfdec-d7aa-4cde-9592-f2e39aa42b62`
   - Version: `1.0.11`
   - Domain: `stellaheystella.domo.com`

2. **Budget Optimizer Workflow**
   - Workflow ID: `6ae11ee9-2e69-4462-9768-40cc73bfd5d4`
   - Version: `1.0.0`

#### Datasets (Auto-mapped in manifest.json)
- `metricsSummary` - MMM execution summary
- `datasets` - List of available datasets
- `revenueColumnsDataset` - Dataset columns metadata

---

## Development Guide

### Prerequisites
- Domo instance access
- Domo Code Engine enabled
- Custom App development permissions

### Setup

1. **Clone/Upload to Domo Design Studio**
   ```
   Upload all files to Domo Custom App
   Configure manifest.json with your collection/workflow IDs
   ```

2. **Configure Constants**
   Edit `config/constants.js`:
   - Update `DOMO.COLLECTION_ID` with your AppDB collection
   - Update `WORKFLOW.WORKFLOW_ID` with your workflow ID
   - Update `WORKFLOW.DOMAIN` with your Domo instance

3. **Enable Dev Mode**
   In `app.js`:
   ```javascript
   const DEV_CONFIG = {
     SKIP_TO_EXECUTION: true,
     DEV_DOCUMENT_ID: "your-test-document-id"
   };
   ```

### Development Workflow

1. **Local Development**
   - Use browser dev tools
   - Enable console logging (`DEBUG_CONFIG.ENABLE_CONSOLE_LOGS: true`)
   - Use dev shortcuts (F12 console): `window.debugApp()`

2. **Testing Workflow**
   - Set `SKIP_TO_EXECUTION: true` to jump to Step 3
   - Use dev panel to navigate between steps
   - Test with fixed document ID

3. **Debugging**
   ```javascript
   // Available debug functions
   window.debugApp()          // Print app state
   window.debugIROAS()        // Test iROAS rendering
   window.simulateMappedChannels()  // Add mock channels
   ```

### Adding New Components

1. **Create Component File**
   ```javascript
   // modules/insights/components/MyComponent.js
   export class MyComponent {
     render(data) {
       return `<div>...</div>`;
     }
   }
   ```

2. **Import in InsightsManager**
   ```javascript
   import { MyComponent } from './components/MyComponent.js';

   this.myComponent = new MyComponent();
   ```

3. **Use in Render**
   ```javascript
   ${this.myComponent.render(data)}
   ```

### Color Scheme (Domo Blue)

Primary brand color: `#99ccee`

Usage:
- Buttons: `style="background-color: #99ccee;"`
- Icons: `stroke="#99ccee"`
- Progress bars, accents, highlights

---

## API Integration

### Domo Public API

#### Get Datasets
```
GET /data/v1/datasets
Returns: [{ id, name }, ...]
```

#### Get Dataset Columns
```
GET /data/v1/revenueColumnsDataset?dataSetId={id}
Returns: [{ ColumnName, ColumnType }, ...]
```

### Domo Code Engine API

#### Start Workflow
```
POST /domo/codeengine/v2/packages/startWorkflowInRemoteInstance
Body: {
  domoAccessToken: { id, type, subType },
  domain: "instance.domo.com",
  workflowId: "...",
  workflowVersion: "1.0.11",
  startObject: { document_id: "..." }
}
Returns: { result: { modelId, id, status, ... } }
```

#### Get Workflow Status
```
POST /domo/codeengine/v2/packages/getWorkflowExecution
Body: {
  domoAccessToken: { ... },
  domain: "...",
  executionId: "..."
}
Returns: { result: { status: "RUNNING" | "COMPLETED" | "FAILED" } }
```

### Domo AppDB API

#### Save Document
```
POST /domo/datastores/v2/collections/{collectionName}/documents
Body: { RevenueDatasetId, SelectedChannel, ... }
Returns: { id: "document-id" }
```

#### Update Document
```
PUT /domo/datastores/v2/collections/{collectionName}/documents/{id}
Body: { field: value }
```

#### Search Documents
```
GET /domo/datastores/v2/collections/{collectionName}/documents/query
Body: { query: { field: value } }
Returns: [{ id, content: {...} }]
```

---

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**
   - Insights dashboard only loads when navigating to Step 4
   - Charts render on-demand per tab

2. **Polling Efficiency**
   - Workflow polling: 5-second intervals (max 120 polls = 10 minutes)
   - Progress updates only when phase changes

3. **Chart Rendering**
   - D3 charts use virtual DOM for efficiency
   - Canvas-based charts for large datasets

4. **PNG Export Optimization**
   - html2canvas scale: 2 (high quality)
   - Hide unnecessary elements (buttons) during capture
   - Manual text truncation to prevent clipping

---

## Troubleshooting

### Common Issues

1. **Workflow fails to start**
   - Check workflow ID and version in `constants.js`
   - Verify Code Engine account permissions
   - Check document ID exists in AppDB

2. **Charts not rendering**
   - Verify D3.js loaded: `window.d3`
   - Check browser console for errors
   - Ensure data format matches expected structure

3. **PNG export issues**
   - Check html2canvas loaded
   - Ensure dashboard fully rendered before export
   - Large dashboards may take time to capture

4. **AI Insights not generating**
   - Verify OpenAI API key configured
   - Check network for blocked requests
   - Review prompt data structure

---

## License & Credits

**Project**: Stella MMM
**Version**: 1.0.2
**Platform**: Domo Custom App
**Framework**: Vanilla JavaScript, Tailwind CSS
**Charts**: D3.js, Chart.js
**AI**: OpenAI GPT

---

## Changelog

### v1.0.2 (Current)
- Added PNG export functionality
- Updated UI to Domo blue (#99ccee)
- Fixed negative value formatting in waterfall chart
- Improved metric card truncation handling
- AI Insights section styling updates

### v1.0.1
- Real workflow polling implementation
- Budget optimizer integration
- VIF and correlation matrix components

### v1.0.0
- Initial release
- 4-step wizard
- MMM workflow integration
- Insights dashboard with multiple tabs
