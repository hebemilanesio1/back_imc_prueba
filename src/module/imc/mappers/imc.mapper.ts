import { ImcEntity } from '../entities/imc.entity';
import { CreateImcDto } from '../dto/create-imc.dto';

export class ImcMapper {
    static toCreateDto(entity: ImcEntity): CreateImcDto {
        const dto = new CreateImcDto();
        dto.peso = Number(entity.peso);
        dto.altura = Number(entity.altura);
        dto.imc = Number(entity.imc);
        dto.categoria = entity.categoria;
        dto.fecha = entity.fecha;
        return dto;
    }

    static toCreateDtoList(entities: ImcEntity[]): CreateImcDto[] {
        return entities.map(entity => this.toCreateDto(entity));
    }
}
