const mongoose = require("mongoose");

// Puraana email/password wala schema hata rahe hain (ya aap rakh bhi sakte hain)
const userSchema = mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    // Aap user ka naam, email etc. baad mein bhi le sakte hain
    name: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
