const jwt = require('jsonwebtoken');
const User = require('../model/userSchema');
const { sendOTP, sendPhoneUpdateOTP } = require('../services/smsService');
const { generateAlphanumericOTP } = require('../utils/otpGenerator');

exports.signin = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }

        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ success: false, message: 'Invalid phone number format' });
        }

        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found. Please register yourself first' });
        }

        // Static OTP for test number (1234567890) - for Google Play Store testing
        // Handle different formats: 1234567890, +1234567890, 91234567890, +91234567890
        const normalizedPhone = phoneNumber.replace(/\D/g, ''); // Remove all non-digits
        const isTestNumber = normalizedPhone === '1234567890' || normalizedPhone.endsWith('1234567890');
        
        let otp;
        if (isTestNumber) {
            otp = 'VR95P'; // Static OTP for test user
            console.log('🧪 Test OTP generated for phone:', phoneNumber);
        } else {
            otp = generateAlphanumericOTP();
        }

        const otpExpires = new Date(Date.now() + 2 * 60 * 1000);
        const otpSentAt = new Date();

        await User.findByIdAndUpdate(user._id, {
            otp,
            otpExpires,
            otpSentAt
        });

        // Skip SMS for test number to avoid unnecessary API calls
        if (!isTestNumber) {
            await sendOTP(phoneNumber, otp);
        }

        res.status(200).json({
            success: true,
            message: 'Verification code sent to your phone number'
        });

    } catch (error) {
        console.error('Signin request error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.verifySignin = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        if (!phoneNumber || !otp) {
            return res.status(400).json({ success: false, message: 'Phone number and OTP are required' });
        }

        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check for test number and static OTP
        const normalizedPhone = phoneNumber.replace(/\D/g, ''); // Remove all non-digits
        const isTestNumber = normalizedPhone === '1234567890' || normalizedPhone.endsWith('1234567890');
        
        // For test number, accept static OTP "VR95P" even if not stored (backup check)
        if (isTestNumber && otp === 'VR95P') {
            // If user.otp doesn't exist or is different, update it for test user
            if (!user.otp || user.otp !== 'VR95P') {
                await User.findByIdAndUpdate(user._id, {
                    otp: 'VR95P',
                    otpExpires: new Date(Date.now() + 2 * 60 * 1000)
                });
                // Refetch user to get updated OTP
                const updatedUser = await User.findById(user._id);
                user.otp = updatedUser.otp;
                user.otpExpires = updatedUser.otpExpires;
            }
        }

        if (!user.otp) {
            return res.status(400).json({ success: false, message: 'No signin request found' });
        }

        if (user.otpExpires < new Date()) {
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        await User.findByIdAndUpdate(user._id, {
            $unset: {
                otp: 1,
                otpExpires: 1
            }
        });

        res.status(200).json({
            success: true,
            message: 'Signin successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                phoneNumber: user.phoneNumber
            }
        });

    } catch (error) {
        console.error('Signin verification error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Resend OTP for signin
exports.resendSigninOTP = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }

        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ success: false, message: 'Invalid phone number format' });
        }

        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found. Please register yourself first' });
        }

        // Check for test number
        const normalizedPhone = phoneNumber.replace(/\D/g, ''); // Remove all non-digits
        const isTestNumber = normalizedPhone === '1234567890' || normalizedPhone.endsWith('1234567890');

        // Rate limiting: Check if OTP was sent recently (within last 60 seconds)
        // Skip rate limiting for test number
        if (!isTestNumber && user.otpSentAt && user.otpSentAt > new Date(Date.now() - 60 * 1000)) {
            const timeLeft = Math.ceil((user.otpSentAt - new Date(Date.now() - 60 * 1000)) / 1000);
            return res
                .status(429)
                .json({ 
                    success: false, 
                    message: `Please wait ${timeLeft} seconds before requesting another OTP` 
                });
        }

        // Generate new OTP (static for test number)
        let otp;
        if (isTestNumber) {
            otp = 'VR95P'; // Static OTP for test user
            console.log('🧪 Test OTP resent for phone:', phoneNumber);
        } else {
            otp = generateAlphanumericOTP();
        }

        const otpExpires = new Date(Date.now() + 2 * 60 * 1000);
        const otpSentAt = new Date();

        // Update user with new OTP
        await User.findByIdAndUpdate(user._id, {
            otp,
            otpExpires,
            otpSentAt
        });

        // Skip SMS for test number to avoid unnecessary API calls
        if (!isTestNumber) {
            await sendOTP(phoneNumber, otp);
        }

        res.status(200).json({
            success: true,
            message: 'OTP resent to your phone number'
        });

    } catch (error) {
        console.error('Resend signin OTP error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};