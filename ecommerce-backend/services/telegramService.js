import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config';
// 1. Import Order model to update status
import { Order } from '../models/Order.js'; 

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

// 2. CHANGE polling TO TRUE (Allows the bot to receive messages)
const bot = new TelegramBot(token, { polling: true });

// --- NEW: LISTENER FOR INCOMING MESSAGES ---
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text ? msg.text.trim() : '';

  // Security check: Only allow the admin to update orders
  if (chatId.toString() !== adminChatId) {
    return;
  }

  // Check if the text looks like a UUID (Order ID)
  // (UUIDs are usually 36 chars, but we'll just check length to be safe)
  if (text.length > 20) {
    try {
      const order = await Order.findByPk(text);

      if (order) {
        // Update the status
        order.status = 'received';
        await order.save();

        // Confirm back to you on Telegram
        bot.sendMessage(chatId, `✅ Success! Order status changed to 'received'.\nID: ${text}`);
      } else {
        bot.sendMessage(chatId, `❌ Order not found for ID: ${text}`);
      }
    } catch (error) {
      console.error("Bot Error:", error);
      bot.sendMessage(chatId, `❌ Error updating order.`);
    }
  }
});

export const sendOrderNotification = async (order, user, productsList) => {
  try {
    const total = (order.totalCostCents / 100).toFixed(2);
    const orderDate = new Date(order.orderTimeMs).toLocaleString('en-US', { 
      timeZone: 'Asia/Kathmandu', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    let productString = '';
    productsList.forEach(p => {
      let deliveryString = 'N/A';
      if (p.deliveryDate) {
        deliveryString = new Date(p.deliveryDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      }
      productString += `\n**${p.name}**\nQty: ${p.quantity}\nArrives: ${deliveryString}\n`;
    });

    // 3. ADD ORDER ID TO MESSAGE (Wrapped in backticks ` ` for copy-paste)
    const message = `
 **NEW ORDER RECEIVED!**

**Order ID:** \`${order.id}\` 
**Total:** $${total}
**Placed:** ${orderDate}

**Customer:**
Name: ${user.name || 'Guest'}
Email: ${user.email}
Phone: ${user.phone || 'N/A'}

**Delivery Address:**
${user.addressLine1 || 'No Street info'}
${user.city || ''}, ${user.state || ''}
${user.postalCode || ''}
${user.country || ''}

**Items Ordered:**
${productString}
    `;

    await bot.sendMessage(adminChatId, message, { parse_mode: 'Markdown' });
    console.log('Telegram notification sent successfully!');

  } catch (error) {
    console.error('Failed to send Telegram notification:', error.message);
  }
};

export const sendCancellationNotification = async (order, user, reason) => {
  try {
    const orderId = order.id;
    const total = (order.totalCostCents / 100).toFixed(2);
    const cancelDate = new Date().toLocaleString('en-US', { 
      timeZone: 'Asia/Kathmandu', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const message = `
🚫 **ORDER CANCELLED**

**Reason:** ${reason}
**Order ID:** \`${orderId}\`
**Refund Amount:** $${total}
**Time:** ${cancelDate}

**Customer:**
Name: ${user.name}
    `;

    await bot.sendMessage(adminChatId, message, { parse_mode: 'Markdown' });
    console.log('Cancellation notification sent to Telegram.');

  } catch (error) {
    console.error('Failed to send Telegram cancellation:', error.message);
  }
};