import { Module } from '@nestjs/common';
import { OrganigramaService } from './organigrama.service';
import { OrganigramaController } from './organigrama.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dependencia } from './entities/dependencia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dependencia])],
  controllers: [OrganigramaController],
  providers: [OrganigramaService],
})
export class OrganigramaModule { }
