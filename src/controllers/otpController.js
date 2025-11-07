const User = require("../models/userModel");
const generateToken = require("../utils/generateToken"); // JWT token
const twilio = require("twilio");


const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);



const sendOtp = async (req, res) => {
  const { phone } = req.body;
  console.log("ACCOUNT SID:", process.env.TWILIO_ACCOUNT_SID);
  console.log("AUTH TOKEN:", process.env.TWILIO_AUTH_TOKEN);
  console.log("PHONE NUMBER:", process.env.TWILIO_PHONE_NUMBER);

  // 1. Ek 6-digit ka random OTP generate karein
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // 2. OTP ke liye expiry time set karein (10 minute)
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  try {
    // 3. Database mein user ko dhoondho ya naya banao
    // 'upsert: true' ka matlab: agar phone number nahi mila, toh naya user bana do
    const user = await User.findOneAndUpdate(
      { phone },
      { phone, otp, otpExpires },
      { new: true, upsert: true }
    );

    // 4. Twilio se SMS bhejein
    await client.messages.create({
      body: `Aapka OTP hai: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone, // User ka phone number (country code ke saath, jaise +91...)
    });

    res
      .status(200)
      .json({ message: "OTP send successfully", phone: user.phone });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error sending OTP", error: error.message });
  }
};

// @desc    Verify OTP and login user
// @route   POST /api/otp/verify
const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    // 1. User ko phone number se dhoondho
    const user = await User.findOne({ phone });

    // 2. Check karo ki user hai ya nahi
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Check karo ki OTP sahi hai aur expire toh nahi hua
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // 5. User ke liye ek JWT Token banao aur bhej do
    res.json({
      _id: user._id,
      phone: user.phone,
      name: user.name,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { sendOtp, verifyOtp };
