import { Test, TestingModule } from '@nestjs/testing';
import { ImcRepository } from '../repository/imc.repository';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ImcEntity } from '../entities/imc.entity';
import { User } from '../../user/entities/user.entity';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
});

describe('ImcRepository', () => {
  let repository: ImcRepository;
  let repo: ReturnType<typeof mockRepository>;
  let module: TestingModule;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedpassword',
    imc: [],
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        ImcRepository,
        {
          provide: getRepositoryToken(ImcEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<ImcRepository>(ImcRepository);
    repo = module.get(getRepositoryToken(ImcEntity));

    // Silenciar logs si el repositorio los usa
  jest.spyOn(repository['logger'], 'error').mockImplementation(() => {});
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createAndSave', () => {
    it('should create and save an ImcEntity', async () => {
      const fecha = new Date();
      const entity = new ImcEntity();
      entity.id = 1;
      entity.peso = 70;
      entity.altura = 1.75;
      entity.imc = 22.86;
      entity.categoria = 'Normal';
      entity.fecha = fecha;
      entity.user = mockUser;

      repo.create.mockReturnValue(entity);
      repo.save.mockResolvedValue(entity);
      
      const result = await repository.createAndSave(entity);
      
      expect(repo.create).toHaveBeenCalledWith(entity);
      expect(repo.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });

    it('should throw InternalServerErrorException on error', async () => {
      repo.create.mockImplementation(() => { throw new Error('fail'); });
      const entity = new ImcEntity();
      entity.peso = 70;
      entity.altura = 1.75;
      entity.imc = 22.86;
      entity.categoria = 'Normal';
      entity.fecha = new Date();
      
      await expect(repository.createAndSave(entity)).rejects.toThrow('No se pudo crear el registro IMC');
    });
  });

  describe('find', () => {
    it('should return entities in DESC order', async () => {
      const entity = new ImcEntity();
      entity.id = 1;
      entity.peso = 70;
      entity.altura = 1.75;
      entity.imc = 22.86;
      entity.categoria = 'Normal';
      entity.fecha = new Date();
      const entities: ImcEntity[] = [entity];
      repo.find.mockResolvedValue(entities);
      const result = await repository.find(true, 0, 10);
      expect(repo.find).toHaveBeenCalledWith({ order: { fecha: 'DESC' }, skip: 0, take: 10 });
      expect(result).toEqual(entities);
        });
        it('should return entities in ASC order', async () => {
      const entity = new ImcEntity();
      entity.id = 1;
      entity.peso = 70;
      entity.altura = 1.75;
      entity.imc = 22.86;
      entity.categoria = 'Normal';
      entity.fecha = new Date();
      const entities: ImcEntity[] = [entity];
      repo.find.mockResolvedValue(entities);
      const result = await repository.find(false, 0, 10);
      expect(repo.find).toHaveBeenCalledWith({ order: { fecha: 'ASC' }, skip: 0, take: 10 });
      expect(result).toEqual(entities);
    });
    it('should throw InternalServerErrorException on error', async () => {
      repo.find.mockImplementation(() => {
        throw new Error('fail');
      });
      await expect(repository.find(true, 0, 10)).rejects.toThrow('No se pudo obtener el historial de IMC');
    });
  });

  describe('findByUser', () => {
    it('should return entities for specific user in DESC order', async () => {
      const entity = new ImcEntity();
      entity.id = 1;
      entity.peso = 70;
      entity.altura = 1.75;
      entity.imc = 22.86;
      entity.categoria = 'Normal';
      entity.fecha = new Date();
      entity.user = mockUser;
      
      const entities: ImcEntity[] = [entity];
      repo.find.mockResolvedValue(entities);
      
      const result = await repository.findByUser(mockUser, true, 0, 10);
      
      expect(repo.find).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
        order: { fecha: 'DESC' },
        skip: 0,
        take: 10
      });
      expect(result).toEqual(entities);
    });

    it('should return entities for specific user in ASC order', async () => {
      const entity = new ImcEntity();
      entity.id = 1;
      entity.peso = 70;
      entity.altura = 1.75;
      entity.imc = 22.86;
      entity.categoria = 'Normal';
      entity.fecha = new Date();
      entity.user = mockUser;
      
      const entities: ImcEntity[] = [entity];
      repo.find.mockResolvedValue(entities);
      
      const result = await repository.findByUser(mockUser, false, 0, 10);
      
      expect(repo.find).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
        order: { fecha: 'ASC' },
        skip: 0,
        take: 10
      });
      expect(result).toEqual(entities);
    });

    it('should throw InternalServerErrorException on error', async () => {
      repo.find.mockImplementation(() => {
        throw new Error('fail');
      });
      await expect(repository.findByUser(mockUser, true, 0, 10)).rejects.toThrow('No se pudo obtener el historial de IMC del usuario');
    });
  });
});

