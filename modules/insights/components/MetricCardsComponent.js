// modules/insights/components/MetricCardsComponent.js
export class MetricCardsComponent {
  /**
   * Render metric card with exact SVG icons from the image
   * @param {Object} cardData - Card configuration
   * @returns {string} HTML string for the card
   */
  render(cardData) {
    const { title, value } = cardData;
    
    // Exact SVG icons from the image
    const svgIcons = {
      'Incremental Revenue': `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-blue-300">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
          <polyline points="16 7 22 7 22 13"></polyline>
        </svg>
      `,
      'Model R²': `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-blue-300">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2"></circle>
        </svg>
      `,
      'Top Channel': `
       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-blue-300">
       <line x1="12" y1="1" x2="12" y2="23"></line>
       <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
      `,
      'MAPE': `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-blue-300">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
          <polyline points="16 7 22 7 22 13"></polyline>
        </svg>
      `
    };


    
    const displayIcon = svgIcons[title] || '';
    
   return `
 <div class="metric-card bg-white rounded-xl border border-gray-100 px-6 py-3 shadow-sm hover:shadow-md transition-all duration-200">
 <!-- Icon and Value in same line - large and prominent at top -->
 <div class="flex items-center gap-2 mb-1">
${displayIcon}
 <span class="text-sml font-bold text-gray-800 truncate max-w-[200px]" title="${value}">${value}</span> </div>
 <!-- Title below -->
 <div class="text-sm font-medium text-gray-600">${title}</div>
 </div>
    `;
  }
}