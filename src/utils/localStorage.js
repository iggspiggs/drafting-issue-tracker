// localStorage utility functions
const STORAGE_KEY = 'drafting_issues_data';

export const loadFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Ensure dates are properly parsed
      return parsed.map(issue => ({
        ...issue,
        dateReported: issue.dateReported || new Date().toISOString().split('T')[0],
        reviewHistory: issue.reviewHistory || []
      }));
    }
    return null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

export const saveToStorage = (issues) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const clearStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};