import { Router } from 'express';
import { verifyTransaction } from '../services/payments/flutterwave.service';
const router = Router();

router.post('/webhook/flutterwave', async (req, res) => {
  const payload = req.body;
  console.log('Flutterwave webhook received', payload);
  // TODO: verify signature
  res.json({ received: true });
});

export default router;