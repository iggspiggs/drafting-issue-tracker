// Enhanced email parser with better validation and error handling
export const parseEmailContent = (content, selectedJob = '') => {
  if (!content || typeof content !== 'string') {
    return { issues: [], errors: ['Invalid email content'] };
  }

  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  const parsedIssues = [];
  const errors = [];
  let currentCategory = '';
  let jobNumber = selectedJob;
  
  // Enhanced job number detection with multiple patterns
  const jobPatterns = [
    /job\s*#?\s*(\d+)/i,
    /project\s*#?\s*(\d+)/i,
    /job\s*number:?\s*(\d+)/i,
    /\b(\d{6})\b/ // 6-digit number as fallback
  ];
  
  for (const pattern of jobPatterns) {
    const match = content.match(pattern);
    if (match && !jobNumber) {
      jobNumber = match[1];
      break;
    }
  }

  if (!jobNumber) {
    errors.push('Warning: No job number detected. Please enter manually.');
  }

  const categoryMap = {
    'erection drawings': 'Erection Drawings',
    'erection': 'Erection Drawings',
    'shipper': 'Shipper',
    'ship': 'Shipper',
    'shop drawings': 'Shop Drawings',
    'shop': 'Shop Drawings'
  };

  let issueCounter = { 
    'Erection Drawings': 1, 
    'Shipper': 1, 
    'Shop Drawings': 1 
  };

  // Get existing issue counts to avoid ID conflicts
  const existingIssues = JSON.parse(localStorage.getItem('drafting_issues_data') || '[]');
  // Ensure existingIssues is an array
  if (Array.isArray(existingIssues)) {
    existingIssues.forEach(issue => {
    const match = issue.id.match(/([A-Z]+)-(\d+)/);
    if (match) {
      const prefix = match[1];
      const num = parseInt(match[2]);
      if (prefix === 'ERE') issueCounter['Erection Drawings'] = Math.max(issueCounter['Erection Drawings'], num + 1);
      if (prefix === 'SHP') issueCounter['Shipper'] = Math.max(issueCounter['Shipper'], num + 1);
      if (prefix === 'SHD') issueCounter['Shop Drawings'] = Math.max(issueCounter['Shop Drawings'], num + 1);
    }
    });
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for category headers
    const lowerLine = line.toLowerCase();
    for (const [key, value] of Object.entries(categoryMap)) {
      if (lowerLine.includes(key)) {
        currentCategory = value;
        break;
      }
    }

    // Parse numbered items
    const numberMatch = line.match(/^(\d+)[\.\)]\s*(.+)/);
    if (numberMatch && currentCategory) {
      let description = numberMatch[2];
      
      // Collect multi-line descriptions
      let j = i + 1;
      while (j < lines.length && !lines[j].match(/^(\d+)[\.\)]/) && !lines[j].toLowerCase().match(/drawings|shipper/)) {
        if (lines[j].trim() && !lines[j].startsWith('--')) {
          description += ' ' + lines[j];
        }
        j++;
      }

      // Determine status and extract notes
      let status = 'New';
      let resolutionNotes = '';

      const statusPatterns = [
        { pattern: /cannot\s+change|cannot\s+show|not\s+possible/i, status: 'Cannot Change' },
        { pattern: /fixed|completed|done|resolved/i, status: 'Fixed' },
        { pattern: /will\s+review|under\s+review|reviewing/i, status: 'Under Review' },
        { pattern: /will\s+fix|in\s+progress|working/i, status: 'In Progress' },
        { pattern: /needs?\s+rework|rejected|redo/i, status: 'Needs Rework' }
      ];

      for (const { pattern, status: matchedStatus } of statusPatterns) {
        if (pattern.test(description)) {
          status = matchedStatus;
          break;
        }
      }

      // Extract resolution notes after dash or hyphen
      const notesMatch = description.match(/[-–]\s*(.+)$/);
      if (notesMatch) {
        resolutionNotes = notesMatch[1].trim();
        description = description.replace(/[-–]\s*.+$/, '').trim();
      }

      const categoryPrefix = currentCategory === 'Erection Drawings' ? 'ERE' : 
                           currentCategory === 'Shipper' ? 'SHP' : 'SHD';
      
      const assignee = currentCategory === 'Erection Drawings' ? 'Engineering Team' :
                      currentCategory === 'Shipper' ? 'Production Team' : 'Detailing Team';
      
      parsedIssues.push({
        id: `${categoryPrefix}-${String(issueCounter[currentCategory]).padStart(3, '0')}`,
        jobNumber: jobNumber,
        category: currentCategory,
        description: description,
        status: status,
        dateReported: new Date().toISOString().split('T')[0],
        resolutionNotes: resolutionNotes,
        assignee: assignee,
        reviewHistory: []
      });

      issueCounter[currentCategory]++;
    }
  }

  if (parsedIssues.length === 0) {
    errors.push('No issues could be parsed. Please check the email format.');
  }

  return { issues: parsedIssues, errors, jobNumber };
};