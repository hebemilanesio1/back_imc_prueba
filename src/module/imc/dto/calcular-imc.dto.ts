import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class CalcularImcDto {
    @Type(() => Number) // transforma el valor entrante a número
    @IsNumber({}, { message: 'El peso debe ser un número' })
    @IsNotEmpty({ message: 'El peso no puede estar vacío' })
    @Min(0.1, { message: 'El peso debe ser mayor que 0' })
    @Max(499.99, { message: 'El peso debe ser menor a 500 kg' })
    peso: number;

    @Type(() => Number)
    @IsNumber({}, { message: 'La altura debe ser un número' })
    @IsNotEmpty({ message: 'La altura no puede estar vacía' })
    @Min(0.1, { message: 'La altura debe ser mayor a 0' })
    @Max(2.99, { message: 'La altura debe ser menor a 3 metros' })
    altura: number;
}
