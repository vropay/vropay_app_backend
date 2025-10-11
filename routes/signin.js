const express = require("express");
const router = express.Router();
const signinCtrl = require('../controller/signin');


// signin
router.post('/signin', signinCtrl.signin);
router.post('/verify-signin', signinCtrl.verifySignin);

// resend OTP for signin
router.post('/resend-signin-otp', signinCtrl.resendSigninOTP);

module.exports = router;