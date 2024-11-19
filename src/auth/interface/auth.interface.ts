import { Dependencia } from "src/organigrama/entities/dependencia.entity";

export interface ILoginResponse {
    access_token: string;
    dependencia: string;
}