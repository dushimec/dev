import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const FW_BASE = 'https://api.flutterwave.com/v3';

export const createPaymentLink = async (amount: number, currency = 'RWF', redirectUrl = '') => {
  const payload = {
    tx_ref: 'ecuruza_' + Date.now(),
    amount: String(amount),
    currency,
    redirect_url: redirectUrl,
    // customer, payment options...
  };
  const resp = await axios.post(`${FW_BASE}/payments`, payload, {
    headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` }
  });
  return resp.data;
};

export const verifyTransaction = async (txId: string) => {
  const resp = await axios.get(`${FW_BASE}/transactions/${txId}/verify`, {
    headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` }
  });
  return resp.data;
};