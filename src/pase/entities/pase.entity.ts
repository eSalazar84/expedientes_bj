import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Expediente } from "../../expediente/entities/expediente.entity";
import { Dependencia } from "src/dependencia/entities/dependencia.entity";

@Entity()
export class Pase {
    @PrimaryGeneratedColumn()
    idPase: number

    /* @Column({ type: 'datetime', nullable: true })
    fecha_hora_migracion: Date | null */

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    fecha_pase: Date

    @Column({ type: "int" })
    expedienteId: number

    @Column({ type: "int" })
    destinoId: number

    @ManyToOne(() => Expediente, (expediente) => expediente.pases)
    @JoinColumn({ name: 'expedienteId' })
    expediente: Expediente

    @ManyToOne(() => Dependencia, (dependencia) => dependencia.pases)
    @JoinColumn({ name: 'destinoId' })
    destino: Dependencia
}