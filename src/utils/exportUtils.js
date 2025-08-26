// Export utilities for CSV and other formats
export const exportToCSV = (issues) => {
  const headers = [
    'ID',
    'Job Number',
    'Category',
    'Description',
    'Status',
    'Priority',
    'Date Reported',
    'Resolution Notes',
    'Assignee',
    'Review Count'
  ];

  const rows = issues.map(issue => [
    issue.id,
    issue.jobNumber,
    issue.category,
    `"${issue.description.replace(/"/g, '""')}"`, // Escape quotes in description
    issue.status,
    issue.priority,
    issue.dateReported,
    `"${(issue.resolutionNotes || '').replace(/"/g, '""')}"`,
    issue.assignee,
    issue.reviewHistory ? issue.reviewHistory.length : 0
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `issues_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (issues) => {
  const dataStr = JSON.stringify(issues, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `issues_export_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const printIssues = (issues) => {
  const printWindow = window.open('', '_blank');
  const groupedByStatus = issues.reduce((acc, issue) => {
    if (!acc[issue.status]) acc[issue.status] = [];
    acc[issue.status].push(issue);
    return acc;
  }, {});

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Issues Report - ${new Date().toLocaleDateString()}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .priority-High { color: #dc2626; font-weight: bold; }
        .priority-Medium { color: #f59e0b; }
        .priority-Low { color: #10b981; }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>Technical Issues Report</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
      <p>Total Issues: ${issues.length}</p>
      
      ${Object.entries(groupedByStatus).map(([status, statusIssues]) => `
        <h2>${status} (${statusIssues.length})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Job #</th>
              <th>Category</th>
              <th>Description</th>
              <th>Priority</th>
              <th>Assignee</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${statusIssues.map(issue => `
              <tr>
                <td>${issue.id}</td>
                <td>${issue.jobNumber}</td>
                <td>${issue.category}</td>
                <td>${issue.description}</td>
                <td class="priority-${issue.priority}">${issue.priority}</td>
                <td>${issue.assignee}</td>
                <td>${issue.dateReported}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `).join('')}
      
      <script>
        window.onload = () => {
          window.print();
          setTimeout(() => window.close(), 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};