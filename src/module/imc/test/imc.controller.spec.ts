import { Test, TestingModule } from '@nestjs/testing';
import { ImcController } from '../imc.controller';
import { ImcService } from '../imc.service';
import { CalcularImcDto } from '../dto/calcular-imc.dto';

describe('ImcController', () => {
    let controller: ImcController;
    let service: ImcService;
    let module: TestingModule;

    const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedpassword',
        imc: [],
    };

    const mockRequest = {
        user: mockUser,
    };

    beforeEach(async () => {
        module = await Test.createTestingModule({
            controllers: [ImcController],
            providers: [
                {
                    provide: ImcService,
                    useValue: {
                        calcularImc: jest.fn(),
                        getHistorial: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<ImcController>(ImcController);
        service = module.get<ImcService>(ImcService);
    });

    afterAll(async () => {
        if (module) {
            await module.close();
        }
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return IMC and category for valid input', async () => {
        const dto: CalcularImcDto = { altura: 1.75, peso: 70 };
        const expectedResult = {
            altura: 1.75,
            peso: 70,
            imc: 22.86,
            categoria: 'Normal',
            fecha: new Date(),
        };

        jest.spyOn(service, 'calcularImc').mockResolvedValue(expectedResult);

        const result = await controller.calcular(dto, mockRequest as any);
        
        expect(result).toEqual(expectedResult);
        expect(service.calcularImc).toHaveBeenCalledWith(dto, mockUser);
    });

    it('should call getHistorial with correct parameters', async () => {
        const mockQuery = { skip: '0', take: '10', esDescendente: true };
        const expectedResult = [
            {
                altura: 1.75,
                peso: 70,
                imc: 22.86,
                categoria: 'Normal',
                fecha: new Date(),
            }
        ];

        jest.spyOn(service, 'getHistorial').mockResolvedValue(expectedResult);

        const result = await controller.getHistorial(mockQuery as any, mockRequest as any);
        
        expect(result).toEqual(expectedResult);
        expect(service.getHistorial).toHaveBeenCalledWith(mockUser, 0, 10, true);
    });
});
