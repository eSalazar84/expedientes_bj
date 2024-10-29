import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Expediente } from "../../expediente/entities/expediente.entity";
import { Pase } from "../../pase/entities/pase.entity";

@Entity()
export class Dependencia {
    @PrimaryGeneratedColumn()
    idDependencia: number

    @Column({ type: 'varchar', length: 80 })
    nombre_dependencia: string

    @Column({ type: 'varchar', length: 1 })
    letra_identificadora: string

    @Column({ type: 'int' })
    nro_expediente: number

    @Column({ type: 'varchar', length: 20, nullable: true })
    telefono: string | null

    @Column({ type: 'int', nullable: true })
    codigo_interno_telefono: number | null

    @Column({ type: 'varchar', length: 80, nullable: true })
    direccion: string | null

    @Column({ type: 'varchar', length: 60, nullable: true })
    email_dependencia: string | null

    @OneToMany(() => Expediente, (expediente) => expediente.dependencia_creadora)
    expedientes: Expediente[]

    @OneToMany(() => Pase, (pase) => pase.destino)
    pases: Pase[]
}