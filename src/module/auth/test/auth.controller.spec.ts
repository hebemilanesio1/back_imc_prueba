import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { LoginUserDto } from '../../user/dto/login-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get(AuthController);
    service = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería registrar un usuario', async () => {
    const dto: CreateUserDto = { email: 'nuevo@example.com', password: 'clave123' };
    const expected = { id: 1, email: dto.email };

    mockAuthService.register.mockResolvedValue(expected);

    const result = await controller.register(dto);

    expect(service.register).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  it('debería loguear un usuario y devolver el token', async () => {
    const dto: LoginUserDto = { email: 'hebe@example.com', password: 'clave123' };
    const expected = { access_token: 'jwt-token' };

    mockAuthService.login.mockResolvedValue(expected);

    const result = await controller.login(dto);

    expect(service.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });
});
