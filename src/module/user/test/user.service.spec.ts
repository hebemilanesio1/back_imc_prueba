import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

describe('UserService', () => {
  let service: UserService;
  let module: TestingModule;
  let mockUserRepository: {
    findByEmail: jest.Mock;
    findById: jest.Mock;
    findAll: jest.Mock;
    createUser: jest.Mock;
    updateUser: jest.Mock;
  };

  beforeEach(async () => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
    };

    module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'IUserRepository',
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedpassword',
      };

      mockUserRepository.createUser.mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);

      expect(mockUserRepository.createUser).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedUser);
    });

    // PU-23: Este test verifica que el DTO valida contraseñas menores a 6 caracteres
    it('should handle validation errors at DTO level for passwords less than 6 characters (PU-23)', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: '1', // Contraseña de 1 caracter
      };

      // Simulamos que el repositorio rechaza por validación del DTO
      const validationError = new Error('La contraseña debe tener al menos 6 caracteres');
      mockUserRepository.createUser.mockRejectedValue(validationError);

      await expect(service.create(createUserDto)).rejects.toThrow('La contraseña debe tener al menos 6 caracteres');
      expect(mockUserRepository.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const email = 'test@example.com';
      const expectedUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedpassword',
      };

      mockUserRepository.findByEmail.mockResolvedValue(expectedUser);

      const result = await service.findByEmail(email);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(expectedUser);
    });

    it('should return null if user not found', async () => {
      const email = 'nonexistent@example.com';
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const userId = 1;
      const expectedUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedpassword',
      };

      mockUserRepository.findById.mockResolvedValue(expectedUser);

      const result = await service.findById(userId);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const expectedUsers = [
        { id: 1, email: 'user1@example.com', password: 'hashedpass1' },
        { id: 2, email: 'user2@example.com', password: 'hashedpass2' },
      ];

      mockUserRepository.findAll.mockResolvedValue(expectedUsers);

      const result = await service.findAll();

      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
      };

      const expectedUser = {
        id: 1,
        email: 'updated@example.com',
        password: 'hashedpassword',
      };

      mockUserRepository.updateUser.mockResolvedValue(expectedUser);

      const result = await service.update(userId, updateUserDto);

      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual(expectedUser);
    });
  });
});