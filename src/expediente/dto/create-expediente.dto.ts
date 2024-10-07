import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateExpedienteDto {

    @IsNumber()
    dependenciaId: number; // ID de la dependencia que crea el expediente

    @IsString()
    @IsNotEmpty()
    titulo_expediente: string; // Título proporcionado por el usuario

    @IsString()
    @IsNotEmpty()
    descripcion: string; // Descripción proporcionada por el usuario

    // Solo obligatorio si la dependencia es PERMISOS o HABILITACIONES
    @IsOptional()
    apellidoSolicitante?: string;
}
