const express = require("express");
const router = express.Router();
const withdrawalController = require("../controllers/withdrawalController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post('/create', verifyToken, withdrawalController.createWithdrawalRequest); // 03/11/2025 -----> Paid
router.get('/withdrawl-req',verifyToken, withdrawalController.getWithdrawalsWithBalance); // 03/11/2025 -----> Paid
router.get('/withdrawllist',verifyToken, withdrawalController.getAllWithdrawalRequests); // 03/11/2025 -----> Paid
router.post('/adminProcessWithdrawal', verifyToken, withdrawalController.adminProcessWithdrawal); // 03/11/2025 -----> Paid





module.exports = router;

