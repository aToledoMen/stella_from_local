// modules/services/WorkflowService.js

import { APP_CONFIG } from '../../config/constants.js';
export class WorkflowService {
  constructor() {
    this.workflowConfig = {
      account: APP_CONFIG.WORKFLOW.ACCOUNT,
      domain:APP_CONFIG.WORKFLOW.DOMAIN,
      workflowId:APP_CONFIG.WORKFLOW.WORKFLOW_ID,
      workflowVersion: APP_CONFIG.WORKFLOW.WORKFLOW_VERSION
    };

    this.mmmSteps = [
      "Data Validation",
      "Feature Engineering", 
      "Bayesian Model Setup",
      "MCMC Sampling",
      "Posterior Analysis",
      "Generating Insights"
    ];

    this.phaseMapping = {
      "DATA_VALIDATION": 0,
      "FEATURE_ENGINEERING": 1,
      "BAYESIAN_MODEL_SETUP": 2,
      "MCMC_SAMPLING": 3,
      "POSTERIOR_ANALYSIS": 4,
      "GENERATING_INSIGHTS": 5
    };

    this.stepPercentages = [10, 30, 50, 70, 85, 95];
  }

  /**
   * Lanza el workflow MMM usando Code Engine
   */
  async launchWorkflow(documentId, collectionId) {
   const payload = {
      documentID: documentId,
      base_url: APP_CONFIG.WORKFLOW.BASE_URL,
      variablesID:APP_CONFIG.DOMO.VARIABLES_ID,
      client_id: APP_CONFIG.WORKFLOW.CLIENT_ID,
      secret_id:APP_CONFIG.WORKFLOW.SECRET_ID,
      developerToken:APP_CONFIG.WORKFLOW.DEVELOPER_TOKEN,
      parametersCollection:APP_CONFIG.DOMO.STELLA_PARAMETERS_COLLECTION_ID,
    };

    const codeEngineParams = {
      account: this.workflowConfig.account,
      domain: this.workflowConfig.domain,
      workflowId: this.workflowConfig.workflowId,
      workflowVersion: this.workflowConfig.workflowVersion,
      startObject: payload
    };
console.log("Workflow codeEngineParams:", codeEngineParams);
    try {
      const response = await domo.post(
        `/domo/codeengine/v2/packages/startWorkflowInRemoteInstance`, 
        codeEngineParams
      );

      console.log("Workflow launch response:", response);
      
      const executionId = response?.result?.id;
      if (!executionId) {
        throw new Error("No execution ID returned from workflow");
      }

      console.log("Workflow execution started:", executionId);
      return executionId;
    } catch (error) {
      console.error("Error launching workflow:", error);
      throw new Error("Failed to launch workflow");
    }
  }


/**
 * Launch Budget Optimizer workflow using Code Engine
 * @param {string} documentId - MMM configuration document ID
 * @param {string} budgetOptimizerDocId - Budget optimizer parameters document ID
 * @returns {Promise<string>} Execution ID
 */
/**
 * Launch Budget Optimizer workflow using Code Engine
 * @param {string} documentId - MMM configuration document ID
 * @param {string} budgetOptimizerDocId - Budget optimizer parameters document ID
 * @returns {Promise<string>} Execution ID
 */
async launchBudgetOptimizerWorkflow(documentId, budgetOptimizerDocId) {
  console.log('🚀 Launching Budget Optimizer workflow...');
  console.log('  MMM Document ID:', documentId);
  console.log('  Budget Optimizer Doc ID:', budgetOptimizerDocId);
  
  // Get Budget Optimizer workflow configuration
  const budgetOptimizerWorkflowId = "6ae11ee9-2e69-4462-9768-40cc73bfd5d4";
  const budgetOptimizerWorkflowVersion = "1.0.0";
  
  console.log('🔍 Budget Optimizer Workflow ID:', budgetOptimizerWorkflowId);
  console.log('🔍 Budget Optimizer Workflow Version:', budgetOptimizerWorkflowVersion);
  
  const payload = {
    documentID: documentId,
    budgetSaveID: budgetOptimizerDocId,
    base_url: APP_CONFIG.WORKFLOW.BASE_URL,
    variablesID: APP_CONFIG.DOMO.VARIABLES_ID,
    client_id: APP_CONFIG.WORKFLOW.CLIENT_ID,
    secret_id: APP_CONFIG.WORKFLOW.SECRET_ID,
    developerToken: APP_CONFIG.WORKFLOW.DEVELOPER_TOKEN,
    parametersCollection: APP_CONFIG.DOMO.STELLA_PARAMETERS_COLLECTION_ID,
    budgetVariablesCollection:APP_CONFIG.DOMO.BUDGET_OPTIMIZER_COLLECTION_ID
  };


  const codeEngineParams = {
    account: this.workflowConfig.account,
    domain: this.workflowConfig.domain,
    workflowId: budgetOptimizerWorkflowId,
    workflowVersion: budgetOptimizerWorkflowVersion,
    startObject: payload
  };

  console.log('📋 Budget Optimizer workflow params:', codeEngineParams);

  try {
    const response = await domo.post(
      `/domo/codeengine/v2/packages/startWorkflowInRemoteInstance`,
      codeEngineParams
    );

    console.log('✅ Budget Optimizer workflow response:', response);

    const executionId = response?.result?.id;
    if (!executionId) {
      throw new Error('No execution ID returned from Budget Optimizer workflow');
    }

    console.log('🎯 Budget Optimizer execution started:', executionId);
    return executionId;

  } catch (error) {
    console.error('❌ Error launching Budget Optimizer workflow:', error);
    throw new Error('Failed to launch Budget Optimizer workflow');
  }
}


/**
 * Get Budget Optimizer workflow execution status using Code Engine
 * @param {string} executionId - Workflow execution ID
 * @returns {Promise<Object>} Execution status object
 */
async getBudgetOptimizerExecutionStatus(executionId) {
  console.log('📡 Getting execution status for:', executionId);
  
  const codeEngineParams = {
    domoAccessToken: {
      id: "608",  // Same as in manifest
      type: "ACCOUNT",
      subType: "domo-access-token"
    },
    domain: this.workflowConfig.domain,
    executionId: executionId
  };

  console.log('📋 getWorkflowExecution params:', codeEngineParams);

  try {
    const response = await domo.post(
      `/domo/codeengine/v2/packages/getWorkflowExecution`,
      codeEngineParams
    );

    console.log('📊 Execution status response:', response);

    return {
      status: response?.result?.status || 'UNKNOWN',
      executionId: executionId,
      fullResponse: response
    };

  } catch (error) {
    console.error('❌ Error getting execution status:', error);
    throw error;
  }
}


  /**
   * Polling real del estado del workflow
   */
  pollWorkflowStatus(modelId, onProgress, onComplete, onError) {
    const pollingInterval = 3000; // 3 segundos
    const maxAttempts = 40;
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;
      
      try {
        const url = `/api/workflow/v1/instances/${modelId}/status`;
        const response = await domo.get(url);
        
        const status = (response?.status || "").toUpperCase();
        const phase = (response?.phase || response?.detail?.phase || "").toUpperCase();
        
        console.log(`Workflow status for ${modelId}:`, status, phase);

        // Actualizar progreso en UI
        if (onProgress) {
          const stepIndex = this.phaseMapping[phase] || 0;
          onProgress(stepIndex, phase, this.mmmSteps[stepIndex]);
        }

        if (status === "COMPLETED") {
          clearInterval(interval);
          onComplete(status);
          return;
        } 
        
        if (status !== "IN_PROGRESS") {
          clearInterval(interval);
          onError(status || "Unknown status");
          return;
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          onError("Timeout waiting for workflow to complete.");
        }

      } catch (err) {
        clearInterval(interval);
        onError(err);
      }
    }, pollingInterval);

    return interval; // Retornar para poder cancelar si es necesario
  }

 /**
 * Simulación del polling para desarrollo/testing - 7 minutos total
 */
simulateWorkflowPolling(onProgress, onComplete, onError) {
  const phases = [
    "DATA_VALIDATION",
    "FEATURE_ENGINEERING", 
    "BAYESIAN_MODEL_SETUP",
    "MCMC_SAMPLING",
    "POSTERIOR_ANALYSIS",
    "GENERATING_INSIGHTS"
  ];

  // Distribución de tiempo: 7 minutos total (195 segundos)
  const phaseDurations = [
    15,  // DATA_VALIDATION - 30 segundos
    60,  // FEATURE_ENGINEERING - 45 segundos  
    60,  // BAYESIAN_MODEL_SETUP - 60 segundos
    60, // MCMC_SAMPLING - 3 minutos (la más larga)
    60,  // POSTERIOR_ANALYSIS - 75 segundos
    100   // GENERATING_INSIGHTS - 30 segundos
  ];

  let currentStep = 0;
  let timeouts = [];

  const executePhase = (stepIndex) => {
    if (stepIndex >= phases.length) {
      if (onComplete) {
        onComplete("COMPLETED");
      }
      console.log("Simulated workflow completed.");
      return;
    }

    const phase = phases[stepIndex];
    const index = this.phaseMapping[phase];
    
    if (onProgress) {
      onProgress(index, phase, this.mmmSteps[index]);
    }
    
    console.log(`Simulated phase: ${phase} - Duration: ${phaseDurations[stepIndex]}s`);
    
    // Programar el siguiente paso
    const timeout = setTimeout(() => {
      executePhase(stepIndex + 1);
    }, phaseDurations[stepIndex] * 1000);
    
    timeouts.push(timeout);
  };

  // Iniciar la primera fase
  executePhase(0);

  // Retornar función para cancelar todos los timeouts
  return () => {
    timeouts.forEach(timeout => clearTimeout(timeout));
    timeouts = [];
  };
}

  /**
   * Polling del estado de ejecución de Code Engine
   */
  pollExecutionStatus(executionId, onProgress, onComplete, onError) {
    const interval = setInterval(async () => {
      try {
        const status = await domo.get(`/domo/codeengine/v2/executions/${executionId}`);
        const currentStatus = status?.status?.toLowerCase();

        if (onProgress) {
          onProgress(currentStatus?.replaceAll("_", " ").toUpperCase());
        }

        if (currentStatus === "completed") {
          clearInterval(interval);
          onComplete();
        }

        if (["failed", "canceled", "timeout"].includes(currentStatus)) {
          clearInterval(interval);
          onError(`Workflow ${currentStatus}`);
        }
      } catch (err) {
        console.error("Error polling execution status:", err);
        clearInterval(interval);
        onError("Error polling status");
      }
    }, 5000);

    return interval;
  }

  /**
   * Obtiene el estado actual de un workflow
   */
  async getWorkflowStatus(modelId) {
    try {
      const url = `/api/workflow/v1/instances/${modelId}/status`;
      const response = await domo.get(url);
      
      return {
        status: (response?.status || "").toUpperCase(),
        phase: (response?.phase || response?.detail?.phase || "").toUpperCase()
      };
    } catch (error) {
      console.error("Error getting workflow status:", error);
      throw new Error("Failed to get workflow status");
    }
  }

  /**
   * Cancela un workflow en ejecución
   */
  async cancelWorkflow(modelId) {
    try {
      const url = `/api/workflow/v1/instances/${modelId}/cancel`;
      const response = await domo.post(url);
      console.log("Workflow cancelled:", response);
      return response;
    } catch (error) {
      console.error("Error cancelling workflow:", error);
      throw new Error("Failed to cancel workflow");
    }
  }






}