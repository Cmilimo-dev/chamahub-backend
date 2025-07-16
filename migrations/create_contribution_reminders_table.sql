-- Create contribution_reminders table
USE chamahub;
CREATE TABLE IF NOT EXISTS contribution_reminders (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  group_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  reminder_type ENUM('upcoming', 'overdue', 'grace_period') NOT NULL,
  reminder_date TIMESTAMP NOT NULL,
  amount_due DECIMAL(10, 2) NOT NULL,
  days_until_due INT,
  days_overdue INT,
  message TEXT,
  sent_at TIMESTAMP NULL,
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES chama_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
