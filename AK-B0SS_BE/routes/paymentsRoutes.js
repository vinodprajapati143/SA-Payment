const express = require("express");
const router = express.Router();
const paymentsControllers = require("../controllers/paymentsControllers");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post('/save', verifyToken, paymentsControllers.savePaymentDetails); // 03/11/2025 -----> Paid
router.get("/details", verifyToken, paymentsControllers.getPaymentDetails); // 03/11/2025 -----> Paid

module.exports = router;
