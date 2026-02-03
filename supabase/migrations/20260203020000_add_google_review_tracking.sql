-- Add tracking columns for Google Review clicks
ALTER TABLE nps_feedbacks 
ADD COLUMN IF NOT EXISTS clicked_google_review BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS clicked_google_review_at TIMESTAMPTZ;

-- Create index for analytics
CREATE INDEX IF NOT EXISTS idx_nps_feedbacks_google_clicks 
ON nps_feedbacks (clicked_google_review) 
WHERE clicked_google_review = TRUE;
