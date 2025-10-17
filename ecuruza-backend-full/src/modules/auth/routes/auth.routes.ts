import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { body } from 'express-validator';
import validate from '../../../middlewares/validate.middleware';
import authMiddleware from '../../../middlewares/auth.middleware';
import { authRateLimiter } from '../../../middlewares/rateLimiter';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validate([
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
  ]),
  AuthController.register
);

router.post(
  '/login',
  authRateLimiter,
  validate([
    body('email').isEmail(),
    body('password').exists(),
  ]),
  AuthController.login
);

router.post('/verify-email', validate([body('email').isEmail(), body('code').isLength({min:6})]), async (req, res) => {
  try { await AuthController.verifyEmail(req, res); } catch (e:any) { res.status(e.status||500).json({error: e.message}); }
});

router.post('/request-password-reset', validate([body('email').isEmail()]), async (req, res) => {
  try { await AuthController.requestPasswordReset(req, res); } catch (e:any) { res.status(e.status||500).json({error: e.message}); }
});

router.post('/reset-password', validate([body('email').isEmail(), body('code').isLength({min:6}), body('newPassword').isLength({min:6})]), async (req, res) => {
  try { await AuthController.resetPassword(req, res); } catch (e:any) { res.status(e.status||500).json({error: e.message}); }
});

router.post('/send-otp', authRateLimiter, validate([body('phone').isMobilePhone('any')]), async (req, res) => {
  try { await AuthController.sendOtp(req, res); } catch (e:any) { res.status(e.status||500).json({error: e.message}); }
});

router.post('/verify-otp', validate([body('phone').isMobilePhone('any'), body('code').isLength({min:6})]), async (req, res) => {
  try { await AuthController.verifyOtp(req, res); } catch (e:any) { res.status(e.status||500).json({error: e.message}); }
});

router.post('/refresh-token', validate([body('refreshToken').exists()]), async (req, res) => {
  try { await AuthController.refreshToken(req, res); } catch (e:any) { res.status(e.status||500).json({error: e.message}); }
});

router.post('/logout', validate([body('refreshToken').exists()]), async (req, res) => {
  try { await AuthController.logout(req, res); } catch (e:any) { res.status(e.status||500).json({error: e.message}); }
});

router.get('/me', authMiddleware, AuthController.me);

export default router;
