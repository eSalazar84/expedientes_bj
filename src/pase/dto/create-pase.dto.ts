import { IsNotEmpty } from "class-validator";

export class CreatePaseDto {

    @IsNotEmpty()
    expedienteId: number

    @IsNotEmpty()
    destinoId: number;
}
