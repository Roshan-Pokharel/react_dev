import { sendBanStatusEmail } from './services/emailService.js';

// Replace with your actual personal email to test
const myPersonalEmail = 'put-your-real-email-here@gmail.com'; 

console.log("Starting test...");
sendBanStatusEmail(myPersonalEmail, "Test User", true);