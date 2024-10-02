import { Module } from '@nestjs/common';
import { PaseService } from './pase.service';
import { PaseController } from './pase.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pase } from './entities/pase.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pase])],
  controllers: [PaseController],
  providers: [PaseService],
})
export class PaseModule { }
