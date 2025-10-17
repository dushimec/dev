import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const BASE = process.env.INTOUCH_API_URL;
const API_KEY = process.env.INTOUCH_API_KEY;
const SENDER = process.env.INTOUCH_SENDER || 'ECURUZA';

export const sendSms = async (phone: string, message: string) => {
  if (!API_KEY || !BASE) {
    console.warn('InTouchSMS not configured, skipping SMS send', phone, message);
    return { success: false, error: 'not_configured' };
  }
  const payload = {
    sender: SENDER,
    recipient: phone,
    message
  };
  const resp = await axios.post(`${BASE}/sms/send`, payload, {
    headers: { 'Content-Type': 'application/json', 'x-intouch-o-token': API_KEY }
  });
  return resp.data;
};