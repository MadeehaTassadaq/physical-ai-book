/**
 * Helper function to get the currently selected text on the page
 * @returns {string} The selected text, or empty string if no text is selected
 */
export const getSelectedText = () => {
  return window.getSelection ? window.getSelection().toString().trim() : '';
};

/**
 * Helper function to get information about the current page
 * @returns {Object} Page metadata including URL, title, and other relevant info
 */
export const getCurrentPageInfo = () => {
  return {
    url: window.location.href,
    title: document.title,
    pathname: window.location.pathname,
    // Extract potential section/chapter info from URL or DOM
    section: extractSectionInfo(),
  };
};

/**
 * Helper function to extract section/chapter info from the current page
 * @returns {string} Section or chapter name if available
 */
const extractSectionInfo = () => {
  // Try to get section info from common DOM elements
  const selectors = [
    'header h1',
    'header h2',
    'main h1',
    'main h2',
    'article h1',
    'article h2',
    '.markdown h1',
    '.markdown h2',
    '[class*="title"]',
    '[class*="header"]',
    '[id*="title"]',
    '[id*="header"]'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim()) {
      return element.textContent.trim();
    }
  }

  // If no specific header found, try to extract from URL path
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts.length > 0) {
    // Use the last meaningful path segment as the section
    return pathParts[pathParts.length - 1];
  }

  return 'Unknown Section';
};

/**
 * Helper function to get comprehensive selection context
 * @returns {Object} Combined information about selected text and current page
 */
export const getSelectionContext = () => {
  const selectedText = getSelectedText();
  const pageInfo = getCurrentPageInfo();

  return {
    selectedText,
    currentPage: pageInfo.url,
    pageMetadata: {
      title: pageInfo.title,
      section: pageInfo.section,
      pathname: pageInfo.pathname
    }
  };
};