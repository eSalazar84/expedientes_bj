import { IsNotEmpty } from "class-validator";

export class CreatePaseDto {
    idPase: number

    @IsNotEmpty()
    expedienteId: number

    @IsNotEmpty()
    dependenciaId: number;
}
