import prisma from "../../../config/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createRefreshToken } from "./token.service";
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { sendEmail } from '../../services/mailer/mailer';
import { sendSms } from '../../services/sms/sms.service';

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m"; // short-lived access token

class AuthService {
  static async register({ email, password, profileName, phone }: { email: string; password: string; profileName?: string; phone?: string }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw { status: 400, message: "Email already registered" };

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        profileName,
        phone
      },
      select: { id: true, email: true, profileName: true }
    });

    // create email verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = dayjs().add(1, 'day').toDate();
    await prisma.emailVerification.create({
      data: { userId: user.id, code, purpose: 'VERIFY_EMAIL', expiresAt }
    });
    // send email (async)
    sendEmail(user.email, 'Verify your Ecuruza account', `<p>Your verification code: <strong>${code}</strong></p>`).catch(console.error);

    return user;
  }

  static async login({ email, password }: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw { status: 401, message: "Invalid credentials" };

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw { status: 401, message: "Invalid credentials" };

    const accessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refresh = await createRefreshToken(user.id);
    return { accessToken, refreshToken: refresh.token, user: { id: user.id, email: user.email, role: user.role } };
  }

  static async verifyEmail({ email, code }: { email: string; code: string }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw { status: 404, message: 'User not found' };
    const record = await prisma.emailVerification.findFirst({
      where: { userId: user.id, code, purpose: 'VERIFY_EMAIL', used: false, expiresAt: { gt: new Date() } }
    });
    if (!record) throw { status: 400, message: 'Invalid or expired code' };
    await prisma.user.update({ where: { id: user.id }, data: { isVerified: true } });
    await prisma.emailVerification.update({ where: { id: record.id }, data: { used: true } });
    return true;
  }

  static async requestPasswordReset({ email }: { email: string }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw { status: 404, message: 'User not found' };
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = dayjs().add(1, 'hour').toDate();
    await prisma.emailVerification.create({ data: { userId: user.id, code, purpose: 'PASSWORD_RESET', expiresAt } });
    sendEmail(user.email, 'Password reset code', `<p>Your password reset code: <strong>${code}</strong></p>`).catch(console.error);
    return true;
  }

  static async resetPassword({ email, code, newPassword }: { email: string; code: string; newPassword: string }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw { status: 404, message: 'User not found' };
    const record = await prisma.emailVerification.findFirst({
      where: { userId: user.id, code, purpose: 'PASSWORD_RESET', used: false, expiresAt: { gt: new Date() } }
    });
    if (!record) throw { status: 400, message: 'Invalid or expired code' };
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    await prisma.emailVerification.update({ where: { id: record.id }, data: { used: true } });
    return true;
  }

  static async sendOtp({ phone }: { phone: string }) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = dayjs().add(10, 'minute').toDate();
    await prisma.oTP.create({ data: { phone, code, expiresAt } });
    sendSms(phone, `Your Ecuruza OTP: ${code}`).catch(console.error);
    return true;
  }

  static async verifyOtp({ phone, code }: { phone: string; code: string }) {
    const record = await prisma.oTP.findFirst({ where: { phone, code, used: false, expiresAt: { gt: new Date() } } });
    if (!record) throw { status: 400, message: 'Invalid or expired OTP' };
    await prisma.oTP.update({ where: { id: record.id }, data: { used: true } });
    return true;
  }
}

export default AuthService;