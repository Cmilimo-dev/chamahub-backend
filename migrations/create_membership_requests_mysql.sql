-- Create MySQL-compatible membership_requests table
USE chamahub;
CREATE TABLE IF NOT EXISTS membership_requests (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  group_id VARCHAR(36) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  invitation_token VARCHAR(255) UNIQUE NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'expired', 'invited') DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  approved_by VARCHAR(36),
  rejected_at TIMESTAMP NULL,
  rejected_by VARCHAR(36),
  rejection_reason TEXT,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 7 DAY),
  form_submitted BOOLEAN DEFAULT false,
  form_submitted_at TIMESTAMP NULL,
  user_id VARCHAR(36),
  invited_by VARCHAR(36),
  invited_role VARCHAR(50) DEFAULT 'member',
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES chama_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create membership_actions table for tracking admin actions
CREATE TABLE IF NOT EXISTS membership_actions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  membership_request_id VARCHAR(36) NOT NULL,
  admin_id VARCHAR(36) NOT NULL,
  action ENUM('approved', 'rejected', 'reviewed') NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (membership_request_id) REFERENCES membership_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX idx_membership_requests_group_id ON membership_requests(group_id);
CREATE INDEX idx_membership_requests_token ON membership_requests(invitation_token);
CREATE INDEX idx_membership_requests_status ON membership_requests(status);
CREATE INDEX idx_membership_requests_email ON membership_requests(email);
CREATE INDEX idx_membership_requests_phone ON membership_requests(phone_number);
CREATE INDEX idx_membership_requests_form_submitted ON membership_requests(form_submitted, status);
CREATE INDEX idx_membership_requests_user_id ON membership_requests(user_id);
CREATE INDEX idx_membership_actions_request_id ON membership_actions(membership_request_id);
