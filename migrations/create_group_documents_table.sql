-- Create group_documents table
USE chamahub;
CREATE TABLE IF NOT EXISTS group_documents (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  group_id VARCHAR(36) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size INT,
  file_type VARCHAR(100),
  uploaded_by VARCHAR(36),
  is_public BOOLEAN DEFAULT true,
  status ENUM('active', 'archived', 'deleted') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES chama_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);
