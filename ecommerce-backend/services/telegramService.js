// services/telegramService.js
import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config';

// 1. Initialize Bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
const bot = new TelegramBot(token, { polling: false });

// 2. Define the notification function
export const sendOrderNotification = async (order, user, productsList) => {
  try {
    // Format cost (Cents -> Dollars)
    const total = (order.totalCostCents / 100).toFixed(2);
    
    // Format date
    const date = new Date(order.orderTimeMs).toLocaleString('en-US', { 
      timeZone: 'Asia/Kathmandu' // Set to your timezone (e.g., Nepal)
    });

    // Format product list string
    let productString = '';
    productsList.forEach(p => {
      productString += `• ${p.name} (x${p.quantity})\n`;
    });

    // Construct the message
    const message = `
 **NEW ORDER RECEIVED!**

 **Total:** $${total}
 **Time:** ${date}

 **Customer:**
${user.name || 'No Name'}
${user.email}
 ${user.phone || 'No Phone'}

 **Delivery Address:**
${user.addressLine1 || ''}
${user.city || ''}, ${user.state || ''}
${user.country || ''}

 **Items:**
${productString}
    `;

    // Send to your phone
    await bot.sendMessage(adminChatId, message, { parse_mode: 'Markdown' });
    console.log('Telegram notification sent!');

  } catch (error) {
    console.error('Telegram Error:', error.message);
    // We do not throw the error here to prevent crashing the actual order process
  }
};