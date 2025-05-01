import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  private apiKey: string;
  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.apiKey = this.configService.getOrThrow<string>('apiKey');
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const uncheckedApiKey = request.headers['x-api-key'];
    if (!uncheckedApiKey) {
      throw new UnauthorizedException('API key is missing');
    }

    if (uncheckedApiKey !== this.apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }
    return true;
  }
}
