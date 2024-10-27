import { Controller, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaseService } from './pase.service';
import { CreatePaseDto } from './dto/create-pase.dto';
import { UpdatePaseDto } from './dto/update-pase.dto';
import { Pase } from './entities/pase.entity';

@Controller('pases')
export class PaseController {
  constructor(private readonly paseService: PaseService) {}

  @Post()
  async create(@Body() createPaseDto: CreatePaseDto):Promise<Pase> {
    return await this.paseService.createPase(createPaseDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaseDto: UpdatePaseDto) {
    return this.paseService.update(+id, updatePaseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paseService.remove(+id);
  }
}
