const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Public routes (no token required)
router.get("/public-game-list", gameController.getPublicGames); // 10/08/2025 -----> Paid
router.get("/public-game-result", gameController.getPublicGameResults);// 10/08/2025 -----> Paid
router.get('/:gameId/jodi-records', gameController.getJodiRecords);// 10/08/2025 -----> Paid
router.get('/:gameId/panel-records', gameController.getPanelRecords);// 10/08/2025 -----> Paid
// Protected routes (token required)
router.use(verifyToken); // 03/11/2025 -----> Paid
router.get("/getAllPlayingRecords", gameController.getAllPlayingRecords); // 03/11/2025 -----> Paid
router.get("/getAllWinRecords", gameController.getAllPlayingRecordsWithWinForRange); // 03/11/2025 -----> Paid

router.post("/add-game",  gameController.addGame);// 10/08/2025 -----> Paid
router.get("/game-list", gameController.getGameList);// 10/08/2025 -----> Paid
router.get("/nearest-game-list", gameController.getNearestGames);// 10/08/2025 -----> Paid
router.get("/user-game-list", gameController.getUserBoardGames);// 10/08/2025 -----> Paid
router.post("/save-game-input", gameController.saveGameInput);// 10/08/2025 -----> Paid
router.get('/:id', gameController.getGameById);// 10/08/2025 -----> Paid
router.put('/:id', gameController.updateGameById);// 10/08/2025 -----> Paid
router.post('/single-ank/entry', gameController.addSingleAnk);// 10/08/2025 -----> Paid

router.post('/jodi-ank/entry', gameController.addJodiAnk); // 03/11/2025 -----> Paid
router.post('/singlepanna-ank/entry', gameController.addSinglePannaAnk); // 03/11/2025 -----> Paid




module.exports = router;