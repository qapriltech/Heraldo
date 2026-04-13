import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Étape 1 — L'utilisateur entre son email + rôle
   * On crée le user si inexistant, génère un OTP 6 chiffres, et l'envoie par email
   */
  async requestOtp(dto: RequestOtpDto) {
    // Trouver ou créer l'utilisateur
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          fullName: dto.fullName || dto.email.split('@')[0],
          role: dto.role,
          status: 'ACTIVE',
          emailVerified: false,
        },
      });
    }

    // Générer un code OTP 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalider les anciens OTP non utilisés
    await this.prisma.otpCode.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // Créer le nouvel OTP
    await this.prisma.otpCode.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      },
    });

    // Envoyer par email
    await this.sendOtpEmail(dto.email, code, user.fullName);

    return {
      success: true,
      message: `Code de connexion envoyé à ${dto.email}`,
      // En dev, on retourne le code pour faciliter les tests
      ...(this.configService.get('NODE_ENV') !== 'production' ? { devCode: code } : {}),
    };
  }

  /**
   * Étape 2 — L'utilisateur saisit le code reçu par email
   * On vérifie le code et on retourne les tokens JWT
   */
  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        institutionUsers: {
          include: { institution: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    // Chercher un OTP valide
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        code: dto.code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Code invalide ou expiré');
    }

    // Marquer l'OTP comme utilisé
    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Marquer l'email comme vérifié + mettre à jour lastLoginAt
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        lastLoginAt: new Date(),
      },
    });

    // Générer les tokens JWT
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    const institution = user.institutionUsers?.[0]?.institution || null;

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        institution: institution ? { id: institution.id, name: institution.name } : null,
      },
      ...tokens,
    };
  }

  /**
   * Refresh token
   */
  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_SECRET', 'heraldo-refresh-secret'),
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException();
      }
      return this.generateTokens(user.id, user.email, user.role);
    } catch {
      throw new UnauthorizedException('Token de rafraîchissement invalide');
    }
  }

  /**
   * Me — Profil utilisateur courant
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        institutionUsers: {
          include: { institution: true },
        },
        journalist: true,
      },
    });

    if (!user) throw new UnauthorizedException();

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      institution: user.institutionUsers?.[0]?.institution || null,
      journalist: user.journalist || null,
    };
  }

  /**
   * Envoi email OTP via Mailgun/SMTP
   */
  private async sendOtpEmail(email: string, code: string, name: string) {
    const mailgunKey = this.configService.get<string>('MAILGUN_API_KEY');
    const mailgunDomain = this.configService.get<string>('MAILGUN_DOMAIN');

    if (mailgunKey && mailgunDomain) {
      try {
        const formData = new URLSearchParams();
        formData.append('from', `HERALDO <noreply@${mailgunDomain}>`);
        formData.append('to', email);
        formData.append('subject', `${code} — Votre code de connexion HERALDO`);
        formData.append('html', `
          <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #C8A45C, #D4B876); padding: 12px 16px; border-radius: 12px;">
                <span style="color: #0D1B3E; font-size: 20px; font-weight: 800; letter-spacing: 1px;">HERALDO</span>
              </div>
            </div>
            <h2 style="color: #0D1B3E; font-size: 22px; font-weight: 700; margin-bottom: 8px;">Bonjour ${name},</h2>
            <p style="color: #8A8278; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">Voici votre code de connexion HERALDO. Il est valable 10 minutes.</p>
            <div style="background: #F5F3EF; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0D1B3E;">${code}</span>
            </div>
            <p style="color: #B5AEA4; font-size: 13px; text-align: center;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
            <hr style="border: none; border-top: 1px solid #EDE8DF; margin: 24px 0;" />
            <p style="color: #B5AEA4; font-size: 11px; text-align: center;">HERALDO — Votre message, notre mission.<br/>Abidjan, Côte d'Ivoire</p>
          </div>
        `);

        await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
          method: 'POST',
          headers: {
            Authorization: 'Basic ' + Buffer.from(`api:${mailgunKey}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });

        console.log(`[AUTH] OTP email sent to ${email}`);
      } catch (err) {
        console.error('[AUTH] Mailgun error (non-blocking):', err);
        // Ne pas bloquer la connexion si l'email échoue
      }
    } else {
      // Mode dev — afficher dans la console
      console.log(`\n========================================`);
      console.log(`  HERALDO OTP pour ${email}`);
      console.log(`  Code: ${code}`);
      console.log(`  Expire dans 10 minutes`);
      console.log(`========================================\n`);
    }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET', 'heraldo-dev-secret'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('REFRESH_SECRET', 'heraldo-refresh-secret'),
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
