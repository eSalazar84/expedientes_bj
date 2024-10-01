import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Pase } from "../../migration/entities/pase.entity";
import { Dependencia } from "src/organigrama/entities/dependencia.entity";

@Entity()
export class Expediente {
    @PrimaryGeneratedColumn()
    idExpediente: number

    @Column()
    anio_expediente: number

    @Column()
    letra_identificadora: string

    @Column()
    nro_expediente: number

    @Column()
    ruta_expediente: number

    @Column()
    titulo_expediente: string

    @Column()
    descripcion: string

    // Un expediente puede tener múltiples pases
    @OneToMany(() => Pase, (pase) => pase.expediente)
    pases: Pase[];

    // Muchos expedientes pueden estar relacionados con una única dependencia
    @ManyToOne(() => Dependencia, (dependencia) => dependencia.expedientes)
    dependencia: Dependencia;

}
