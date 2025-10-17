import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const IN_TOUCH_BASE = process.env.INTOUCH_API_URL || 'https://api.intouchsms.rw'; // placeholder

export const sendSms = async (phone: string, message: string) => {
  // Replace with actual InTouchSMS API call. This is a placeholder.
  // Example: axios.post(IN_TOUCH_BASE + '/send', { to: phone, message, api_key: process.env.INTOUCH_API_KEY })
  console.log('SMS send placeholder', phone, message);
  return { success: true };
};