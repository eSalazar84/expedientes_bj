import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Dependencia } from '../organigrama/entities/dependencia.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        @InjectRepository(Dependencia)
        private dependenciaRepository: Repository<Dependencia>
    ) { }

    async login(email: string, password: string) {
        const dependencia = await this.dependenciaRepository.findOne({
            where: { email_dependencia: email }
        });

        console.log(dependencia);

        if (!dependencia || !dependencia.email_dependencia) {
            throw new HttpException('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
        }

        const isPasswordValid = await bcrypt.compare(password, dependencia.password);

        if (!isPasswordValid) {
            throw new HttpException('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
        }

        const payload = {
            email: dependencia.email_dependencia,
            sub: dependencia.idDependencia,
            nombre: dependencia.nombre_dependencia,
            rol: dependencia.rol
        };

        return {
            access_token: this.jwtService.sign(payload),
            dependencia: {
                id: dependencia.idDependencia,
                nombre: dependencia.nombre_dependencia,
                email: dependencia.email_dependencia,
                rol: dependencia.rol
            }
        };
    }
}
