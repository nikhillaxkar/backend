const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp } = require('../controllers/otpController');

// /api/otp/send
router.post('/send', sendOtp);

// /api/otp/verify
router.post('/verify', verifyOtp);

module.exports = router;