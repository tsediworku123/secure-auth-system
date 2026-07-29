const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('📧 Testing email configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? '***set***' : 'NOT SET');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  try {
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');

    // Send test email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email',
      text: 'This is a test email from your password reset system.',
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Full error:', error);
  }
}

testEmail();
