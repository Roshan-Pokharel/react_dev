import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config';
import { Order } from '../models/Order.js'; 
import { User } from '../models/User.js'; 
// Import both email functions
import { sendBanStatusEmail, sendOrderStatusEmail } from './emailService.js'; 

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

  const args = text.split(/\s+/);
  
  // Identify Data Types
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const foundEmail = args.find(arg => emailRegex.test(arg));
  const orderId = args.find(arg => arg.length > 20 && !emailRegex.test(arg));

  // Check for keywords
  const isShipCommand = args.some(arg => arg.toLowerCase().includes('ship'));
  const isCancelCommand = args.some(arg => arg.toLowerCase().includes('cancel'));
  const isUnbanCommand = args.some(arg => arg.toLowerCase().includes('unban'));
  const isBanCommand = args.some(arg => arg.toLowerCase().includes('ban') && !arg.toLowerCase().includes('unban')); 

  // --- LOGIC A: USER MANAGEMENT (BAN / UNBAN) ---
  if (foundEmail) {
    try {
      const user = await User.findOne({ where: { email: foundEmail } });

      if (user) {
        // 1. UNBAN
        if (isUnbanCommand) {
            user.isBanned = false;
            await user.save();
            
            // Send Email
            await sendBanStatusEmail(user.email, user.name, false); 

            bot.sendMessage(chatId, `✅ **USER UNBANNED**\nName: ${user.name}\nEmail: \`${foundEmail}\`\nUser can login again.`, { parse_mode: 'Markdown' });
        } 
        
        // 2. BAN
        else if (isBanCommand) {
            user.isBanned = true; 
            await user.save();

            // Send Email
            await sendBanStatusEmail(user.email, user.name, true);

            bot.sendMessage(chatId, `🚫 **USER BANNED**\nName: ${user.name}\nEmail: \`${foundEmail}\`\nUser cannot log in anymore.`, { parse_mode: 'Markdown' });
        }

        // 3. INFO
        else {
            const status = user.isBanned ? "🚫 BANNED" : "✅ ACTIVE";
            bot.sendMessage(chatId, `👤 **User Info**\nName: ${user.name}\nStatus: ${status}\nID: \`${user.id}\``, { parse_mode: 'Markdown' });
        }

      } else {
        bot.sendMessage(chatId, `⚠️ User not found with email: ${foundEmail}`);
      }
    } catch (error) {
      console.error("User Mgmt Error:", error);
      bot.sendMessage(chatId, `Error updating user.`);
    }
    return; 
  }

  // --- LOGIC B: ORDER MANAGEMENT ---
  if (orderId) {
    try {
      // Fetch Order AND the User who made it (to get email)
      const order = await Order.findByPk(orderId, { include: User });

      if (order) {
        const customerEmail = order.User ? order.User.email : null;
        const customerName = order.User ? order.User.name : 'Customer';

        // PRIORITY 1: Cancel Order
        if (isCancelCommand) {
            order.status = 'cancelled';
            await order.save();
            
            // Send Email
            if(customerEmail) await sendOrderStatusEmail(customerEmail, customerName, orderId, 'cancelled');

            bot.sendMessage(chatId, `🚫 **Order Cancelled**\nID: \`${orderId}\`\nEmail sent to customer.`, { parse_mode: 'Markdown' });
        }
        
        // PRIORITY 2: Ship Order
        else if (isShipCommand) {
            order.status = 'shipped';
            await order.save();

            // Send Email
            if(customerEmail) await sendOrderStatusEmail(customerEmail, customerName, orderId, 'shipped');

            bot.sendMessage(chatId, `🚚 **Order Shipped**\nID: \`${orderId}\`\nEmail sent to customer.`, { parse_mode: 'Markdown' });
        }

        // PRIORITY 3: Default (Mark as Received/Delivered)
        else {
            order.status = 'received';
            await order.save();

            // Send Email
            if(customerEmail) await sendOrderStatusEmail(customerEmail, customerName, orderId, 'received');

            bot.sendMessage(chatId, `✅ **Order Delivered**\nID: \`${orderId}\`\nEmail sent to customer.`, { parse_mode: 'Markdown' });
        }
      
      } else {
        bot.sendMessage(chatId, `Order not found for ID: ${orderId}`);
      }
    } catch (error) {
      console.error("Bot Error:", error);
      bot.sendMessage(chatId, `Error updating order.`);
    }
  }
});

// --- ADMIN NOTIFICATIONS (App -> Admin) ---
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