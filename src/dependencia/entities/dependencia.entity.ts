import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Expediente } from "../../expediente/entities/expediente.entity";
import { Pase } from "../../pase/entities/pase.entity";
import { Rol } from "../../auth/enums/rol.enum";
@Entity()
export class Dependencia {
    @PrimaryGeneratedColumn()
    idDependencia: number

    @Column({ type: 'varchar', length: 80, default: 'Dependencia sin nombre' })
    nombre_dependencia: string

    @Column({ type: 'varchar', length: 1, default: 'z' })
    letra_identificadora: string | null

    @Column({ type: 'boolean', default: false })
    letra_es_variable: boolean

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

    @Column({ type: 'enum', enum: Rol, default: 'USER' })
    rol: Rol;

    @Column({ type: 'varchar', length: 60, nullable: true })
    password: string;
}