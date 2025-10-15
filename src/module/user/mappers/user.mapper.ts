import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

export class UserMapper {
  static fromCreateDto(dto: CreateUserDto): Partial<User> {
    return {
      email: dto.email,
      password: dto.password, //el hash se hace en el repo
    };
  }

  static fromUpdateDto(dto: UpdateUserDto): Partial<User> {
    const partial: Partial<User> = {};
    if (dto.email) partial.email = dto.email;
    if (dto.password) partial.password = dto.password;
    return partial;
  }

  static toResponse(user: User): Omit<User, 'password'> {
    const { password, ...rest } = user;
    return rest;
  }
}
