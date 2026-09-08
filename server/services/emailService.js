const nodemailer = require('nodemailer');

/**
 * Creates and configures Nodemailer Transporter
 */
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER || process.env.ADMIN_EMAIL || 'mohankhandagale200711@gmail.com';
  const emailPass = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;

  if (emailPass && emailPass.trim()) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser.trim(),
        pass: emailPass.trim().replace(/\s+/g, ''), // remove accidental spaces in app password
      },
    });
  }

  // Return null if no app password configured
  return null;
};

/**
 * Sends a 6-digit OTP verification email to user
 */
const sendOtpEmail = async (toEmail, otpCode, userName = 'Student') => {
  const transporter = createTransporter();
  const senderEmail = process.env.EMAIL_USER || process.env.ADMIN_EMAIL || 'mohankhandagale200711@gmail.com';

  const htmlTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Peervo Account</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #020617; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #0f172a; border-radius: 24px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      <!-- Header with Gradient Accent -->
      <tr>
        <td style="padding: 36px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(147, 51, 234, 0.15)); border-bottom: 1px solid #1e293b;">
          <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; background: linear-gradient(135deg, #4f46e5, #9333ea); border-radius: 14px; color: #ffffff; font-size: 24px; font-weight: 800; text-align: center; margin-bottom: 12px; box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.4);">
            P
          </div>
          <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Peervo</h1>
          <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px; font-weight: 500;">Student Portfolio & Collaboration Platform</p>
        </td>
      </tr>

      <!-- Body Content -->
      <tr>
        <td style="padding: 40px;">
          <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 20px; font-weight: 700;">Account Verification</h2>
          <p style="margin: 0 0 24px 0; color: #cbd5e1; font-size: 15px; line-height: 1.6;">
            Hi <strong style="color: #ffffff;">${userName}</strong>, welcome to Peervo! Please use the 6-digit verification code below to confirm your real email address and activate your account.
          </p>

          <!-- OTP Code Box -->
          <div style="background-color: #020617; border: 1px solid #312e81; border-radius: 16px; padding: 24px; text-align: center; margin: 30px 0;">
            <span style="display: block; color: #818cf8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Your Verification Code</span>
            <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #ffffff; text-shadow: 0 0 20px rgba(99, 102, 241, 0.5); padding-left: 10px;">
              ${otpCode}
            </div>
            <span style="display: block; color: #64748b; font-size: 12px; margin-top: 10px;">⏱️ Code expires in <strong>10 minutes</strong></span>
          </div>

          <p style="margin: 0 0 16px 0; color: #94a3b8; font-size: 13px; line-height: 1.5;">
            🔒 <strong>Security Notice:</strong> If you did not attempt to register an account on Peervo, please ignore this email. Never share your verification code with anyone.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding: 24px 40px; background-color: #020617; border-top: 1px solid #1e293b; text-align: center;">
          <p style="margin: 0; color: #475569; font-size: 12px;">
            &copy; ${new Date().getFullYear()} Peervo Platform. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  if (!transporter) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📨 [EMAIL SIMULATION] Verification OTP for ${toEmail}:`);
    console.log(`👉 CODE: [ ${otpCode} ] (Valid for 10 minutes)`);
    console.log('💡 Note: Set EMAIL_PASS in Render Environment to deliver live Gmail emails.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Peervo Verification" <${senderEmail}>`,
      to: toEmail,
      subject: `🔐 Your Peervo Verification Code: ${otpCode}`,
      text: `Your Peervo verification code is: ${otpCode}. It expires in 10 minutes.`,
      html: htmlTemplate,
    });

    console.log(`✅ Verification email sent to ${toEmail} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send verification email to ${toEmail}:`, error.message);
    // Fallback: log code so development and registration never get blocked
    console.log(`👉 FALLBACK CODE: [ ${otpCode} ] for ${toEmail}`);
    return { success: false, error: error.message };
  }
};

module.exports = { sendOtpEmail };
