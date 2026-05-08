const db = require("../config/db");
const axios = require('axios');
const EKQR_API_KEY = process.env.EKQR_API_KEY;


// Get User Wallet Balance (latest)
exports.getUserWalletBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      "SELECT balance_after FROM user_wallet WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [userId]
    );
    const balance = rows.length ? rows[0].balance_after : 0;
    res.json({ user_id: userId, balance });
  } catch (err) {
    res.status(500).json({ message: 'Error getting wallet balance.' });
  }
};

exports.createAddMoneyOrder = async (req, res) => {
  try {
    const user = req.user; // from authMiddleware
    console.log('user: ', user);
    const { amount } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ success: false, message: "Minimum amount is ₹1" });
    }

    // 1. Create unique client_txn_id each request
    const client_txn_id = Date.now() + '_' + user.id + '_' + Math.round(Math.random() * 10000);
    const redirectUrl = "https://ak247pro.com/user/add-amount";
    // 2. Prepare API request payload
    const payload = {
      key: process.env.EKQR_API_KEY,
      client_txn_id,
      amount: String(amount),
      p_info: "Wallet Recharge",
      customer_name: user.username,
      customer_email: "tbz0u@tiffincrane.com",
      customer_mobile: user.phone,
      redirect_url: redirectUrl, // Or wherever you want (handle result here)
      udf1: user.id.toString()
    };

    // 3. Call ekQR API (with error handling)
    console.log('payload: ', payload);
    const ekqrResp = await axios.post('https://api.ekqr.in/api/create_order', payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (!ekqrResp.data.status) {
      return res.status(400).json({ success: false, message: ekqrResp.data.msg || 'Gateway order create failed' });
    }

    // 4. Insert this order in payment_orders with status pending
    await db.query(
      `INSERT INTO payment_orders (client_txn_id, user_id, amount, status, created_at)
       VALUES (?, ?, ?, 'pending', NOW())`,
      [client_txn_id, user.id, amount]
    );

    // 5. Return payment_url and order id to frontend
    res.json({
      success: true,
      payment_url: ekqrResp.data.data.payment_url,
      client_txn_id
    });
  } catch (err) {
    console.error('createAddMoneyOrder', err?.response?.data || err);
    res.status(500).json({ success: false, message: 'Internal error. Please try again.' });
  }
};

exports.ekqrWebhook = async (req, res) => {
  try {
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    const data = req.body;
    console.log('data: webhook ', data);
    const { client_txn_id, status, amount, upi_txn_id, remark, id } = data;

    // 1. Check if already credited (idempotency)
    const [alreadyCredited] = await db.query(
      "SELECT id FROM user_wallet WHERE description=? AND transaction_type='CREDIT'",
      [`UPI Recharge ${client_txn_id}`]
    );
    if (alreadyCredited.length) return res.status(200).send('Already credited');

    // 2. Fetch user_id from payment_orders
    const [orderRows] = await db.query(
      "SELECT user_id, amount FROM payment_orders WHERE client_txn_id = ? LIMIT 1",
      [client_txn_id]
    );
    if (!orderRows.length) return res.status(400).send('Payment order not found');

    // 3. On success, credit wallet
    if (status === "success") {
      const userId = orderRows[0].user_id;
      const newAmt = Number(amount);
      const [walletRows] = await db.query(
        "SELECT balance_after FROM user_wallet WHERE user_id=? ORDER BY id DESC LIMIT 1",
        [userId]
      );
      const oldBal = walletRows.length ? Number(walletRows[0].balance_after) : 0;
      const newBal = oldBal + newAmt;
        await db.query(
        `INSERT INTO user_wallet (user_id, transaction_type, amount, balance_after, description, reference_id, created_at)
        VALUES (?, 'CREDIT', ?, ?, ?, ?, NOW())`,
        [userId, newAmt, newBal, `UPI Recharge ${client_txn_id}`, upi_txn_id || id]
      );

      await db.query("UPDATE payment_orders SET status='success', payment_id=?, remark=?, completed_at=NOW() WHERE client_txn_id=?", [upi_txn_id || id, remark && remark.length ? remark : "Recharge successful via webhook", client_txn_id]);
      return res.status(200).send('Wallet credited');
    } else {
        let failRemark = "Webhook payment failed";
        // Agar remark aa raha hai to usme specific reason rakh sakte hain
        if (remark && remark.length) failRemark = `Webhook fail: ${remark}`;
        else if (!orderRows.length) failRemark = "Payment order not found";
        else if (alreadyCredited.length) failRemark = "Duplicate credit attempt";
      // On fail, just update payment_orders status
      await db.query("UPDATE payment_orders SET status='failed', remark=? WHERE client_txn_id=?", [failRemark, client_txn_id]);
      return res.status(200).send('Failed marked');
    }
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Webhook error');
  }
};

exports.checkOrderStatus = async (req, res) => {
  try {
    const { client_txn_id } = req.query;
    if (!client_txn_id) {
      return res.status(400).json({ success: false, message: "client_txn_id required" });
    }

    // Prepare payload for ekQR API
    const bodyData = {
      key: process.env.EKQR_API_KEY,
      client_txn_id,
      txn_date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'), // DD-MM-YYYY format
    };

    // Call ekQR order status API
    const ekqrResponse = await axios.post('https://api.ekqr.in/api/check_order_status', bodyData, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (!ekqrResponse.data.status) {
      return res.status(400).json({ success: false, message: ekqrResponse.data.msg });
    }

    // Send status and data back to frontend
    res.json({  
      success: true,
      status: ekqrResponse.data.data.status,
      data: ekqrResponse.data.data
    });

  } catch (error) {
    console.error('checkOrderStatus error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getAddMoneyListAllStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. ASC for correct balance chain
    const [orders] = await db.query(
      `SELECT * FROM payment_orders WHERE user_id=? ORDER BY created_at ASC`,
      [userId]
    );
    const [walletRows] = await db.query(
      `SELECT * FROM user_wallet WHERE user_id=? ORDER BY id ASC`,
      [userId]
    );

    // UPI Recharge credits mapping
    const walletCreditsByTxnId = {};
    walletRows.forEach(w => {
      const match = /UPI Recharge ([^ ]+)/.exec(w.description);
      if (match && match[1]) walletCreditsByTxnId[match[1]] = w;
    });

    let addMoneyList = [];
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const walletCredit = walletCreditsByTxnId[order.client_txn_id];

      // Wallet balance just BEFORE this created_at (chain-wise)
      let openingBalance = 0;
      for (let j = 0; j < walletRows.length; j++) {
        if (new Date(walletRows[j].created_at) < new Date(order.created_at)) {
          openingBalance = Number(walletRows[j].balance_after);
        } else {
          break;
        }
      }

      let closingBalance = openingBalance;
      if (order.status === 'success' && walletCredit) {
        closingBalance = Number(walletCredit.balance_after);
      }

      addMoneyList.push({
        client_txn_id: order.client_txn_id,
        added_at: order.completed_at || order.created_at,
        status: order.status,
        recharge_amount: order.amount,
        opening_balance: openingBalance,
        closing_balance: closingBalance,
        payment_id: order.payment_id,
        remark: order.remark,
        tax: 0,
        amount_after_tax: walletCredit ? walletCredit.amount : order.amount
      });
    }

    // Reverse output for latest first
    addMoneyList = addMoneyList.reverse();

    return res.json(addMoneyList);
  } catch (err) {
    console.error('AddMoneyListAllStatus API error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};










 
