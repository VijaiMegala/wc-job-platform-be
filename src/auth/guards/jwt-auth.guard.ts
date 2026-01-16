import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('Missing or invalid Authorization header');
      throw new UnauthorizedException('Missing or invalid authorization token');
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      // Handle JWT-specific errors
      if (info) {
        if (info.name === 'JsonWebTokenError') {
          const errorMsg = info.message || 'malformed token';
          this.logger.warn(`Invalid JWT token: ${errorMsg}`);
          
          // Provide more specific error messages
          if (errorMsg.includes('signature')) {
            this.logger.error('JWT signature verification failed. This usually means:');
            this.logger.error('  1. JWT_SECRET mismatch between token creation and verification');
            this.logger.error('  2. Token was signed with a different secret');
            this.logger.error('  3. JWT_SECRET environment variable changed');
            throw new UnauthorizedException('Invalid token signature. Please login again.');
          }
          
          throw new UnauthorizedException(`Invalid or malformed token: ${errorMsg}`);
        }
        if (info.name === 'TokenExpiredError') {
          this.logger.debug('JWT token expired');
          throw new UnauthorizedException('Token has expired');
        }
        if (info.name === 'NotBeforeError') {
          this.logger.debug('JWT token not active yet');
          throw new UnauthorizedException('Token is not yet active');
        }
      }
      
      // Handle other errors
      if (err) {
        // Only log as error if it's unexpected
        if (err instanceof UnauthorizedException) {
          this.logger.debug(`Authentication failed: ${err.message}`);
        } else {
          this.logger.error(`Unexpected authentication error: ${err.message}`, err.stack);
        }
        throw err;
      }
      
      // No user and no specific error info
      this.logger.debug('Authentication failed: user not authenticated');
      throw new UnauthorizedException('Authentication required');
    }
    return user;
  }
}

