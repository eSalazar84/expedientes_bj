import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateExpedienteDto {

    @IsNumber()
    @IsNotEmpty()
    dependenciaId: number; // ID de la dependencia que crea el expediente

    @IsString()
    @IsNotEmpty()
    titulo_expediente: string; // Título proporcionado por el usuario

    @IsString()
    @IsNotEmpty()
    descripcion: string; // Descripción proporcionada por el usuario
}
