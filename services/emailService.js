const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmailOTP = async (email, otp) => {
  const htmlTemplate = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>VroPay Verification Code</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f5f7fa;
        color: #333;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 480px;
        margin: 40px auto;
        background: #fff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0,0,0,0.08);
      }
      .header {
        background: linear-gradient(135deg, #4e54c8, #8f94fb);
        color: white;
        text-align: center;
        padding: 25px 20px;
      }
      .header h1 {
        margin: 0;
        font-size: 22px;
        letter-spacing: 1px;
      }
      .content {
        padding: 30px 25px;
        text-align: center;
      }
      .otp-box {
        font-size: 28px;
        font-weight: bold;
        background: #f3f3f3;
        padding: 15px 25px;
        border-radius: 8px;
        display: inline-block;
        letter-spacing: 3px;
        margin-top: 10px;
        color: #4e54c8;
      }
      .footer {
        font-size: 13px;
        color: #888;
        text-align: center;
        padding: 15px 20px 25px;
        border-top: 1px solid #eee;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>VroPay Verification</h1>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>Your verification code for <strong>VroPay</strong> is:</p>
        <div class="otp-box">${otp}</div>
        <p style="margin-top: 20px;">This code will expire in <strong>2 minutes</strong>.</p>
        <p>If you didn’t request this, please ignore this email.</p>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} VroPay. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;

  await transporter.sendMail({
    from: `"VroPay" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your VroPay Verification Code',
    html: htmlTemplate,
  });
};

const sendEmailUpdateOTP = async (email, otp) => {
  const htmlTemplate = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>VroPay Email Update Verification</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f5f7fa;
        color: #333;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 480px;
        margin: 40px auto;
        background: #fff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0,0,0,0.08);
      }
      .header {
        background: linear-gradient(135deg, #4e54c8, #8f94fb);
        color: white;
        text-align: center;
        padding: 25px 20px;
      }
      .header h1 {
        margin: 0;
        font-size: 22px;
        letter-spacing: 1px;
      }
      .content {
        padding: 30px 25px;
        text-align: center;
      }
      .otp-box {
        font-size: 28px;
        font-weight: bold;
        background: #f3f3f3;
        padding: 15px 25px;
        border-radius: 8px;
        display: inline-block;
        letter-spacing: 3px;
        margin-top: 10px;
        color: #4e54c8;
      }
      .footer {
        font-size: 13px;
        color: #888;
        text-align: center;
        padding: 15px 20px 25px;
        border-top: 1px solid #eee;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>VroPay Email Update</h1>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>Your verification code to update your email address for <strong>VroPay</strong> is:</p>
        <div class="otp-box">${otp}</div>
        <p style="margin-top: 20px;">This code will expire in <strong>2 minutes</strong>.</p>
        <p>If you didn't request this email update, please ignore this email.</p>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} VroPay. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;

  await transporter.sendMail({
    from: `"VroPay" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your VroPay Email Update Verification Code',
    html: htmlTemplate,
  });
};

module.exports = { sendEmailOTP, sendEmailUpdateOTP };