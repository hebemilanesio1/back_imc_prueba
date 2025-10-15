import { UserMapper } from '../mappers/user.mapper';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';

describe('UserMapper', () => {
  describe('fromCreateDto', () => {
    it('debería mapear correctamente un CreateUserDto a Partial<User>', () => {
      const dto: CreateUserDto = {
        email: 'hebe@example.com',
        password: 'clave123',
      };

      const result = UserMapper.fromCreateDto(dto);

      expect(result).toEqual({
        email: 'hebe@example.com',
        password: 'clave123',
      });
    });
  });

  describe('fromUpdateDto', () => {
    it('debería mapear solo el email si el password no está presente', () => {
      const dto: UpdateUserDto = {
        email: 'nuevo@example.com',
      };

      const result = UserMapper.fromUpdateDto(dto);

      expect(result).toEqual({ email: 'nuevo@example.com' });
    });

    it('debería mapear solo el password si el email no está presente', () => {
      const dto: UpdateUserDto = {
        password: 'nuevaClave',
      };

      const result = UserMapper.fromUpdateDto(dto);

      expect(result).toEqual({ password: 'nuevaClave' });
    });

    it('debería mapear ambos campos si están presentes', () => {
      const dto: UpdateUserDto = {
        email: 'actualizado@example.com',
        password: 'claveActualizada',
      };

      const result = UserMapper.fromUpdateDto(dto);

      expect(result).toEqual({
        email: 'actualizado@example.com',
        password: 'claveActualizada',
      });
    });

    it('debería devolver un objeto vacío si no hay campos', () => {
      const dto: UpdateUserDto = {};
      const result = UserMapper.fromUpdateDto(dto);
      expect(result).toEqual({});
    });
  });

  describe('toResponse', () => {
    it('debería excluir el campo password al mapear un User completo', () => {
      const user: User = {
        id: 1,
        email: 'hebe@example.com',
        password: 'hashedPassword',
        imc: [],
      };

      const result = UserMapper.toResponse(user);

      expect(result).toEqual({
        id: 1,
        email: 'hebe@example.com',
        imc:[],
      });

      expect('password' in result).toBe(false);
    });
  });
});
