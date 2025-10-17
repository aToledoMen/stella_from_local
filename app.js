// app.js - Archivo principal modular Test
import { AppState } from './modules/state/app_state.js';
import { UIManager } from './modules/ui/ui_manager.js';
import { DataService } from './modules/services/data_service.js';
import { WorkflowService } from './modules/services/workflow_service.js';
import { ValidationService } from './modules/services/validation_service.js';
import { StepController } from './modules/controllers/step_controller.js';

// 🔧 CONFIGURACIÓN DE DESARROLLO
const DEV_CONFIG = {
  SKIP_TO_EXECUTION: false, // ← CHANGE to false FOR PRODUCTION
  MOCK_DATA: false,
  QUICK_WORKFLOW: false,
  ENABLE_INSIGHTS_DEV: false,         
  DEV_DOCUMENT_ID: "f7fbeb61-5ec5-4dec-b62b-d6f5e6bba252"  
};

document.addEventListener("DOMContentLoaded", async () => {
  try {

     if (DEV_CONFIG.SKIP_TO_EXECUTION) {
      console.log("🔧 DEVELOPMENT MODE ENABLED - Starting at Model Execution");
      console.log("To disable: Change DEV_CONFIG.SKIP_TO_EXECUTION to false");
     }
    // Inicializar servicios
    const appState = new AppState();
    const dataService = new DataService();
    const workflowService = new WorkflowService();
    const validationService = new ValidationService();
    const uiManager = new UIManager(appState);
    
    // Inicializar controlador principal
    const stepController = new StepController({
      appState,
      uiManager,
      dataService,
      workflowService,
      validationService,
      devConfig: DEV_CONFIG 
    });

    // HACER DISPONIBLES PARA DEBUG
    window.appState = appState;
    window.uiManager = uiManager;
    window.stepController = stepController;
    window.DEV_CONFIG = DEV_CONFIG; // ← AGREGAR ESTA LÍNEA

    // Configurar event listeners globales
    setupGlobalEventListeners(stepController, uiManager, appState);

    // Inicializar la aplicación
    await stepController.initialize();
    
    console.log("Application initialized successfully");

  // AGREGAR ESTAS LÍNEAS AL FINAL:
    if (DEV_CONFIG.SKIP_TO_EXECUTION) {
      console.log("🔧 DEV MODE: Ready at Model Execution screen");
      console.log("AppState channels:", appState.getMappedChannelsCount());
    }
    
  } catch (error) {
    console.error('Error initializing application:', error);
    showErrorMessage('Failed to initialize application. Please refresh and try again.');
  }
});

function setupGlobalEventListeners(stepController, uiManager, appState) {
  // Botón de inicio
  document.getElementById("start-btn")?.addEventListener("click", () => {
    stepController.goToStep(2);
  });

  // Botón guardar mapeo
  document.getElementById("save-mapping")?.addEventListener("click", async () => {
    await stepController.saveMapping();
  });

  // Botón lanzar MMM
  document.getElementById("launch-mmm")?.addEventListener("click", async () => {
    await stepController.launchWorkflow();
  });

// 🆕 Botón preview configuration en Step 3 (reutiliza el mismo del Step 2)
document.getElementById("preview-config-btn")?.addEventListener("click", () => {
  // ✅ MODIFICADO: Pasar el step actual (3)
  uiManager.showDataMappingPreview(3);
});
  // Botón agregar canal
  document.getElementById("add-channel-btn")?.addEventListener("click", () => {
    stepController.addChannelRow();
  });

  // Botón agregar variable personalizada
  document.getElementById("add-custom-var-btn")?.addEventListener("click", () => {
    stepController.addCustomVariable();
  });

  // Botón enviar insights

document.getElementById("view-insights")?.addEventListener("click", async () => {
  console.log("🎯 View Insights button clicked");
  await stepController.goToInsights();
});
  if (DEV_CONFIG.SKIP_TO_EXECUTION) {
    setupDevelopmentControls(stepController);
  }
}


// 🔧 NUEVO: Configurar controles de desarrollo
function setupDevelopmentControls(stepController) {
  // Crear panel de desarrollo
  const devPanel = document.createElement('div');
  devPanel.id = 'dev-panel';
  devPanel.className = 'fixed top-4 left-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3 shadow-lg z-50';
  devPanel.innerHTML = `
    <div class="text-xs font-bold text-yellow-800 mb-2">🔧 DEV MODE</div>
    <div class="flex gap-2 text-xs">
      <button id="dev-goto-step2" class="bg-blue-500 text-white px-2 py-1 rounded">Step 2</button>
      <button id="dev-goto-step3" class="bg-green-500 text-white px-2 py-1 rounded">Step 3</button>
      <button id="dev-goto-step4" class="bg-purple-500 text-white px-2 py-1 rounded">Step 4</button>
      <button id="dev-quick-workflow" class="bg-orange-500 text-white px-2 py-1 rounded">Quick Run</button>
    </div>
  `;
  
  document.body.appendChild(devPanel);

  // Event listeners para controles de desarrollo
  document.getElementById('dev-goto-step2')?.addEventListener('click', () => {
    stepController.goToStep(2);
  });
  
  document.getElementById('dev-goto-step3')?.addEventListener('click', () => {
    stepController.goToStep(3);
  });
  
    // ← MODIFICAR SOLO ESTA PARTE
  document.getElementById('dev-goto-step4')?.addEventListener('click', async () => {
    console.log("🔧 DEV: Going to Step 4 with fixed document_id");
    await stepController.goToStep4WithFixedDocument();
  });
  
  document.getElementById('dev-quick-workflow')?.addEventListener('click', () => {
    stepController.launchWorkflow();
  });

  console.log("🔧 Development controls added");
}

// 🔧 FUNCIONES DE DEBUG MEJORADAS
window.debugApp = function() {
  console.log("=== APP DEBUG INFO ===");
  console.log("DEV_CONFIG:", window.DEV_CONFIG);
  console.log("Current Step:", window.appState?.getCurrentStep());
  console.log("Mapped Channels:", window.appState?.getMappedChannelsCount());
  console.log("Document ID:", window.appState?.documentId);
  console.log("Revenue Field:", window.appState?.revenueAmountField);
  console.log("Date Field:", window.appState?.dateField);
  console.log("====================");
};

window.switchToProd = function() {
  console.log("🔄 Switching to production mode...");
  window.DEV_CONFIG.SKIP_TO_EXECUTION = false;
  const devPanel = document.getElementById('dev-panel');
  if (devPanel) devPanel.remove();
  location.reload();
};

function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// DEBUGGING MEJORADO
window.debugIROAS = function() {
  console.log("=== iROAS Debug ===");
  console.log("AppState exists:", !!window.appState);
  console.log("UIManager exists:", !!window.uiManager);
  
  if (window.appState) {
    console.log("Channel mappings:", window.appState.channelMappings);
    console.log("Mapped count:", window.appState.getMappedChannelsCount());
    
    // Test the method directly
    if (window.uiManager && window.uiManager.renderIROASPriorsSection) {
      console.log("Calling renderIROASPriorsSection...");
      window.uiManager.renderIROASPriorsSection();
    } else {
      console.error("UIManager or renderIROASPriorsSection method not found");
    }
  }
};

window.testIROAS = function() {
  const container = document.getElementById("iroas-priors-container");
  console.log("Container exists:", !!container);
  
  if (container) {
    container.classList.remove("hidden");
    container.innerHTML = "<p>TEST - iROAS section is working!</p>";
  }
};

// Test para simular channels mapeados
window.simulateMappedChannels = function() {
  if (window.appState) {
    window.appState.channelMappings[0].value = "Google Ads";
    window.appState.channelMappings[1].value = "Facebook Ads";
    console.log("Simulated 2 mapped channels");
    console.log("New mapped count:", window.appState.getMappedChannelsCount());
    
    if (window.uiManager) {
      window.uiManager.renderIROASPriorsSection();
    }
  }

// ===========================================
// DESARROLLO: ACCESOS DIRECTOS
// ===========================================
if (window.location.search.includes('debug=true')) {
  console.log("🔧 DEBUG MODE: Adding development shortcuts");
  
  // Funciones de desarrollo
  window.testInsights = async function() {
    if (window.stepController) {
      await window.stepController.goToInsights();
    }
  };
  
  window.debugState = function() {
    console.table({
      appState: !!window.appState,
      stepController: !!window.stepController,
      chartJS: !!window.Chart,
      hasMetrics: window.appState?.hasValidMetrics() || false
    });
  };
}
  
};