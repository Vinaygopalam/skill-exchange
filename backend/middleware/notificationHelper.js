const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');
const User = require('../models/user');

const emailConfig = {
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
};

const isEmailConfigured = Boolean(
  emailConfig.host &&
  emailConfig.port &&
  emailConfig.auth.user &&
  emailConfig.auth.pass
);

const transporter = isEmailConfigured ? nodemailer.createTransport(emailConfig) : null;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

const buildActionLink = (actionUrl) => {
  if (!actionUrl) return frontendUrl;
  return `${frontendUrl}${actionUrl.startsWith('/') ? actionUrl : `/${actionUrl}`}`;
};

const sendEmail = async ({ to, subject, text, html }) => {
  if (!isEmailConfigured || !transporter || !to) return;
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending email notification:', err.message);
  }
};

const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();

    if (notificationData.sendEmail) {
      const user = await User.findById(notificationData.userId);
      if (user?.email) {
        const actionLink = buildActionLink(notificationData.actionUrl);
        const text = `${notificationData.message}\n\nOpen the SkillExchange app to continue: ${actionLink}`;
        const html = `
          <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;">
            <h2>${notificationData.title}</h2>
            <p>${notificationData.message}</p>
            <p><a href="${actionLink}" style="color:#2563eb;text-decoration:none;">Open SkillExchange</a></p>
          </div>
        `;

        await sendEmail({
          to: user.email,
          subject: notificationData.title,
          text,
          html
        });
      }
    }

    return notification;
  } catch (err) {
    console.error('Error creating notification:', err.message);
  }
};

module.exports = {
  createNotification
};
