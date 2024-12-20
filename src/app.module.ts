import { Module } from '@nestjs/common';
import { MigrationModule } from './migration/migration.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { DependenciaModule } from './dependencia/dependencia.module';
import { ExpedienteModule } from './expediente/expediente.module';
import { PaseModule } from './pase/pase.module';
import { DB_TYPE, MYSQLHOST, MYSQLPORT, MYSQLDATABASE, MYSQLPASSWORD, MYSQLUSER } from 'config'
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: DB_TYPE,
      host: MYSQLHOST,
      port: MYSQLPORT,
      username: MYSQLUSER,
      password: MYSQLPASSWORD,
      database: MYSQLDATABASE,
      entities: [
        join(__dirname, '/**/*.entity{.ts,.js}')
      ]
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
