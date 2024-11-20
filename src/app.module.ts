import { Module } from '@nestjs/common';
import { MigrationModule } from './migration/migration.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { DependenciaModule } from './organigrama/dependencia.module';
import { ExpedienteModule } from './expediente/expediente.module';
import { PaseModule } from './pase/pase.module';
import { DB_TYPE, HOST, PORT, USER_DB_NAME, USER_DB_PASSWORD, DATABASE_NAME } from 'config'
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: DB_TYPE,
      host: HOST,
      port: PORT,
      username: USER_DB_NAME,
      password: USER_DB_PASSWORD,
      database: DATABASE_NAME,
      entities: [
        join(__dirname, '/**/*.entity{.ts,.js}')
      ],
      synchronize: true
    }),
    MigrationModule,
    DependenciaModule,
    ExpedienteModule,
    PaseModule,
    AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
