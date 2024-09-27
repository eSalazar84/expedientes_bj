import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Expediente } from "./expediente.entity";
import { Dependencia } from "../../organigrama/entities/dependencia.entity";

@Entity()
export class Pase {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Expediente, (expediente) => expediente.pases)
    expediente: Expediente

    @Column({ type: 'datetime', nullable: true })
    fecha_hora_migracion: Date | null

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    fecha_pase: Date

    // Muchos pases pueden tener el mismo destino (una dependencia)
    @ManyToOne(() => Dependencia, (dependencia) => dependencia.destino_pases)
    destino: Dependencia;
}