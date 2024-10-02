import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator"

export class CreateDependenciaDto {

    @IsString()
    @IsNotEmpty()
    nombre_dependencia: string

    @IsOptional()
    @Matches(/^[+\d\s-]+$/, { message: 'El número de teléfono contiene caracteres no permitidos.' })
    telefono: string

    @IsOptional()
    @IsString()
    direccion: string

    @IsOptional()
    @IsEmail()
    email_dependencia: string

}
