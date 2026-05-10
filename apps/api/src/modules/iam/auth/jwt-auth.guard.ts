import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard — Guard for JWT authentication on protected endpoints.
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard)
 *   @Get('/protected')
 *   handler(@Req() req) { req.user → JwtPayload }
 *
 * Authentication flow:
 * 1. Extract Bearer token from Authorization header
 * 2. JwtStrategy.validate() → verify signature + check Redis session
 * 3. If valid → attach payload to request.user
 * 4. If invalid → throw 401 Unauthorized
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
