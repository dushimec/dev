import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const FW_BASE = 'https://api.flutterwave.com/v3';
const SECRET = process.env.FLUTTERWAVE_SECRET_KEY;

export type PaymentMethod = 'CARD' | 'MOMO';

interface CreatePaymentLinkOptions {
  userId: string;
  planType: 'CLASS' | 'VIP';
  amount: number;
  method: PaymentMethod;
  customerEmail: string;
  redirectUrl: string;
}

interface FlutterwavePaymentResponse {
  status: string;
  message: string;
  data: {
    link: string;
    flw_ref: string;
    tx_ref: string;
    id: number;
  };
}

export const createPaymentLink = async ({
  userId,
  planType,
  amount,
  method,
  customerEmail,
  redirectUrl,
}: CreatePaymentLinkOptions): Promise<string> => {
  try {
    const payload = {
      tx_ref: `ecuruza_${userId}_${Date.now()}`,
      amount: String(amount),
      currency: 'RWF',
      redirect_url: redirectUrl,
      payment_options:
        method === 'CARD' ? 'card' : 'mobilemoneyrwanda', // card or MOMO
      customer: {
        email: customerEmail,
      },
      meta: {
        userId,
        planType,
      },
    };

    const response = await axios.post<FlutterwavePaymentResponse>(
      `${FW_BASE}/payments`,
      payload,
      {
        headers: { Authorization: `Bearer ${SECRET}` },
      }
    );

    if (response.data.status !== 'success') {
      throw new Error('Failed to create payment link with Flutterwave');
    }

    return response.data.data.link;
  } catch (error: any) {
    console.error('Flutterwave payment link error:', error.message);
    throw new Error('Could not create payment link. Please try again.');
  }
};

// Verify transaction
export const verifyTransaction = async (txId: string) => {
  try {
    const resp = await axios.get(`${FW_BASE}/transactions/${txId}/verify`, {
      headers: { Authorization: `Bearer ${SECRET}` },
    });
    return resp.data;
  } catch (error: any) {
    console.error('Flutterwave verification error:', error.message);
    throw new Error('Could not verify transaction. Please try again.');
  }
};
