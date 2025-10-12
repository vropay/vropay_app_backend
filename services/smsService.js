const axios = require('axios');

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID; // Correct DLT Template ID
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID;
const MSG91_SMS_URL = 'https://api.msg91.com/api/sendhttp.php';

/**
 * Send OTP using MSG91 API
 * @param {string} phoneNumber - e.g., +919876543210
 * @param {string} otp - OTP code
 */
const sendOTP = async (phoneNumber, otp) => {
  try {
    if (!MSG91_AUTH_KEY || !MSG91_TEMPLATE_ID || !MSG91_SENDER_ID) {
      throw new Error('Missing MSG91 configuration. Please check environment variables.');
    }

    // Format phone number (remove +)
    const formattedPhoneNumber = phoneNumber.replace('+', '').trim();

    // DLT-approved message text (must match your approved template)
    const message = `Use OTP ${otp} to verify your VROPAY(VRPAY) account. This code expires in 2 minutes. Do not share with anyone for security reasons.`;
    

    const params = new URLSearchParams({
      authkey: MSG91_AUTH_KEY,
      mobiles: formattedPhoneNumber,
      message: message,
      sender: MSG91_SENDER_ID,
      route: '4', // Transactional route
      DLT_TE_ID: MSG91_TEMPLATE_ID, // ✅ Correct DLT template ID param
      country: '91'
    });

    const config = {
      method: 'get',
      url: `${MSG91_SMS_URL}?${params.toString()}`,
      headers: { 'Content-Type': 'application/json' }
    };

    console.log('📤 Sending OTP via MSG91:', config.url.replace(MSG91_AUTH_KEY, '[HIDDEN]'));

    const response = await axios(config);
    const result = response.data.toString().trim();

    console.log('📩 MSG91 Response:', result);

    if (
      result.length > 10 &&
      !result.toLowerCase().includes('error') &&
      !result.toLowerCase().includes('not found')
    ) {
      console.log(`✅ OTP sent successfully to ${formattedPhoneNumber}`);
      return { success: true, messageId: result };
    } else {
      console.error(`❌ MSG91 failed: ${result}`);
      throw new Error(result);
    }
  } catch (error) {
    console.error('❌ Error sending OTP via MSG91:', error.message);
    throw error;
  }
};

module.exports = { sendOTP };
