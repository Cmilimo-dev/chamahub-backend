-- Add missing columns to membership_requests table if they don't exist
ALTER TABLE membership_requests 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS form_submitted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS form_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS message TEXT;

-- Update existing records to have form_submitted = true if they have names filled
UPDATE membership_requests 
SET form_submitted = TRUE, 
    form_submitted_at = COALESCE(updated_at, created_at)
WHERE first_name IS NOT NULL AND first_name != '' 
  AND last_name IS NOT NULL AND last_name != '';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_membership_requests_form_submitted 
ON membership_requests(form_submitted, status);

-- Add index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_membership_requests_user_id 
ON membership_requests(user_id);

COMMENT ON COLUMN membership_requests.form_submitted IS 'Indicates whether the user has completed the membership form';
COMMENT ON COLUMN membership_requests.form_submitted_at IS 'Timestamp when the membership form was submitted';
COMMENT ON COLUMN membership_requests.user_id IS 'Reference to the user who submitted the form (if authenticated)';
