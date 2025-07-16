-- Add missing columns to profiles table
-- This fixes the "Unknown column 'p.bio' in 'field list'" error

USE chamahub;

-- Add the missing columns to the profiles table
ALTER TABLE profiles 
ADD COLUMN bio TEXT,
ADD COLUMN location VARCHAR(255),
ADD COLUMN language VARCHAR(50) DEFAULT 'en',
ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC';

-- Update the profiles table to match the users table data for existing records
UPDATE profiles p
JOIN users u ON p.id = u.id
SET 
    p.first_name = u.first_name,
    p.last_name = u.last_name,
    p.phone = COALESCE(u.phone, u.phone_number),
    p.avatar_url = u.avatar_url
WHERE p.first_name IS NULL OR p.last_name IS NULL OR p.phone IS NULL;

-- Add some default values for existing profiles
UPDATE profiles SET 
    bio = 'No bio available',
    location = 'Not specified',
    language = 'en',
    timezone = 'UTC'
WHERE bio IS NULL;

-- Verify the changes
SELECT 'Profiles table structure after migration:' as message;
DESCRIBE profiles;

SELECT 'Sample profile data:' as message;
SELECT id, email, first_name, last_name, bio, location, language, timezone FROM profiles LIMIT 3;
