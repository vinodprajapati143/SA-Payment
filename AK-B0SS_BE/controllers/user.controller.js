// controllers/users.controller.js
const db = require("../config/db");
// const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

exports.listUsers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        u.id,
        u.username, 
        u.registerType, 
        rr.invite_code AS invitecode, -- referral_relations ka invite_code
        u.phone, 
        u.joiningdate
      FROM users u
      LEFT JOIN referral_relations rr 
        ON u.id = rr.invitee_id   -- relation user ke id se match hoga
      ORDER BY u.id DESC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("listUsers error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

async function generateReferralCode(userId) {
  const [rows] = await db.query("SELECT id, phone, invitecode FROM users WHERE id = ?", [userId]);
  if (rows.length === 0) throw new Error("User not found");

  let user = rows[0];

  if (user.invitecode && user.invitecode.trim() !== '') {
    return user.invitecode;
  }

  const newInviteCode = `AK_${user.phone}`;



  return newInviteCode;
}

// GENERATE REFERRAL CODE API (if needed separately)
exports.getReferralCode = async (req, res) => {
  try {
    const userId = req.user.id; // JWT/token se ya session se aayega
    const [rows] = await db.query("SELECT invitecode FROM users WHERE id = ?", [userId]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ inviteCode: rows[0].invitecode });
  } catch (err) {
    console.error('Error fetching referral code:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getReferralList = async (req, res) => {
  try {
    const referrerId = req.user.id;
    const commission_rate = 0.05; // 5%


    // Get base referral list with invitee details
    const sql = `
      SELECT rr.id, 
             rr.invite_code AS referrer_code,
             u.id AS invitee_id,
             u.username AS invitee_username,
             u.phone AS invitee_phone,
             u.invitecode AS invitee_code,
             rr.created_at
      FROM referral_relations rr
      JOIN users u ON rr.invitee_id = u.id
      WHERE rr.referrer_id = ?
      ORDER BY rr.created_at DESC
    `;

    const [referrals] = await db.query(sql, [referrerId]);

    // If no referrals found, return empty array
    if (!referrals.length) {
      return res.json({ success: true, referrals: [] });
    }

    // Define entry tables for iteration
    const entryTables = [
      'single_ank_entries',
      'jodi_ank_entries',
      'singlepanna_ank_entries'
    ];

    // Process each referral to get their bet details
    const updatedReferrals = [];

    for (const ref of referrals) {
      // Dynamically build UNION ALL query
      const unionQueries = entryTables
        .map(table => `SELECT total_amount AS bid_amount, name AS game_name, batch_id, created_at AS bet_date FROM ${table} WHERE user_id = ?`)
        .join(' UNION ALL ');

      const fullQuery = `${unionQueries} ORDER BY bet_date DESC`;

      // Execute query with repeated invitee_id for each table
      const params = entryTables.map(() => ref.invitee_id);
      const [bets] = await db.query(fullQuery, params);

      // ✅ Group bets by batch_id (one batch = one transaction with multiple digits)
      const batchMap = new Map();

      for (const bet of bets) {
        if (!batchMap.has(bet.batch_id)) {
          batchMap.set(bet.batch_id, {
            bid_amount: Number(bet.bid_amount),
            game_name: bet.game_name,
            batch_id: bet.batch_id,
            bet_date: bet.bet_date
          });
        }
        // If same batch_id appears multiple times (shouldn't for total_amount), skip duplicate
      }

      // Convert Map to Array with commission calculation
      const invitee_bid_commision = Array.from(batchMap.values()).map(b => ({
        bid_amount: b.bid_amount.toFixed(2),
        commission: (b.bid_amount * commission_rate).toFixed(2),
        game_name: b.game_name,
        batch_id: b.batch_id,
        bet_date: b.bet_date
      }));

      // Mask last 5 characters of invitee_code
      let maskedCode = ref.invitee_code;
      if (ref.invitee_code && ref.invitee_code.length > 5) {
        const visiblePart = ref.invitee_code.slice(0, -5);
        maskedCode = visiblePart + "*****";
      }

      // Calculate total stats for this invitee (based on unique batches)
      const totalBidAmount = invitee_bid_commision.reduce((sum, b) => sum + Number(b.bid_amount), 0);
      const totalCommission = totalBidAmount * commission_rate;

      updatedReferrals.push({
        id: ref.id,
        referrer_code: ref.referrer_code,
        invitee_username: ref.invitee_username,
        invitee_phone: ref.invitee_phone,
        invitee_code: maskedCode,
        total_bids: invitee_bid_commision.length, // Unique batches count
        total_bid_amount: totalBidAmount.toFixed(2),
        total_commission: totalCommission.toFixed(2),
        invitee_bid_commision: invitee_bid_commision,
        created_at: ref.created_at
      });
    }

    return res.json({
      success: true,
      total_referrals: updatedReferrals.length,
      referrals: updatedReferrals
    });

  } catch (error) {
    console.error("Referral List API error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// User Profile Controller
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // 👈 auth middleware se aayega

    const [rows] = await db.query(
      "SELECT id, username, registerType, phone, countryCode, joiningDate FROM users WHERE id = ?",
      [userId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      data: rows[0]   // 👈 ab id ke saath details aayengi
    });
  } catch (err) {
    console.error("Profile API Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// User Profile Controller
exports.updateUserProfile = async (req, res) => {
  try {
    const { id, username, phone, countryCode } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    // Update query
    const [result] = await db.query(
      "UPDATE users SET username = ?, phone = ?, countryCode = ? WHERE id = ?",
      [username, phone, countryCode, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found or no changes" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully"
    });
  } catch (err) {
    console.error("Update Profile API Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllUsersWithWallet = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        u.id AS user_id,
        u.username,
        u.registerType,
        u.phone,

        COALESCE(
          (SELECT balance_after 
           FROM user_wallet uw 
           WHERE uw.user_id = u.id 
           ORDER BY uw.id DESC LIMIT 1), 0
        ) AS normal_balance
      FROM users u
    `);
    res.json({ users: rows });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users with wallet balances.' });
  }
};

exports.transferBalance = async (req, res) => {
  try {
    const operatorId = req.user.id;
    const { userId, amount, remark, password } = req.body;

    // Input validation
    if (!userId || !amount || !password) {
      return res.status(400).json({ message: 'Required fields missing.' });
    }
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number.' });
    }
    if (userId === operatorId) {
      return res.status(400).json({ message: 'Cannot transfer to own account.' });
    }

    // 1. Fetch operator ka hashed password
    const [userRows] = await db.query('SELECT pwd FROM users WHERE id = ?', [operatorId]);
    if (!userRows.length) {
      return res.status(400).json({ message: 'Operator not found.' });
    }

    // 2. Compare input password with hash (exactly like login)
    const validPass = await bcrypt.compare(password, userRows[0].pwd);
    if (!validPass) {
      return res.status(400).json({ message: 'Incorrect login password.' });
    }

    // 3. Further balance transfer logic...
    // Fetch receiver's last balance
    const [walletRows] = await db.query(
      'SELECT balance_after FROM user_wallet WHERE user_id = ? ORDER BY id DESC LIMIT 1',
      [userId]
    );
    const currentBalance = walletRows.length ? Number(walletRows[0].balance_after) : 0;
    const newBalance = currentBalance + Number(amount);

    // Insert new wallet transaction
    await db.query(
      'INSERT INTO user_wallet (user_id, transaction_type, amount, balance_after, description, reference_id, created_at) VALUES (?, ?, ?, ?, ?, NULL, NOW())',
      [userId, 'CREDIT', amount, newBalance, remark || 'Balance transfer']
    );

    return res.json({ message: 'Balance transferred successfully.', balance: newBalance });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong.', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const childTables = [
      { name: "user_wallet", col: "user_id" },
      { name: "withdrawal_requests", col: "user_id" },
      { name: "user_payment_details", col: "user_id" },
      { name: "payment_orders", col: "user_id" },
      { name: "single_ank_entries", col: "user_id" },
      { name: "jodi_ank_entries", col: "user_id" },
      { name: "singlepanna_ank_entries", col: "user_id" },
      { name: "referral_relations", col: "invitee_id" },
      { name: "referral_relations", col: "referrer_id" }
    ];

    for (const table of childTables) {
      try {
        await db.query(`DELETE FROM ${table.name} WHERE ${table.col} = ?`, [id]);
      } catch (e) {
        // Silently skip if table doesn't exist or other minor issues
        console.warn(`Could not delete from ${table.name}:`, e.message);
      }
    }

    const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  }
};

// exports.contactForm = async (req, res) => {
//   try {
//     const { firstName, lastName, username, emailId, password, mobileNumber } = req.body;

//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.MAIL_USER || 'vinodpraja075@gmail.com',
//         pass: process.env.MAIL_PASS || 'uuti tzbm gydu dpcz'
//       }
//     });

//     const mailOptions = {
//       from: emailId,
//       to: 'vinodpraja075@gmail.com',
//       subject: `New Contact Request from ${firstName} ${lastName}`,
//       text: `
//         Contact Request Details:
//         ----------------------------------
//         First Name: ${firstName}
//         Last Name: ${lastName}
//         Username: ${username}
//         Email ID: ${emailId}
//         Password: ${password}
//         Mobile Number: ${mobileNumber}
//         ----------------------------------
//       `
//     };

//     await transporter.sendMail(mailOptions);
//     res.json({ success: true, message: "Email sent successfully" });
//   } catch (err) {
//     console.error("contactForm error:", err);
//     res.status(500).json({ success: false, message: "Failed to send email. Check SMTP settings.", error: err.message });
//   }
// };
