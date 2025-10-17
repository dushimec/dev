import { Router } from 'express';
import { verifyTransaction } from '../services/payments/flutterwave.service';
const router = Router();

router.post('/webhook/flutterwave', async (req, res) => {
  // TODO: verify signature header if provided, then process event
  const payload = req.body;
  // Example: if (payload.event == 'charge.completed') { ... }
  console.log('Flutterwave webhook received', payload);
  res.json({ received: true });
});

export default router;