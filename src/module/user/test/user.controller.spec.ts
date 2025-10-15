import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user.dto';

// Mock del guard para permitir el acceso sin validar token
class MockAuthGuard {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    req.user = { email: 'test@example.com' }; 
    return true;
  }
}

// Mock del servicio
const mockUserService = {
  findByEmail: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com' }),
  findAll: jest.fn().mockResolvedValue([{ id: 1, email: 'user1@example.com' }]),
  update: jest.fn().mockResolvedValue({ id: 1, email: 'updated@example.com' }),
};

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('debería devolver el perfil del usuario autenticado', async () => {
    const req = { user: { email: 'test@example.com' } };
    const result = await controller.getProfile(req);
    expect(result).toEqual({ id: 1, email: 'test@example.com' });
    expect(mockUserService.findByEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('debería devolver todos los usuarios', async () => {
    const result = await controller.getAllUsers();
    expect(result).toEqual([{ id: 1, email: 'user1@example.com' }]);
    expect(mockUserService.findAll).toHaveBeenCalled();
  });

  it('debería actualizar un usuario por ID', async () => {
    const dto: UpdateUserDto = { password: 'nuevaClave123' };
    const result = await controller.updateUser('1', dto);
    expect(result).toEqual({ id: 1, email: 'updated@example.com' });
    expect(mockUserService.update).toHaveBeenCalledWith(1, dto);
  });
});
