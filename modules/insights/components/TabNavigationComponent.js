// modules/insights/components/TabNavigationComponent.js
export class TabNavigationComponent {
  /**
   * Render tab navigation matching the design
   * @param {Array} tabs - Array of tab objects
   * @param {string} activeTab - ID of currently active tab
   * @returns {string} HTML string for tab navigation
   */
  render(tabs, activeTab) {
    return `
      <div class="tab-navigation mb-8">
        <nav class="flex space-x-8 border-b border-gray-200" role="tablist">
          ${tabs.map(tab => this.renderTab(tab, activeTab)).join('')}
        </nav>
      </div>
    `;
  }

  /**
   * Render individual tab button matching the design
   * @param {Object} tab - Tab configuration
   * @param {string} activeTab - ID of currently active tab
   * @returns {string} HTML string for tab button
   */
  renderTab(tab, activeTab) {
    const isActive = tab.id === activeTab;
    
    const baseClasses = "tab-button py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200";
    const activeClasses = isActive 
      ? "border-blue-500 text-blue-600" 
      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300";
    
    return `
      <button 
        data-tab-id="${tab.id}"
        class="${baseClasses} ${activeClasses}"
        type="button"
        role="tab"
        aria-selected="${isActive}"
      >
        ${tab.label}
      </button>
    `;
  }
}