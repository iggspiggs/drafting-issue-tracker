import { supabase } from '../supabaseClient';

// Issue CRUD Operations
export const issueService = {
  // Fetch all issues
  async getAll() {
    const { data, error } = await supabase
      .from('issues')
      .select(`
        *,
        issue_notes (
          id,
          content,
          author,
          timestamp
        ),
        issue_reviews (
          id,
          reviewername,
          approved,
          notes,
          reviewdate,
          iterationnumber
        )
      `)
      .order('dateReported', { ascending: false });
    
    if (error) throw error;
    
    // Transform data to match app format
    return data.map(issue => ({
      ...issue,
      // Database now uses camelCase consistently
      displayId: issue.displayId || issue.id, // Use displayId for UI, fallback to id
      dateReported: issue.dateReported,
      resolutionDate: issue.resolutionDate,
      uploadedBy: issue.uploadedBy,
      lastStatusChange: issue.lastStatusChange,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      createdBy: issue.createdBy,
      jobNumber: issue.jobNumber,
      notes: issue.issue_notes?.map(note => ({
        id: note.id,
        content: note.content,
        author: note.author,
        timestamp: note.timestamp
      })) || [],
      reviewHistory: issue.issue_reviews?.map(review => ({
        id: review.id,
        reviewerName: review.reviewerName,
        approved: review.approved,
        notes: review.notes,
        date: review.reviewDate,
        iteration: review.iterationNumber
      })) || []
    }));
  },

  // Create new issue
  async create(issue) {
    const { data: userData } = await supabase.auth.getUser();
    
    const issueToInsert = {
      // Don't pass id - let database generate UUID
      displayId: issue.displayId || null, // Let database auto-generate if null
      jobNumber: issue.jobNumber,
      squad: issue.squad,
      category: issue.category,
      description: issue.description,
      status: issue.status,
      dateReported: issue.dateReported || new Date().toISOString().split('T')[0],
      uploadedBy: issue.uploadedBy,
      createdBy: userData?.user?.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Inserting issue:', issueToInsert); // Debug log
    
    const { data, error } = await supabase
      .from('issues')
      .insert([issueToInsert])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase create error:', error);
      throw error;
    }
    return data;
  },

  // Update existing issue
  async update(id, updates) {
    // Database now uses camelCase
    const dbUpdates = {};
    if (updates.jobNumber !== undefined) dbUpdates.jobNumber = updates.jobNumber;
    if (updates.squad !== undefined) dbUpdates.squad = updates.squad;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.dateReported !== undefined) dbUpdates.dateReported = updates.dateReported;
    if (updates.resolutionDate !== undefined) dbUpdates.resolutionDate = updates.resolutionDate;
    if (updates.uploadedBy !== undefined) dbUpdates.uploadedBy = updates.uploadedBy;
    
    dbUpdates.updatedAt = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('issues')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete issue
  async delete(id) {
    const { error } = await supabase
      .from('issues')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Bulk delete issues
  async bulkDelete(ids) {
    const { error } = await supabase
      .from('issues')
      .delete()
      .in('id', ids);
    
    if (error) throw error;
  },

  // Bulk update status
  async bulkUpdateStatus(ids, newStatus) {
    const { error } = await supabase
      .from('issues')
      .update({ 
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      .in('id', ids);
    
    if (error) throw error;
  },

  // Add note to issue
  async addNote(issueId, note) {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('issue_notes')
      .insert([{
        issueid: issueId,
        content: note.content,
        author: note.author,
        timestamp: new Date().toISOString(),
        createdby: userData?.user?.id
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Add review to issue
  async addReview(issueId, review) {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('issue_reviews')
      .insert([{
        issueid: issueId,
        reviewername: review.reviewerName,
        approved: review.approved,
        notes: review.notes,
        reviewdate: new Date().toISOString(),
        iterationnumber: review.iteration || 1,
        createdby: userData?.user?.id
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Subscribe to real-time updates
  subscribeToChanges(callback) {
    const subscription = supabase
      .channel('issues_channel')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'issues' 
        },
        callback
      )
      .subscribe();
    
    return subscription;
  }
};