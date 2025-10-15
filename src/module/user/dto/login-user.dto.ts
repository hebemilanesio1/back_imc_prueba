import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'El correo debe tener un formato válido' })
  email: string;

  @IsString()
  password: string;
}
