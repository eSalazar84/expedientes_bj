import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Pase } from "../../pase/entities/pase.entity";
import { Dependencia } from "src/organigrama/entities/dependencia.entity";

@Entity()
export class Expediente {
    @PrimaryGeneratedColumn()
    idExpediente: number

    @Column({ type: 'year' })
    anio_expediente: number

    @Column({ type: 'int' })
    nro_expediente: number

    @Column({ type: 'int' })
    ruta_expediente: number

    @Column({ type: 'varchar', length: 120 })
    titulo_expediente: string

    @Column({ type: 'varchar', length: 250 })
    descripcion: string

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    fecha_creacion: Date

    @Column({ type: "int" })
    dependenciaId: number

    @ManyToOne(() => Dependencia, (dependencia) => dependencia.expedientes)
    @JoinColumn({ name: 'dependenciaId' })
    dependencia_creadora: Dependencia

    @OneToMany(() => Pase, (pase) => pase.expediente)
    pases: Pase[]
}
