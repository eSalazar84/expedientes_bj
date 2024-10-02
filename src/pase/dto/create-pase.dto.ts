import { IsNotEmpty } from "class-validator";
import { Expediente } from "src/expediente/entities/expediente.entity";
import { Dependencia } from "src/organigrama/entities/dependencia.entity";

export class CreatePaseDto {
    idPase: number

    @IsNotEmpty()
    expediente: Expediente

    @IsNotEmpty()
    destino: Dependencia;
}
