import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class PaginationDto {
    @IsOptional()
    @IsBoolean()
    @ApiProperty({
        description: 'Definir si el orden es descendente, sino es ascendente',
        example: true,
        default: true,
    })
    esDescendente: boolean = true;

    @IsOptional()
    @IsInt()
    @Min(0, { message: 'El valor mínimo de skip es 0' })
    @Type(() => Number)
    @ApiProperty({
        description: 'Número de registros a omitir',
        example: 0,
        default: 0,
    })
    skip: number = 0;

    @IsOptional()
    @IsInt()
    @Min(1, { message: 'El valor mínimo de take es 1' })
    @Type(() => Number)
    @ApiProperty({
        description: 'Número de registros a retornar. Si no se define, devuelve todos',
        example: 10,
        required: false,
    })
    take?: number; // ahora es opcional
}
