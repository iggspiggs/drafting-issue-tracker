-- CLEAN Supabase Database Schema for Drafting Issue Tracker
-- This schema creates tables WITHOUT sample data

-- First, clean up any existing objects
DROP TABLE IF EXISTS issue_status_history CASCADE;
DROP TABLE IF EXISTS issue_notes CASCADE;
DROP TABLE IF EXISTS issue_reviews CASCADE;
DROP TABLE IF EXISTS issues CASCADE;

-- Drop sequences if they exist
DROP SEQUENCE IF EXISTS seq_erection_drawings CASCADE;
DROP SEQUENCE IF EXISTS seq_shipper CASCADE;
DROP SEQUENCE IF EXISTS seq_shop_drawings CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS generate_display_id(TEXT) CASCADE;
DROP FUNCTION IF EXISTS auto_generate_display_id() CASCADE;
DROP FUNCTION IF EXISTS update_updatedAt_column() CASCADE;
DROP FUNCTION IF EXISTS track_status_change() CASCADE;

-- Issues table with CORRECTED field names (camelCase to match app)
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  displayId TEXT UNIQUE NOT NULL, -- Human-readable ID like ERE-001
  jobNumber TEXT,                    -- FIXED: was job_number
  squad TEXT,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL,
  dateReported DATE NOT NULL DEFAULT CURRENT_DATE,  -- FIXED: was date_reported
  resolutionDate DATE,               -- FIXED: was resolution_date
  uploadedBy TEXT,                   -- FIXED: was uploaded_by
  lastStatusChange TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  -- FIXED: was last_status_change
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),         -- FIXED: was created_at
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),         -- FIXED: was updated_at
  createdBy UUID REFERENCES auth.users(id)                  -- FIXED: was created_by
);

-- Add constraints after table creation (these now reference correct field names)
ALTER TABLE issues ADD CONSTRAINT check_squad 
  CHECK (squad IN ('Cadeploy (MBS)', 'Cadeploy (Tekla)', 'Crystal Engineering', 'Basuraj', 'Manohar', 'Rohan Engineering', 'Precision Engineering', 'Jerry Dubose', 'Other'));

ALTER TABLE issues ADD CONSTRAINT check_category 
  CHECK (category IN ('Erection Drawings', 'Shipper', 'Shop Drawings'));

ALTER TABLE issues ADD CONSTRAINT check_status 
  CHECK (status IN ('New', 'In Progress', 'Under Review', 'Needs Rework', 'Fixed', 'Cannot Change'));

-- Create sequences for generating display IDs by category
CREATE SEQUENCE seq_erection_drawings START 1;
CREATE SEQUENCE seq_shipper START 1;
CREATE SEQUENCE seq_shop_drawings START 1;

-- Function to generate display ID based on category
CREATE OR REPLACE FUNCTION generate_display_id(category_name TEXT)
RETURNS TEXT AS $$
DECLARE
    prefix TEXT;
    seq_val INTEGER;
BEGIN
    CASE category_name
        WHEN 'Erection Drawings' THEN 
            prefix := 'ERE';
            seq_val := nextval('seq_erection_drawings');
        WHEN 'Shipper' THEN 
            prefix := 'SHP';
            seq_val := nextval('seq_shipper');
        WHEN 'Shop Drawings' THEN 
            prefix := 'SHD';
            seq_val := nextval('seq_shop_drawings');
        ELSE 
            prefix := 'ISS';
            seq_val := nextval('seq_erection_drawings'); -- Default to erection sequence
    END CASE;
    
    RETURN prefix || '-' || LPAD(seq_val::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate display ID on insert
CREATE OR REPLACE FUNCTION auto_generate_display_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.displayId IS NULL OR NEW.displayId = '' THEN
        NEW.displayId := generate_display_id(NEW.category);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate display ID
CREATE TRIGGER trigger_auto_display_id
    BEFORE INSERT ON issues
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_display_id();

-- Issue notes table with CORRECTED field names
CREATE TABLE issue_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issueId UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,  -- FIXED: was issue_id
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  createdBy UUID REFERENCES auth.users(id)  -- FIXED: was created_by
);

-- Review history table with CORRECTED field names
CREATE TABLE issue_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issueId UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,  -- FIXED: was issue_id
  reviewerName TEXT NOT NULL,                                      -- FIXED: was reviewer_name
  approved BOOLEAN NOT NULL,
  notes TEXT,
  reviewDate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),              -- FIXED: was review_date
  iterationNumber INTEGER DEFAULT 1,                              -- FIXED: was iteration_number
  createdBy UUID REFERENCES auth.users(id)                        -- FIXED: was created_by
);

-- Status change history table with CORRECTED field names
CREATE TABLE issue_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issueId UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,  -- FIXED: was issue_id
  oldStatus TEXT,                                                  -- FIXED: was old_status
  newStatus TEXT NOT NULL,                                         -- FIXED: was new_status
  changedBy TEXT,                                                  -- FIXED: was changed_by
  changeDate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),              -- FIXED: was change_date
  notes TEXT,
  createdBy UUID REFERENCES auth.users(id)                        -- FIXED: was created_by
);

-- Create indexes for better performance (with corrected field names)
CREATE INDEX idx_issues_displayId ON issues(displayid);
CREATE INDEX idx_issues_jobNumber ON issues(jobnumber);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_squad ON issues(squad);
CREATE INDEX idx_issues_category ON issues(category);
CREATE INDEX idx_issues_createdBy ON issues(createdby);
CREATE INDEX idx_issues_dateReported ON issues(datereported);

-- Notes indexes (with corrected field names)
CREATE INDEX idx_issue_notes_issueId ON issue_notes(issueid);
CREATE INDEX idx_issue_notes_timestamp ON issue_notes(timestamp);

-- Review indexes (with corrected field names)  
CREATE INDEX idx_issue_reviews_issueId ON issue_reviews(issueid);
CREATE INDEX idx_issue_reviews_date ON issue_reviews(reviewdate);

-- Status history indexes (with corrected field names)
CREATE INDEX idx_status_history_issueId ON issue_status_history(issueid);
CREATE INDEX idx_status_history_date ON issue_status_history(changedate);

-- Create updatedAt trigger function (with corrected field names)
CREATE OR REPLACE FUNCTION update_updatedAt_column()  -- FIXED: was update_updated_at_column
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedat = NOW();  -- Use lowercase field name
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updatedAt (with corrected field names)
CREATE TRIGGER update_issues_updatedAt    -- FIXED: was update_issues_updated_at
    BEFORE UPDATE ON issues 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updatedAt_column();  -- FIXED: was update_updated_at_column

-- Function to automatically track status changes (with corrected field names)
CREATE OR REPLACE FUNCTION track_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only insert if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO issue_status_history (issueid, oldstatus, newstatus, changedby, notes, createdby)
        VALUES (NEW.id, OLD.status, NEW.status, NEW.uploadedby, 'Status changed automatically', auth.uid());
        
        -- Update lastStatusChange timestamp
        NEW.laststatuschange = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for status change tracking
CREATE TRIGGER track_issue_status_changes
    BEFORE UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION track_status_change();

-- Enable RLS
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Issues (with corrected field names)
CREATE POLICY "Allow authenticated users to view issues" 
    ON issues FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated users to insert issues" 
    ON issues FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = createdBy);  -- FIXED: was created_by

CREATE POLICY "Allow authenticated users to update issues" 
    ON issues FOR UPDATE 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated users to delete issues" 
    ON issues FOR DELETE 
    TO authenticated 
    USING (true);

-- RLS Policies for Notes (with corrected field names)
CREATE POLICY "Allow authenticated users to view notes" 
    ON issue_notes FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated users to insert notes" 
    ON issue_notes FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = createdBy);  -- FIXED: was created_by

CREATE POLICY "Allow authenticated users to update notes" 
    ON issue_notes FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = createdBy);  -- FIXED: was created_by

CREATE POLICY "Allow authenticated users to delete notes" 
    ON issue_notes FOR DELETE 
    TO authenticated 
    USING (auth.uid() = createdBy);  -- FIXED: was created_by

-- RLS Policies for Reviews (with corrected field names)
CREATE POLICY "Allow authenticated users to view reviews" 
    ON issue_reviews FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated users to insert reviews" 
    ON issue_reviews FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = createdBy);  -- FIXED: was created_by

CREATE POLICY "Allow authenticated users to update reviews" 
    ON issue_reviews FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = createdBy);  -- FIXED: was created_by

-- RLS Policies for Status History (with corrected field names)
CREATE POLICY "Allow authenticated users to view status history" 
    ON issue_status_history FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated users to insert status history" 
    ON issue_status_history FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = createdBy);  -- FIXED: was created_by

-- NO SAMPLE DATA - Clean database ready for production use