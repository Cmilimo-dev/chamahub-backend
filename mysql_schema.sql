-- MySQL Schema for ChamaHub Application
-- Converted from PostgreSQL schema

-- Create database
CREATE DATABASE IF NOT EXISTS chamahub;
USE chamahub;

-- Create users table (equivalent to auth.users in Supabase)
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    phone_number VARCHAR(20),
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create profiles table (extends users)
CREATE TABLE IF NOT EXISTS profiles (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    phone_number VARCHAR(20),
    avatar_url TEXT,
    notification_preferences JSON DEFAULT ('{"email_enabled": true, "sms_enabled": false, "in_app_enabled": true}'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create chama_groups table
CREATE TABLE IF NOT EXISTS chama_groups (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by CHAR(36) NOT NULL,
    contribution_amount DECIMAL(15,2) DEFAULT 0,
    contribution_frequency VARCHAR(20) DEFAULT 'monthly',
    member_count INT DEFAULT 0,
    total_savings DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    meeting_day VARCHAR(20),
    meeting_time VARCHAR(20),
    min_contribution_amount DECIMAL(15,2) DEFAULT 0,
    max_contribution_amount DECIMAL(15,2),
    loan_interest_rate DECIMAL(5,2) DEFAULT 5.0,
    max_loan_multiplier DECIMAL(5,2) DEFAULT 3.0,
    allow_partial_contributions BOOLEAN DEFAULT FALSE,
    contribution_grace_period_days INT DEFAULT 0,
    group_rules JSON DEFAULT ('{}'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    group_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    role VARCHAR(20) DEFAULT 'member',
    status VARCHAR(20) DEFAULT 'active',
    total_contributions DECIMAL(15,2) DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES chama_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_group_member (group_id, user_id)
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    method_type VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    account_identifier VARCHAR(100) NOT NULL,
    account_name VARCHAR(100),
    is_primary BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(10),
    verification_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create contributions table
CREATE TABLE IF NOT EXISTS contributions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    group_id CHAR(36) NOT NULL,
    member_id CHAR(36) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    contribution_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_method_id CHAR(36),
    reference_number VARCHAR(100),
    external_transaction_id VARCHAR(100),
    transaction_fees DECIMAL(15,2) DEFAULT 0,
    recorded_by CHAR(36) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES chama_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES group_members(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
    FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    group_id CHAR(36) NOT NULL,
    borrower_id CHAR(36) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) DEFAULT 5.0,
    duration_months INT NOT NULL,
    amount_repaid DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    purpose TEXT,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP,
    disbursement_date TIMESTAMP,
    due_date TIMESTAMP,
    approved_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES chama_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (borrower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Create loan_repayments table
CREATE TABLE IF NOT EXISTS loan_repayments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    loan_id CHAR(36) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50),
    payment_method_id CHAR(36),
    recorded_by CHAR(36) NOT NULL,
    reference_number VARCHAR(100),
    external_transaction_id VARCHAR(100),
    transaction_fees DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
    FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'unread',
    priority VARCHAR(20) DEFAULT 'medium',
    channels JSON DEFAULT ('["in_app"]'),
    metadata JSON DEFAULT ('{}'),
    scheduled_for TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP,
    expires_at TIMESTAMP,
    group_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES chama_groups(id) ON DELETE CASCADE,
    CHECK (notification_type IN ('loan_eligibility', 'contribution_reminder', 'loan_status_update', 'member_loan_announcement', 'general')),
    CHECK (status IN ('unread', 'read')),
    CHECK (priority IN ('low', 'medium', 'high'))
);

-- Create loan_eligibility_rules table
CREATE TABLE IF NOT EXISTS loan_eligibility_rules (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    group_id CHAR(36) NOT NULL,
    rule_name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    rule_value DECIMAL(15,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES chama_groups(id) ON DELETE CASCADE,
    UNIQUE KEY unique_group_rule (group_id, rule_type),
    CHECK (rule_type IN ('contribution_multiplier', 'membership_duration_months', 'max_active_loans', 'minimum_contributions'))
);

-- Create indexes for performance
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_contributions_group_id ON contributions(group_id);
CREATE INDEX idx_contributions_member_id ON contributions(member_id);
CREATE INDEX idx_loans_group_id ON loans(group_id);
CREATE INDEX idx_loans_borrower_id ON loans(borrower_id);
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_loan_repayments_loan_id ON loan_repayments(loan_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);

-- Insert sample data for testing
INSERT INTO users (id, email, first_name, last_name) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@chamahub.com', 'Admin', 'User'),
('550e8400-e29b-41d4-a716-446655440001', 'user1@chamahub.com', 'John', 'Doe'),
('550e8400-e29b-41d4-a716-446655440002', 'user2@chamahub.com', 'Jane', 'Smith');

INSERT INTO profiles (id, email, first_name, last_name) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@chamahub.com', 'Admin', 'User'),
('550e8400-e29b-41d4-a716-446655440001', 'user1@chamahub.com', 'John', 'Doe'),
('550e8400-e29b-41d4-a716-446655440002', 'user2@chamahub.com', 'Jane', 'Smith');

INSERT INTO chama_groups (id, name, description, created_by, contribution_amount, member_count) VALUES
('650e8400-e29b-41d4-a716-446655440000', 'Sample Chama Group', 'A sample group for testing', '550e8400-e29b-41d4-a716-446655440000', 1000.00, 3);

INSERT INTO group_members (id, group_id, user_id, role) VALUES
('750e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'admin'),
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'member'),
('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'member');
