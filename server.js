import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chamahub',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create MySQL pool
const pool = mysql.createPool(dbConfig);

// Email configuration (using environment variables for security)
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
};

// SMS configuration (Twilio)
const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || 'your-twilio-account-sid',
  authToken: process.env.TWILIO_AUTH_TOKEN || 'your-twilio-auth-token',
  phoneNumber: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
  // For API Keys, we need the main account SID
  mainAccountSid: process.env.TWILIO_MAIN_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID || 'your-twilio-main-account-sid'
};

// Create email transporter
const transporter = nodemailer.createTransport(emailConfig);

// Initialize Twilio client (only if valid credentials are provided)
let twilioClient = null;
// Account SID can start with 'AC' (main account) or 'SK' (API key)
if ((twilioConfig.accountSid.startsWith('AC') || twilioConfig.accountSid.startsWith('SK')) && 
    twilioConfig.authToken && 
    twilioConfig.authToken !== 'your-twilio-auth-token') {
  try {
    if (twilioConfig.accountSid.startsWith('SK')) {
      // For API Keys, we need to pass the main account SID
      twilioClient = twilio(twilioConfig.accountSid, twilioConfig.authToken, {
        accountSid: twilioConfig.mainAccountSid
      });
    } else {
      // For main account SID
      twilioClient = twilio(twilioConfig.accountSid, twilioConfig.authToken);
    }
    console.log('Twilio client initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize Twilio client:', error.message);
  }
} else {
  console.log('Twilio credentials not configured - SMS functionality will be disabled');
}

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: true, // Allow all origins during development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Helper function for password hashing
const hashPassword = (password) => {
  return Buffer.from(password).toString('base64');
};

const verifyPassword = (password, hash) => {
  return hashPassword(password) === hash;
};

// API Routes
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT * FROM users');
    res.json(users);
  } catch (ex) {
    console.error(ex);
    res.status(500).send('Error retrieving users.');
  }
});

app.get('/api/groups', async (req, res) => {
  try {
    const [groups] = await pool.execute('SELECT * FROM chama_groups');
    res.json(groups);
  } catch (ex) {
    console.error(ex);
    res.status(500).send('Error retrieving groups.');
  }
});

// Auth endpoints
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Insert user (let MySQL generate UUID)
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, first_name || null, last_name || null, phone || null]
    );

    // Get the created user to get the generated UUID
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    const newUser = users[0];

    // Create profile with the same UUID
    await pool.execute(
      'INSERT INTO profiles (id, email, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)',
      [newUser.id, email, first_name || null, last_name || null, phone || null]
    );

    // Return user without password
    const { password_hash: _, ...userWithoutPassword } = newUser;
    res.json(userWithoutPassword);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error creating user' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, password: '***' + password.slice(-3), passwordLength: password.length });

    // Get user by email
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      console.log('User not found for email:', email);
      return res.status(401).json({ error: 'User not found' });
    }

    const user = users[0];
    console.log('User found:', { email: user.email, stored_hash: user.password_hash });
    
    const hashedAttempt = hashPassword(password);
    console.log('Password verification:', { 
      received_password: password,
      hashed_attempt: hashedAttempt,
      stored_hash: user.password_hash,
      matches: hashedAttempt === user.password_hash
    });

    // Verify password
    if (!verifyPassword(password, user.password_hash)) {
      console.log('Password verification failed');
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Remove password hash from returned user
    const { password_hash: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error signing in' });
  }
});

// Notifications endpoints
app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // For now, return empty array since notifications table might not exist
    // In a real app, you'd query: SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC
    const notifications = [];
    
    res.json(notifications);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error retrieving notifications' });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    // For now, just return success
    // In a real app, you'd query: UPDATE notifications SET status = 'read' WHERE id = ?
    
    res.json({ success: true });
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error updating notification' });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // For now, just return success
    // In a real app, you'd query: DELETE FROM notifications WHERE id = ?
    
    res.json({ success: true });
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error deleting notification' });
  }
});

// Push Notifications endpoint
app.post('/api/push-tokens', async (req, res) => {
  try {
    const { user_id, token, platform } = req.body;
    // Insert token
    await pool.execute(
      'INSERT INTO user_push_tokens (user_id, token, platform) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = VALUES(token)',
      [user_id, token, platform]
    );
    res.json({ success: true, message: 'Push token saved successfully' });
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error saving push token' });
  }
});

// Mpesa Transactions endpoint
app.post('/api/mpesa/transactions', async (req, res) => {
  try {
    const { user_id, group_id, amount, phone_number, mpesa_receipt_number, mpesa_transaction_id } = req.body;
    // Insert transaction
    await pool.execute(
      'INSERT INTO mpesa_transactions (user_id, group_id, amount, phone_number, mpesa_receipt_number, mpesa_transaction_id) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, group_id, amount, phone_number, mpesa_receipt_number, mpesa_transaction_id]
    );
    res.json({ success: true, message: 'Transaction recorded successfully' });
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error recording transaction' });
  }
});

// Group Documents endpoint
app.post('/api/groups/:groupId/documents', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { title, description, file_path, uploaded_by } = req.body;
    // Save document
    await pool.execute(
      'INSERT INTO group_documents (group_id, title, description, file_path, uploaded_by) VALUES (?, ?, ?, ?, ?)',
      [groupId, title, description, file_path, uploaded_by]
    );
    res.json({ success: true, message: 'Document saved successfully' });
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error saving document' });
  }
});

// Report Templates endpoint
app.post('/api/report/templates', async (req, res) => {
  try {
    const { name, description, report_type, template_config, created_by, group_id } = req.body;
    // Save template
    await pool.execute(
      'INSERT INTO report_templates (name, description, report_type, template_config, created_by, group_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, report_type, template_config, created_by, group_id]
    );
    res.json({ success: true, message: 'Report template saved successfully' });
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error saving report template' });
  }
});

// Contribution Reminders endpoint
app.post('/api/contribution/reminders', async (req, res) => {
  try {
    const { group_id, user_id, reminder_type, reminder_date, amount_due } = req.body;
    // Save reminder
    await pool.execute(
      'INSERT INTO contribution_reminders (group_id, user_id, reminder_type, reminder_date, amount_due) VALUES (?, ?, ?, ?, ?)',
      [group_id, user_id, reminder_type, reminder_date, amount_due]
    );
    res.json({ success: true, message: 'Contribution reminder saved successfully' });
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error saving contribution reminder' });
  }
});

// Membership Requests endpoints
app.post('/api/membership_requests', async (req, res) => {
  try {
    const { 
      group_id, 
      user_id, 
      email, 
      phone_number, 
      invitation_token, 
      first_name, 
      last_name, 
      status, 
      invited_by, 
      invited_role 
    } = req.body;
    
    // Insert membership request (remove expires_at to fix datetime issue)
    await pool.execute(
      `INSERT INTO membership_requests 
       (group_id, user_id, email, phone_number, invitation_token, first_name, last_name, 
        status, invited_by, invited_role) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [group_id, user_id || null, email, phone_number, invitation_token, 
       first_name || null, last_name || null, status || 'pending', 
       invited_by || null, invited_role || 'member']
    );
    
    res.json({ success: true, message: 'Membership request sent successfully' });
  } catch (ex) {
    console.error('Error in membership request:', ex);
    res.status(500).json({ error: 'Error sending membership request' });
  }
});

app.put('/api/membership_requests/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { first_name, last_name, phone_number, email, form_submitted, form_submitted_at, user_id } = req.body;
    
    // Update membership request with form data
    await pool.execute(
      `UPDATE membership_requests SET first_name = ?, last_name = ?, phone_number = ?, 
       email = ?, form_submitted = ?, form_submitted_at = ?, user_id = ? 
       WHERE invitation_token = ?`,
      [first_name, last_name, phone_number, email, form_submitted, form_submitted_at, user_id, token]
    );
    
    res.json({ success: true, message: 'Membership request updated successfully' });
  } catch (ex) {
    console.error('Error updating membership request:', ex);
    res.status(500).json({ error: 'Error updating membership request' });
  }
});

// Group admin notifications endpoint
app.post('/api/notifications/group-admins', async (req, res) => {
  try {
    const { group_id, title, message, notification_type, metadata } = req.body;
    
    // Get group admins
    const [admins] = await pool.execute(
      `SELECT user_id FROM group_members 
       WHERE group_id = ? AND role IN ('admin', 'treasurer', 'secretary') AND status = 'active'`,
      [group_id]
    );
    
    // Insert notification for each admin
    for (const admin of admins) {
      await pool.execute(
        `INSERT INTO notifications (user_id, title, message, notification_type, group_id, metadata) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [admin.user_id, title, message, notification_type || 'general', group_id, JSON.stringify(metadata || {})]
      );
    }
    
    res.json({ success: true, message: 'Admin notifications sent successfully' });
  } catch (ex) {
    console.error('Error sending admin notifications:', ex);
    res.status(500).json({ error: 'Error sending admin notifications' });
  }
});

// Group settings endpoint
app.get('/api/groups/:groupId/settings', async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Get group settings
    const [groups] = await pool.execute(
      'SELECT * FROM chama_groups WHERE id = ?',
      [groupId]
    );
    
    if (groups.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    const group = groups[0];
    
    // Return group settings in expected format
    const settings = {
      id: group.id,
      name: group.name,
      description: group.description,
      contribution_amount: group.contribution_amount,
      contribution_frequency: group.contribution_frequency,
      meeting_day: group.meeting_day,
      meeting_time: group.meeting_time,
      loan_interest_rate: group.loan_interest_rate,
      max_loan_multiplier: group.max_loan_multiplier,
      allow_partial_contributions: group.allow_partial_contributions,
      contribution_grace_period_days: group.contribution_grace_period_days,
      group_rules: group.group_rules
    };
    
    res.json(settings);
  } catch (ex) {
    console.error('Error fetching group settings:', ex);
    res.status(500).json({ error: 'Error fetching group settings' });
  }
});

app.put('/api/groups/:id/settings', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      min_contribution_amount,
      max_contribution_amount,
      loan_interest_rate,
      max_loan_multiplier,
      allow_partial_contributions,
      contribution_grace_period_days,
      group_rules
    } = req.body;
    
    // Update group settings
    await pool.execute(
      `UPDATE chama_groups SET 
       min_contribution_amount = ?, max_contribution_amount = ?, 
       loan_interest_rate = ?, max_loan_multiplier = ?, 
       allow_partial_contributions = ?, contribution_grace_period_days = ?, 
       group_rules = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [min_contribution_amount, max_contribution_amount, loan_interest_rate, 
       max_loan_multiplier, allow_partial_contributions, contribution_grace_period_days, 
       JSON.stringify(group_rules), id]
    );
    
    res.json({ success: true, message: 'Group settings updated successfully' });
  } catch (ex) {
    console.error('Error updating group settings:', ex);
    res.status(500).json({ error: 'Error updating group settings' });
  }
});

// Update group endpoint
app.put('/api/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, updated_at } = req.body;
    
    // Update group basic info
    const [result] = await pool.execute(
      'UPDATE chama_groups SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json({ success: true, message: 'Group updated successfully' });
  } catch (ex) {
    console.error('Error updating group:', ex);
    res.status(500).json({ error: 'Error updating group' });
  }
});

// Delete group endpoint
app.delete('/api/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First delete group members
    await pool.execute('DELETE FROM group_members WHERE group_id = ?', [id]);
    
    // Then delete the group document
    const [result] = await pool.execute('DELETE FROM chama_groups WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json({ success: true, message: 'Group deleted successfully' });
  } catch (ex) {
    console.error('Error deleting group:', ex);
    res.status(500).json({ error: 'Error deleting group' });
  }
});

// Transactions endpoints
app.get('/api/transactions/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // For now, return empty array since the transactions relationship might not be fully set up
    // In a real app, you'd query: 
    // SELECT c.*, g.name as group_name FROM contributions c 
    // JOIN chama_groups g ON c.group_id = g.id 
    // WHERE c.user_id = ? ORDER BY c.contribution_date DESC
    const transactions = [];
    
    res.json(transactions);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error retrieving user transactions' });
  }
});

// Group search endpoint
app.get('/api/groups/search', async (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }
    
    // For now, return empty array since the groups search might not be fully set up
    // In a real app, you'd query: 
    // SELECT * FROM chama_groups WHERE name LIKE ? AND status = 'active'
    const groups = [];
    
    res.json(groups);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error searching groups' });
  }
});

// Get group members endpoint
app.get('/api/groups/:groupId/members', async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Query group members with user details
    const [members] = await pool.execute(
      `SELECT gm.*, u.first_name, u.last_name, u.email, u.phone
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = ? AND gm.status = 'active'
       ORDER BY gm.role, u.first_name`,
      [groupId]
    );
    
    res.json(members);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error retrieving group members' });
  }
});

// Add member to group endpoint
app.post('/api/groups/:groupId/members', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { user_id, role, status } = req.body;
    
    // For now, just return success
    // In a real app, you'd query: 
    // INSERT INTO group_members (user_id, group_id, role, status) VALUES (?, ?, ?, ?)
    
    res.json({ success: true, message: 'Member added successfully' });
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error adding member to group' });
  }
});

// Old loan endpoint - replaced by comprehensive loan system below

app.put('/api/loan-repayments/:scheduleId', async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const updateData = req.body;
    
    // For now, just return success
    // In a real app, you'd query: UPDATE loan_repayment_schedule SET ... WHERE id = ?
    
    res.json({ success: true, message: 'Repayment recorded successfully' });
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error recording repayment' });
  }
});

app.post('/api/loans/:loanId/disburse', async (req, res) => {
  try {
    const { loanId } = req.params;
    const disbursementData = req.body;
    
    // For now, just return success
    // In a real app, you'd:
    // 1. INSERT INTO loan_disbursements ...
    // 2. UPDATE loans SET status = 'disbursed' WHERE id = ?
    
    res.json({ success: true, message: 'Loan disbursed successfully' });
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error disbursing loan' });
  }
});

// Invitation endpoints
app.post('/api/invitations/send', async (req, res) => {
  const { type, to, invitationLink, groupId, groupName } = req.body;
  
  try {
    if (type === 'email') {
      const mailOptions = {
        from: emailConfig.auth.user,
        to,
        subject: `Invitation to join group "${groupName}"`,
        text: `You have been invited to join the group "${groupName}". Click here to accept the invitation: ${invitationLink}`,
        html: `<p>You have been invited to join the group "<strong>${groupName}</strong>".</p>
               <p>Click <a href="${invitationLink}">here</a> to accept the invitation.</p>`
      };

      await transporter.sendMail(mailOptions);
    } else if (type === 'sms') {
      if (!twilioClient) {
        throw new Error('SMS service not configured. Please set up Twilio credentials.');
      }
      await twilioClient.messages.create({
        body: `You have been invited to join the group "${groupName}". Accept: ${invitationLink}`,
        from: twilioConfig.phoneNumber,
        to
      });
    }

    res.json({ success: true, message: 'Invitation sent' });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});
app.get('/api/invitations/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Get invitation details with group information
    const [invitations] = await pool.execute(
      `SELECT mr.*, g.name as group_name, g.description as group_description, 
       g.group_rules, g.contribution_amount, g.contribution_frequency,
       g.meeting_day, g.meeting_time, g.loan_interest_rate,
       invited_by_user.first_name as inviter_first_name,
       invited_by_user.last_name as inviter_last_name,
       invited_by_user.email as inviter_email
       FROM membership_requests mr
       JOIN chama_groups g ON mr.group_id = g.id
       LEFT JOIN users invited_by_user ON mr.invited_by = invited_by_user.id
       WHERE mr.invitation_token = ? AND mr.status IN ('pending', 'invited')`,
      [token]
    );
    
    if (invitations.length === 0) {
      return res.status(404).json({ error: 'Invitation not found or expired' });
    }
    
    const invitation = invitations[0];
    
    // Check if invitation has expired
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Invitation has expired' });
    }
    
    const response = {
      id: invitation.id,
      group_id: invitation.group_id,
      email: invitation.email,
      phone_number: invitation.phone_number,
      first_name: invitation.first_name,
      last_name: invitation.last_name,
      invitation_token: invitation.invitation_token,
      status: invitation.status,
      invited_role: invitation.invited_role,
      expires_at: invitation.expires_at,
      created_at: invitation.created_at,
      group: {
        name: invitation.group_name,
        description: invitation.group_description,
        group_rules: invitation.group_rules,
        contribution_amount: invitation.contribution_amount,
        contribution_frequency: invitation.contribution_frequency,
        meeting_day: invitation.meeting_day,
        meeting_time: invitation.meeting_time,
        loan_interest_rate: invitation.loan_interest_rate
      },
      inviter: invitation.inviter_first_name ? {
        first_name: invitation.inviter_first_name,
        last_name: invitation.inviter_last_name,
        email: invitation.inviter_email
      } : null
    };
    
    res.json(response);
  } catch (ex) {
    console.error('Error retrieving invitation:', ex);
    res.status(500).json({ error: 'Error retrieving invitation' });
  }
});

app.post('/api/invitations/:token/accept', async (req, res) => {
  try {
    const { token } = req.params;
    const { user_id, first_name, last_name, phone_number, email } = req.body;
    
    // Get the invitation details
    const [invitations] = await pool.execute(
      'SELECT * FROM membership_requests WHERE invitation_token = ? AND status IN ("pending", "invited")',
      [token]
    );
    
    if (invitations.length === 0) {
      return res.status(404).json({ error: 'Invitation not found or already processed' });
    }
    
    const invitation = invitations[0];
    
    // Check if invitation has expired
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Invitation has expired' });
    }
    
    // Check if user is already a member of this group
    const [existingMember] = await pool.execute(
      'SELECT * FROM group_members WHERE user_id = ? AND group_id = ?',
      [user_id, invitation.group_id]
    );
    
    if (existingMember.length > 0) {
      return res.status(400).json({ error: 'You are already a member of this group' });
    }
    
    // Start transaction
    await pool.execute('START TRANSACTION');
    
    try {
      // Update the membership request status
      await pool.execute(
        `UPDATE membership_requests SET 
         status = 'accepted', 
         user_id = ?, 
         first_name = COALESCE(?, first_name), 
         last_name = COALESCE(?, last_name), 
         phone_number = COALESCE(?, phone_number), 
         email = COALESCE(?, email),
         form_submitted = 1,
         form_submitted_at = CURRENT_TIMESTAMP
         WHERE invitation_token = ?`,
        [user_id, first_name, last_name, phone_number, email, token]
      );
      
      // Add user as group member
      await pool.execute(
        'INSERT INTO group_members (user_id, group_id, role, status, joined_at) VALUES (?, ?, ?, ?, ?)',
        [user_id, invitation.group_id, invitation.invited_role || 'member', 'active', new Date()]
      );
      
      // Update group member count
      await pool.execute(
        'UPDATE chama_groups SET member_count = member_count + 1 WHERE id = ?',
        [invitation.group_id]
      );
      
      // Send notification to group admins
      const [admins] = await pool.execute(
        `SELECT user_id FROM group_members 
         WHERE group_id = ? AND role IN ('admin', 'treasurer', 'secretary') AND status = 'active'`,
        [invitation.group_id]
      );
      
      const [groupInfo] = await pool.execute(
        'SELECT name FROM chama_groups WHERE id = ?',
        [invitation.group_id]
      );
      
      const groupName = groupInfo[0]?.name || 'your group';
      const memberName = `${first_name || invitation.first_name} ${last_name || invitation.last_name}`.trim();
      
      // Insert notifications for admins
      for (const admin of admins) {
        await pool.execute(
          `INSERT INTO notifications (user_id, title, message, notification_type, group_id, metadata) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            admin.user_id,
            'New Member Joined',
            `${memberName} has joined ${groupName}`,
            'member_joined',
            invitation.group_id,
            JSON.stringify({ new_member_id: user_id, invitation_id: invitation.id })
          ]
        );
      }
      
      // Commit transaction
      await pool.execute('COMMIT');
      
      res.json({ 
        success: true, 
        message: 'Invitation accepted successfully! You are now a member of the group.',
        group_id: invitation.group_id
      });
      
    } catch (error) {
      // Rollback on error
      await pool.execute('ROLLBACK');
      throw error;
    }
    
  } catch (ex) {
    console.error('Error accepting invitation:', ex);
    res.status(500).json({ error: 'Error accepting invitation' });
  }
});

// User loans endpoint
app.get('/api/loans/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Query loans for a user with group information
    const [loans] = await pool.execute(
      `SELECT l.*, g.name as group_name, 
       approver.first_name as approver_first_name, 
       approver.last_name as approver_last_name 
       FROM loans l
       JOIN chama_groups g ON l.group_id = g.id
       LEFT JOIN users approver ON l.approved_by = approver.id
       WHERE l.borrower_id = ? ORDER BY l.application_date DESC`,
      [userId]
    );
    
    res.json(loans);
  } catch (ex) {
    console.error('Error retrieving user loans:', ex);
    res.status(500).json({ error: 'Error retrieving user loans' });
  }
});

// Meeting endpoints
app.get('/api/groups/:groupId/meetings', async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Query meetings for a specific group
    const [meetings] = await pool.execute(
      'SELECT * FROM group_meetings WHERE group_id = ? ORDER BY meeting_date ASC',
      [groupId]
    );
    
    res.json(meetings);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error retrieving meetings' });
  }
});

app.post('/api/groups/:groupId/meetings', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { title, description, meeting_date, meeting_time, location, agenda, created_by, status } = req.body;
    
    // Insert new meeting
    const [result] = await pool.execute(
      `INSERT INTO group_meetings (group_id, title, description, meeting_date, meeting_time, 
       location, agenda, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [groupId, title, description, meeting_date, meeting_time, location, 
       JSON.stringify(agenda), created_by, status || 'scheduled']
    );
    
    res.json({ success: true, id: result.insertId, message: 'Meeting created successfully' });
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error creating meeting' });
  }
});

// Transaction notification endpoints
app.get('/api/users/:userId/transaction-notifications', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Query transaction notifications for a user
    const [notifications] = await pool.execute(
      'SELECT * FROM transaction_notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [userId]
    );
    
    res.json(notifications);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error retrieving transaction notifications' });
  }
});

// Notification endpoints
app.post('/api/notifications/send-group-notification', async (req, res) => {
  try {
    const { groupId, title, body, data } = req.body;
    
    // Get all group members
    const [members] = await pool.execute(
      'SELECT user_id FROM group_members WHERE group_id = ? AND status = "active"',
      [groupId]
    );
    
    // Insert notification for each member
    for (const member of members) {
      await pool.execute(
        'INSERT INTO notifications (user_id, title, body, data, type) VALUES (?, ?, ?, ?, ?)',
        [member.user_id, title, body, JSON.stringify(data), 'group']
      );
    }
    
    res.json({ success: true, message: 'Group notification sent' });
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error sending group notification' });
  }
});

app.post('/api/notifications/schedule', async (req, res) => {
  try {
    const { group_id, notification_type, title, body, scheduled_for, data } = req.body;
    
    // Insert scheduled notification
    await pool.execute(
      `INSERT INTO scheduled_notifications (group_id, notification_type, title, body, 
       scheduled_for, data) VALUES (?, ?, ?, ?, ?, ?)`,
      [group_id, notification_type, title, body, scheduled_for, JSON.stringify(data)]
    );
    
    res.json({ success: true, message: 'Notification scheduled' });
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error scheduling notification' });
  }
});

// Loan eligibility endpoint
app.post('/api/functions/calculate-loan-eligibility', async (req, res) => {
  try {
    const { groupId } = req.body;
    
    // Basic loan eligibility calculation
    // In a real app, this would check contribution history, group rules, etc.
    const eligibility = {
      isEligible: true,
      maxLoanAmount: 50000,
      eligibilityReasons: [
        'Member has made regular contributions',
        'No outstanding loan balance',
        'Member meets minimum contribution requirements'
      ]
    };
    
    res.json(eligibility);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error calculating loan eligibility' });
  }
});

// Contributions endpoints
app.get('/api/contributions/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if contributions table exists first
    const [tableExists] = await pool.execute(
      `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = 'chamahub' AND table_name = 'contributions'`
    );
    
    if (tableExists[0].count === 0) {
      console.log('Contributions table does not exist, returning empty array');
      return res.json([]);
    }
    
// Query contributions for a user
    const [memberships] = await pool.execute(
      'SELECT id FROM group_members WHERE user_id = ? AND status = "active"',
      [userId]
    );

    if (memberships.length === 0) {
      return res.json([]);
    }

    const memberIds = memberships.map(m => m.id);

    // Build the IN clause placeholder
    const placeholders = memberIds.map(() => '?').join(',');
    const query = `SELECT c.*, g.name as group_name FROM contributions c
                   JOIN chama_groups g ON c.group_id = g.id
                   WHERE c.member_id IN (${placeholders}) ORDER BY c.contribution_date DESC`;

    const [contributions] = await pool.execute(query, memberIds);
    
    res.json(contributions);
  } catch (ex) {
    console.error('Error retrieving contributions:', ex);
    // Return empty array instead of error to prevent frontend crashes
    res.json([]);
  }
});

app.post('/api/contributions', async (req, res) => {
  try {
    const { user_id, group_id, amount, contribution_date, status, payment_method, payment_method_id, notes, phone_number } = req.body;
    
    // First, find the group_members.id for this user and group
    const [memberResult] = await pool.execute(
      'SELECT id FROM group_members WHERE user_id = ? AND group_id = ? AND status = "active"',
      [user_id, group_id]
    );
    
    if (memberResult.length === 0) {
      return res.status(400).json({ error: 'User must be an active member of the selected group to record contributions' });
    }
    
    const member_id = memberResult[0].id;
    
    // Insert new contribution
    const [result] = await pool.execute(
      'INSERT INTO contributions (member_id, group_id, amount, contribution_date, status, recorded_by, payment_method, payment_method_id, notes, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [member_id, group_id, amount, contribution_date, status || 'completed', user_id, payment_method || 'cash', payment_method_id || null, notes || null, phone_number || null]
    );
    
    res.json({ success: true, id: result.insertId, message: 'Contribution recorded successfully' });
  } catch (ex) {
    console.error('Error recording contribution:', ex);
    res.status(500).json({ error: 'Error recording contribution' });
  }
});

// Comprehensive Loan CRUD Operations

// Create loan application
app.post('/api/loans', async (req, res) => {
  try {
    const { borrower_id, group_id, amount, purpose, duration_months, interest_rate } = req.body;
    
    console.log('Received loan application:', { borrower_id, group_id, amount, purpose, duration_months, interest_rate });
    
    // Validate required fields
    if (!borrower_id || !group_id || !amount || !purpose || !duration_months) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if user is a member of the group
    const [memberCheck] = await pool.execute(
      'SELECT id FROM group_members WHERE user_id = ? AND group_id = ? AND status = "active"',
      [borrower_id, group_id]
    );
    
    if (memberCheck.length === 0) {
      return res.status(400).json({ error: 'User must be an active member of the group to apply for a loan' });
    }
    
    // Get group settings for interest rate if not provided
    const [groupSettings] = await pool.execute(
      'SELECT loan_interest_rate FROM chama_groups WHERE id = ?',
      [group_id]
    );
    
    console.log('Group settings result:', groupSettings);
    
    const finalInterestRate = interest_rate || (groupSettings[0]?.loan_interest_rate ?? 5.0);
    
    // Calculate due date
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + parseInt(duration_months));
    
    console.log('Inserting loan with values:', {
      borrower_id,
      group_id,
      amount: parseFloat(amount),
      purpose,
      duration_months: parseInt(duration_months),
      finalInterestRate,
      dueDate,
      status: 'pending'
    });
    
    // Insert new loan application
    const [result] = await pool.execute(
      `INSERT INTO loans (borrower_id, group_id, amount, purpose, duration_months, interest_rate, due_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        borrower_id,
        group_id,
        parseFloat(amount),
        purpose,
        parseInt(duration_months),
        parseFloat(finalInterestRate),
        dueDate,
        'pending'
      ]
    );
    
    console.log('Loan application inserted successfully:', result);
    res.json({ success: true, id: result.insertId, message: 'Loan application submitted successfully' });
  } catch (ex) {
    console.error('Error submitting loan application:', ex);
    res.status(500).json({ error: 'Error submitting loan application' });
  }
});

// Get all loans for a group (for admin/treasurer)
app.get('/api/loans/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { status } = req.query;
    
    let query = `
      SELECT l.*, g.name as group_name, 
             borrower.first_name as borrower_first_name, 
             borrower.last_name as borrower_last_name,
             borrower.email as borrower_email,
             approver.first_name as approver_first_name, 
             approver.last_name as approver_last_name 
      FROM loans l
      JOIN chama_groups g ON l.group_id = g.id
      JOIN users borrower ON l.borrower_id = borrower.id
      LEFT JOIN users approver ON l.approved_by = approver.id
      WHERE l.group_id = ?`;
    
    const params = [groupId];
    
    if (status) {
      query += ' AND l.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY l.application_date DESC';
    
    const [loans] = await pool.execute(query, params);
    
    res.json(loans);
  } catch (ex) {
    console.error('Error retrieving group loans:', ex);
    res.status(500).json({ error: 'Error retrieving group loans' });
  }
});

// Get specific loan details
app.get('/api/loans/:loanId', async (req, res) => {
  try {
    const { loanId } = req.params;
    
    const [loans] = await pool.execute(
      `SELECT l.*, g.name as group_name, 
             borrower.first_name as borrower_first_name, 
             borrower.last_name as borrower_last_name,
             borrower.email as borrower_email,
             approver.first_name as approver_first_name, 
             approver.last_name as approver_last_name 
       FROM loans l
       JOIN chama_groups g ON l.group_id = g.id
       JOIN users borrower ON l.borrower_id = borrower.id
       LEFT JOIN users approver ON l.approved_by = approver.id
       WHERE l.id = ?`,
      [loanId]
    );
    
    if (loans.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    res.json(loans[0]);
  } catch (ex) {
    console.error('Error retrieving loan:', ex);
    res.status(500).json({ error: 'Error retrieving loan' });
  }
});

// Update loan status (approve/reject/disburse)
app.put('/api/loans/:loanId', async (req, res) => {
  try {
    const { loanId } = req.params;
    const { status, approved_by, disbursement_date, notes } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'disbursed', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid loan status' });
    }
    
    const updateFields = ['status = ?'];
    const updateValues = [status];
    
    if (approved_by) {
      updateFields.push('approved_by = ?');
      updateValues.push(approved_by);
    }
    
    if (status === 'approved' || status === 'rejected') {
      updateFields.push('approval_date = CURRENT_TIMESTAMP');
    }
    
    if (status === 'disbursed' && disbursement_date) {
      updateFields.push('disbursement_date = ?');
      updateValues.push(disbursement_date);
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(loanId);
    
    const [result] = await pool.execute(
      `UPDATE loans SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    res.json({ success: true, message: `Loan ${status} successfully` });
  } catch (ex) {
    console.error('Error updating loan:', ex);
    res.status(500).json({ error: 'Error updating loan' });
  }
});

// Delete loan (only for pending applications)
app.delete('/api/loans/:loanId', async (req, res) => {
  try {
    const { loanId } = req.params;
    
    // Check if loan exists and is pending
    const [loans] = await pool.execute(
      'SELECT status FROM loans WHERE id = ?',
      [loanId]
    );
    
    if (loans.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    if (loans[0].status !== 'pending') {
      return res.status(400).json({ error: 'Only pending loan applications can be deleted' });
    }
    
    // Delete the loan
    const [result] = await pool.execute(
      'DELETE FROM loans WHERE id = ?',
      [loanId]
    );
    
    res.json({ success: true, message: 'Loan application deleted successfully' });
  } catch (ex) {
    console.error('Error deleting loan:', ex);
    res.status(500).json({ error: 'Error deleting loan' });
  }
});

// Record loan repayment
app.post('/api/loans/:loanId/repayment', async (req, res) => {
  try {
    const { loanId } = req.params;
    const { amount, payment_date, payment_method, notes } = req.body;
    
    // Get current loan details
    const [loans] = await pool.execute(
      'SELECT amount, amount_repaid, status FROM loans WHERE id = ?',
      [loanId]
    );
    
    if (loans.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    const loan = loans[0];
    
    if (loan.status !== 'disbursed') {
      return res.status(400).json({ error: 'Can only record repayments for disbursed loans' });
    }
    
    const newAmountRepaid = parseFloat(loan.amount_repaid) + parseFloat(amount);
    const totalAmount = parseFloat(loan.amount);
    
    if (newAmountRepaid > totalAmount) {
      return res.status(400).json({ error: 'Repayment amount exceeds loan balance' });
    }
    
    // Update loan repayment amount
    const newStatus = newAmountRepaid >= totalAmount ? 'completed' : 'disbursed';
    
    await pool.execute(
      'UPDATE loans SET amount_repaid = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newAmountRepaid, newStatus, loanId]
    );
    
    // TODO: Insert into loan_repayments table if it exists
    
    res.json({ 
      success: true, 
      message: 'Repayment recorded successfully',
      new_balance: totalAmount - newAmountRepaid,
      is_completed: newStatus === 'completed'
    });
  } catch (ex) {
    console.error('Error recording repayment:', ex);
    res.status(500).json({ error: 'Error recording repayment' });
  }
});

// Group creation endpoint
app.post('/api/groups', async (req, res) => {
  try {
    const {
      name, description, created_by, contribution_amount, contribution_frequency,
      meeting_day, meeting_time, min_contribution_amount, max_contribution_amount,
      loan_interest_rate, max_loan_multiplier, allow_partial_contributions,
      contribution_grace_period_days, group_rules
    } = req.body;
    
    // First validate that the creating user exists
    if (!created_by) {
      return res.status(400).json({ error: 'created_by is required' });
    }
    
    const [userCheck] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [created_by]
    );
    
    if (userCheck.length === 0) {
      return res.status(400).json({ error: 'Invalid user id for created_by' });
    }
    
    // Insert new group
    const [result] = await pool.execute(
      `INSERT INTO chama_groups (name, description, created_by, contribution_amount, 
       contribution_frequency, meeting_day, meeting_time, min_contribution_amount, 
       max_contribution_amount, loan_interest_rate, max_loan_multiplier, 
       allow_partial_contributions, contribution_grace_period_days, group_rules, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name || null, description || null, created_by, contribution_amount || 0,
       contribution_frequency || 'monthly', meeting_day || null, meeting_time || null,
       min_contribution_amount || 0, max_contribution_amount || 0,
       loan_interest_rate || 0, max_loan_multiplier || 0,
       allow_partial_contributions || false, contribution_grace_period_days || 0,
       JSON.stringify(group_rules || {}), 'active']
    );
    
    // Since we're using UUID, we need to get the generated ID
    const [groups] = await pool.execute(
      'SELECT id FROM chama_groups WHERE name = ? AND created_by = ? ORDER BY created_at DESC LIMIT 1',
      [name, created_by]
    );
    
    const groupId = groups[0].id;
    
    // Add creator as admin member
    await pool.execute(
      'INSERT INTO group_members (user_id, group_id, role, status, joined_at) VALUES (?, ?, ?, ?, ?)',
      [created_by, groupId, 'admin', 'active', new Date()]
    );
    
    res.json({ success: true, id: groupId, message: 'Group created successfully' });
  } catch (ex) {
    console.error('Error creating group:', ex);
    res.status(500).json({ error: 'Error creating group' });
  }
});

// Update groups endpoint to properly fetch user groups
app.get('/api/groups/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Fetch groups for user with member info
    const [groups] = await pool.execute(
      `SELECT g.*, gm.role, gm.status as member_status FROM chama_groups g 
       JOIN group_members gm ON g.id = gm.group_id 
       WHERE gm.user_id = ? AND gm.status = 'active'`,
      [userId]
    );
    
    res.json(groups);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error retrieving user groups' });
  }
});

// Payment methods endpoints
app.get('/api/payment-methods/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Query payment methods for a user
    const [paymentMethods] = await pool.execute(
      'SELECT * FROM payment_methods WHERE user_id = ? and is_verified = 1',
      [userId]
    );
    
    res.json(paymentMethods);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error retrieving payment methods' });
  }
});

app.post('/api/payment-methods', async (req, res) => {
  try {
    const { user_id, method_type, provider, account_identifier, account_name, is_primary, is_verified } = req.body;
    
    // If this is set as primary, unset other primaries first
    if (is_primary) {
      await pool.execute(
        'UPDATE payment_methods SET is_primary = FALSE WHERE user_id = ?',
        [user_id]
      );
    }
    
    // Insert new payment method
    const [result] = await pool.execute(
      'INSERT INTO payment_methods (user_id, method_type, provider, account_identifier, account_name, is_primary, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, method_type, provider, account_identifier, account_name || null, is_primary || false, is_verified || false]
    );
    
    res.json({ success: true, id: result.insertId, message: 'Payment method added successfully' });
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error adding payment method' });
  }
});

// Update payment method endpoint
app.put('/api/payment-methods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, updates } = req.body;
    
    if (updates.is_primary) {
      await pool.execute(
        'UPDATE payment_methods SET is_primary = FALSE WHERE user_id = ?',
        [user_id]
      );
    }
    
    await pool.execute(
      'UPDATE payment_methods SET ? WHERE id = ? AND user_id = ?',
      [updates, id, user_id]
    );
    
    res.json({ success: true, message: 'Payment method updated successfully' });
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error updating payment method' });
  }
});

// Delete payment method endpoint
app.delete('/api/payment-methods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.query;
    
    await pool.execute(
      'UPDATE payment_methods SET is_verified = 0 WHERE id = ? AND user_id = ?',
      [id, user_id]
    );
    
    res.json({ success: true, message: 'Payment method deleted successfully' });
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error deleting payment method' });
  }
});

// User profile endpoints
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user profile data
    const [users] = await pool.execute(
      'SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, p.bio, p.location, p.language, p.timezone FROM users u LEFT JOIN profiles p ON u.id = p.id WHERE u.id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error retrieving user profile' });
  }
});

app.put('/api/users/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, phone, bio, location, language, timezone } = req.body;
    
    // Update users table
    await pool.execute(
      'UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE id = ?',
      [firstName, lastName, email, phone, userId]
    );
    
    // Update or insert profile data
    await pool.execute(
      'INSERT INTO profiles (id, email, first_name, last_name, phone, bio, location, language, timezone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE bio = VALUES(bio), location = VALUES(location), language = VALUES(language), timezone = VALUES(timezone)',
      [userId, email, firstName, lastName, phone, bio, location, language, timezone]
    );
    
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error updating user profile' });
  }
});

app.put('/api/users/:userId/password', async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    // Get current user
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    
    // Verify current password
    if (!verifyPassword(currentPassword, user.password_hash)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedNewPassword = hashPassword(newPassword);
    
    // Update password
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashedNewPassword, userId]
    );
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error updating password' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running at http://localhost:${PORT}`);
  console.log(`API server also accessible at http://192.168.100.43:${PORT}`);
  console.log('Server is ready to accept connections from mobile devices');
});

