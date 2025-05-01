import { ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let configService: DeepMocked<ConfigService>;

  beforeEach(() => {
    configService = createMock<ConfigService>();
    configService.getOrThrow.mockReturnValue('SECRET');
    authGuard = new AuthGuard(configService);
    authGuard.onModuleInit();
  });
  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });
  it('should return true if the API key is valid', async () => {
    const mockedExecutionContext = createMock<ExecutionContext>();
    mockedExecutionContext.switchToHttp().getRequest.mockReturnValue({
      headers: {
        'x-api-key': 'SECRET',
      },
    });
    const result = await authGuard.canActivate(mockedExecutionContext);
    expect(result).toBe(true);
  });
  it('should throw an UnauthorizedException if the API key is missing', async () => {
    const mockedExecutionContext = createMock<ExecutionContext>();
    mockedExecutionContext.switchToHttp().getRequest.mockReturnValue({
      headers: {},
    });
    const result = () => authGuard.canActivate(mockedExecutionContext);
    expect(result).toThrow(UnauthorizedException);
  });
  it('should throw an UnauthorizedException if the API key is invalid', async () => {
    const mockedExecutionContext = createMock<ExecutionContext>();
    mockedExecutionContext.switchToHttp().getRequest.mockReturnValue({
      headers: {
        'x-api-key': 'INVALID_KEY',
      },
    });
    const result = () => authGuard.canActivate(mockedExecutionContext);
    expect(result).toThrow(UnauthorizedException);
  });
});
