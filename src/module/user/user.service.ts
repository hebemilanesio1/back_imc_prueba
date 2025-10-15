import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from './repository/user-repository.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: number) {
    return this.userRepository.findById(id);
  }

  async findAll() {
    return this.userRepository.findAll();
  }

  async create(dto: CreateUserDto) {
    return this.userRepository.createUser(dto);
  }

  async update(id: number, dto: UpdateUserDto) {
    return this.userRepository.updateUser(id, dto);
  }
}
