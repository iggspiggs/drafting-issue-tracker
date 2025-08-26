import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to transform database row to app format
const transformIssueFromDB = (dbRow) => {
  if (!dbRow) return null;
  
  return {
    id: dbRow.id,
    jobNumber: dbRow.job_number,
    category: dbRow.category,
    description: dbRow.description,
    status: dbRow.status,
    dateReported: dbRow.date_reported,
    // Ignore priority from database during transition
    resolutionNotes: dbRow.resolution_notes,
    resolutionDate: dbRow.resolution_date,
    assignee: dbRow.assignee,
    lastStatusChange: dbRow.last_status_change,
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at,
    createdBy: dbRow.created_by,
    reviewHistory: dbRow.issue_reviews || []
  };
};

// Helper function to transform app format to database format
const transformIssueForDB = (issue) => {
  return {
    id: issue.id,
    job_number: issue.jobNumber,
    category: issue.category,
    description: issue.description,
    status: issue.status,
    date_reported: issue.dateReported,
    resolution_notes: issue.resolutionNotes || null,
    resolution_date: issue.resolutionDate || null,
    assignee: issue.assignee || null,
    last_status_change: issue.lastStatusChange || new Date().toISOString(),
  };
};

// Database operations
export const supabaseService = {
  // Get all issues with their review history
  async getAllIssues() {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          issue_reviews (
            id,
            reviewer_name,
            approved,
            notes,
            review_date
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(transformIssueFromDB);
    } catch (error) {
      console.error('Error fetching issues:', error);
      throw error;
    }
  },

  // Create a new issue
  async createIssue(issue) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const issueData = {
        ...transformIssueForDB(issue),
        created_by: userData.user?.id
      };

      const { data, error } = await supabase
        .from('issues')
        .insert([issueData])
        .select()
        .single();

      if (error) throw error;
      
      return transformIssueFromDB(data);
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  },

  // Update an existing issue
  async updateIssue(issueId, updates) {
    try {
      const updateData = {
        ...transformIssueForDB(updates),
        updated_at: new Date().toISOString()
      };

      // Remove the ID from updates to avoid conflicts
      delete updateData.id;

      const { data, error } = await supabase
        .from('issues')
        .update(updateData)
        .eq('id', issueId)
        .select()
        .single();

      if (error) throw error;
      
      return transformIssueFromDB(data);
    } catch (error) {
      console.error('Error updating issue:', error);
      throw error;
    }
  },

  // Delete an issue
  async deleteIssue(issueId) {
    try {
      const { error } = await supabase
        .from('issues')
        .delete()
        .eq('id', issueId);

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting issue:', error);
      throw error;
    }
  },

  // Add a review to an issue
  async addReview(issueId, reviewData) {
    try {
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('issue_reviews')
        .insert([{
          issue_id: issueId,
          reviewer_name: reviewData.reviewerName,
          approved: reviewData.approved,
          notes: reviewData.notes,
          created_by: userData.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  },

  // Bulk update issues (for bulk operations)
  async bulkUpdateIssues(issueIds, updates) {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('issues')
        .update(updateData)
        .in('id', issueIds)
        .select();

      if (error) throw error;
      
      return data.map(transformIssueFromDB);
    } catch (error) {
      console.error('Error bulk updating issues:', error);
      throw error;
    }
  },

  // Bulk delete issues
  async bulkDeleteIssues(issueIds) {
    try {
      const { error } = await supabase
        .from('issues')
        .delete()
        .in('id', issueIds);

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error bulk deleting issues:', error);
      throw error;
    }
  },

  // Migration function to import localStorage data
  async migrateFromLocalStorage() {
    try {
      const localData = localStorage.getItem('drafting_issues_data');
      if (!localData) return { success: true, count: 0 };

      const issues = JSON.parse(localData);
      const { data: userData } = await supabase.auth.getUser();

      const issuesForDB = issues.map(issue => ({
        ...transformIssueForDB(issue),
        created_by: userData.user?.id
      }));

      const { data, error } = await supabase
        .from('issues')
        .upsert(issuesForDB, { onConflict: 'id' })
        .select();

      if (error) throw error;

      // Clear localStorage after successful migration
      localStorage.removeItem('drafting_issues_data');
      
      return { success: true, count: data.length };
    } catch (error) {
      console.error('Error migrating data:', error);
      throw error;
    }
  }
};

// Auth helpers
export const authService = {
  // Sign up new user
  async signUp(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  },

  // Sign in user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};