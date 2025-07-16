-- Create mpesa_transactions table
USE chamahub;
CREATE TABLE IF NOT EXISTS mpesa_transactions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  group_id VARCHAR(36) NOT NULL,
  contribution_id VARCHAR(36),
  transaction_type ENUM('paybill', 'till', 'stk_push') NOT NULL,
  mpesa_receipt_number VARCHAR(255) UNIQUE,
  phone_number VARCHAR(20) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  mpesa_transaction_id VARCHAR(255) UNIQUE,
  result_code INT,
  result_description TEXT,
  status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  callback_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES chama_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (contribution_id) REFERENCES contributions(id) ON DELETE SET NULL
);
