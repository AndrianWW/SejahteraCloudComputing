const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);

router.use(authMiddleware);

router.get('/:userId', authMiddleware, userController.getProfile); 
router.put('/:userId', authMiddleware, userController.updateProfile);

module.exports = router;