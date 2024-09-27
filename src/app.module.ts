import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MigrationModule } from './migration/migration.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { OrganigramaModule } from './organigrama/organigrama.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'prueba_exp',
      entities: [
        join(__dirname, '/**/*.entity{.ts,.js}')
      ],
      synchronize: true
    }),
    MigrationModule,
    OrganigramaModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
