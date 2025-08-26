import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Calendar, User, Tag, FileText, 
  X, CheckCircle, XCircle, Clock, RefreshCw, 
  Download, Trash2, Edit2, Save, Eye, Filter,
  ChevronDown, ChevronUp, Database, FileDown, Printer,
  MessageSquare, ChevronLeft, ChevronRight,
  CalendarDays, List, BarChart3
} from 'lucide-react';
import { parseEmailContent } from './utils/emailParser';
import { exportToCSV, exportToJSON, printIssues } from './utils/exportUtils';
import { issueService } from './services/supabaseService';
import './EnhancedStyles.css';
import './styles/kpi.css';

const EnhancedIssuePlannerBoardV2 = ({ user }) => {
  const [issues, setIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJob, setFilterJob] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSquad, setFilterSquad] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [emailContent, setEmailContent] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedSquad, setSelectedSquad] = useState('');
  const [draggedIssue, setDraggedIssue] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingIssue, setReviewingIssue] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [editingIssue, setEditingIssue] = useState(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState(null);
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [parsePreview, setParsePreview] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [showKPIs, setShowKPIs] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [viewMode, setViewMode] = useState('board'); // 'board', 'list', or 'calendar'
  const [calendarDate, setCalendarDate] = useState(new Date()); // Default to current month/year
  const [calendarView] = useState('month'); // 'month' or 'week' - setCalendarView removed as unused
  const [sortBy, setSortBy] = useState('date'); // 'date', 'id'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [showKPIModal, setShowKPIModal] = useState(false);
  const [selectedKPIFilter, setSelectedKPIFilter] = useState(null);
  const [kpiModalTitle, setKpiModalTitle] = useState('');
  const [showCalendarDayModal, setShowCalendarDayModal] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  // Squad options
  const squadOptions = [
    'Cadeploy (MBS)',
    'Cadeploy (Tekla)',
    'Crystal Engineering',
    'Basuraj',
    'Manohar',
    'Rohan Engineering',
    'Precision Engineering',
    'Jerry Dubose',
    'Other'
  ];

  // Buckets configuration
  const buckets = [
    { id: 'new', title: 'New Issues', status: 'New', color: 'bg-blue-500' },
    { id: 'inprogress', title: 'In Progress', status: 'In Progress', color: 'bg-yellow-500' },
    { id: 'review', title: 'Under Review', status: 'Under Review', color: 'bg-purple-500' },
    { id: 'needsrework', title: 'Needs Rework', status: 'Needs Rework', color: 'bg-orange-500' },
    { id: 'fixed', title: 'Fixed', status: 'Fixed', color: 'bg-green-500' },
    { id: 'cannotchange', title: 'Cannot Change', status: 'Cannot Change', color: 'bg-red-500' }
  ];

  // ESC key handler for closing modals
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        // Close whichever modal is currently open
        setShowAddModal(false);
        setShowIssueModal(false);
        setShowReviewModal(false);
        setShowEditModal(false);
        setShowDeleteConfirm(false);
        setShowKPIModal(false);
        setShowCalendarDayModal(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  // Load data from Supabase on mount and when user changes
  useEffect(() => {
    if (!user) {
      setIssues([]);  // Clear issues if no user
      return;
    }
    
    const loadIssues = async () => {
      try {
        const data = await issueService.getAll();
        setIssues(data || []);  // Set empty array if no data
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading issues from Supabase:', error);
        }
        setIssues([]);  // Set empty array on error, no sample data
      }
    };
    
    const loadSampleData = () => {
      // Initialize with sample data for testing
      const sampleIssues = [
        {
          id: 'DIT-2024-001',
          description: 'Beam dimensions incorrect on plan view - column B3 shows 18" depth but should be 21" per structural calculations',
          jobNumber: '113980',
          squad: 'Cadeploy (Tekla)',
          category: 'Erection Drawings',
          status: 'New',
          uploadedBy: 'Sarah Wilson',
          dateReported: '2024-01-15',
          resolutionDate: null,
          reviewHistory: [],
          notes: [
            {
              id: 1,
              content: 'Initial review by structural team - dimensions need correction',
              timestamp: '2024-01-15T10:35:00Z',
              author: 'Mike Johnson'
            }
          ],
          lastStatusChange: '2024-01-15T10:30:00Z'
        },
        {
          id: 'DIT-2024-002',
          description: 'Missing bolt specifications for connection detail at grid line 5 - need grade and size callouts. Currently reviewing structural specs for correct bolt grade.',
          jobNumber: '113980',
          squad: 'Crystal Engineering',
          category: 'Shop Drawings',
          status: 'In Progress',
          uploadedBy: 'Mike Johnson',
          dateReported: '2024-01-16',
          resolutionDate: null,
          reviewHistory: [],
          notes: [
            {
              id: 1,
              content: 'Checking with vendor for bolt specifications',
              timestamp: '2024-01-16T14:25:00Z',
              author: 'Mike Johnson'
            }
          ],
          lastStatusChange: '2024-01-16T14:20:00Z'
        },
        {
          id: 'DIT-2024-003',
          description: 'Shipment quantity mismatch - Drawing shows 12 pieces but BOM lists 14 pieces for angle brackets. Updated BOM to reflect correct quantity of 12 pieces. Drawing is accurate.',
          jobNumber: '114520',
          squad: 'Rohan Engineering',
          category: 'Shipper',
          status: 'Under Review',
          uploadedBy: 'David Chen',
          dateReported: '2024-01-17',
          resolutionDate: null,
          reviewHistory: [],
          lastStatusChange: '2024-01-18T09:15:00Z'
        },
        {
          id: 'DIT-2024-004',
          description: 'Weld symbol missing on connection plate - need to specify fillet weld size and type. RESOLUTION: Added 3/16" fillet weld symbol all around connection plate per AWS D1.1.',
          jobNumber: '113980',
          squad: 'Precision Engineering',
          category: 'Erection Drawings',
          status: 'Fixed',
          uploadedBy: 'Sarah Wilson',
          dateReported: '2024-01-12',
          resolutionDate: '2024-01-14',
          reviewHistory: [
            {
              reviewerName: 'Quality Team',
              approved: true,
              notes: 'Weld symbol correctly applied, matches structural requirements',
              date: '2024-01-14',
              time: '3:45 PM',
              iteration: 1
            }
          ],
          lastStatusChange: '2024-01-14T15:45:00Z'
        },
        {
          id: 'DIT-2024-005',
          description: 'Elevation view conflicts with plan view - beam elevation shows 45\'-6" but plan shows 45\'-8". Corrected elevation to 45\'-6" per field measurements.',
          jobNumber: '114520',
          squad: 'Basuraj',
          category: 'Shop Drawings',
          status: 'Needs Rework',
          uploadedBy: 'Mike Johnson',
          dateReported: '2024-01-10',
          resolutionDate: null,
          reviewHistory: [
            {
              reviewerName: 'Quality Team',
              approved: false,
              notes: 'Need to verify with field survey data before finalizing',
              date: '2024-01-13',
              time: '11:20 AM',
              iteration: 1
            }
          ],
          lastStatusChange: '2024-01-13T11:20:00Z'
        },
        {
          id: 'DIT-2024-006',
          description: 'Material specification unclear - need to clarify if HSS is A500 Grade B or Grade C. Client confirmed existing specification is correct per project requirements. No change needed.',
          jobNumber: '115100',
          squad: 'Manohar',
          category: 'Erection Drawings',
          status: 'Cannot Change',
          uploadedBy: 'David Chen',
          dateReported: '2024-01-18',
          resolutionDate: null,
          reviewHistory: [],
          lastStatusChange: '2024-01-19T16:30:00Z'
        },
        {
          id: 'DIT-2024-007',
          description: 'Connection detail dimensions incorrect on sheet 5 - beam-to-column connection shows 6" but should be 8" per structural drawings. RESOLUTION: Updated connection detail to reflect correct 8" dimension and verified with structural engineer.',
          jobNumber: '114520',
          squad: 'Jerry Dubose',
          category: 'Shop Drawings',
          status: 'Fixed',
          uploadedBy: 'Alex Martinez',
          dateReported: '2024-01-08',
          resolutionDate: '2024-01-12',
          reviewHistory: [
            {
              reviewerName: 'Quality Team',
              approved: true,
              notes: 'Connection detail updated correctly, approved for final release',
              date: '2024-01-12',
              time: '4:15 PM',
              iteration: 1
            }
          ],
          lastStatusChange: '2024-01-12T16:15:00Z'
        }
      ];
      setIssues(sampleIssues);
    };
    
    loadIssues();
    
    // Subscribe to real-time changes
    const subscription = issueService.subscribeToChanges((payload) => {
      console.log('Real-time update:', payload);
      if (payload.eventType === 'DELETE') {
        setIssues(prev => prev.filter(issue => issue.id !== payload.old.id));
      } else if (payload.eventType === 'INSERT') {
        loadIssues();  // Reload to get the complete issue with relations
      } else if (payload.eventType === 'UPDATE') {
        loadIssues();  // Reload to get the updated issue
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [user]);  // Reload when user changes

  // Enhanced email parsing with preview
  const handleParseEmail = () => {
    const result = parseEmailContent(emailContent, selectedJob);
    if (result.errors.length > 0) {
      alert('Parsing warnings:\\n' + result.errors.join('\\n'));
    }
    // Add squad and uploadedBy to parsed issues
    const issuesWithMetadata = result.issues.map(issue => ({
      ...issue,
      squad: selectedSquad || '',
      uploadedBy: user?.email || 'Unknown'
    }));
    setParsePreview({ ...result, issues: issuesWithMetadata });
  };

  const confirmParsedIssues = async () => {
    if (parsePreview && parsePreview.issues.length > 0) {
      try {
        // Create all issues in a single batch
        const createdIssues = await issueService.createBatch(parsePreview.issues);
        
        // Add issues to local state with the returned IDs from database
        setIssues(prevIssues => [...prevIssues, ...createdIssues]);
        setEmailContent('');
        setSelectedJob('');
        setParsePreview(null);
        setShowAddModal(false);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error creating issues:', error);
        }
        alert('Failed to create issues. Please try again.');
      }
    }
  };

  // Edit issue functionality
  const handleEditIssue = (issue) => {
    setEditingIssue({ ...issue });
    setShowIssueModal(false);  // Close the issue details modal
    setShowEditModal(true);
  };

  const saveEditedIssue = async () => {
    try {
      // Update issue in Supabase
      await issueService.update(editingIssue.id, editingIssue);
      
      // Update local state
      setIssues(prevIssues =>
        prevIssues.map(issue =>
          issue.id === editingIssue.id ? editingIssue : issue
        )
      );
      setShowEditModal(false);
      setEditingIssue(null);
      if (selectedIssue?.id === editingIssue.id) {
        setSelectedIssue(editingIssue);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating issue:', error);
      }
      alert('Failed to update issue. Please try again.');
    }
  };

  // Delete issue functionality
  const handleDeleteIssue = (issue) => {
    setIssueToDelete(issue);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (issueToDelete) {
      try {
        console.log('Attempting to delete issue:', issueToDelete);
        // Delete issue from Supabase
        await issueService.delete(issueToDelete.id);
        console.log('Delete successful, updating local state');
        
        // Remove issue from local state
        setIssues(prevIssues => prevIssues.filter(issue => issue.id !== issueToDelete.id));
        setShowDeleteConfirm(false);
        setIssueToDelete(null);
        setShowIssueModal(false);
        setSelectedIssue(null);
      } catch (error) {
        console.error('Error deleting issue - full error:', error);
        alert(`Failed to delete issue: ${error.message}`);
      }
    }
  };

  // Bulk actions
  const toggleIssueSelection = (issueId) => {
    setSelectedIssues(prev =>
      prev.includes(issueId)
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    );
  };

  const selectAllInBucket = (bucketStatus) => {
    const bucketIssues = issues.filter(issue => issue.status === bucketStatus);
    const bucketIds = bucketIssues.map(issue => issue.id);
    setSelectedIssues(prev => [...new Set([...prev, ...bucketIds])]);
  };

  const bulkUpdateStatus = async (newStatus) => {
    try {
      console.log('Bulk updating status for issues:', selectedIssues, 'to:', newStatus);
      // Update issues in Supabase
      await issueService.bulkUpdateStatus(selectedIssues, newStatus);
      console.log('Bulk update successful');
      
      // Update issues in local state
      setIssues(prevIssues =>
        prevIssues.map(issue =>
          selectedIssues.includes(issue.id)
            ? { ...issue, status: newStatus }
            : issue
        )
      );
      setSelectedIssues([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error bulk updating issues:', error);
      alert(`Failed to update issues: ${error.message}`);
    }
  };

  const bulkDelete = async () => {
    if (window.confirm(`Delete ${selectedIssues.length} selected issues?`)) {
      try {
        console.log('Bulk deleting issues:', selectedIssues);
        // Delete issues from Supabase
        await issueService.bulkDelete(selectedIssues);
        console.log('Bulk delete successful');
        
        // Remove issues from local state
        setIssues(prevIssues =>
          prevIssues.filter(issue => !selectedIssues.includes(issue.id))
        );
        setSelectedIssues([]);
        setShowBulkActions(false);
      } catch (error) {
        console.error('Error bulk deleting issues:', error);
        alert(`Failed to delete issues: ${error.message}`);
      }
    }
  };

  // Move issue
  const moveIssue = async (issueId, newStatus) => {
    try {
      const issue = issues.find(i => i.id === issueId);
      const updatedIssue = {
        ...issue,
        status: newStatus,
        resolutionDate: newStatus === 'Fixed' ? new Date().toISOString().split('T')[0] : issue.resolutionDate,
        lastStatusChange: new Date().toISOString()
      };
      
      // Update issue in Supabase
      await issueService.update(issueId, updatedIssue);
      
      // Update issue in local state
      setIssues(prevIssues =>
        prevIssues.map(issue =>
          issue.id === issueId ? updatedIssue : issue
        )
      );
    } catch (error) {
      console.error('Error moving issue:', error);
      alert('Failed to update issue status. Please try again.');
    }
  };

  // Review functionality
  const submitReview = (approved, notes) => {
    if (!reviewingIssue) return;

    try {
      const reviewEntry = {
        reviewerName: 'Quality Team',
        approved: approved,
        notes: notes,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        iteration: (reviewingIssue.reviewHistory?.length || 0) + 1
      };

      const newStatus = approved ? 'Fixed' : 'Needs Rework';
      
      const updatedIssue = {
        ...reviewingIssue,
        status: newStatus,
        resolutionDate: approved ? new Date().toISOString().split('T')[0] : null,
        lastStatusChange: new Date().toISOString(),
        reviewHistory: [...(reviewingIssue.reviewHistory || []), reviewEntry]
      };

      // Update local state (localStorage auto-save will handle persistence)
      setIssues(prevIssues =>
        prevIssues.map(issue =>
          issue.id === reviewingIssue.id ? updatedIssue : issue
        )
      );

      setShowReviewModal(false);
      setReviewingIssue(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  // Add note function
  const addNote = () => {
    if (!newNoteContent.trim() || !selectedIssue) return;

    try {
      const newNote = {
        id: Math.max(0, ...(selectedIssue.notes || []).map(n => n.id)) + 1,
        content: newNoteContent.trim(),
        timestamp: new Date().toISOString(),
        author: 'Current User' // You can replace this with actual user data
      };

      const updatedIssue = {
        ...selectedIssue,
        notes: [...(selectedIssue.notes || []), newNote]
      };

      // Update local state
      setIssues(prevIssues =>
        prevIssues.map(issue =>
          issue.id === selectedIssue.id ? updatedIssue : issue
        )
      );

      // Update selectedIssue to reflect the change in the modal
      setSelectedIssue(updatedIssue);
      setNewNoteContent('');
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note. Please try again.');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, issue) => {
    setDraggedIssue(issue);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, bucketStatus) => {
    e.preventDefault();
    if (draggedIssue && draggedIssue.status !== bucketStatus) {
      moveIssue(draggedIssue.id, bucketStatus);
    }
    setDraggedIssue(null);
  };

  // Filtering and sorting
  const getFilteredIssues = () => {
    let filtered = issues.filter(issue => {
      const matchesSearch = 
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.jobNumber.includes(searchTerm) ||
        issue.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesJob = filterJob === 'All' || issue.jobNumber === filterJob;
      const matchesCategory = filterCategory === 'All' || issue.category === filterCategory;
      const matchesStatus = filterStatus === 'All' || issue.status === filterStatus;
      const matchesSquad = filterSquad === 'All' || issue.squad === filterSquad;

      return matchesSearch && matchesJob && matchesCategory && matchesStatus && matchesSquad;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.dateReported) - new Date(b.dateReported);
          break;
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const getIssuesForBucket = (bucketStatus) => {
    return getFilteredIssues().filter(issue => issue.status === bucketStatus);
  };

  // Statistics
  const getStatistics = () => {
    const total = issues.length;
    const byStatus = buckets.reduce((acc, bucket) => {
      acc[bucket.status] = issues.filter(i => i.status === bucket.status).length;
      return acc;
    }, {});
    return { total, byStatus };
  };

  const stats = getStatistics();

  // Utility functions

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Erection Drawings': return '🏗️';
      case 'Shipper': return '📦';
      case 'Shop Drawings': return '⚙️';
      default: return '📄';
    }
  };

  const uniqueJobs = [...new Set(issues.map(issue => issue.jobNumber))];
  const categories = ['All', 'Erection Drawings', 'Shipper', 'Shop Drawings'];

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getWeekDays = (date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getIssuesForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return issues.filter(issue => {
      return issue.dateReported === dateStr || 
             issue.resolutionDate === dateStr ||
             issue.dueDate === dateStr;
    });
  };

  const getStatusBreakdownForDate = (date) => {
    if (!date) return {};
    const dayIssues = getIssuesForDate(date);
    
    const breakdown = {
      'Fixed': 0,
      'In Progress': 0,
      'Under Review': 0,
      'Needs Rework': 0,
      'Cannot Change': 0,
      'New': 0
    };
    
    dayIssues.forEach(issue => {
      if (breakdown.hasOwnProperty(issue.status)) {
        breakdown[issue.status]++;
      }
    });
    
    return breakdown;
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };


  const navigateCalendar = (direction) => {
    const newDate = new Date(calendarDate);
    if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else {
      newDate.setDate(newDate.getDate() + (direction * 7));
    }
    setCalendarDate(newDate);
  };

  // Handle KPI card click
  const handleKPIClick = (filterType, title) => {
    setSelectedKPIFilter(filterType);
    setKpiModalTitle(title);
    setShowKPIModal(true);
  };

  // Get filtered issues based on KPI selection
  const getKPIFilteredIssues = () => {
    if (!selectedKPIFilter) return [];
    
    switch(selectedKPIFilter) {
      case 'total':
        return issues;
      case 'inProgress':
        return issues.filter(issue => issue.status === 'In Progress');
      case 'underReview':
        return issues.filter(issue => issue.status === 'Under Review');
      case 'needsRework':
        return issues.filter(issue => issue.status === 'Needs Rework');
      case 'fixed':
        return issues.filter(issue => issue.status === 'Fixed');
      case 'cannotChange':
        return issues.filter(issue => issue.status === 'Cannot Change');
      default:
        return [];
    }
  };

  // KPI Calculations
  const calculateKPIs = () => {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const thisWeekIssues = issues.filter(issue => 
      new Date(issue.dateReported) >= oneWeekAgo
    );
    
    const inProgressIssues = issues.filter(issue => issue.status === 'In Progress');
    const underReviewIssues = issues.filter(issue => issue.status === 'Under Review');
    const needsReworkIssues = issues.filter(issue => issue.status === 'Needs Rework');
    const fixedIssues = issues.filter(issue => issue.status === 'Fixed');
    const cannotChangeIssues = issues.filter(issue => issue.status === 'Cannot Change');

    return {
      totalIssues: issues.length,
      newThisWeek: thisWeekIssues.length,
      inProgressCount: inProgressIssues.length,
      underReviewCount: underReviewIssues.length,
      needsReworkCount: needsReworkIssues.length,
      fixedCount: fixedIssues.length,
      cannotChangeCount: cannotChangeIssues.length
    };
  };

  return (
    <div className="enhanced-app min-h-screen bg-gray-100 flex flex-col">
      {/* KPI Section */}
      {showKPIs && (() => {
        const kpis = calculateKPIs();
        return (
          <div className="bg-white border-b border-gray-200">
            {/* KPI Header with Hide Button */}
            <div className="flex justify-end px-6 pt-2" style={{backgroundColor: '#f8f9fa'}}>
              <button
                onClick={() => setShowKPIs(!showKPIs)}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors bg-white shadow-sm border border-gray-200"
              >
                <BarChart3 className="w-3 h-3" />
                Hide KPIs
                <ChevronUp className="w-2 h-2" />
              </button>
            </div>
            
            <div className="kpi-grid" style={{paddingTop: '8px'}}>
                {/* Total Issues */}
                <div className="kpi-card-enhanced kpi-clickable" onClick={() => handleKPIClick('total', 'Total Issues')}>
                  <div className="flex-col">
                    <div className="kpi-label">
                      TOTAL ISSUES
                    </div>
                    <div className="kpi-value">
                      {kpis.totalIssues}
                    </div>
                    <div className="kpi-description">
                      All tracked items
                    </div>
                  </div>
                </div>

                {/* In Progress */}
                <div className="kpi-card-enhanced kpi-clickable" onClick={() => handleKPIClick('inProgress', 'In Progress')}>
                  <div className="flex-col">
                    <div className="kpi-label">
                      IN PROGRESS
                    </div>
                    <div className="kpi-value">
                      {kpis.inProgressCount}
                    </div>
                    <div className="kpi-description">
                      Being worked on
                    </div>
                  </div>
                </div>

                {/* Under Review */}
                <div className="kpi-card-enhanced kpi-clickable" onClick={() => handleKPIClick('underReview', 'Under Review')}>
                  <div className="flex-col">
                    <div className="kpi-label">
                      UNDER REVIEW
                    </div>
                    <div className="kpi-value">
                      {kpis.underReviewCount}
                    </div>
                    <div className="kpi-description">
                      Awaiting approval
                    </div>
                  </div>
                </div>

                {/* Needs Rework */}
                <div className="kpi-card-enhanced kpi-clickable" onClick={() => handleKPIClick('needsRework', 'Needs Rework')}>
                  <div className="flex-col">
                    <div className="kpi-label">
                      NEEDS REWORK
                    </div>
                    <div className="kpi-value">
                      {kpis.needsReworkCount}
                    </div>
                    <div className="kpi-description">
                      Requires changes
                    </div>
                  </div>
                </div>

                {/* Fixed */}
                <div className="kpi-card-enhanced kpi-clickable" onClick={() => handleKPIClick('fixed', 'Fixed')}>
                  <div className="flex-col">
                    <div className="kpi-label">
                      FIXED
                    </div>
                    <div className="kpi-value">
                      {kpis.fixedCount}
                    </div>
                    <div className="kpi-description">
                      Resolved issues
                    </div>
                  </div>
                </div>

                {/* Cannot Change */}
                <div className="kpi-card-enhanced kpi-clickable" onClick={() => handleKPIClick('cannotChange', 'Cannot Change')}>
                  <div className="flex-col">
                    <div className="kpi-label">
                      CANNOT CHANGE
                    </div>
                    <div className="kpi-value">
                      {kpis.cannotChangeCount}
                    </div>
                    <div className="kpi-description">
                      No action possible
                    </div>
                  </div>
                </div>
          </div>
          </div>
        );
      })()}
      
      {/* Show KPIs Button - When hidden */}
      {!showKPIs && (
        <div className="bg-gray-50 border-b border-gray-200 p-2 flex justify-end">
          <button
            onClick={() => setShowKPIs(!showKPIs)}
            className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            <BarChart3 className="w-3 h-3" />
            Show KPIs
            <ChevronDown className="w-2 h-2" />
          </button>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">          
          {showFilters && (
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center flex-1">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search issues..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filterJob}
                onChange={(e) => setFilterJob(e.target.value)}
              >
                <option value="All">All Jobs</option>
                {uniqueJobs.map(job => (
                  <option key={job} value={job}>Job #{job}</option>
                ))}
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                {buckets.map(bucket => (
                  <option key={bucket.id} value={bucket.status}>{bucket.title}</option>
                ))}
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filterSquad}
                onChange={(e) => setFilterSquad(e.target.value)}
              >
                <option value="All">All Squads</option>
                {squadOptions.map(squad => (
                  <option key={squad} value={squad}>{squad}</option>
                ))}
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Sort by Date</option>
                <option value="id">Sort by ID</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors bg-white shadow-sm border border-gray-200"
              >
                <Filter className="w-3 h-3" />
                {showFilters ? 'Hide' : 'Show'} Filters
                {showFilters ? <ChevronUp className="w-2 h-2" /> : <ChevronDown className="w-2 h-2" />}
              </button>
            </div>
          )}
          
          {!showFilters && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Filters collapsed</span>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors bg-white shadow-sm border border-gray-200"
              >
                <Filter className="w-3 h-3" />
                {showFilters ? 'Hide' : 'Show'} Filters
                {showFilters ? <ChevronUp className="w-2 h-2" /> : <ChevronDown className="w-2 h-2" />}
              </button>
            </div>
          )}
      </div>

      {/* Selected items actions */}
      {selectedIssues.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedIssues.length} issue{selectedIssues.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => bulkUpdateStatus('In Progress')}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
              >
                Move to In Progress
              </button>
              <button
                onClick={() => bulkUpdateStatus('Fixed')}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                Mark as Fixed
              </button>
              <button
                onClick={bulkDelete}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedIssues([])}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

      {/* Action Buttons */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode('board')}
              className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                viewMode === 'board' ? 'bg-white shadow-sm border border-gray-200' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Tag className="w-3 h-3" />
              Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                viewMode === 'list' ? 'bg-white shadow-sm border border-gray-200' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <List className="w-3 h-3" />
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                viewMode === 'calendar' ? 'bg-white shadow-sm border border-gray-200' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <CalendarDays className="w-3 h-3" />
              Calendar
            </button>
            
            {viewMode === 'board' && (
              <button
                onClick={() => setCompactView(!compactView)}
                className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                  compactView ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Eye className="w-3 h-3" />
                {compactView ? 'Detailed' : 'Compact'}
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded flex items-center gap-1 hover:bg-blue-700"
            >
              <Plus className="w-3 h-3" />
              Add Issue(s)
            </button>
            <div className="relative">
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded flex items-center gap-1 hover:bg-gray-200"
              >
                <Download className="w-3 h-3" />
                Export
                <ChevronDown className="w-2 h-2" />
              </button>
              {showBulkActions && (
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <button
                    onClick={() => exportToCSV(issues)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FileDown className="w-4 h-4" />
                    Export to CSV
                  </button>
                  <button
                    onClick={() => exportToJSON(issues)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    Export to JSON
                  </button>
                  <button
                    onClick={() => printIssues(issues)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Board/List/Calendar View */}
      {viewMode === 'board' ? (
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex gap-6 min-h-full w-full">
            {buckets.map((bucket) => {
              const bucketIssues = getIssuesForBucket(bucket.status);

              return (
                <div
                  key={bucket.id}
                  className="w-80 xl:w-80 2xl:w-80 bg-white rounded-lg shadow-lg border-2 border-gray-300 flex flex-col hover:shadow-xl transition-shadow duration-200"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, bucket.status)}
                >
                  {/* Bucket Header */}
                  <div className="p-4 border-b-2 border-gray-200 bg-white rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${bucket.color}`}></div>
                        <h3 className="font-bold text-gray-900 text-lg">{bucket.title}</h3>
                        <span className="bg-gray-700 text-white px-2.5 py-0.5 rounded-md text-sm font-bold">
                          {bucketIssues.length}
                        </span>
                      </div>
                      <button
                        onClick={() => selectAllInBucket(bucket.status)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Select All
                      </button>
                    </div>
                  </div>

                  {/* Issues */}
                  <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                    {bucketIssues.map((issue) => (
                      <div
                        key={issue.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, issue)}
                        onClick={() => {
                          setSelectedIssue(issue);
                          setShowIssueModal(true);
                        }}
                        className={`
                          card card-clickable border border-gray-200
                          ${
                            issue.status === 'New' ? 'border-l-blue-500 bg-white' :
                            issue.status === 'In Progress' ? 'border-l-yellow-500 bg-white' :
                            issue.status === 'Under Review' ? 'border-l-purple-500 bg-white' :
                            issue.status === 'Needs Rework' ? 'border-l-orange-500 bg-white' :
                            issue.status === 'Fixed' ? 'border-l-green-500 bg-white' :
                            'border-l-red-500 bg-white'
                          }
                          ${selectedIssues.includes(issue.id) ? 'ring-2 ring-blue-600 ring-offset-1' : ''}
                          transition-shadow duration-200 hover:shadow-xl
                        `}
                      >
                        {compactView ? (
                          // Compact Card View
                          <div className="p-2">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={selectedIssues.includes(issue.id)}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    toggleIssueSelection(issue.id);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-3 h-3"
                                />
                                <span className="font-mono text-xs font-bold text-gray-900">{issue.id}</span>
                              </div>
                              {issue.squad && (
                                <span className="text-xs text-gray-500">{issue.squad}</span>
                              )}
                            </div>
                            <p className="text-gray-800 text-xs mb-1 line-clamp-2">{issue.description}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Job #{issue.jobNumber}</span>
                              <span>{issue.category}</span>
                            </div>
                          </div>
                        ) : (
                          // Full Card View
                          <div className="p-4">
                          {/* Issue Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedIssues.includes(issue.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleIssueSelection(issue.id);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4"
                              />
                              <span className="text-lg">{getCategoryIcon(issue.category)}</span>
                              <span className="font-mono text-sm font-bold text-gray-900">{issue.id}</span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditIssue(issue);
                                }}
                                className="text-gray-400 hover:text-gray-600 p-1"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteIssue(issue);
                                }}
                                className="text-gray-400 hover:text-red-600 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Issue Content */}
                          <p className="text-gray-800 text-sm font-medium mb-3 line-clamp-3">{issue.description}</p>

                          {/* Issue Meta */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                              <Tag className="w-3 h-3" />
                              <span>Job #{issue.jobNumber}</span>
                              <span>•</span>
                              <span>{issue.category}</span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                              <User className="w-3 h-3" />
                              <span>Uploaded by: {issue.uploadedBy}</span>
                            </div>

                            {issue.squad && (
                              <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                                <Tag className="w-3 h-3" />
                                <span>Squad: {issue.squad}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                              <Calendar className="w-3 h-3" />
                              <span>{issue.dateReported}</span>
                            </div>
                          </div>

                          {/* Notes Section */}
                          {issue.notes && issue.notes.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                <MessageSquare className="w-3 h-3" />
                                <span>{issue.notes.length} note{issue.notes.length > 1 ? 's' : ''}</span>
                              </div>
                              <div className="space-y-1">
                                {issue.notes.slice(-2).map((note) => (
                                  <div key={note.id} className="text-xs bg-gray-50 p-2 rounded">
                                    <p className="text-gray-800 mb-1">{note.content}</p>
                                    <div className="text-gray-500 text-xs">
                                      {note.author} • {new Date(note.timestamp).toLocaleDateString()}
                                    </div>
                                  </div>
                                ))}
                                {issue.notes.length > 2 && (
                                  <div className="text-xs text-gray-500 text-center">
                                    +{issue.notes.length - 2} more notes
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Review Button for Under Review items */}
                          {issue.status === 'Under Review' && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReviewingIssue(issue);
                                  setShowReviewModal(true);
                                }}
                                className="w-full bg-purple-600 text-white text-xs py-2 px-3 rounded hover:bg-purple-700 flex items-center justify-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Review Fix
                              </button>
                            </div>
                          )}

                          {/* Rework indicator */}
                          {issue.status === 'Needs Rework' && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center gap-1 text-orange-600 text-xs">
                                <RefreshCw className="w-3 h-3" />
                                <span>Iteration #{(issue.reviewHistory?.length || 0)}</span>
                              </div>
                            </div>
                          )}

                          {/* Review history indicator */}
                          {issue.reviewHistory && issue.reviewHistory.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{issue.reviewHistory.length} review{issue.reviewHistory.length !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                          </div>
                        )}
                      </div>
                    ))}

                    {bucketIssues.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No issues in this bucket</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : viewMode === 'list' ? (
        // List View
        <div className="flex-1 p-4">
          <div className="bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIssues(getFilteredIssues().map(i => i.id));
                        } else {
                          setSelectedIssues([]);
                        }
                      }}
                      checked={selectedIssues.length === getFilteredIssues().length && getFilteredIssues().length > 0}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Squad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredIssues().map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIssues.includes(issue.id)}
                        onChange={() => toggleIssueSelection(issue.id)}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{issue.id}</td>
                    <td className="px-4 py-3 text-sm">{issue.jobNumber}</td>
                    <td className="px-4 py-3 text-sm">{issue.squad || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="mr-1">{getCategoryIcon(issue.category)}</span>
                      {issue.category}
                    </td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate">{issue.description}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        issue.status === 'Fixed' ? 'bg-green-100 text-green-800' :
                        issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        issue.status === 'Cannot Change' ? 'bg-red-100 text-red-800' :
                        issue.status === 'Under Review' ? 'bg-purple-100 text-purple-800' :
                        issue.status === 'Needs Rework' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{issue.uploadedBy || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{issue.dateReported}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setSelectedIssue(issue);
                            setShowIssueModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditIssue(issue)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteIssue(issue)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : viewMode === 'calendar' ? (
        // Calendar View
        <div className="flex-1 p-4 bg-gray-50">
          <div className="bg-white rounded-lg shadow h-full flex flex-col">
            {/* Calendar Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateCalendar(-1)}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  {formatMonthYear(calendarDate)}
                </h2>
                <button
                  onClick={() => navigateCalendar(1)}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 flex flex-col border border-gray-300 bg-white">
              {/* Day Headers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }} className="bg-gray-50 border-b-2 border-gray-300">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                  <div 
                    key={day} 
                    className="p-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-300 last:border-r-0"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Body */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', flex: '1' }}>
                {getDaysInMonth(calendarDate).map((date, index) => {
                  const statusBreakdown = date ? getStatusBreakdownForDate(date) : {};
                  const dayIssues = date ? getIssuesForDate(date) : [];
                  const totalIssues = dayIssues.length;
                  const isToday = date && date.toDateString() === new Date().toDateString();
                  const isCurrentMonth = date && date.getMonth() === calendarDate.getMonth();
                  
                  return (
                    <div
                      key={index}
                      className={`border-r border-b border-gray-300 p-2 flex flex-col cursor-pointer transition-colors ${
                        !date ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                      } ${isToday ? 'bg-blue-50 border-2 border-blue-500' : ''}`}
                      style={{ minHeight: '120px' }}
                      onClick={() => {
                        if (date && totalIssues > 0) {
                          setSelectedCalendarDate(date);
                          setShowCalendarDayModal(true);
                        }
                      }}
                    >
                      {date && (
                        <>
                          <div className={`text-sm font-semibold mb-2 flex justify-between items-center ${
                            isToday ? 'text-blue-600' : 
                            !isCurrentMonth ? 'text-gray-400' : 'text-gray-800'
                          }`}>
                            <span>{date.getDate()}</span>
                            {totalIssues > 0 && (
                              <span className="text-xs bg-gray-600 text-white px-1 rounded-full">
                                {totalIssues}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex-1 flex flex-col gap-1 text-xs">
                            {statusBreakdown['Fixed'] > 0 && (
                              <div className="flex justify-between items-center bg-green-100 text-green-800 px-2 py-1 rounded">
                                <span>Fixed</span>
                                <span className="font-bold">{statusBreakdown['Fixed']}</span>
                              </div>
                            )}
                            {statusBreakdown['In Progress'] > 0 && (
                              <div className="flex justify-between items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                <span>In Progress</span>
                                <span className="font-bold">{statusBreakdown['In Progress']}</span>
                              </div>
                            )}
                            {statusBreakdown['Under Review'] > 0 && (
                              <div className="flex justify-between items-center bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                <span>Review</span>
                                <span className="font-bold">{statusBreakdown['Under Review']}</span>
                              </div>
                            )}
                            {statusBreakdown['Needs Rework'] > 0 && (
                              <div className="flex justify-between items-center bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                <span>Rework</span>
                                <span className="font-bold">{statusBreakdown['Needs Rework']}</span>
                              </div>
                            )}
                            {statusBreakdown['Cannot Change'] > 0 && (
                              <div className="flex justify-between items-center bg-red-100 text-red-800 px-2 py-1 rounded">
                                <span>No Change</span>
                                <span className="font-bold">{statusBreakdown['Cannot Change']}</span>
                              </div>
                            )}
                            {statusBreakdown['New'] > 0 && (
                              <div className="flex justify-between items-center bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                <span>New</span>
                                <span className="font-bold">{statusBreakdown['New']}</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Add Issues Modal with Preview */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Parse Issues from Email</h2>
              <p className="text-gray-600 mt-1">Paste email content to automatically extract and categorize issues</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Number (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 113980"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Squad (optional)
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedSquad}
                    onChange={(e) => setSelectedSquad(e.target.value)}
                  >
                    <option value="">Select Squad...</option>
                    {squadOptions.map(squad => (
                      <option key={squad} value={squad}>{squad}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Content
                </label>
                <textarea
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Paste the email content here..."
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                />
              </div>

              {/* Preview parsed issues */}
              {parsePreview && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Preview: {parsePreview.issues.length} issues found</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {parsePreview.issues.map((issue, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                        <span className="font-mono text-blue-600">{issue.id}</span>
                        <span className="text-gray-600">|</span>
                        <span className="flex-1 truncate">{issue.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setParsePreview(null);
                  setEmailContent('');
                  setSelectedJob('');
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              {!parsePreview ? (
                <button
                  onClick={handleParseEmail}
                  disabled={!emailContent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Parse Email
                </button>
              ) : (
                <button
                  onClick={confirmParsedIssues}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add {parsePreview.issues.length} Issues
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Issue Modal */}
      {showEditModal && editingIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Edit Issue {editingIssue.id}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingIssue.description}
                  onChange={(e) => setEditingIssue({ ...editingIssue, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={editingIssue.status}
                    onChange={(e) => setEditingIssue({ ...editingIssue, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {buckets.map(bucket => (
                      <option key={bucket.id} value={bucket.status}>{bucket.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Number</label>
                  <input
                    type="text"
                    value={editingIssue.jobNumber}
                    onChange={(e) => setEditingIssue({ ...editingIssue, jobNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Squad</label>
                  <select
                    value={editingIssue.squad || ''}
                    onChange={(e) => setEditingIssue({ ...editingIssue, squad: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Squad...</option>
                    {squadOptions.map(squad => (
                      <option key={squad} value={squad}>{squad}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingIssue(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEditedIssue}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete issue {issueToDelete?.id}? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setIssueToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Issue Detail Modal */}
      {showIssueModal && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCategoryIcon(selectedIssue.category)}</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedIssue.id}</h2>
                    <p className="text-gray-600">Job #{selectedIssue.jobNumber} • {selectedIssue.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditIssue(selectedIssue)}
                    className="text-gray-600 hover:text-gray-800 p-2"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteIssue(selectedIssue)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowIssueModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-2"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-900">{selectedIssue.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedIssue.status}
                    onChange={(e) => {
                      moveIssue(selectedIssue.id, e.target.value);
                      setSelectedIssue({ ...selectedIssue, status: e.target.value });
                    }}
                  >
                    {buckets.map(bucket => (
                      <option key={bucket.id} value={bucket.status}>{bucket.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded By</h3>
                  <p className="text-gray-900">{selectedIssue.uploadedBy}</p>
                </div>
                {selectedIssue.squad && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Squad</h3>
                    <p className="text-gray-900">{selectedIssue.squad}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Date Reported</h3>
                  <p className="text-gray-900">{selectedIssue.dateReported}</p>
                </div>
              </div>

              {selectedIssue.resolutionDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Resolution Date</h3>
                  <p className="text-gray-900">{selectedIssue.resolutionDate}</p>
                </div>
              )}

              {/* Notes Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Notes</h3>
                
                {/* Add Note */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a note..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newNoteContent.trim()) {
                          addNote();
                        }
                      }}
                    />
                    <button
                      onClick={addNote}
                      disabled={!newNoteContent.trim()}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Notes List */}
                {selectedIssue.notes && selectedIssue.notes.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedIssue.notes.map((note) => (
                      <div key={note.id} className="border rounded-lg p-3 bg-gray-50">
                        <p className="text-sm text-gray-900 mb-2">{note.content}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{note.author}</span>
                          <span>{new Date(note.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No notes yet.</p>
                )}
              </div>

              {/* Review History */}
              {selectedIssue.reviewHistory && selectedIssue.reviewHistory.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Review History</h3>
                  <div className="space-y-3">
                    {selectedIssue.reviewHistory.map((review, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {review.approved ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="font-medium text-sm">
                              Iteration #{review.iteration} - {review.approved ? 'Approved' : 'Rejected'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">{review.date} {review.time}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{review.notes}</p>
                        <p className="text-xs text-gray-500">Reviewed by: {review.reviewerName}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewingIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Review Fix</h2>
                  <p className="text-gray-600">{reviewingIssue.id} - Job #{reviewingIssue.jobNumber}</p>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Issue Description</h3>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{reviewingIssue.description}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Add your review comments..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => submitReview(false, reviewNotes)}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Reject - Needs Rework
                </button>
                <button
                  onClick={() => submitReview(true, reviewNotes)}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve - Mark Fixed
                </button>
              </div>

              {reviewingIssue.reviewHistory && reviewingIssue.reviewHistory.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Previous Reviews</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {reviewingIssue.reviewHistory.map((review, index) => (
                      <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          {review.approved ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-500" />
                          )}
                          <span className="font-medium">
                            Iteration #{review.iteration} - {review.approved ? 'Approved' : 'Rejected'}
                          </span>
                          <span className="text-xs text-gray-500 ml-auto">{review.date}</span>
                        </div>
                        <p className="text-gray-700">{review.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KPI Detail Modal */}
      {showKPIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{kpiModalTitle}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {getKPIFilteredIssues().length} issue{getKPIFilteredIssues().length !== 1 ? 's' : ''} found
                </p>
              </div>
              <button
                onClick={() => setShowKPIModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              {getKPIFilteredIssues().length > 0 ? (
                <div className="overflow-auto max-h-full">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-white">
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">ID</th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Description</th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Job #</th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Squad</th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Category</th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getKPIFilteredIssues().map((issue, index) => (
                        <tr key={issue.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-4 py-3 text-sm font-mono text-blue-600">{issue.id}</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm max-w-xs truncate">{issue.description}</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              issue.status === 'Fixed' ? 'bg-green-100 text-green-800' :
                              issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                              issue.status === 'Cannot Change' ? 'bg-red-100 text-red-800' :
                              issue.status === 'Under Review' ? 'bg-purple-100 text-purple-800' :
                              issue.status === 'Needs Rework' ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {issue.status}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">{issue.jobNumber}</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">{issue.squad}</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">{issue.category}</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-500">{issue.dateReported}</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setSelectedIssue(issue);
                                  setShowKPIModal(false);
                                  setShowIssueModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingIssue({ ...issue });
                                  setShowKPIModal(false);
                                  setShowEditModal(true);
                                }}
                                className="text-gray-600 hover:text-gray-800 p-1"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No issues found for this category</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Calendar Day Detail Modal */}
      {showCalendarDayModal && selectedCalendarDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-auto my-8" style={{ maxHeight: '80vh' }}>
            {/* Fixed Header */}
            <div className="sticky top-0 bg-white rounded-t-lg border-b border-gray-200 p-4 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedCalendarDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {getIssuesForDate(selectedCalendarDate).length} issue{getIssuesForDate(selectedCalendarDate).length !== 1 ? 's' : ''} on this date
                  </p>
                </div>
                <button
                  onClick={() => setShowCalendarDayModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 100px)' }}>
              {(() => {
                const dayIssues = getIssuesForDate(selectedCalendarDate);
                const statusBreakdown = getStatusBreakdownForDate(selectedCalendarDate);
                
                return (
                  <div className="space-y-4">
                    {/* Status Summary - Fixed Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                      {Object.entries(statusBreakdown).map(([status, count]) => (
                        count > 0 && (
                          <div key={status} className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className={`text-xl font-bold ${
                              status === 'Fixed' ? 'text-green-600' :
                              status === 'In Progress' ? 'text-yellow-600' :
                              status === 'Under Review' ? 'text-purple-600' :
                              status === 'Needs Rework' ? 'text-orange-600' :
                              status === 'Cannot Change' ? 'text-red-600' :
                              'text-blue-600'
                            }`}>
                              {count}
                            </div>
                            <div className="text-xs text-gray-600 font-medium mt-1">
                              {status}
                            </div>
                          </div>
                        )
                      ))}
                    </div>

                    {/* Issue List by Status */}
                    <div className="space-y-4">
                      {Object.entries(statusBreakdown).map(([status, count]) => {
                        if (count === 0) return null;
                        
                        const statusIssues = dayIssues.filter(issue => issue.status === status);
                        
                        return (
                          <div key={status} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className={`px-4 py-3 font-medium text-white ${
                              status === 'Fixed' ? 'bg-green-600' :
                              status === 'In Progress' ? 'bg-yellow-600' :
                              status === 'Under Review' ? 'bg-purple-600' :
                              status === 'Needs Rework' ? 'bg-orange-600' :
                              status === 'Cannot Change' ? 'bg-red-600' :
                              'bg-blue-600'
                            }`}>
                              {status} ({count})
                            </div>
                            <div className="divide-y divide-gray-200">
                              {statusIssues.map((issue) => (
                                <div key={issue.id} className="px-4 py-3 hover:bg-gray-50 flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-blue-600">{issue.id}</div>
                                    <div className="text-sm text-gray-600 mt-1 break-words">
                                      {issue.description}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      Job: {issue.jobNumber} | Squad: {issue.squad} | Category: {issue.category}
                                    </div>
                                  </div>
                                  <div className="flex gap-2 flex-shrink-0">
                                    <button
                                      onClick={() => {
                                        setSelectedIssue(issue);
                                        setShowCalendarDayModal(false);
                                        setShowIssueModal(true);
                                      }}
                                      className="text-blue-600 hover:text-blue-800 p-1"
                                      title="View Details"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingIssue({ ...issue });
                                        setShowCalendarDayModal(false);
                                        setShowEditModal(true);
                                      }}
                                      className="text-gray-600 hover:text-gray-800 p-1"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EnhancedIssuePlannerBoardV2;