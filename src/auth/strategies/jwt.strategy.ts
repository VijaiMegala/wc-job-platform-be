import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../users/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET', 'your-secret-key-change-in-production');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
    this.logger.debug(`JWT Strategy initialized with secret: ${secret ? '***' + secret.slice(-4) : 'NOT SET'}`);
  }

  async validate(payload: any) {
    if (!payload || !payload.sub) {
      this.logger.warn('Invalid JWT payload: missing sub field');
      throw new UnauthorizedException('Invalid token payload');
    }

    try {
      const user = await this.userService.findOne(payload.sub);
      if (!user) {
        this.logger.warn(`User not found for user_id: ${payload.sub}`);
        throw new UnauthorizedException('User not found');
      }
      return { userId: user.user_id, email: user.user_email, orgId: payload.org_id, roleId: payload.role_id };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Error validating user: ${error.message}`, error.stack);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}

