-- Enable Row Level Security on all tables
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_tags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Authenticated users can read videos" ON videos;
DROP POLICY IF EXISTS "Authenticated users can update videos" ON videos;
DROP POLICY IF EXISTS "Authenticated users can read tags" ON tags;
DROP POLICY IF EXISTS "Authenticated users can manage video_tags" ON video_tags;

-- Create policies: Only authenticated users can access
CREATE POLICY "Authenticated users can read videos" ON videos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update videos" ON videos
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read tags" ON tags
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage video_tags" ON video_tags
  FOR ALL USING (auth.role() = 'authenticated');
