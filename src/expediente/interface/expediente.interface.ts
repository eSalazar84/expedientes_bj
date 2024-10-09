import { Ipase } from "src/pase/interface/pase.interface";

export interface Iexpediente {
    idExpediente: number,
    anio_expediente: number,
    letra_identificadora: string,
    nro_expediente: number,
    ruta_expediente: number,
    titulo_expediente: string,
    descripcion: string,
    dependencia: {
        idDependencia: number; // ID de la dependencia
        nombre_dependencia: string;
    }
    pases: Ipase[]
}