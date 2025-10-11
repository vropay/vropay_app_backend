/**
 * Generates a random alphanumeric OTP
 * @param {number} length - Length of the OTP (default: 5)
 * @returns {string} - Alphanumeric OTP string
 */
const generateAlphanumericOTP = (length = 5) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    otp += characters[randomIndex];
  }
  
  return otp;
};

module.exports = { generateAlphanumericOTP };
