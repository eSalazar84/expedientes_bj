import { DependenciaEnum } from "src/utils/enums/organigrama.enum";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Expediente } from "../../expediente/entities/expediente.entity";
import { Pase } from "../../pase/entities/pase.entity";

@Entity()
export class Dependencia {
    @PrimaryGeneratedColumn()
    idDependencia: number

    @Column({ type: 'varchar', length: 80 })
    nombre_dependencia: string

    @Column({ type: 'varchar', length: 20, nullable: true })
    telefono: string | null

    @Column({ type: 'int', nullable: true })
    codigo_interno_telefono: number | null

    @Column({ type: 'varchar', length: 80, nullable: true })
    direccion: string | null

    @Column({ type: 'varchar', length: 60, nullable: true })
    email_dependencia: string | null

    // Relación de ManyToOne entre Dependencia y Expedientes
    // Una dependencia puede estar relacionada con múltiples expedientes
    @OneToMany(() => Expediente, (expediente) => expediente.dependencia)
    expedientes: Expediente[];

    // Relación de ManyToOne entre Dependencia y Pases
    // Una dependencia puede ser el destino de múltiples pases
    @OneToMany(() => Pase, (pase) => pase.destino)
    destino_pases: Pase[];
}