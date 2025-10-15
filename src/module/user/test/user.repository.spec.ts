import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../repository/user.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('UserRepository', () => {
  let repository: UserRepository;
  let repo: ReturnType<typeof mockRepository>;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(User),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    repo = module.get(getRepositoryToken(User));

    if (repository['logger']) {
        jest.spyOn(repository['logger'], 'error').mockImplementation(() => {});
      }
      

  });

  afterAll(async () => {
    if (module) await module.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const user = { id: 1, email: 'hebe@example.com', password: 'hashed' };
      repo.findOne.mockResolvedValue(user);

      const result = await repository.findByEmail('hebe@example.com');
      expect(repo.findOne).toHaveBeenCalledWith({ where: { email: 'hebe@example.com' } });
      expect(result).toEqual(user);
    });
  });

  describe('findById', () => {
    it('should return user by ID', async () => {
      const user = { id: 1, email: 'hebe@example.com', password: 'hashed' };
      repo.findOne.mockResolvedValue(user);

      const result = await repository.findById(1);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(user);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [
        { id: 1, email: 'a@example.com', password: 'hashed' },
        { id: 2, email: 'b@example.com', password: 'hashed' },
      ];
      repo.find.mockResolvedValue(users);

      const result = await repository.findAll();
      expect(repo.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('createUser', () => {
    it('should create and save user with hashed password', async () => {
      const dto: CreateUserDto = { email: 'nuevo@example.com', password: 'clave123' };
      const hashed = await bcrypt.hash(dto.password, 10);
      const entity = { id: 1, email: dto.email, password: hashed };

      repo.create.mockReturnValue(entity);
      repo.save.mockResolvedValue(entity);

      const result = await repository.createUser(dto);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: dto.email,
          password: expect.any(String),
        })
      );
      
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: dto.email,
          password: expect.any(String),
        })
      );
      
      const isValid = await bcrypt.compare(dto.password, result.password);
      expect(isValid).toBe(true);
      
    });

    it('should throw error if password is missing', async () => {
      const dto: CreateUserDto = { email: 'error@example.com', password: '' };
      await expect(repository.createUser(dto)).rejects.toThrow('La contraseña es obligatoria para crear un usuario');
    });
  });

  describe('updateUser', () => {
    it('should update user with new email and hashed password', async () => {
      const existing = { id: 1, email: 'old@example.com', password: 'hashed' };
      repo.findOne.mockResolvedValue(existing);

      const dto: UpdateUserDto = { email: 'new@example.com', password: 'nuevaClave456' };
      const hashed = await bcrypt.hash(dto.password!, 10);
      const updated = { ...existing, email: dto.email, password: hashed };

      repo.save.mockResolvedValue(updated);

      const result = await repository.updateUser(1, dto);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: dto.email,
          password: expect.any(String),
        })
      );
      
      const isValid = await bcrypt.compare(dto.password!, result.password);
      expect(isValid).toBe(true);
    });

    it('should update user with only email if password is missing', async () => {
      const existing = { id: 1, email: 'old@example.com', password: 'hashed' };
      repo.findOne.mockResolvedValue(existing);

      const dto: UpdateUserDto = { email: 'soloemail@example.com' };
      const updated = { ...existing, email: dto.email };

      repo.save.mockResolvedValue(updated);

      const result = await repository.updateUser(1, dto);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repo.save).toHaveBeenCalledWith(updated);
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if user not found', async () => {
      repo.findOne.mockResolvedValue(null);
      const dto: UpdateUserDto = { email: 'no@example.com' };

      await expect(repository.updateUser(999, dto)).rejects.toThrow(NotFoundException);
    });
  });
});


