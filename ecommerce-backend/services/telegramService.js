import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config';
import { Order } from '../models/Order.js'; 

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

const bot = new TelegramBot(token, { polling: true });

// --- LISTENER FOR INCOMING MESSAGES ---
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text ? msg.text.trim() : '';

  // Security check: Only allow the admin
  if (chatId.toString() !== adminChatId) {
    return;
  }

  // 1. Parse the message into words (split by spaces)
  const args = text.split(/\s+/);

  // 2. Find the Order ID (Look for a long string, likely the UUID)
  const orderId = args.find(arg => arg.length > 20);

  // 3. Check for keywords ("ship" or "shipped")
  const isShipCommand = args.some(arg => arg.toLowerCase().includes('ship'));

  if (orderId) {
    try {
      const order = await Order.findByPk(orderId);

      if (order) {
        // --- STATUS LOGIC ---
        // If message contains "ship", set to 'shipped' (Progress Bar: 50%)
        // If message is just the ID, set to 'received' (Progress Bar: 100% / Delivered)
        
        let newStatus = 'received'; 
        let statusMessage = "✅ Order Delivered (Received)";

        if (isShipCommand) {
            newStatus = 'shipped';
            statusMessage = "🚚 Order Shipped";
        }

        // Update Database
        order.status = newStatus;
        await order.save();

        // Confirm to Admin
        bot.sendMessage(chatId, `${statusMessage}!\nID: \`${orderId}\``, { parse_mode: 'Markdown' });
      
      } else {
        bot.sendMessage(chatId, `❌ Order not found for ID: ${orderId}`);
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