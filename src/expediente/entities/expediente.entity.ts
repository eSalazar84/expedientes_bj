import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Pase } from "../../pase/entities/pase.entity";
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

    @Column({ type: "int" })
    dependenciaId: number

    @ManyToOne(() => Dependencia, (dependencia) => dependencia.expedientes)
    @JoinColumn({ name: 'dependenciaId' })
    dependencia: Dependencia

    @OneToMany(() => Pase, (pase) => pase.expediente)
    pases: Pase[]
}
