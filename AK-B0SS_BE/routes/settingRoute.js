const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const settingsController = require('../controllers/settingController')


router.get('/settings', settingsController.getSettings);
router.put('/settings', verifyToken, settingsController.updateSettings);

module.exports = router;