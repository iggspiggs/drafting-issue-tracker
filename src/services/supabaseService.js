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
      .order('datereported', { ascending: false });
    
    if (error) throw error;
    
    // Transform data to match app format
    return data.map(issue => ({
      ...issue,
      // Database now uses camelCase consistently
      displayId: issue.displayid || issue.id, // Use displayId for UI, fallback to id
      dateReported: issue.datereported,
      resolutionDate: issue.resolutiondate,
      uploadedBy: issue.uploadedby,
      lastStatusChange: issue.laststatuschange,
      createdAt: issue.createdat,
      updatedAt: issue.updatedat,
      createdBy: issue.createdby,
      jobNumber: issue.jobnumber,
      notes: issue.issue_notes?.map(note => ({
        id: note.id,
        content: note.content,
        author: note.author,
        timestamp: note.timestamp
      })) || [],
      reviewHistory: issue.issue_reviews?.map(review => ({
        id: review.id,
        reviewerName: review.reviewername,
        approved: review.approved,
        notes: review.notes,
        date: review.reviewdate,
        iteration: review.iterationnumber
      })) || []
    }));
  },

  // Create multiple issues in a batch
  async createBatch(issues) {
    const { data: userData } = await supabase.auth.getUser();
    
    // Prepare all issues for batch insert
    const issuesToInsert = issues.map(issue => ({
      displayid: issue.displayId || null,
      jobnumber: issue.jobNumber,
      squad: issue.squad,
      category: issue.category,
      description: issue.description,
      status: issue.status,
      datereported: issue.dateReported || new Date().toISOString().split('T')[0],
      uploadedby: issue.uploadedBy,
      createdby: userData?.user?.id,
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString()
    }));
    
    const { data, error } = await supabase
      .from('issues')
      .insert(issuesToInsert)
      .select();
    
    if (error) {
      console.error('Supabase batch create error:', error);
      throw error;
    }
    
    // Transform returned data to match app format
    return data.map(issue => ({
      ...issue,
      id: issue.id,
      displayId: issue.displayid,
      dateReported: issue.datereported,
      resolutionDate: issue.resolutiondate,
      uploadedBy: issue.uploadedby,
      lastStatusChange: issue.laststatuschange,
      createdAt: issue.createdat,
      updatedAt: issue.updatedat,
      createdBy: issue.createdby,
      jobNumber: issue.jobnumber,
      notes: [],
      reviewHistory: []
    }));
  },

  // Create new issue
  async create(issue) {
    const { data: userData } = await supabase.auth.getUser();
    
    const issueToInsert = {
      // Don't pass id - let database generate UUID
      displayid: issue.displayId || null, // Let database auto-generate if null
      jobnumber: issue.jobNumber,
      squad: issue.squad,
      category: issue.category,
      description: issue.description,
      status: issue.status,
      datereported: issue.dateReported || new Date().toISOString().split('T')[0],
      uploadedby: issue.uploadedBy,
      createdby: userData?.user?.id,
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('issues')
      .insert([issueToInsert])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update existing issue
  async update(id, updates) {
    // Database uses lowercase field names
    const dbUpdates = {};
    if (updates.jobNumber !== undefined) dbUpdates.jobnumber = updates.jobNumber;
    if (updates.squad !== undefined) dbUpdates.squad = updates.squad;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.dateReported !== undefined) dbUpdates.datereported = updates.dateReported;
    if (updates.resolutionDate !== undefined) dbUpdates.resolutiondate = updates.resolutionDate;
    if (updates.uploadedBy !== undefined) dbUpdates.uploadedby = updates.uploadedBy;
    if (updates.lastStatusChange !== undefined) dbUpdates.laststatuschange = updates.lastStatusChange;
    
    dbUpdates.updatedat = new Date().toISOString();
    
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
    // First check if the issue exists
    const { data: existingIssue, error: fetchError } = await supabase
      .from('issues')
      .select('id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      throw new Error('Issue not found');
    }
    
    const { data, error, count } = await supabase
      .from('issues')
      .delete()
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Delete error:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('Delete failed - no rows affected');
    }
    
    return data;
  },

  // Bulk delete issues
  async bulkDelete(ids) {
    const { data, error } = await supabase
      .from('issues')
      .delete()
      .in('id', ids)
      .select();  // Return deleted rows to verify
    
    if (error) {
      console.error('Bulk delete error:', error);
      throw error;
    }
    
    if (!data || data.length !== ids.length) {
      console.warn(`Expected to delete ${ids.length} issues, but deleted ${data?.length || 0}`);
    }
    return data;
  },

  // Bulk update status
  async bulkUpdateStatus(ids, newStatus) {
    const { error } = await supabase
      .from('issues')
      .update({ 
        status: newStatus,
        updatedat: new Date().toISOString()  // lowercase field name
      })
      .in('id', ids);
    
    if (error) {
      console.error('Bulk update error:', error);
      throw error;
    }
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