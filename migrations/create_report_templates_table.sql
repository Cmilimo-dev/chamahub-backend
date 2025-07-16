-- Create report_templates table
USE chamahub;
CREATE TABLE IF NOT EXISTS report_templates (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  report_type ENUM('financial', 'membership', 'loans', 'contributions', 'custom') NOT NULL,
  template_config JSON NOT NULL,
  is_system_template BOOLEAN DEFAULT false,
  created_by VARCHAR(36),
  group_id VARCHAR(36),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (group_id) REFERENCES chama_groups(id) ON DELETE CASCADE
);
