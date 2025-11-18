import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config';

// Initialize the Bot
// Make sure TELEGRAM_BOT_TOKEN and TELEGRAM_ADMIN_CHAT_ID are in your .env file
const token = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

// Create a bot that uses 'polling' to fetch new updates (polling: false means it only sends messages)
const bot = new TelegramBot(token, { polling: false });

export const sendOrderNotification = async (order, user, productsList) => {
  try {
    // 1. Format Total Cost (Cents -> Dollars)
    const total = (order.totalCostCents / 100).toFixed(2);
    
    // 2. Format Order Time
    // You can change 'Asia/Kathmandu' to your preferred timezone
    const orderDate = new Date(order.orderTimeMs).toLocaleString('en-US', { 
      timeZone: 'Asia/Kathmandu',
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });

    // 3. Format Product List with Delivery Dates
    let productString = '';
    
    productsList.forEach(p => {
      // Format delivery date (e.g., "Fri, Nov 24")
      let deliveryString = 'N/A';
      
      if (p.deliveryDate) {
        deliveryString = new Date(p.deliveryDate).toLocaleDateString('en-US', {
          weekday: 'short', 
          month: 'short', 
          day: 'numeric'
        });
      }

      productString += `
**${p.name}**
Qty: ${p.quantity}
Arrives: ${deliveryString}
`;
    });

    // 4. Construct the Final Message
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

    // 5. Send the message
    await bot.sendMessage(adminChatId, message, { parse_mode: 'Markdown' });
    console.log('Telegram notification sent successfully!');

  } catch (error) {
    console.error('Failed to send Telegram notification:', error.message);
    // We intentionally do not throw the error so the user's order doesn't fail 
    // just because the notification failed.
  }
};