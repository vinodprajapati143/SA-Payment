
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const axios = require("axios");


// old regiter starts
// exports.register = async (req, res) => {
//   try {
//     const {
//       username,
//       smsvcode,
//       registerType,
//       pwd,
//       invitecode,
//       domainurl,
//       phonetype,
//       captchaId,
//       track,
//       deviceId,
//       language,
//       random,
//       signature,
//       timestamp,
//       phone,
//       countryCode,
//       agree,
//     } = req.body;

//     // ✅ Required Field Validations
//     if (!username || !pwd) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "Username and password are required",
//         });
//     }

//     if (!phone) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Phone number is required" });
//     }
//     // ✅ Phone Format Check (optional)
//     if (phone && !/^\d{6,15}$/.test(phone)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid phone number" });
//     }
//     // ✅ Password Strength Check
//     if (pwd.length < 6) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "Password must be at least 6 characters long",
//         });
//     }

//     if (agree !== true) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "You must agree to the terms and conditions",
//         });
//     }

//     // ✅ Check if user already exists
//     const [existingUser] = await db.query(
//       "SELECT id FROM users WHERE username = ?",
//       [username]
//     );
//     if (existingUser.length > 0) {
//       return res
//         .status(409)
//         .json({ success: false, message: "Username already exists" });
//     }

//     // ✅ Hash password
//     const hashedPwd = await bcrypt.hash(pwd, 10);

//     const sql = `
//       INSERT INTO users (
//         username, smsvcode, registerType, pwd, invitecode,
//         domainurl, phonetype, captchaId, track, deviceId,
//         language, random, signature, timestamp,
//         phone, countryCode, agree
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     const values = [
//       username,
//       smsvcode,
//       registerType,
//       hashedPwd,
//       invitecode,
//       domainurl,
//       phonetype,
//       captchaId,
//       track,
//       deviceId,
//       language,
//       random,
//       signature,
//       timestamp,
//       phone,
//       countryCode,
//       agree,
//     ];

//     await db.query(sql, values);

//     return res.status(200).json({
//       success: true,
//       message: "User registered successfully",
//     });
//   } catch (error) {
//     console.error("Register API Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//       error: error.message,
//     });
//   }
// };

// login api
// old register ends

// new register based on refer starts




// REGISTER API
exports.register = async (req, res) => {
  try {
    const {
      username,
      email,
      smsvcode,
      registerType,
      pwd,
      invitecode,    // Referrer ka code (agar diya h)
      domainurl,
      phonetype,
      captchaId,
      track,
      deviceId,
      language,
      random,
      signature,
      timestamp,
      phone,
      countryCode,
      agree
    } = req.body;

    // Basic validations
    if (!username || !pwd || !phone || !email || agree !== true) {
      return res.status(400).json({ success: false, message: "Required fields missing or terms not agreed." });
    }

    const phoneRegex = /^[0-9]{10}$/; // India ke liye 10 digit

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number. Must be 10 digits"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Email check
    const [emailCheck] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (emailCheck.length > 0) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    // Phone check
    const [phoneCheck] = await db.query("SELECT id FROM users WHERE phone = ?", [cleanPhone]);
    if (phoneCheck.length > 0) {
      return res.status(409).json({ success: false, message: "Phone already exists" });
    }

    // Check existing user
    const [existingUser] = await db.query("SELECT id FROM users WHERE username = ?", [username]);
    if (existingUser.length > 0) {
      return res.status(409).json({ success: false, message: "Username already exists" });
    }

    // Hash password
    const hashedPwd = await bcrypt.hash(pwd, 10);

    // Find referrer id by invitecode if available
    let referrerId = null;
    if (invitecode) {
      const [referrer] = await db.query(
        "SELECT id FROM users WHERE invitecode = ? LIMIT 1",
        [invitecode]
      );
      if (referrer.length > 0) {
        referrerId = referrer[0].id;
      }
    }

    // Insert new user (invitecode abhi blank rakhenge, baad me generate hoga)
    const sql = `
      INSERT INTO users (
        username, email, smsvcode, registerType, pwd,
        domainurl, phonetype, captchaId, track, deviceId,
        language, random, signature, timestamp,
        phone, countryCode, agree, referrer_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?)
    `;

    const values = [
      username, email, smsvcode, registerType, hashedPwd,
      domainurl, phonetype, captchaId, track, deviceId,
      language, random, signature, timestamp,
      phone, countryCode, agree, referrerId
    ];

    const result = await db.query(sql, values);
    const newUserId = result[0].insertId;

    // Generate unique referral code for this new user
    const newInviteCode = `AK_${phone}`;
    await db.query("UPDATE users SET invitecode = ? WHERE id = ?", [newInviteCode, newUserId]);

    // Save referral relation if referrer exists
    if (referrerId) {
      const referralSql = `
        INSERT INTO referral_relations (referrer_id, invitee_id, invite_code, invitee_invitecode)
        VALUES (?, ?, ?, ?)
      `;
      await db.query(referralSql, [referrerId, newUserId, invitecode, newInviteCode]);
    }

    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      inviteCode: newInviteCode
    });

  } catch (error) {
    console.error("Register API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
// new register based on refer ends




exports.loginUser = async (req, res) => {
  try {
    const {
      phone,
      pwd,
      phonetype,
      logintype,
      language,
      random,
      signature,
      timestamp,
      countryCode
    } = req.body;

    if (!phone || !pwd) {
      return res.status(400).json({ message: "Phone and password are required" });
    }

    // ✅ Use await with promisePool
    const [result] = await db.query(`SELECT * FROM users WHERE phone = ? LIMIT 1`, [phone]);

    if (result.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(pwd, user.pwd);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const tokenPayload = {
      id: user.id,
      username: user.username,
      phone: user.phone,
      registerType: user.registerType,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        registerType: user.registerType,
        countryCode,
        phonetype,
        logintype,
        language,
        random,
        signature,
        timestamp,
      },
    });
  } catch (error) {
    console.error("Catch Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.logoutUser = async (req, res) => {
  try {
  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
  }catch (error) {
    console.error("Catch Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.sendForgotOtp = async (req, res) => {
  const { phone, countryCode } = req.body;

  if (!phone || !countryCode) {
    return res.status(400).json({ success: false, message: "Phone and country code required" });
  }

  

  try {
    // 1️⃣ User check
    const [user] = await db.query(
      "SELECT * FROM users WHERE phone = ? AND countryCode = ?",
      [phone, countryCode]
    );
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2️⃣ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiryMinutes = 2;

    // 3️⃣ Send OTP via WhatsApp (Sarobotic API)
    const apiKey = process.env.SAROBOTIC_API_KEY;
    const message = encodeURIComponent(
      `Well Come To ak247pro.com \n\nYour OTP is ${otp}. It will expire in ${expiryMinutes} minutes.`
    );

    const url = `https://www.sarobotic.in/api/whatsapp/send?contacts=${countryCode}${phone}&message=${message}`;

    const response = await axios.get(url, {
      headers: { "Api-key": apiKey }
    });

    // 4️⃣ Check API response
    if (response.data.success) {
      // ✅ Save OTP in DB only if sent successfully
      await db.query(
        "UPDATE users SET otp = ?, otp_expiry = DATE_ADD(NOW(), INTERVAL ? MINUTE) WHERE phone = ? AND countryCode = ?",
        [otp, expiryMinutes, phone, countryCode]
      );

      return res.status(200).json({ success: true, message: "OTP sent via WhatsApp successfully" });
    } else {
      return res.status(500).json({ success: false, message: "Failed to send OTP via WhatsApp" });
    }

  } catch (error) {
    console.error("Sarobotic WhatsApp OTP Error:", error.response?.data || error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.verifyOtpAndResetPassword = async (req, res) => {
  const { phone, countryCode, otp, newPassword } = req.body;

  if (!phone || !countryCode || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const [user] = await db.query(
      'SELECT * FROM users WHERE phone = ? AND countryCode = ?',
      [phone, countryCode]
    );

    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const dbUser = user[0];
    const now = new Date();
    const expiry = new Date(dbUser.otp_expiry);

    // ✅ OTP match check
    if (dbUser.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // ✅ OTP expiry check
    if (now > expiry) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // ✅ Hash new password
    const hashedPwd = await bcrypt.hash(newPassword, 10);

    // ✅ Update password in DB and clear OTP
    await db.query(
      'UPDATE users SET pwd = ?, otp = NULL, otp_expiry = NULL WHERE phone = ? AND countryCode = ?',
      [hashedPwd, phone, countryCode]
    );

    res.status(200).json({ success: true, message: "Password reset successfully" });

  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ success: false, message: "Failed to reset password" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const [userResult] = await db.query("SELECT pwd FROM users WHERE id = ?", [userId]);
    if (!userResult.length) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, userResult[0].pwd);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Old password incorrect" });
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET pwd = ? WHERE id = ?", [hashedNew, userId]);

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};






