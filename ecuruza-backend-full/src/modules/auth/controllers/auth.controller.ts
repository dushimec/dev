import { Request, Response } from 'express';
import AuthService from '../services/auth.service';
import { revokeRefreshToken } from '../services/token.service';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

export default class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, profileName, phone } = req.body;
      const user = await AuthService.register({ email, password, profileName, phone });
      return res.status(201).json({ message: 'User registered', user: { id: user.id, email: user.email } });
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: err.message || 'Internal error' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      return res.json(result);
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: err.message || 'Internal error' });
    }
  }

  static async me(req: Request, res: Response) {
    return res.json({ user: (req as any).user });
  }

  static async verifyEmail(req: Request, res: Response) {
    const { email, code } = req.body;
    await AuthService.verifyEmail({ email, code });
    res.json({ success: true });
  }

  static async requestPasswordReset(req: Request, res: Response) {
    const { email } = req.body;
    await AuthService.requestPasswordReset({ email });
    res.json({ success: true });
  }

  static async resetPassword(req: Request, res: Response) {
    const { email, code, newPassword } = req.body;
    await AuthService.resetPassword({ email, code, newPassword });
    res.json({ success: true });
  }

  static async sendOtp(req: Request, res: Response) {
    const { phone } = req.body;
    await AuthService.sendOtp({ phone });
    res.json({ success: true });
  }

  static async verifyOtp(req: Request, res: Response) {
    const { phone, code } = req.body;
    await AuthService.verifyOtp({ phone, code });
    res.json({ success: true });
  }

  static async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;
    const token = await (await import('../services/token.service')).findRefreshToken(refreshToken);
    if (!token) return res.status(400).json({ error: 'Invalid refresh token' });
    if (token.status !== 'ACTIVE' || new Date(token.expiresAt) < new Date()) return res.status(400).json({ error: 'Invalid or expired refresh token' });
    const payload: any = { userId: token.userId };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
    res.json({ accessToken });
  }

  static async logout(req: Request, res: Response) {
    const { refreshToken } = req.body;
    await revokeRefreshToken(refreshToken);
    res.json({ success: true });
  }
}
