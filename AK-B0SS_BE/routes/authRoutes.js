const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/register', authController.register); // 10/8/2025 -----> Paid
router.post('/login', authController.loginUser); // 10/8/2025 -----> Paid
router.post('/logout', authController.logoutUser); // 10/8/2025 -----> Paid
router.post("/send-forgot-otp", authController.sendForgotOtp); // 10/8/2025 -----> Paid
router.post("/reset-password", authController.verifyOtpAndResetPassword); // 10/8/2025 -----> Paid
router.post('/change-password', verifyToken, authController.changePassword); // 10/8/2025 -----> Paid



module.exports = router;