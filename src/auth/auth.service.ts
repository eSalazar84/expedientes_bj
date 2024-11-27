import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Dependencia } from '../organigrama/entities/dependencia.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        @InjectRepository(Dependencia)
        private dependenciaRepository: Repository<Dependencia>
    ) { }

    async login(email: string, password: string) {
        const dependencia = await this.dependenciaRepository.findOne({
            where: { email_dependencia: email }
        });

        if (!dependencia || !dependencia.email_dependencia) {
            throw new HttpException('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
        }

        const isPasswordValid = await bcrypt.compare(password, dependencia.password);

        if (!isPasswordValid) {
            throw new HttpException('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
        }

        const payload = {
            sub: dependencia.idDependencia,
            email: dependencia.email_dependencia,
            rol: dependencia.rol,
            nombre: dependencia.nombre_dependencia
        };

        const token = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('JWT_SECRET')
        });

        return {
            access_token: token,
            dependencia: {
                id: dependencia.idDependencia,
                nombre: dependencia.nombre_dependencia,
                email: dependencia.email_dependencia,
                rol: dependencia.rol
            }
        };
    }
}
