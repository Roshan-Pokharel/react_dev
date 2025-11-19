import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config';

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

const bot = new TelegramBot(token, { polling: false });

export const sendOrderNotification = async (order, user, productsList) => {
  // ... (Keep your existing sendOrderNotification code exactly as is) ...
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

    const message = `
 **NEW ORDER RECEIVED!**

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

// --- ADD THIS NEW FUNCTION ---
export const sendCancellationNotification = async (order, user, reason) => {
  try {
    const orderId = order.id;
    const total = (order.totalCostCents / 100).toFixed(2);
    
    const cancelDate = new Date().toLocaleString('en-US', { 
      timeZone: 'Asia/Kathmandu',
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const message = `
🚫 **ORDER CANCELLED**

**Reason:** ${reason}

**Order ID:** \`${orderId}\`
**Refund Amount:** $${total}
**Time:** ${cancelDate}

**Customer:**
Name: ${user.name}
Email: ${user.email}
Phone: ${user.phone || 'N/A'}
    `;

    await bot.sendMessage(adminChatId, message, { parse_mode: 'Markdown' });
    console.log('Cancellation notification sent to Telegram.');

  } catch (error) {
    console.error('Failed to send Telegram cancellation:', error.message);
  }
};