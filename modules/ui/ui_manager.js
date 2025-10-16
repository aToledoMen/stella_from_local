// modules/ui/UIManager.js
export class UIManager {
  constructor(appState) {
  this.appState = appState;
  this.steps = ['Welcome', 'Field Mapping', 'Model Run', 'Insights', 'Settings'];
  
  // AGREGAR ESTAS LÍNEAS:
  this.workflowStartTime = null;
  this.timerInterval = null;
  this.currentWorkflowStep = -1;
}


  
/**
 * Inicia el contador de tiempo del workflow
 */
startWorkflowTimer() {
  this.workflowStartTime = Date.now();
  
  // Limpiar timer anterior si existe
  if (this.timerInterval) {
    clearInterval(this.timerInterval);
  }
  
  this.timerInterval = setInterval(() => {
    const elapsedTime = document.getElementById("elapsed-time");
    if (elapsedTime && this.workflowStartTime) {
      const elapsed = Math.floor((Date.now() - this.workflowStartTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      elapsedTime.textContent = `Elapsed: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }, 1000);
}

/**
 * Detiene el contador de tiempo del workflow
 */
stopWorkflowTimer() {
  if (this.timerInterval) {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }
}

/**
 * Inyecta los estilos CSS necesarios para los step cards
 */
injectStepCardStyles() {
  const styleId = 'step-card-styles';
  
  // Verificar si ya existen los estilos
  if (document.getElementById(styleId)) {
    return;
  }

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .step-card {
      transition: all 0.3s ease;
    }
    
    .step-completed {
      background-color: #f0f9ff !important;
      border-color: #10b981 !important;
    }
    
    .step-active {
      background-color: #eff6ff !important;
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
    }
    
    .step-pending {
      background-color: #f9fafb !important;
      border-color: #e5e7eb !important;
    }
  `;
  
  document.head.appendChild(style);
}

showStep(stepNum) {
  console.log(`Showing step ${stepNum}`);

  // Hide all steps
  document.querySelectorAll(".step-section").forEach(el => {
    el.classList.add("hidden");
  });

  // Show specific step based on stepNum
  if (stepNum === 4) {
    const step3 = document.getElementById("step-3");
    const step4 = document.getElementById("step-4");
    const containerButton = document.getElementById("container-button");
    
    if (step3) step3.classList.remove("hidden");
    if (step4) step4.classList.remove("hidden");
    if (containerButton) containerButton.classList.add("hidden");
  } else {
    const currentStepEl = document.getElementById(`step-${stepNum}`);
    if (currentStepEl) {
      currentStepEl.classList.remove("hidden");
    }
  }

  this.appState.setCurrentStep(stepNum);
  
  // NUEVO: Mostrar/Ocultar stepper según el paso
  const stepTracker = document.getElementById("step-tracker");
  if (stepTracker) {
    if (stepNum === 1) {
      // Ocultar stepper en Step 1 (Welcome)
      stepTracker.classList.add("hidden");
      console.log("Stepper hidden (Step 1)");
    } else {
      // Mostrar stepper desde Step 2 en adelante
      stepTracker.classList.remove("hidden");
      this.updateStepIndicator();
      this.updateVisualProgress();
      console.log("Stepper shown and updated");
    }
  }
  
  console.log(`Step ${stepNum} shown`);
}


  /**
   * Actualiza el indicador visual de pasos
   */
  updateStepIndicator() {
  const indicator = document.getElementById("step-indicator");
  if (!indicator) return;

  indicator.innerHTML = "";
  
  this.steps.forEach((label, i) => {
    const stepNum = i + 1;
    const isCompleted = stepNum < this.appState.getCurrentStep();
    const isCurrent = stepNum === this.appState.getCurrentStep();

    let circleStyle = "";
    let textClass = "text-gray-400";

    if (isCompleted) {
      circleStyle = "background-color: #99ccee; color: white;";
      textClass = "text-gray-800";
    } else if (isCurrent) {
      circleStyle = "background-color: #99ccee; color: white;";
      textClass = "text-gray-800 font-semibold";
    } else {
      circleStyle = "background-color: #e5e7eb; color: #9ca3af;";
    }

    const div = document.createElement("div");
    div.className = `flex items-center gap-2 ${textClass}`;
    div.innerHTML = `
      <div class="rounded-full w-8 h-8 flex items-center justify-center font-bold" style="${circleStyle}">
        ${stepNum}
      </div>
      <span class="font-medium">${label}</span>
    `;
    indicator.appendChild(div);
  });
}

  /**
   * Actualiza la barra de progreso visual
   */
  updateVisualProgress() {
    const progress = document.getElementById("progress-bar-fill");
    const stepCircles = document.querySelectorAll(".step-circle");
    const stepLabels = document.querySelectorAll(".step-label");

    if (progress) {
      const percentage = ((this.appState.getCurrentStep() - 1) / (this.steps.length - 1)) * 100;
      progress.style.width = `${percentage}%`;
    }
      stepCircles.forEach((circle, index) => {
        const stepNum = index + 1;
        if (stepNum < this.appState.getCurrentStep()) {
          circle.classList.remove("bg-gray-300", "text-gray-600");
          circle.style.backgroundColor = "#99ccee";
          circle.classList.add("text-white");
        } else if (stepNum === this.appState.getCurrentStep()) {
          circle.classList.remove("bg-gray-300", "text-gray-600");
          circle.style.backgroundColor = "#99ccee";
          circle.classList.add("text-white");
        } else {
          circle.style.backgroundColor = "";
          circle.classList.remove("text-white");
          circle.classList.add("bg-gray-300", "text-gray-600");
        }
      });

    stepLabels.forEach((label, index) => {
      const stepNum = index + 1;
      if (stepNum <= this.appState.getCurrentStep()) {
        label.classList.remove("text-gray-500");
        label.classList.add("text-black");
      } else {
        label.classList.remove("text-black");
        label.classList.add("text-gray-500");
      }
    });
  }

/**
 * Renderiza todos los dropdowns con mejor gestión de estado
 */
renderAllDropdowns(columnOptions) {
  // Verificar que tenemos datos válidos
  if (!Array.isArray(columnOptions)) {
    console.warn("Invalid column options provided to renderAllDropdowns");
    return;
  }

  console.log("Rendering dropdowns with columns:", columnOptions);
  
  // Renderizar cada componente individualmente
  this.renderRevenueDropdown(columnOptions);
  this.renderChannelDropdowns(columnOptions);
  this.renderControlDropdowns(columnOptions);
  
  // Date field al final para evitar conflictos
  this.renderDateFieldDropdown(columnOptions);
}

  /**
   * Renderiza el dropdown de Revenue Amount
   */
  /**
 * Renderiza el dropdown de Revenue Amount CON VALIDACIÓN DE TIPO
 */
/**
 * Renderiza el dropdown de Revenue Amount CON VALIDACIÓN DE TIPO
 */
renderRevenueDropdown(columnOptions) {
  const revenueSelect = document.getElementById("revenue-amount-select");
  if (!revenueSelect) {
    console.warn("⚠️ Revenue select element not found");
    return;
  }

  const usedColumns = this.appState.getUsedColumns();
  
  revenueSelect.innerHTML = `<option value="">No mapping</option>`;
  
  // Obtener el datasetId actual
  const datasetSelect = document.getElementById("revenue-select");
  const currentDatasetId = datasetSelect?.value;
  
  console.log("📊 Rendering revenue dropdown for dataset:", currentDatasetId);
  
  columnOptions.forEach(col => {
    if (!usedColumns.has(col) || col === this.appState.revenueAmountField) {
      const opt = document.createElement("option");
      opt.value = col;
      opt.textContent = col;
      
      // NUEVO: Agregar atributo de tipo
      if (currentDatasetId) {
        const columnType = this.appState.getColumnType(currentDatasetId, col);
        opt.setAttribute('data-type', columnType || 'UNKNOWN');
      }
      
      revenueSelect.appendChild(opt);
    }
  });
  
  revenueSelect.value = this.appState.revenueAmountField;

  // NUEVO: Event listener con validación
  revenueSelect.onchange = (e) => {
    const selectedColumn = e.target.value;
    
    console.log("💰 Revenue column selected:", selectedColumn);
    
    // Si no hay selección, resetear
    if (!selectedColumn) {
      this.appState.revenueAmountField = "";
      this.renderAllDropdowns(columnOptions);
      return;
    }

    // VALIDACIÓN DE TIPO
    if (currentDatasetId) {
      const isValid = this.appState.isNumericColumn(currentDatasetId, selectedColumn);
      const columnType = this.appState.getColumnType(currentDatasetId, selectedColumn);

      if (!isValid) {
        console.error(`❌ Invalid column type for revenue: ${columnType}`);
        
        // Mostrar error
        this.showToast(
          `⚠️ Invalid column type: "${selectedColumn}" is ${columnType}. Revenue Amount must be numeric (DECIMAL, LONG, or DOUBLE).`,
          "error"
        );
        
        // Resetear selección
        e.target.value = "";
        this.appState.revenueAmountField = "";
        return;
      }

      console.log(`✅ Valid revenue column: ${selectedColumn} (${columnType})`);
    }

    // Actualizar estado y re-renderizar
    this.appState.revenueAmountField = selectedColumn;
    this.renderAllDropdowns(columnOptions);
  };
}

  /**
   * Renderiza los dropdowns de canales
   */
  /**
 * Renderiza los dropdowns de canales y actualiza la sección iROAS
 */
/**
 * Renderiza los dropdowns de canales CON VALIDACIÓN DE TIPO
 */
renderChannelDropdowns(columnOptions) {
  const container = document.getElementById("channel-selects");
  if (!container) return;

  const usedColumns = this.appState.getUsedColumns();
  container.innerHTML = "";

  // Obtener el datasetId actual
  const datasetSelect = document.getElementById("revenue-select");
  const currentDatasetId = datasetSelect?.value;

  console.log("📊 Rendering channel dropdowns for dataset:", currentDatasetId);

  this.appState.channelMappings.forEach((mapping, index) => {
    const wrapper = document.createElement("div");
    const select = document.createElement("select");
    
    select.className = "w-full border rounded px-3 py-2 text-sm";
    select.innerHTML = `<option value="">No mapping</option>`;

    const currentValue = mapping.value;

    columnOptions.forEach(opt => {
      if (!usedColumns.has(opt) || opt === currentValue) {
        const optionEl = document.createElement("option");
        optionEl.value = opt;
        optionEl.textContent = opt;
        
        // NUEVO: Agregar atributo de tipo
        if (currentDatasetId) {
          const columnType = this.appState.getColumnType(currentDatasetId, opt);
          optionEl.setAttribute('data-type', columnType || 'UNKNOWN');
        }
        
        select.appendChild(optionEl);
      }
    });

    select.value = currentValue;

    // NUEVO: Event listener con validación
    select.addEventListener("change", (e) => {
      const selectedColumn = e.target.value;
      
      console.log(`📊 Channel ${index + 1} selected:`, selectedColumn);
      
      // Si no hay selección, solo actualizar
      if (!selectedColumn) {
        this.appState.updateChannelMapping(index, selectedColumn);
        this.renderAllDropdowns(columnOptions);
        this.updateMappedCount();
        return;
      }

      // VALIDACIÓN DE TIPO
      if (currentDatasetId) {
        const isValid = this.appState.isNumericColumn(currentDatasetId, selectedColumn);
        const columnType = this.appState.getColumnType(currentDatasetId, selectedColumn);

        if (!isValid) {
          console.error(`❌ Invalid column type for channel: ${columnType}`);
          
          // Mostrar error
          this.showToast(
            `⚠️ Invalid column type: "${selectedColumn}" is ${columnType}. Marketing Channels must be numeric (DECIMAL, LONG, or DOUBLE).`,
            "error"
          );
          
          // Resetear selección
          e.target.value = "";
          this.appState.updateChannelMapping(index, "");
          return;
        }

        console.log(`✅ Valid channel: ${selectedColumn} (${columnType})`);
      }

      // Actualizar estado y re-renderizar
      this.appState.updateChannelMapping(index, selectedColumn);
      this.renderAllDropdowns(columnOptions);
      this.updateMappedCount(); // Esto también actualiza iROAS
    });

    wrapper.innerHTML = `<label class="block text-sm font-medium mb-1">${mapping.label}</label>`;
    wrapper.appendChild(select);
    container.appendChild(wrapper);
  });

  this.updateMappedCount(); // Actualiza tanto el contador como iROAS
}

  /**
   * Renderiza los dropdowns de variables de control
   */
 /**
 * Renderiza los dropdowns de variables de control CON VALIDACIÓN DE TIPO
 */
renderControlDropdowns(columnOptions) {
  const container = document.getElementById("control-variables-selects");
  if (!container) return;

  const usedColumns = this.appState.getUsedColumns();
  container.innerHTML = "";

  // Obtener el datasetId actual
  const datasetSelect = document.getElementById("revenue-select");
  const currentDatasetId = datasetSelect?.value;

  console.log("🎛️ Rendering control dropdowns for dataset:", currentDatasetId);

  this.appState.controlMappings.forEach((mapping, index) => {
    const wrapper = document.createElement("div");
    const select = document.createElement("select");
    
    select.className = "w-full border rounded px-3 py-2 text-sm";
    select.innerHTML = `<option value="">No mapping</option>`;

    const currentValue = mapping.value;

    columnOptions.forEach(opt => {
      if (!usedColumns.has(opt) || opt === currentValue) {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        
        // NUEVO: Agregar atributo de tipo
        if (currentDatasetId) {
          const columnType = this.appState.getColumnType(currentDatasetId, opt);
          option.setAttribute('data-type', columnType || 'UNKNOWN');
        }
        
        select.appendChild(option);
      }
    });

    select.value = currentValue;

    // NUEVO: Event listener con validación
    select.addEventListener("change", (e) => {
      const selectedColumn = e.target.value;
      
      console.log(`🎛️ Control Variable ${index + 1} selected:`, selectedColumn);
      
      // Si no hay selección, solo actualizar
      if (!selectedColumn) {
        this.appState.updateControlMapping(index, selectedColumn);
        this.renderAllDropdowns(columnOptions);
        this.updateControlMappedCount();
        return;
      }

      // VALIDACIÓN DE TIPO
      if (currentDatasetId) {
        const isValid = this.appState.isNumericColumn(currentDatasetId, selectedColumn);
        const columnType = this.appState.getColumnType(currentDatasetId, selectedColumn);

        if (!isValid) {
          console.error(`❌ Invalid column type for control variable: ${columnType}`);
          
          // Mostrar error
          this.showToast(
            `⚠️ Invalid column type: "${selectedColumn}" is ${columnType}. Control Variables must be numeric (DECIMAL, LONG, or DOUBLE).`,
            "error"
          );
          
          // Resetear selección
          e.target.value = "";
          this.appState.updateControlMapping(index, "");
          return;
        }

        console.log(`✅ Valid control variable: ${selectedColumn} (${columnType})`);
      }

      // Actualizar estado y re-renderizar
      this.appState.updateControlMapping(index, selectedColumn);
      this.renderAllDropdowns(columnOptions);
      this.updateControlMappedCount();
    });

    wrapper.innerHTML = `<label class="block text-sm font-medium mb-1">${mapping.label}</label>`;
    wrapper.appendChild(select);
    container.appendChild(wrapper);
  });

  this.updateControlMappedCount();
}



  /**
   * Construye el dropdown de datasets de revenue
   */
  buildRevenueDatasetDropdown() {
    const select = document.getElementById("revenue-select");
    if (!select) return;

    select.innerHTML = `<option value="">Choose your revenue data source</option>`;

    this.appState.getAvailableDatasets()
      .sort((a, b) => a.Name.localeCompare(b.Name))
      .forEach(({ Name, ID }) => {
        const option = document.createElement("option");
        option.value = ID;
        option.textContent = Name;
        select.appendChild(option);
      });
  }

  /**
   * Actualiza el contador de canales mapeados
   */
updateMappedCount() {
    console.log("UPDATE MAPPED COUNT LLAMADO"); // <-- AGREGAR ESTA LÍNEA

  const count = this.appState.getMappedChannelsCount();
  const display = document.getElementById("mapped-count");
  if (!display) return;

  if (count >= 2) {
    display.innerHTML = `<span class="flex items-center gap-1 text-blue-600">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
        stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      Ready
    </span>`;
  } else {
    display.textContent = `${count} mapped`;
  }

  // Actualizar sección de iROAS cuando cambian los channels
  this.renderIROASPriorsSection(); //
}

  /**
   * Actualiza el contador de controles mapeados
   */
  updateControlMappedCount() {
    const count = this.appState.getMappedControlsCount();
    const display = document.getElementById("control-mapped-count");
    if (!display) return;

    if (count >= 1) {
      display.innerHTML = `<span class="flex items-center gap-1 text-blue-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        ${count} mapped
      </span>`;
    } else {
      display.textContent = `0 mapped`;
    }
  }

  /**
 * Updates the summary display in Step 3 with current configuration
 */
  updateSummaryDisplay() {
    const revenueSelect = document.getElementById("revenue-select");
    const selectedOption = revenueSelect?.options[revenueSelect.selectedIndex];
    const summaryRevenue = document.getElementById("summary-revenue");
    if (summaryRevenue) {
      summaryRevenue.textContent = selectedOption?.textContent || "Not selected";
    }

    const channelCount = this.appState.getMappedChannelsCount();
    const summaryChannels = document.getElementById("summary-channels");
    if (summaryChannels) {
      summaryChannels.textContent = `${channelCount} channels mapped`;
    }

    const controlCount = this.appState.getMappedControlsCount();
    const summaryControls = document.getElementById("summary-controls");
    if (summaryControls) {
      summaryControls.textContent = `${controlCount} controls included`;
    }
    console.log("Summary display updated successfully");
  return true; 
  }

 /**
 * Renders the custom variables section with improved layout
 */
renderCustomVariablesSection() {
  console.log('Rendering Custom Variables Section');

  const container = document.getElementById("custom-vars-section");
  if (!container) return;

  container.innerHTML = "";

  const startInput = document.getElementById("start-date");
  const endInput = document.getElementById("end-date");

  const start = startInput ? new Date(startInput.value) : null;
  const end = endInput ? new Date(endInput.value) : null;
  
  if (!start || !end || isNaN(start) || isNaN(end)) {
    container.innerHTML = `
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p class="text-sm text-yellow-700">Please set a date range first to configure custom variables.</p>
      </div>
    `;
    return;
  }

  const weeks = Math.ceil((end - start) / (7 * 24 * 60 * 60 * 1000));

  if (!this.appState.customVars || this.appState.customVars.length === 0) {
    container.innerHTML = `
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div class="text-gray-400 mb-3">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </div>
        <p class="text-gray-500 text-sm">No custom variables defined yet</p>
        <p class="text-gray-400 text-xs mt-1">Add binary or numeric variables to capture additional factors</p>
      </div>
    `;
    return;
  }

  // Container header
  const header = document.createElement("div");
  header.className = "mb-6";
  header.innerHTML = `
    <h3 class="text-lg font-semibold text-gray-800 mb-2">Configure Custom Variables</h3>
    <p class="text-sm text-gray-600">Set values for each week in your analysis period (${weeks} weeks total)</p>
  `;
  container.appendChild(header);

  // Variables container
  const variablesContainer = document.createElement("div");
  variablesContainer.className = "space-y-4";

  this.appState.customVars.forEach((customVar, varIndex) => {
    const row = this.createCustomVariableRow(customVar, varIndex, weeks, start);
    variablesContainer.appendChild(row);
  });

  container.appendChild(variablesContainer);

  // Show the section
  container.classList.remove("hidden");
}
  /**
 * Creates a custom variable row with improved layout matching the design
 */
createCustomVariableRow(customVar, varIndex, weeks, startDate) {
  const row = document.createElement("div");
  row.className = "bg-white border border-gray-200 rounded-lg p-6 mb-4 shadow-sm relative";

  // Header with variable name and delete button
  const header = document.createElement("div");
  header.className = "flex items-center justify-between mb-4";
  
  const nameAndType = document.createElement("div");
  nameAndType.innerHTML = `
    <h4 class="text-lg font-semibold text-gray-800">${customVar.label}</h4>
    <p class="text-sm text-gray-500">${customVar.type === "numeric" ? "Numeric Variable" : "Binary Variable"}</p>
  `;

  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = `
    <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
    </svg>
  `;
  deleteBtn.className = "p-2 text-red-500 hover:bg-red-50 rounded-md transition";
  deleteBtn.addEventListener("click", () => {
    this.appState.removeCustomVariable(varIndex);
    this.renderCustomVariablesSection();
  });

  header.appendChild(nameAndType);
  header.appendChild(deleteBtn);
  row.appendChild(header);

  // Weekly inputs grid
  const grid = document.createElement("div");
  grid.className = "grid grid-cols-8 gap-3"; // 8 columns for better spacing

  for (let w = 0; w < weeks; w++) {
    const weekDate = new Date(startDate.getTime());
    weekDate.setDate(startDate.getDate() + w * 7);
    const formattedDate = weekDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });

    const col = document.createElement("div");
    col.className = "flex flex-col items-center";

    // Date label
    const label = document.createElement("div");
    label.className = "text-xs text-gray-600 mb-2 text-center font-medium";
    label.textContent = formattedDate;
    col.appendChild(label);

    // Input field
    if (customVar.type === "numeric") {
      const input = document.createElement("input");
      input.type = "number";
      input.value = customVar.values?.[w] ?? 0;
      input.className = "w-16 h-10 border border-gray-300 rounded-md px-2 py-1 text-sm text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none";
      input.addEventListener("input", (e) => {
        this.appState.updateCustomVariableValue(varIndex, w, parseFloat(e.target.value));
      });
      col.appendChild(input);

    } else if (customVar.type === "binary") {
      const checkboxContainer = document.createElement("div");
      checkboxContainer.className = "flex items-center justify-center w-16 h-10";
      
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = customVar.values?.[w] === 1;
      checkbox.className = "w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2";
      checkbox.addEventListener("change", (e) => {
        this.appState.updateCustomVariableValue(varIndex, w, e.target.checked ? 1 : 0);
      });
      
      checkboxContainer.appendChild(checkbox);
      col.appendChild(checkboxContainer);
    }

    grid.appendChild(col);
  }

  row.appendChild(grid);
  return row;
}

  /**
   * Muestra overlay de carga
   */
  showLoadingOverlay(message = "Processing...") {
    const overlay = document.getElementById("loading-overlay");
    const messageEl = document.getElementById("loading-message");
    if (overlay) overlay.classList.remove("hidden");
    if (messageEl) messageEl.innerText = message;
  }

  /**
   * Oculta overlay de carga
   */
  hideLoadingOverlay() {
    const overlay = document.getElementById("loading-overlay");
    if (overlay) overlay.classList.add("hidden");
  }

  /**
   * Muestra overlay de carga 2 (para workflow)
   */
  showLoadingOverlay2() {
    const overlay = document.getElementById("loading-overlay2");
    if (overlay) overlay.classList.remove("hidden");
  }

  /**
   * Oculta overlay de carga 2
   */
  hideLoadingOverlay2() {
    const overlay = document.getElementById("loading-overlay2");
    if (overlay) overlay.classList.add("hidden");
  }

 /**
 * Updates the workflow progress with the new grid-based design
 * 
 * @param {number} stepIndex - Current step index (0-5)
 * @param {string} phase - Current phase name
 * @param {string} stepLabel - Human readable step label
 */
/**
 * Updates the workflow progress with the new grid-based design
 * 
 * @param {number} stepIndex - Current step index (0-5)
 * @param {string} phase - Current phase name
 * @param {string} stepLabel - Human readable step label
 */
updateWorkflowProgress(stepIndex, phase, stepLabel) {
  // Iniciar timer en el primer paso si no está iniciado
  if (!this.workflowStartTime && stepIndex >= 0) {
    this.startWorkflowTimer();
  }

  // Update current step text
  const currentStepText = document.getElementById("current-step-text");
  if (currentStepText) {
    currentStepText.textContent = `Current Step: ${stepLabel || phase || "Processing..."}`;
  }

  // Update progress bar
  const progressBar = document.getElementById("main-progress-bar");
  if (progressBar) {
    const percentage = ((stepIndex + 1) / 6) * 100;
    progressBar.style.width = `${percentage}%`;
  }

  // Solo actualizar si realmente cambió de paso
  if (this.currentWorkflowStep !== stepIndex) {
    this.currentWorkflowStep = stepIndex;
    this.updateStepCards(stepIndex);
  }
  
  console.log(`Workflow progress updated: step ${stepIndex}, phase: ${phase}`);
}

/**
 * Updates the visual state of step cards in the grid
 * 
 * @param {number} currentStepIndex - Current active step (0-5)
 */
updateStepCards(currentStepIndex) {
  const stepCards = document.querySelectorAll('[data-step-index]');
  
  stepCards.forEach((card, index) => {
    const icon = card.querySelector('.step-icon');
    
    card.style.transition = 'all 0.3s ease';
    
    if (index < currentStepIndex) {
      // Completed step - Verde claro
      card.style.backgroundColor = '#f0fdf4';
      card.style.borderColor = '#22c55e';
      card.style.boxShadow = '';
      
      if (icon) {
        icon.innerHTML = `
          <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
        `;
      }
    } else if (index === currentStepIndex) {
      // Active step - Azul claro
      card.style.backgroundColor = '#dbeafe';
      card.style.borderColor = '#3b82f6';
      card.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
      
      if (icon) {
        icon.innerHTML = `
          <svg class="w-5 h-5 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        `;
      }
    } else {
      // Pending step - Gris claro
      card.style.backgroundColor = '#f9fafb';
      card.style.borderColor = '#e5e7eb';
      card.style.boxShadow = '';
      
      if (icon) {
        icon.innerHTML = `
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        `;
      }
    }
  });
}
  /**
   * Establece el estado visual de un paso del workflow
   */
  setStepState(stepIndex, state) {
    const el = document.getElementById(`stepPro-${stepIndex}`);
    if (!el) return;

    el.classList.remove("bg-blue-100", "text-blue-600", "bg-gray-100", "text-gray-500");
    const icon = el.querySelector("span.material-icons");
    if (icon) icon.textContent = "radio_button_unchecked";

    if (state === "past") {
      el.classList.add("bg-blue-100", "text-blue-600");
      if (icon) icon.textContent = "check_circle";
    } else if (state === "current") {
      el.classList.add("bg-blue-100", "text-blue-600");
      if (icon) icon.textContent = "autorenew";
    } else {
      el.classList.add("bg-gray-100", "text-gray-500");
    }
  }

/**
 * Complete workflow progress when finished
 */
completeWorkflowProgress() {
  // Detener el timer
  this.stopWorkflowTimer();
  
  // Mark all steps as completed
  this.updateStepCards(6);
  
  // Update progress bar to 100%
  const progressBar = document.getElementById("main-progress-bar");
  if (progressBar) {
    progressBar.style.width = "100%";
  }
  
  // Update status text
  const currentStepText = document.getElementById("current-step-text");
  if (currentStepText) {
    currentStepText.textContent = "Analysis Complete!";
  }
  
  // Update running indicator
  const runningIndicator = document.querySelector('.animate-pulse');
  if (runningIndicator) {
    runningIndicator.classList.remove('animate-pulse');
    runningIndicator.parentElement.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
        <span class="text-sm font-medium text-green-600">Completed</span>
      </div>
    `;
  }
}


showWorkflowExecutionOverlay() {
  const overlay = document.getElementById("loading-overlay2");
  if (!overlay) return;

  // Update the overlay content with new design
  overlay.innerHTML = `
    <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 p-8">
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold text-gray-900">Model Execution</h2>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span class="text-sm font-medium text-blue-600">Running</span>
          </div>
          <span id="elapsed-time" class="text-sm text-gray-500">Elapsed: 0:00</span>
        </div>
      </div>

      <!-- Current Step Info -->
      <div class="mb-6">
        <p id="current-step-text" class="text-lg text-gray-700 mb-3">Current Step: Data Validation</p>
        
        <!-- Main Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div id="main-progress-bar" class="bg-blue-500 h-2 rounded-full transition-all duration-1000" style="width: 16.67%"></div>
        </div>
      </div>

      <!-- Steps Grid -->
      <div class="grid grid-cols-3 gap-4">
        
        <!-- Data Validation -->
        <div class="step-card bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3" data-step-index="0">
          <div class="step-icon">
            <svg class="w-5 h-5 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <span class="step-text text-sm font-medium text-gray-500">Data Validation</span>
        </div>

        <!-- Feature Engineering -->
        <div class="step-card bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-3" data-step-index="1">
          <div class="step-icon">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
          </div>
          <span class="step-text text-sm font-medium text-gray-500">Feature Engineering</span>
        </div>

        <!-- Bayesian Model Setup -->
        <div class="step-card bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-3" data-step-index="2">
          <div class="step-icon">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
          </div>
          <span class="step-text text-sm font-medium text-gray-500">Bayesian Model Setup</span>
        </div>

        <!-- MCMC Sampling -->
        <div class="step-card bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-3" data-step-index="3">
          <div class="step-icon">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
          </div>
          <span class="step-text text-sm font-medium text-gray-500">MCMC Sampling</span>
        </div>

        <!-- Posterior Analysis -->
        <div class="step-card bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-3" data-step-index="4">
          <div class="step-icon">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
          </div>
          <span class="step-text text-sm font-medium text-gray-500">Posterior Analysis</span>
        </div>

        <!-- Generating Insights -->
        <div class="step-card bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-3" data-step-index="5">
          <div class="step-icon">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
          </div>
          <span class="step-text text-sm font-medium text-gray-500">Generating Insights</span>
        </div>

      </div>

    </div>
  `;

  overlay.classList.remove("hidden");
}



  /**
   * Muestra un toast de notificación
   */
  showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `px-4 py-2 rounded shadow text-sm flex items-center justify-between gap-3 max-w-xs
      ${type === "success" ? "bg-blue-200 text-white" : "bg-red-500 text-white"}`;

    toast.innerHTML = `
      <span>${message}</span>
      <button class="text-white text-lg leading-none" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

  /**
 * Update the loading overlay message
 * @param {string} message - New message to display
 */
updateLoadingMessage(message) {
  const messageElement = document.querySelector('#loading-overlay .text-gray-700');
  if (messageElement) {
    messageElement.textContent = message;
  }
}

  /**
   * Actualiza el resumen de ejecución MMM
   */
  updateMMMExecutionSummary(r2, incrementalRevenue, channelsCount) {
    if (r2 !== null) {
      const r2Element = document.getElementById("model-r2");
      if (r2Element) {
        r2Element.innerText = r2.toFixed(2);
      }
    }

    if (channelsCount !== null) {
      const channelsElement = document.getElementById("channels-analyzed");
      if (channelsElement) {
        channelsElement.innerText = channelsCount;
      }
    }

    if (incrementalRevenue !== null) {
      const revenueElement = document.getElementById("incremental-revenue");
      if (revenueElement) {
        const formattedValue = new Intl.NumberFormat("en", {
          notation: "compact",
          compactDisplay: "short",
          maximumFractionDigits: 1
        }).format(incrementalRevenue);
        revenueElement.innerText = `${formattedValue}`;
      }
    }
  }


/**
 * Renderiza el dropdown de fecha CON VALIDACIÓN DE TIPO
 */
renderDateFieldDropdown(columnOptions) {
  const dateSelect = document.getElementById("date-field-select");
  if (!dateSelect) {
    console.warn("⚠️ Date field select element not found");
    return;
  }

  const usedColumns = this.appState.getUsedColumns();
  const currentValue = this.appState.dateField;
  
  // Obtener el datasetId actual
  const datasetSelect = document.getElementById("revenue-select");
  const currentDatasetId = datasetSelect?.value;
  
  // Preservar el valor actual temporalmente
  const tempValue = dateSelect.value;
  
  // IMPORTANTE: Remover listener anterior clonando el elemento
  if (dateSelect.hasAttribute('data-listener-attached')) {
    const newDateSelect = dateSelect.cloneNode(true);
    dateSelect.parentNode.replaceChild(newDateSelect, dateSelect);
    // Actualizar la referencia al nuevo elemento
    const dateSelectNew = document.getElementById("date-field-select");
    dateSelectNew.removeAttribute('data-listener-attached');
  }
  
  // Obtener referencia actualizada después del posible reemplazo
  const dateField = document.getElementById("date-field-select");
  
  // Limpiar opciones existentes
  dateField.innerHTML = `<option value="">No mapping</option>`;
  
  console.log("📅 Rendering date field dropdown for dataset:", currentDatasetId);
  
  // Agregar nuevas opciones
  columnOptions.forEach(col => {
    if (!usedColumns.has(col) || col === currentValue) {
      const opt = document.createElement("option");
      opt.value = col;
      opt.textContent = col;
      
      // NUEVO: Agregar atributo de tipo
      if (currentDatasetId) {
        const columnType = this.appState.getColumnType(currentDatasetId, col);
        opt.setAttribute('data-type', columnType || 'UNKNOWN');
      }
      
      dateField.appendChild(opt);
    }
  });
  
  // Restaurar valor si sigue siendo válido
  if (columnOptions.includes(currentValue) || currentValue === "") {
    dateField.value = currentValue;
  } else if (columnOptions.includes(tempValue)) {
    dateField.value = tempValue;
    this.appState.dateField = tempValue;
  }

  // Agregar NUEVO listener con validación
  dateField.addEventListener("change", (e) => {
    const selectedColumn = e.target.value;
    
    console.log("📅 Date field selected:", selectedColumn);
    
    // Si no hay selección, resetear
    if (!selectedColumn) {
      this.appState.dateField = "";
      
      // Re-renderizar solo si es necesario
      const selectedId = document.getElementById("revenue-select").value;
      const columnOptions = this.appState.getDatasetColumns(selectedId);
      this.renderAllDropdowns(columnOptions);
      return;
    }

    // VALIDACIÓN DE TIPO
    if (currentDatasetId) {
      const isValid = this.appState.isDateColumn(currentDatasetId, selectedColumn);
      const columnType = this.appState.getColumnType(currentDatasetId, selectedColumn);

      if (!isValid) {
        console.error(`❌ Invalid column type for date field: ${columnType}`);
        
        // Mostrar error
        this.showToast(
          `⚠️ Invalid column type: "${selectedColumn}" is ${columnType}. Date Field must be DATE or DATETIME.`,
          "error"
        );
        
        // Resetear selección
        e.target.value = "";
        this.appState.dateField = "";
        return;
      }

      console.log(`✅ Valid date field: ${selectedColumn} (${columnType})`);
    }

    // Actualizar state
    this.appState.dateField = selectedColumn;
    
    // Re-renderizar solo si es necesario
    const selectedId = document.getElementById("revenue-select").value;
    const columnOptions = this.appState.getDatasetColumns(selectedId);
    this.renderAllDropdowns(columnOptions);
  });
  
  // Marcar como que ya tiene listener
  dateField.setAttribute('data-listener-attached', 'true');
}


/**
 * Método mejorado para limpiar listeners antes de re-renderizar
 */
clearDateFieldListeners() {
  const dateSelect = document.getElementById("date-field-select");
  if (dateSelect) {
    dateSelect.removeAttribute('data-listener-attached');
  }
}

/**
 * Renders the iROAS Priors section based on the number of mapped marketing channels.
 * 
 * This function dynamically shows or hides the iROAS (Incremental Return on Ad Spend) 
 * configuration section based on whether the user has mapped at least 2 marketing channels.
 * 
 * Business Logic:
 * - Shows the section only when 2 or more channels are mapped
 * - Hides the section and clears content when fewer than 2 channels are mapped
 * - Generates input fields for each mapped channel to allow users to set iROAS priors
 * - Provides informational content about how priors work in MMM analysis
 * 
 * @returns {void}
 */
renderIROASPriorsSection() {
  console.log("Starting renderIROASPriorsSection execution");
  
  // Get the container element for the iROAS section
  const container = document.getElementById("iroas-priors-container");
  if (!container) {
    console.error("iROAS container element not found in DOM");
    return;
  }

  // Filter to get only channels that have been mapped to actual data columns
  const mappedChannels = this.appState.channelMappings.filter(
    entry => entry.value && entry.value !== "No mapping"
  );

  console.log(`Found ${mappedChannels.length} mapped channels for iROAS section`);

  // Hide section if insufficient channels are mapped
  if (mappedChannels.length < 2) {
    console.log("Insufficient channels mapped, hiding iROAS section");
    
    // Clear any existing content
    container.innerHTML = "";
    
    // Apply multiple hiding methods to ensure section is not visible
    container.classList.add("hidden");
    container.style.display = "none";
    
    return;
  }

  // Show section when sufficient channels are mapped
  console.log(`Showing iROAS section for ${mappedChannels.length} mapped channels`);
  
  // Remove hiding classes and styles
  container.classList.remove("hidden");
  container.style.display = "";

  // Generate the complete HTML content for the iROAS section
  container.innerHTML = `
    <!-- Section Header -->
    <h3 class="text-lg font-semibold text-gray-800 mb-1 text-left">
      iROAS Priors (Optional)
      <span class="ml-1 inline-block align-middle cursor-pointer" 
            title="Add iROAS values from previous incrementality studies to improve model accuracy. Leave blank if unknown.">
        <svg class="inline h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
      </span>
    </h3>
    
    <!-- Section Description -->
    <p class="text-sm text-gray-600 mb-4">
      Add iROAS values from previous incrementality studies to improve model accuracy. Leave blank if unknown.
    </p>

    <!-- Dynamic Input Fields Container -->
    <div class="space-y-4 mb-4">
      ${this.generateIROASInputsHTML(mappedChannels)}
    </div>

    <!-- Educational Information Panel -->
    <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 text-left">
      <h4 class="text-sm font-semibold text-blue-800 mb-2">How Priors Work</h4>
      <div class="text-xs text-blue-700 space-y-1">
        <p><strong>iROAS:</strong> Incremental Return on Ad Spend (e.g., 2.5 = $2.50 return per $1 spent)</p>
        <p><strong>Data-driven only:</strong> Model relies purely on observed data patterns without external assumptions</p>
        <p><strong>With priors:</strong> Model incorporates your prior knowledge while still learning from data</p>
      </div>
    </div>
  `;

  // Set up event listeners for the dynamically created input fields
  this.setupIROASEventListeners(mappedChannels);
  
  console.log("iROAS section rendered successfully");
}

/**
 * Generates HTML string for iROAS input fields based on mapped channels.
 * 
 * Creates a grid layout with three columns for each mapped channel:
 * 1. Channel information (name and data source)
 * 2. iROAS input field (numeric input for prior values)
 * 3. Alternative option indicator (no prior/data-driven)
 * 
 * @param {Array} mappedChannels - Array of channel mapping objects with label and value properties
 * @returns {string} HTML string containing the input grid
 */
generateIROASInputsHTML(mappedChannels) {
  return mappedChannels.map((channel, index) => {
    // Create unique identifier for each input field
    const inputId = `iroas-${channel.label.toLowerCase().replace(/\s+/g, '-')}-${index}`;
    
    return `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-white border border-gray-200 rounded-lg p-4">
        <!-- Column 1: Channel Information -->
        <div>
          <div class="font-medium text-gray-900">Column ${index + 1}</div>
          <div class="text-sm text-gray-600">${channel.value}</div>
        </div>
        
        <!-- Column 2: iROAS Input Field -->
        <div class="text-center">
          <div class="text-sm font-medium text-gray-700 mb-1">iROAS Prior</div>
          <input 
            type="number" 
            step="0.1" 
            min="0" 
            placeholder="e.g., 2.5"
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm text-center"
            id="${inputId}"
            data-channel-value="${channel.value}"
            aria-label="iROAS prior for ${channel.value}"
          />
        </div>
        
        <!-- Column 3: No Prior Alternative -->
        <div class="text-center text-sm text-gray-500">
          <div class="bg-gray-50 border border-gray-200 rounded px-3 py-2">
            No prior - data-driven only
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Sets up event listeners for iROAS input fields after they are rendered.
 * 
 * Attaches input event listeners to each dynamically created iROAS input field
 * to capture user input and store it in the application state for later use
 * in the MMM analysis configuration.
 * 
 * @param {Array} mappedChannels - Array of mapped channel objects
 * @returns {void}
 */
setupIROASEventListeners(mappedChannels) {
  mappedChannels.forEach((channel, index) => {
    const inputId = `iroas-${channel.label.toLowerCase().replace(/\s+/g, '-')}-${index}`;
    const input = document.getElementById(inputId);
    
    if (input) {
      input.addEventListener("input", (e) => {
        // Initialize iROAS priors object if it doesn't exist
        if (!this.appState.iroasPriors) {
          this.appState.iroasPriors = {};
        }
        
        // Parse and store the input value
        const value = parseFloat(e.target.value);
        this.appState.iroasPriors[channel.value] = isNaN(value) ? null : value;
        
        console.log(`iROAS prior updated: ${channel.value} => ${this.appState.iroasPriors[channel.value]}`);
      });
    } else {
      console.warn(`Could not find input element with ID: ${inputId}`);
    }
  });
}

/**
 * Genera los inputs de iROAS para cada channel mapeado
 */
generateIROASInputs(mappedChannels) {
  const inputsContainer = document.getElementById("iroas-inputs-container");
  if (!inputsContainer) return;

  inputsContainer.innerHTML = "";

  mappedChannels.forEach((channel, index) => {
    const inputRow = document.createElement("div");
    inputRow.className = "grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-white border border-gray-200 rounded-lg p-4";

    // Column 1: Channel Name
    const channelColumn = document.createElement("div");
    channelColumn.innerHTML = `
      <div class="font-medium text-gray-900">Column ${index + 1}</div>
      <div class="text-sm text-gray-600">${channel.value}</div>
    `;

    // Column 2: iROAS Input
    const iroasColumn = document.createElement("div");
    iroasColumn.className = "text-center";
    
    const iroasLabel = document.createElement("div");
    iroasLabel.className = "text-sm font-medium text-gray-700 mb-1";
    iroasLabel.textContent = "iROAS Prior";

    const iroasInput = document.createElement("input");
    iroasInput.type = "number";
    iroasInput.step = "0.1";
    iroasInput.min = "0";
    iroasInput.placeholder = "e.g., 2.5";
    iroasInput.className = "w-full border border-gray-300 rounded px-3 py-2 text-sm text-center";
    iroasInput.id = `iroas-${channel.label.toLowerCase().replace(/\s+/g, '-')}`;
    
    // Almacenar valor en el estado
    iroasInput.addEventListener("input", (e) => {
      if (!this.appState.iroasPriors) this.appState.iroasPriors = {};
      this.appState.iroasPriors[channel.value] = parseFloat(e.target.value) || null;
    });

    iroasColumn.appendChild(iroasLabel);
    iroasColumn.appendChild(iroasInput);

    // Column 3: No Prior Option
    const noPriorColumn = document.createElement("div");
    noPriorColumn.className = "text-center text-sm text-gray-500";
    noPriorColumn.innerHTML = `
      <div class="bg-gray-50 border border-gray-200 rounded px-3 py-2">
        No prior - data-driven only
      </div>
    `;

    // Agregar columnas a la fila
    inputRow.appendChild(channelColumn);
    inputRow.appendChild(iroasColumn);
    inputRow.appendChild(noPriorColumn);

    inputsContainer.appendChild(inputRow);
  });
}

/**
 * Actualiza la sección de iROAS cuando cambian los channels
 */
updateIROASSection() {
  // Solo actualizar si la sección existe y está visible
  const container = document.getElementById("iroas-priors-container");
  if (container && !container.classList.contains("hidden")) {
    this.renderIROASPriorsSection();
  }
}

/**
 * Renders the Data Mapping Preview section showing all configured mappings.
 * 
 * This function creates a comprehensive preview of all user-configured data mappings
 * including revenue details, date configuration, marketing channels, and control variables.
 * The preview helps users verify their configuration before proceeding to model execution.
 * 
 * Business Logic:
 * - Shows current revenue dataset and amount field selection
 * - Displays date field and date range configuration
 * - Lists all mapped marketing channels with their data sources
 * - Shows any mapped control variables
 * - Includes hide/show toggle functionality
 * 
 * @returns {void}
 */


/**
 * Generates HTML for marketing channels preview
 * @param {Array} mappedChannels - Array of mapped channel objects
 * @returns {string} HTML string for channels display
 */
generateChannelPreviewHTML(mappedChannels) {
  if (mappedChannels.length === 0) {
    return '<div class="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">No channels mapped</div>';
  }

  return mappedChannels.map((channel, index) => `
    <div class="bg-blue-50 rounded-lg p-3 flex justify-between items-center">
      <span class="text-sm font-medium text-blue-800">Column ${index + 1}:</span>
      <span class="text-sm text-blue-600">${channel.value}</span>
    </div>
  `).join('');
}

/**
 * Generates HTML for control variables preview
 * @param {Array} mappedControls - Array of mapped control variable objects
 * @returns {string} HTML string for controls display
 */
generateControlPreviewHTML(mappedControls) {
  return mappedControls.map((control, index) => `
    <div class="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
      <span class="text-sm font-medium text-gray-600">${control.label}:</span>
      <span class="text-sm text-gray-800">${control.value}</span>
    </div>
  `).join('');
}

/**
 * Gets the human-readable name of the selected revenue dataset
 * @param {string} datasetId - The ID of the selected dataset
 * @returns {string} The dataset name or fallback text
 */
getRevenueDatasetName(datasetId) {
  if (!datasetId) return null;
  
  const dataset = this.appState.getAvailableDatasets().find(ds => ds.ID === datasetId);
  return dataset?.Name || 'Unknown Dataset';
}

/**
 * Formats the date range for display
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {string} Formatted date range string
 */
formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return 'No date range selected';
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return `${formatDate(startDate)} to ${formatDate(endDate)}`;
}

/**
 * Sets up the hide button event listener for the preview section
 */
setupPreviewHideButton() {
  const hideBtn = document.getElementById("hide-data-mapping-btn");
  if (hideBtn) {
    hideBtn.addEventListener("click", () => {
      this.hideDataMappingPreview();
    });
  }
}

/**
 * Hides the data mapping preview section
 */
hideDataMappingPreview() {
  const container = document.getElementById("data-mapping-preview-container");
  if (container) {
    container.classList.add("hidden");
    container.innerHTML = ""; // Clear content to free memory
    console.log("Data Mapping Preview hidden");
  }
}

/**
 * Shows the data mapping preview in a modal overlay
 * 
 * Creates a modal dialog that displays all configured mappings in a clean,
 * focused interface without disrupting the main form flow.
 * 
 * @returns {void}
 */
/**
 * Shows the data mapping preview in a modal overlay
 * 
 * Creates a modal dialog that displays all configured mappings in a clean,
 * focused interface without disrupting the main form flow.
 * 
 * @param {number} currentStep - The current step number (2 or 3)
 * @returns {void}
 */
showDataMappingPreview(currentStep = 2) {
  console.log("Opening Data Mapping Preview Modal from step:", currentStep);
  
  // Remove any existing modal first
  this.closeDataMappingPreview();
  
  // Get current configuration data
  const revenueDatasetId = document.getElementById("revenue-select")?.value;
  const revenueDatasetName = this.getRevenueDatasetName(revenueDatasetId);
  const revenueAmountField = this.appState.revenueAmountField;
  const dateField = this.appState.dateField;
  const startDate = document.getElementById("start-date")?.value;
  const endDate = document.getElementById("end-date")?.value;

  // Get mapped channels and controls
  const mappedChannels = this.appState.channelMappings.filter(
    entry => entry.value && entry.value !== "No mapping"
  );
  const mappedControls = this.appState.controlMappings.filter(
    entry => entry.value && entry.value !== "No mapping"
  );

  // Get custom variables and iROAS priors
  const customVars = this.appState.customVars || [];
  const iroasPriors = this.appState.iroasPriors || {};

  // Format date range
  const dateRangeDisplay = this.formatDateRange(startDate, endDate);

  // ✅ NUEVO: Determinar si mostrar el botón Continue
  const showContinueButton = currentStep === 2;

  // Create modal HTML
  const modalHTML = `
    <div id="data-mapping-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div class="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <div class="bg-blue-100 p-2 rounded-lg">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-900">Data Mapping Preview</h2>
          </div>
          
          <button id="close-modal-btn" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <div class="space-y-6">
            
            <!-- Revenue Details -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                Revenue Details
              </h3>
              <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-gray-600">Dataset:</span>
                  <span class="text-sm text-gray-800 font-mono bg-white px-2 py-1 rounded border">
                    ${revenueDatasetName || 'Not selected'}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-gray-600">Amount Field:</span>
                  <span class="text-sm text-gray-800 font-mono bg-white px-2 py-1 rounded border">
                    ${revenueAmountField || 'Not selected'}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-gray-600">Date Field:</span>
                  <span class="text-sm text-gray-800 font-mono bg-white px-2 py-1 rounded border">
                    ${dateField || 'Not selected'}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-gray-600">Date Range:</span>
                  <span class="text-sm text-gray-800 bg-white px-2 py-1 rounded border">
                    ${dateRangeDisplay}
                  </span>
                </div>
              </div>
            </div>

            <!-- Marketing Channels -->
            ${mappedChannels.length > 0 ? `
              <div>
                <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Marketing Channels (${mappedChannels.length})
                </h3>
                <div class="space-y-2">
                  ${this.generateModalChannelPreviewHTML(mappedChannels)}
                </div>
              </div>
            ` : ''}

            <!-- Control Variables -->
            ${mappedControls.length > 0 ? `
              <div>
                <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Control Variables (${mappedControls.length})
                </h3>
                <div class="space-y-2">
                  ${this.generateModalControlPreviewHTML(mappedControls)}
                </div>
              </div>
            ` : ''}

            <!-- Custom Variables -->
            ${customVars.length > 0 ? `
              <div>
                <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Custom Variables (${customVars.length})
                </h3>
                <div class="space-y-2">
                  ${this.generateModalCustomVarsPreviewHTML(customVars)}
                </div>
              </div>
            ` : ''}

            <!-- iROAS Priors -->
            ${mappedChannels.length > 0 ? `
              <div>
                <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div class="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  iROAS Priors
                </h3>
                <div class="space-y-2">
                  ${this.generateModalIROASPreviewHTML(mappedChannels, iroasPriors)}
                </div>
              </div>
            ` : ''}

          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button id="close-modal-footer-btn" class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            Close
          </button>
          
          ${showContinueButton ? `
            <button id="continue-from-modal-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
              Continue Analysis
            </button>
          ` : ''}
        </div>

      </div>
    </div>
  `;

  // Insert modal into DOM
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.body.style.overflow = 'hidden'; // Prevent body scrolling

  // Setup event listeners
  this.setupModalEventListeners();

  console.log("Data Mapping Preview Modal displayed");
}

/**
 * Generates HTML for marketing channels in modal format
 * @param {Array} mappedChannels - Array of mapped channel objects
 * @returns {string} HTML string for channels display
 */
generateModalChannelPreviewHTML(mappedChannels) {
  if (mappedChannels.length === 0) {
    return `
      <div class="bg-gray-50 rounded-lg p-4 text-center">
        <div class="text-gray-400 mb-2">
          <svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
        </div>
        <p class="text-sm text-gray-500">No marketing channels mapped yet</p>
      </div>
    `;
  }

  return mappedChannels.map((channel, index) => `
    <div class="bg-white rounded-lg border border-purple-200 p-3 flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div class="bg-purple-100 text-purple-600 text-xs font-medium px-2 py-1 rounded">
          Column ${index + 1}
        </div>
        <span class="text-sm font-medium text-gray-800">${channel.label}</span>
      </div>
      <span class="text-sm text-purple-600 font-mono bg-purple-50 px-2 py-1 rounded border">
        ${channel.value}
      </span>
    </div>
  `).join('');
}

/**
 * Generates HTML for control variables in modal format
 * @param {Array} mappedControls - Array of mapped control variable objects
 * @returns {string} HTML string for controls display
 */
generateModalControlPreviewHTML(mappedControls) {
  return mappedControls.map((control) => `
    <div class="bg-white rounded-lg border border-yellow-200 p-3 flex justify-between items-center">
      <span class="text-sm font-medium text-gray-800">${control.label}</span>
      <span class="text-sm text-yellow-600 font-mono bg-yellow-50 px-2 py-1 rounded border">
        ${control.value}
      </span>
    </div>
  `).join('');
}

/**
 * Sets up event listeners for the modal
 */
setupModalEventListeners() {
  const modal = document.getElementById('data-mapping-modal');
  const closeBtnHeader = document.getElementById('close-modal-btn');
  const closeBtnFooter = document.getElementById('close-modal-footer-btn');
  const continueBtn = document.getElementById('continue-from-modal-btn');

  // Close button handlers
  [closeBtnHeader, closeBtnFooter].forEach(btn => {
    btn?.addEventListener('click', () => {
      this.closeDataMappingPreview();
    });
  });

  // Continue button handler
  continueBtn?.addEventListener('click', () => {
    console.log("Continue button clicked from modal");
    this.closeDataMappingPreview();
    // Trigger save mapping action
    // Debug: verificar que el botón existe
  const saveBtn = document.getElementById('save-mapping');
  console.log("Save mapping button found:", !!saveBtn);
  
  if (saveBtn) {
    console.log("Triggering save mapping click");
    saveBtn.click();
  } else {
    console.error("Save mapping button not found");
  }
  });

  // Close on outside click
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      this.closeDataMappingPreview();
    }
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      this.closeDataMappingPreview();
    }
  });
}

/**
 * Closes and removes the data mapping preview modal
 */
closeDataMappingPreview() {
  const modal = document.getElementById('data-mapping-modal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = ''; // Restore body scrolling
    console.log("Data Mapping Preview Modal closed");
  }
}

/**
 * Helper method to get revenue dataset name
 */
getRevenueDatasetName(datasetId) {
  if (!datasetId) return null;
  const dataset = this.appState.getAvailableDatasets().find(ds => ds.ID === datasetId);
  return dataset?.Name || 'Unknown Dataset';
}

/**
 * Helper method to format date range
 */
formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return 'No date range selected';
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return `${formatDate(startDate)} to ${formatDate(endDate)}`;
}

/**
 * Generates HTML for custom variables in modal format
 */
generateModalCustomVarsPreviewHTML(customVars) {
  return customVars.map((customVar) => `
    <div class="bg-white rounded-lg border border-orange-200 p-3">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-gray-800">${customVar.label}</span>
        <span class="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
          ${customVar.type}
        </span>
      </div>
      <div class="text-xs text-gray-500">
        ${customVar.values && customVar.values.length > 0 
          ? `${customVar.values.filter(v => v !== null && v !== undefined).length} values configured`
          : 'No values set'
        }
      </div>
    </div>
  `).join('');
}

/**
 * Generates HTML for iROAS priors in modal format
 */
generateModalIROASPreviewHTML(mappedChannels, iroasPriors) {
  return mappedChannels.map((channel, index) => {
    const priorValue = iroasPriors[channel.value];
    const hasValue = priorValue !== null && priorValue !== undefined;
    
    return `
      <div class="bg-white rounded-lg border border-indigo-200 p-3 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="bg-indigo-100 text-indigo-600 text-xs font-medium px-2 py-1 rounded">
            Column ${index + 1}
          </div>
          <span class="text-sm font-medium text-gray-800">${channel.value}</span>
        </div>
        <span class="text-sm ${hasValue ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 bg-gray-50'} font-mono px-2 py-1 rounded border">
          ${hasValue ? priorValue.toFixed(1) : 'No prior'}
        </span>
      </div>
    `;
  }).join('');
}



/**
 * Construye el dropdown de datasets para custom variables
 */
buildCustomVarsDatasetDropdown() {
  const select = document.getElementById("custom-vars-dataset-select");
  if (!select) {
    console.warn("⚠️ Custom vars dataset select not found");
    return;
  }

  select.innerHTML = `<option value="">Choose your custom variables data source</option>`;

  this.appState.getAvailableDatasets()
    .sort((a, b) => a.Name.localeCompare(b.Name))
    .forEach(({ Name, ID }) => {
      const option = document.createElement("option");
      option.value = ID;
      option.textContent = Name;
      select.appendChild(option);
    });
  
  console.log("✅ Custom vars dataset dropdown built");
}

/**
 * Renderiza los 3 dropdowns de custom variables
 */
/**
 * Renderiza los dropdowns de custom variables (2 por línea, compacto)
 */
renderCustomVarsDropdowns(columnOptions) {
  const container = document.getElementById("custom-vars-dropdowns");
  if (!container) {
    console.warn("⚠️ Custom vars dropdowns container not found");
    return;
  }

  const customVarsDatasetId = this.appState.getCustomVarsDataset();
  if (!customVarsDatasetId) {
    container.classList.add("hidden");
    console.log("ℹ️ No custom vars dataset selected, hiding dropdowns");
    return;
  }

  container.classList.remove("hidden");
  container.innerHTML = "";

  console.log("🎨 Rendering custom vars dropdowns for dataset:", customVarsDatasetId);

  // Crear grid con 2 columnas
  const gridContainer = document.createElement("div");
  gridContainer.className = "grid grid-cols-1 md:grid-cols-2 gap-4";

  this.appState.customVarsMappings.forEach((mapping, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "bg-gray-50 border border-gray-200 rounded-lg p-4";

    // Header con número (compacto)
    const header = document.createElement("div");
    header.className = "text-xs font-semibold text-gray-600 mb-2";
    header.textContent = `Custom Variable ${index + 1}`;
    wrapper.appendChild(header);

    // Grid para Type y Variable Name EN LA MISMA LÍNEA
    const innerGrid = document.createElement("div");
    innerGrid.className = "grid grid-cols-2 gap-3";

    // Type Select
    const typeSelect = document.createElement("select");
    typeSelect.className = "w-full border rounded px-3 py-2 text-sm";
    typeSelect.innerHTML = `
      <option value="numeric" ${mapping.type === "numeric" ? "selected" : ""}>Numeric</option>
      <option value="binary" ${mapping.type === "binary" ? "selected" : ""}>Binary</option>
    `;
    
    typeSelect.addEventListener("change", (e) => {
      console.log(`🔄 Custom var ${index + 1} type changed to:`, e.target.value);
      this.appState.updateCustomVarMapping(index, "type", e.target.value);
      this.appState.updateCustomVarMapping(index, "value", "");
      this.renderCustomVarsDropdowns(columnOptions);
    });
    
    innerGrid.appendChild(typeSelect);

    // Variable Name Select
    const nameSelect = document.createElement("select");
    nameSelect.className = "w-full border rounded px-3 py-2 text-sm";
    nameSelect.innerHTML = `<option value="">Select column</option>`;

    // Obtener columnas ya usadas (excluyendo la actual)
    const usedCustomVarsColumns = new Set();
    this.appState.customVarsMappings.forEach((m, i) => {
      if (m.value && m.value !== "" && i !== index) {
        usedCustomVarsColumns.add(m.value);
      }
    });
    
    console.log(`🔍 Custom var ${index + 1} - Used by others:`, Array.from(usedCustomVarsColumns));

    // Agregar opciones de columnas
    columnOptions.forEach(col => {
      if (!usedCustomVarsColumns.has(col)) {
        const option = document.createElement("option");
        option.value = col;
        option.textContent = col;
        nameSelect.appendChild(option);
      }
    });

    nameSelect.value = mapping.value || "";

    // Event listener CON validación
    nameSelect.addEventListener("change", (e) => {
      const selectedColumn = e.target.value;
      
      console.log(`📝 Custom var ${index + 1} (${mapping.type}) selected:`, selectedColumn);
      
      if (!selectedColumn) {
        this.appState.updateCustomVarMapping(index, "value", "");
        return;
      }

      // VALIDACIÓN DE TIPO
      const isValid = this.appState.validateCustomVarType(
        customVarsDatasetId, 
        selectedColumn, 
        mapping.type
      );
      const columnType = this.appState.getColumnType(customVarsDatasetId, selectedColumn);

      if (!isValid) {
        console.error(`❌ Invalid column type for ${mapping.type} custom var: ${columnType}`);
        
        const typeLabel = mapping.type === 'numeric' ? 'Numeric' : 'Binary';
        this.showToast(
          `⚠️ Invalid column type: "${selectedColumn}" is ${columnType}. ${typeLabel} variables must be numeric (DECIMAL, LONG, or DOUBLE).`,
          "error"
        );
        
        e.target.value = "";
        this.appState.updateCustomVarMapping(index, "value", "");
        return;
      }

      console.log(`✅ Valid ${mapping.type} custom var: ${selectedColumn} (${columnType})`);
      this.appState.updateCustomVarMapping(index, "value", selectedColumn);
    });
    
    innerGrid.appendChild(nameSelect);
    wrapper.appendChild(innerGrid);
    
    // Agregar wrapper al grid principal
    gridContainer.appendChild(wrapper);
  });

  // Agregar el grid al container
  container.appendChild(gridContainer);

  console.log("✅ Custom vars dropdowns rendered (compact layout)");
}


/**
 * Renderiza la preview de Custom Variables
 */
renderCustomVarsPreview() {
  const customVarsDatasetId = this.appState.getCustomVarsDataset();
  
  // Si no hay dataset seleccionado
  if (!customVarsDatasetId) {
    return `
      <div>
        <h3 class="text-lg font-semibold text-gray-400 mb-3 flex items-center gap-2">
          <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
          Custom Variables
          <span class="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
            No dataset selected
          </span>
        </h3>
      </div>
    `;
  }

  // Obtener nombre del dataset
  const customVarsDataset = this.appState.getAvailableDatasets().find(
    ds => ds.ID === customVarsDatasetId
  );
  const customVarsDatasetName = customVarsDataset?.Name || 'Unknown Dataset';

  // Filtrar custom vars mapeadas
  const mappedCustomVars = this.appState.customVarsMappings.filter(
    mapping => mapping.value && mapping.value !== ""
  );

  // Si hay dataset pero no hay variables mapeadas
  if (mappedCustomVars.length === 0) {
    return `
      <div>
        <h3 class="text-lg font-semibold text-gray-400 mb-3 flex items-center gap-2">
          <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
          Custom Variables
          <span class="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
            None mapped
          </span>
        </h3>
        <div class="bg-gray-50 rounded-lg p-3">
          <span class="text-sm text-gray-600">Dataset: ${customVarsDatasetName}</span>
        </div>
      </div>
    `;
  }

  // Si hay variables mapeadas
  return `
    <div>
      <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
        Custom Variables
        <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
          ${mappedCustomVars.length} mapped
        </span>
      </h3>
      
      <!-- Dataset info -->
      <div class="bg-gray-50 rounded-lg p-3 mb-3">
        <span class="text-sm font-medium text-gray-600">Dataset: </span>
        <span class="text-sm text-gray-800 font-mono">${customVarsDatasetName}</span>
      </div>

      <!-- Variables list -->
      <div class="space-y-2">
        ${mappedCustomVars.map((mapping, index) => `
          <div class="bg-white rounded-lg border border-green-200 p-3 flex justify-between items-center">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-800">${mapping.value}</span>
              <span class="text-xs px-2 py-0.5 rounded ${
                mapping.type === 'numeric' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-purple-100 text-purple-700'
              }">
                ${mapping.type === 'numeric' ? 'Numeric' : 'Binary'}
              </span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}




}