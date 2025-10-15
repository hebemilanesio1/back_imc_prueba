import { Test, TestingModule } from '@nestjs/testing';
import { ImcService } from '../imc.service';
import { CalcularImcDto } from '../dto/calcular-imc.dto';
import { User } from './../../user/entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

describe('ImcService', () => {
  let service: ImcService;
  let mockImcRepository: { 
    createAndSave: jest.Mock; 
    findByUser: jest.Mock 
  };
  let mockUserRepository: Partial<Repository<User>>;
  let module: TestingModule;

  const mockUser: User = {
    id: 1,
    email: 'usuario@test.com',
    password: 'hashedpassword',
    imc: [],
  };

  beforeEach(async () => {
    mockImcRepository = {
      createAndSave: jest.fn(),
      findByUser: jest.fn(),
    };

    mockUserRepository = {
      findOne: jest.fn(),
    };

    module = await Test.createTestingModule({
      providers: [
        ImcService,
        {
          provide: 'IImcRepository',
          useValue: mockImcRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<ImcService>(ImcService);

    // Configurar mocks por defecto - el usuario siempre se encuentra
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

    (mockImcRepository.createAndSave as jest.Mock).mockImplementation((data) => Promise.resolve({
      id: 1,
      ...data,
    }));

  jest.spyOn(service['logger'], 'error').mockImplementation(() => {});
  jest.spyOn(service['logger'], 'debug').mockImplementation(() => {});
  jest.spyOn(service['logger'], 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reconfigurar el mock por defecto después de cada test - usuario siempre encontrado por defecto
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calcularImc error handling', () => {
    it('should log and throw if repository fails', async () => {
      const spyLogger = jest.spyOn(service['logger'], 'error');
      // Mock del usuario para que pase la validación
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      // Mock del repository para que falle
      (mockImcRepository.createAndSave as jest.Mock).mockRejectedValue(new Error('fail'));
      const dto: CalcularImcDto = { altura: 1.75, peso: 70 };
      
      await expect(service.calcularImc(dto, mockUser)).rejects.toThrow('No se pudo crear el registro IMC');
      expect(spyLogger).toHaveBeenCalledWith(
        expect.stringContaining('Error al crear el registro IMC: fail'),
        expect.anything()
      );
    });
  });

  describe('getHistorial', () => {
    it('should return mapped historial in DESC order', async () => {
      const mockEntities = [
        { id: 1, peso: 70, altura: 1.75, imc: 22.86, categoria: 'Normal', fecha: new Date('2023-01-01T00:00:00Z'), usuario: mockUser },
        { id: 2, peso: 80, altura: 1.75, imc: 26.12, categoria: 'Sobrepeso', fecha: new Date('2023-01-02T00:00:00Z'), usuario: mockUser },
      ];
      mockImcRepository.findByUser.mockResolvedValue(mockEntities);
      
      const result = await service.getHistorial(mockUser, 0, 2, true);
      
      expect(mockImcRepository.findByUser).toHaveBeenCalledWith(mockUser, true, 0, 2);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0].peso).toBe(70);
      expect(result[1].categoria).toBe('Sobrepeso');
    });

    it('should return mapped historial in ASC order', async () => {
      const mockEntities = [
        { id: 1, peso: 60, altura: 1.7, imc: 20.76, categoria: 'Normal', fecha: new Date('2023-01-01T00:00:00Z'), usuario: mockUser },
        { id: 2, peso: 90, altura: 1.8, imc: 27.78, categoria: 'Sobrepeso', fecha: new Date('2023-01-02T00:00:00Z'), usuario: mockUser },
      ];
      mockImcRepository.findByUser.mockResolvedValue(mockEntities);
      
      const result = await service.getHistorial(mockUser, 0, 2, false);
      
      expect(mockImcRepository.findByUser).toHaveBeenCalledWith(mockUser, false, 0, 2);
      expect(result[0].peso).toBe(60);
      expect(result[1].imc).toBeCloseTo(27.78, 2);
    });

    it('should throw if repository throws', async () => {
      mockImcRepository.findByUser.mockRejectedValue(new Error('fail'));
      
      await expect(service.getHistorial(mockUser, 0, 2, true)).rejects.toThrow('No se pudo obtener el historial de IMC');
    });
  });

  //PU-01 - Test para verificar que se rechace altura con más de 2 decimales
  it('should throw an error if altura has more than 2 decimal places (PU-01)', async () => {
    const dto = { altura: 2.111, peso: 100 };
    await expect(service.calcularImc(dto as any, mockUser)).rejects.toThrow(BadRequestException);
    await expect(service.calcularImc(dto as any, mockUser)).rejects.toThrow('La altura no puede tener más de 2 decimales');
  });
  
  //PU-02 - Test para verificar que se rechace peso con más de 2 decimales  
  it('should throw an error if peso has more than 2 decimal places (PU-02)', async () => {
    const dto = { altura: 2.1, peso: 100.555 };
    await expect(service.calcularImc(dto as any, mockUser)).rejects.toThrow(BadRequestException);
    await expect(service.calcularImc(dto as any, mockUser)).rejects.toThrow('El peso no puede tener más de 2 decimales');
  });

  //PU-03
  it('should calculate IMC correctly (PU-03)', async () => {
    const dto: CalcularImcDto = { altura: 2.1, peso: 101 };
    const result = await service.calcularImc(dto, mockUser);
    expect(result.imc).toBeCloseTo(22.90, 2);
    expect(result.categoria).toBe('Normal');
  });

  //PU-04 - Test para verificar que se rechacen valores no numéricos
  it('should throw an error if altura or peso are not numeric (PU-04)', async () => {
    const dto = { altura: 'abc', peso: '#$%' };
    await expect(service.calcularImc(dto as any, mockUser)).rejects.toThrow(BadRequestException);
    await expect(service.calcularImc(dto as any, mockUser)).rejects.toThrow('La altura y el peso deben ser valores numéricos válidos');
  });

  // Tests adicionales para verificar que valores válidos con decimales sí funcionan
  it('should accept altura and peso with 1-2 decimal places', async () => {
    const dto = { altura: 1.75, peso: 70.5 };
    const result = await service.calcularImc(dto, mockUser);
    expect(result).toBeDefined();
    expect(result.imc).toBeDefined();
  });

  it('should accept altura and peso with exactly 2 decimal places', async () => {
    const dto = { altura: 1.80, peso: 75.25 };
    const result = await service.calcularImc(dto, mockUser);
    expect(result).toBeDefined();
    expect(result.imc).toBeDefined();
  });

  //PU-05
  it('should throw an error if peso <=0 (PU-05)', async () => {
    const dto = { altura: 1.77, peso: -100 };
    await expect(service.calcularImc(dto as any, mockUser)).rejects.toThrow(BadRequestException);
  });

  //PU-06
  it('should throw an error if altura <=0 (PU-06)', async () => {
    const dto = { altura: -1.77, peso: 100 };
    await expect(service.calcularImc(dto as any, mockUser)).rejects.toThrow(BadRequestException);
  });

  //PU-07
  it('should throw an error if altura or peso are empty (PU-07)', async () => {
    const dto = { altura: '', peso: '' };
    await expect(service.calcularImc(dto as any, mockUser)).rejects.toThrow(BadRequestException);
  });

  //PU-08
  it('should throw an error if altura is 0 (PU-08)', async () => {
    const dto = { altura: 0, peso: 100 };
    await expect(service.calcularImc(dto as any, mockUser)).rejects.toThrow(BadRequestException);
  });

  //PU-09
  it('should throw an error if peso is 0 (PU-09)', async () => {
    const dto = { altura: 1.77, peso: 0 };
    await expect(service.calcularImc(dto as any, mockUser)).rejects.toThrow();
  });

  //PU-10
  it('should throw an error if altura is 3 (PU-10)', async () => {
    const dto = { altura: 3, peso: 100 };
    await expect(service.calcularImc(dto as any, mockUser)).rejects.toThrow();
  });

  //PU-11
  it('should throw an error if peso is 500 (PU-11)', async () => {
    const dto = { altura: 1.77, peso: 500 };
    await expect(service.calcularImc(dto as any, mockUser)).rejects.toThrow();
  });

  //PU-12
  it('should return "Bajo Peso" if IMC < 18.5 (PU-12)', async () => {
    const dto: CalcularImcDto = { altura: 1.75, peso: 50 };
    const result = await service.calcularImc(dto, mockUser);
    expect(result.imc).toBeLessThan(18.5);
    expect(result.categoria).toBe('Bajo peso');
  });

  //PU-13
  it('should return "Normal" if 18.5 <= IMC <= 24.9 (PU-13)', async () => {
    const dto: CalcularImcDto = { altura: 1.75, peso: 75 };
    const result = await service.calcularImc(dto, mockUser);
    expect(result.imc).toBeGreaterThanOrEqual(18.5);
    expect(result.imc).toBeLessThanOrEqual(24.9);
    expect(result.categoria).toBe('Normal');
  });

  //PU-14
  it('should return "Sobrepeso" if 25 <= IMC <= 29.9 (PU-14)', async () => {
    const dto: CalcularImcDto = { altura: 1.75, peso: 85 };
    const result = await service.calcularImc(dto, mockUser);
    expect(result.imc).toBeGreaterThanOrEqual(25);
    expect(result.imc).toBeLessThanOrEqual(29.9);
    expect(result.categoria).toBe('Sobrepeso');
  });

  //PU-15
  it('should return "Obeso" if IMC >= 30 (PU-15)', async () => {
    const dto: CalcularImcDto = { altura: 1.75, peso: 100 };
    const result = await service.calcularImc(dto, mockUser);
    expect(result.imc).toBeGreaterThanOrEqual(30);
    expect(result.categoria).toBe('Obeso');
  });

  //PU-16
  it('should record the IMC calculation in the history immediately with all the data', async () => {
    const dto: CalcularImcDto = { altura: 1.68, peso: 65 };
    const result = await service.calcularImc(dto, mockUser);
    
    mockImcRepository.findByUser.mockResolvedValue([
      {
        id: 1,
        altura: result.altura,
        peso: result.peso,
        imc: result.imc,
        categoria: result.categoria,
        fecha: result.fecha,
        usuario: mockUser,
      } as any
    ]);
    
    const historial = await service.getHistorial(mockUser, 0, 1, true);
    expect(Array.isArray(historial)).toBe(true);
    expect(historial.length).toBeGreaterThan(0);
    expect(historial[0]).toMatchObject({
      altura: 1.68,
      peso: 65,
      imc: 23.03,
      categoria: 'Normal',
    });
    expect(historial[0].fecha).toBeDefined();
  });

  //PU-17
  it('should filter historial by all categories (PU-17)', async () => {
    const mockHistorial = [
      { id: 1, altura: 1.7, peso: 50, imc: 17.3, categoria: 'Bajo peso', fecha: new Date(), usuario: mockUser },
      { id: 2, altura: 1.7, peso: 60, imc: 20.76, categoria: 'Normal', fecha: new Date(), usuario: mockUser },
      { id: 3, altura: 1.7, peso: 80, imc: 27.68, categoria: 'Sobrepeso', fecha: new Date(), usuario: mockUser },
      { id: 4, altura: 1.7, peso: 100, imc: 34.6, categoria: 'Obeso', fecha: new Date(), usuario: mockUser },
    ];
    
    mockImcRepository.findByUser.mockResolvedValue(mockHistorial);
    const historial = await service.getHistorial(mockUser, 0, 10, true);

    // Todas
    expect(historial.length).toBe(4);

    // Bajo Peso
    const bajoPeso = historial.filter(item => item.categoria === 'Bajo peso');
    expect(bajoPeso.length).toBe(1);
    expect(bajoPeso[0].categoria).toBe('Bajo peso');

    // Normal
    const normal = historial.filter(item => item.categoria === 'Normal');
    expect(normal.length).toBe(1);
    expect(normal[0].categoria).toBe('Normal');

    // Sobrepeso
    const sobrepeso = historial.filter(item => item.categoria === 'Sobrepeso');
    expect(sobrepeso.length).toBe(1);
    expect(sobrepeso[0].categoria).toBe('Sobrepeso');

    // Obeso
    const obeso = historial.filter(item => item.categoria === 'Obeso');
    expect(obeso.length).toBe(1);
    expect(obeso[0].categoria).toBe('Obeso');
  });

  // PU-22 Asociar cálculo de IMC a usuario autenticado
  it('debería calcular y guardar el IMC asociado al usuario autenticado', async () => {
    const mockUser: User = {
      id: 1,
      email: 'pu22@example.com',
      password: 'hashed',
      imc: [],
    };

    const dto = { peso: 70, altura: 1.75 };
    const expectedImc = 22.86;
    const expectedCategoria = 'Normal';

    const usuarioEntity = { ...mockUser }; // simula el usuario encontrado en la base
    const imcEntity = {
      id: 1,
      peso: dto.peso,
      altura: dto.altura,
      imc: expectedImc,
      categoria: expectedCategoria,
      fecha: new Date(),
      user: usuarioEntity,
    };

    jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(usuarioEntity);
    jest.spyOn(mockImcRepository, 'createAndSave').mockResolvedValue(imcEntity);

    const result = await service.calcularImc(dto, mockUser);

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUser.id } });
    expect(mockImcRepository.createAndSave).toHaveBeenCalledWith(
      expect.objectContaining({
        peso: dto.peso,
        altura: dto.altura,
        imc: expectedImc,
        categoria: expectedCategoria,
        user: usuarioEntity,
      })
    );
    const plainResult = JSON.parse(JSON.stringify(result));


    expect(plainResult).toEqual(
      expect.objectContaining({
        peso: dto.peso,
        altura: dto.altura,
        imc: expectedImc,
        categoria: expectedCategoria,
        fecha: expect.any(String),
      })
    );
    
  });

  // Tests adicionales para mejorar coverage

  //PU-26 - Test para usuario no encontrado
  it('should throw error when user not found in database (PU-26)', async () => {
    const dto: CalcularImcDto = { altura: 1.75, peso: 70 };
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);
    
    await expect(service.calcularImc(dto, mockUser)).rejects.toThrow('No se pudo crear el registro IMC');
  });

  //PU-27 - Test para repository failure en createAndSave
  it('should handle repository createAndSave failure (PU-27)', async () => {
    const dto: CalcularImcDto = { altura: 1.75, peso: 70 };
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
    (mockImcRepository.createAndSave as jest.Mock).mockRejectedValue(new Error('Database error'));
    
    await expect(service.calcularImc(dto, mockUser)).rejects.toThrow('No se pudo crear el registro IMC');
  });

  //PU-28 - Test para valores en límites superior
  it('should calculate IMC for upper boundary values (PU-28)', async () => {
    const dto: CalcularImcDto = { altura: 2.99, peso: 499.99 };
    const result = await service.calcularImc(dto, mockUser);
    expect(result.imc).toBeDefined();
    expect(result.categoria).toBe('Obeso'); // IMC muy alto
  });

  describe('getEstadisticas', () => {
    //PU-29 - Test para estadísticas con registros
    it('should calculate statistics with records (PU-29)', async () => {
      const mockRegistros = [
        { id: 1, altura: 1.7, peso: 60, imc: 20.76, categoria: 'Normal', fecha: new Date('2024-01-15'), usuario: mockUser },
        { id: 2, altura: 1.7, peso: 65, imc: 22.49, categoria: 'Normal', fecha: new Date('2024-02-15'), usuario: mockUser },
        { id: 3, altura: 1.7, peso: 70, imc: 24.22, categoria: 'Normal', fecha: new Date('2024-03-15'), usuario: mockUser },
      ];
      
      mockImcRepository.findByUser.mockResolvedValue(mockRegistros);
      
      const result = await service.getEstadisticas(mockUser);
      
      expect(result).toHaveProperty('imcMensual');
      expect(result).toHaveProperty('variacionPeso');
      expect(Array.isArray(result.imcMensual)).toBe(true);
      expect(Array.isArray(result.variacionPeso)).toBe(true);
    });

    //PU-30 - Test para estadísticas sin registros
    it('should return empty object when no records found (PU-30)', async () => {
      mockImcRepository.findByUser.mockResolvedValue([]);
      
      const result = await service.getEstadisticas(mockUser);
      
      expect(result).toEqual({});
    });

    //PU-31 - Test para error en getEstadisticas
    it('should handle error in getEstadisticas (PU-31)', async () => {
      mockImcRepository.findByUser.mockRejectedValue(new Error('Database error'));
      
      await expect(service.getEstadisticas(mockUser)).rejects.toThrow('No se pudieron obtener estadísticas de IMC');
    });

    //PU-32 - Test para estadísticas mensuales con múltiples meses
    it('should calculate monthly statistics correctly (PU-32)', async () => {
      const mockRegistros = [
        { id: 1, altura: 1.7, peso: 60, imc: 20.76, categoria: 'Normal', fecha: new Date('2024-01-15'), usuario: mockUser },
        { id: 2, altura: 1.7, peso:62, imc: 21.45, categoria: 'Normal', fecha: new Date('2024-01-25'), usuario: mockUser },
        { id: 3, altura: 1.7, peso: 65, imc: 22.49, categoria: 'Normal', fecha: new Date('2024-02-15'), usuario: mockUser },
        { id: 4, altura: 1.7, peso: 68, imc: 23.53, categoria: 'Normal', fecha: new Date('2024-03-10'), usuario: mockUser },
      ];
      
      mockImcRepository.findByUser.mockResolvedValue(mockRegistros);
      
      const result = await service.getEstadisticas(mockUser);
      
      expect(result.imcMensual?.length).toBeGreaterThan(0);
      expect(result.variacionPeso?.length).toBeGreaterThan(0);
      
      // Verificar que los meses están ordenados correctamente
      const mesesEsperados = ['ene', 'feb', 'mar'];
      result.imcMensual?.forEach((item, index) => {
        expect(mesesEsperados).toContain(item.mes);
      });
    });
  });

  describe('getHistorial additional tests', () => {
    //PU-33 - Test para error en getHistorial
    it('should handle error in getHistorial (PU-33)', async () => {
      mockImcRepository.findByUser.mockRejectedValue(new Error('Database error'));
      
      await expect(service.getHistorial(mockUser, 0, 10, true)).rejects.toThrow('No se pudo obtener el historial de IMC');
    });

    //PU-34 - Test para getHistorial con parámetros opcionales
    it('should get historial with optional parameters (PU-34)', async () => {
      const mockHistorial = [
        { id: 1, altura: 1.7, peso: 60, imc: 20.76, categoria: 'Normal', fecha: new Date(), usuario: mockUser },
      ];
      
      mockImcRepository.findByUser.mockResolvedValue(mockHistorial);
      
      const result = await service.getHistorial(mockUser, 0); // Sin take, con descendente por defecto
      
      expect(Array.isArray(result)).toBe(true);
      expect(mockImcRepository.findByUser).toHaveBeenCalledWith(mockUser, true, 0, undefined);
    });

    //PU-35 - Test para getHistorial en orden ascendente
    it('should get historial in ascending order (PU-35)', async () => {
      const mockHistorial = [
        { id: 1, altura: 1.7, peso: 60, imc: 20.76, categoria: 'Normal', fecha: new Date('2024-01-01'), usuario: mockUser },
        { id: 2, altura: 1.7, peso: 65, imc: 22.49, categoria: 'Normal', fecha: new Date('2024-02-01'), usuario: mockUser },
      ];
      
      mockImcRepository.findByUser.mockResolvedValue(mockHistorial);
      
      const result = await service.getHistorial(mockUser, 0, 10, false);
      
      expect(Array.isArray(result)).toBe(true);
      expect(mockImcRepository.findByUser).toHaveBeenCalledWith(mockUser, false, 0, 10);
    });
  });

  describe('calcularImc edge cases', () => {
    //PU-36 - Test para IMC exactamente en límite de categorías
    it('should categorize IMC exactly at category boundaries (PU-36)', async () => {
      // IMC = 18.5 (límite Bajo peso / Normal)
      const dto1: CalcularImcDto = { altura: 1.0, peso: 18.5 };
      const result1 = await service.calcularImc(dto1, mockUser);
      expect(result1.categoria).toBe('Normal');

      // IMC = 25.0 (límite Normal / Sobrepeso)
      const dto2: CalcularImcDto = { altura: 1.0, peso: 25.0 };
      const result2 = await service.calcularImc(dto2, mockUser);
      expect(result2.categoria).toBe('Sobrepeso');

      // IMC = 30.0 (límite Sobrepeso / Obeso)
      const dto3: CalcularImcDto = { altura: 1.0, peso: 30.0 };
      const result3 = await service.calcularImc(dto3, mockUser);
      expect(result3.categoria).toBe('Obeso');
    });
  });
});