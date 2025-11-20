import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

// --- 1. BAN / UNBAN NOTIFICATION ---
export const sendBanStatusEmail = async (userEmail, userName, isBanned) => {
  try {
    const status = isBanned ? 'Suspended' : 'Reactivated';
    const color = isBanned ? '#d32f2f' : '#2e7d32'; // Red for ban, Green for unban
    
    const subject = isBanned 
      ? 'Important: Your Durga Grocery Shop Account Has Been Suspended' 
      : 'Good News: Your Durga Grocery Shop Account Has Been Reactivated';

    const messageBody = isBanned
      ? `<p>We regret to inform you that your account has been <b>suspended</b> due to a violation of our terms.</p>
         <p>If you believe this is a mistake, please contact our support.</p>`
      : `<p>We are pleased to inform you that your account has been <b>reactivated</b>.</p>
         <p>You may now log in and access your dashboard.</p>`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
        <div style="background-color: ${color}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="margin:0;">Durga Grocery Shop</h2>
          <h3 style="margin:10px 0 0 0; font-weight:normal;">Account ${status}</h3>
        </div>
        <div style="padding: 20px;">
          <p>Hi ${userName},</p>
          ${messageBody}
          <br/>
          <p>Regards,<br/><b>Durga Grocery Shop Team</b></p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Durga Grocery Support" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: subject,
      html: htmlContent,
    });

    console.log(`Ban status email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending ban email:', error);
  }
};

// --- 2. ORDER STATUS NOTIFICATION (NEW) ---
export const sendOrderStatusEmail = async (userEmail, userName, orderId, newStatus) => {
  try {
    let subject = '';
    let color = '';
    let messageBody = '';

    // Customize message based on status
    switch (newStatus) {
      case 'shipped':
        subject = `Great News: Your Order #${orderId} has Shipped!`;
        color = '#1976d2'; // Blue
        messageBody = `<p>Your order is on its way! You should receive it soon.</p>`;
        break;
      case 'cancelled':
        subject = `Update: Order #${orderId} was Cancelled`;
        color = '#d32f2f'; // Red
        messageBody = `<p>Your order has been cancelled. If a refund is due, it will be processed shortly.</p>`;
        break;
      case 'received':
        subject = `Delivered: Order #${orderId} Completed`;
        color = '#2e7d32'; // Green
        messageBody = `<p>Your order has been marked as delivered. Thank you for shopping with us!</p>`;
        break;
      default:
        return; 
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
        <div style="background-color: ${color}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="margin:0;">Durga Grocery Shop</h2>
          <h3 style="margin:10px 0 0 0; font-weight:normal;">Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</h3>
        </div>
        <div style="padding: 20px;">
          <p>Hi ${userName},</p>
          ${messageBody}
          <p><b>Order ID:</b> ${orderId}</p>
          <br/>
          <p>Regards,<br/><b>Durga Grocery Shop Team</b></p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Durga Grocery Orders" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: subject,
      html: htmlContent,
    });

    console.log(`Order status email (${newStatus}) sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending order email:', error);
  }
};