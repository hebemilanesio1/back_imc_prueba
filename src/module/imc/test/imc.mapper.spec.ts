import 'reflect-metadata';
import { ImcMapper } from '../mappers/imc.mapper';
import { ImcEntity } from '../entities/imc.entity';
import { CreateImcDto } from '../dto/create-imc.dto';

describe('ImcMapper', () => {
    it('should map ImcEntity to CreateImcDto correctly', () => {
        const entity = new ImcEntity();
        entity.id = 1;
        entity.peso = 70;
        entity.altura = 1.75;
        entity.imc = 22.86;
        entity.categoria = 'Normal';
        entity.fecha = new Date('2023-01-01T00:00:00Z');

        const dto = ImcMapper.toCreateDto(entity);
        expect(dto).toBeInstanceOf(CreateImcDto);
        expect(dto.peso).toBe(entity.peso);
        expect(dto.altura).toBe(entity.altura);
        expect(dto.imc).toBe(entity.imc);
        expect(dto.categoria).toBe(entity.categoria);
        expect(dto.fecha?.getTime()).toBe(entity.fecha.getTime());
    });

    it('should map a list of ImcEntity to CreateImcDto[]', () => {
        const entity1 = new ImcEntity();
        entity1.id = 1;
        entity1.peso = 70;
        entity1.altura = 1.75;
        entity1.imc = 22.86;
        entity1.categoria = 'Normal';
        entity1.fecha = new Date('2023-01-01T00:00:00Z');

        const entity2 = new ImcEntity();
        entity2.id = 2;
        entity2.peso = 80;
        entity2.altura = 1.75;
        entity2.imc = 26.12;
        entity2.categoria = 'Sobrepeso';
        entity2.fecha = new Date('2023-01-02T00:00:00Z');

        const dtos = ImcMapper.toCreateDtoList([entity1, entity2]);
        expect(Array.isArray(dtos)).toBe(true);
        expect(dtos.length).toBe(2);
        expect(dtos[0].peso).toBe(70);
        expect(dtos[1].peso).toBe(80);
        expect(dtos[1].categoria).toBe('Sobrepeso');
    });
});
