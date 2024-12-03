import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Matches } from "class-validator"
import { Rol } from "src/auth/enums/rol.enum"

export class CreateDependenciaDto {
    idDependencia: number

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

    @IsOptional()
    @IsString()
    @Length(0, 1)
    @Matches(/^[A-Za-z]?$/, { // Permitir una letra o vacío
        message: 'La letra identificadora debe ser una única letra del alfabeto o estar vacía'
    })
    letra_identificadora: string

    @IsNumber()
    @IsOptional()
    codigo_interno_telefono: number

    @IsEnum(Rol)
    @IsOptional()
    rol: Rol

    @IsString()
    @IsOptional()
    password: string
}
