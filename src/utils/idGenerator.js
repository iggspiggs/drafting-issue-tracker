// Client-side ID generation utilities
// This provides fallback ID generation when database sequences are not available

// Simple counter storage (in production, this would be replaced by proper database sequences)
const categoryCounters = {
  'Erection Drawings': 0,
  'Shipper': 0,
  'Shop Drawings': 0
};

// Load counters from localStorage on startup
const loadCounters = () => {
  try {
    const stored = localStorage.getItem('issue_id_counters');
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.assign(categoryCounters, parsed);
    }
  } catch (error) {
    console.warn('Could not load ID counters from localStorage:', error);
  }
};

// Save counters to localStorage
const saveCounters = () => {
  try {
    localStorage.setItem('issue_id_counters', JSON.stringify(categoryCounters));
  } catch (error) {
    console.warn('Could not save ID counters to localStorage:', error);
  }
};

// Initialize counters on module load
loadCounters();

// Generate display ID based on category
export const generateDisplayId = (category) => {
  let prefix;
  
  switch (category) {
    case 'Erection Drawings':
      prefix = 'ERE';
      break;
    case 'Shipper':
      prefix = 'SHP';
      break;
    case 'Shop Drawings':
      prefix = 'SHD';
      break;
    default:
      prefix = 'ISS';
      category = 'Erection Drawings'; // Default category
  }
  
  // Increment counter
  categoryCounters[category] = (categoryCounters[category] || 0) + 1;
  
  // Save updated counters
  saveCounters();
  
  // Format: ERE-001, SHP-002, etc.
  const number = categoryCounters[category].toString().padStart(3, '0');
  return `${prefix}-${number}`;
};

// Update counters based on existing issues (called when loading data)
export const updateCountersFromExistingIssues = (issues) => {
  const maxCounters = {
    'Erection Drawings': 0,
    'Shipper': 0,
    'Shop Drawings': 0
  };
  
  issues.forEach(issue => {
    if (issue.displayId) {
      const match = issue.displayId.match(/^(ERE|SHP|SHD)-(\d+)$/);
      if (match) {
        const [, prefix, numberStr] = match;
        const number = parseInt(numberStr, 10);
        
        let category;
        switch (prefix) {
          case 'ERE':
            category = 'Erection Drawings';
            break;
          case 'SHP':
            category = 'Shipper';
            break;
          case 'SHD':
            category = 'Shop Drawings';
            break;
          default:
            continue;
        }
        
        maxCounters[category] = Math.max(maxCounters[category], number);
      }
    }
  });
  
  // Update counters to be higher than existing maximums
  Object.entries(maxCounters).forEach(([category, maxCount]) => {
    if (maxCount > 0) {
      categoryCounters[category] = Math.max(categoryCounters[category], maxCount);
    }
  });
  
  saveCounters();
};

// Generate a temporary UUID for client-side use
export const generateTempUUID = () => {
  // Simple UUID v4 generator for client-side temporary IDs
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};