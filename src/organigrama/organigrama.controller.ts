import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrganigramaService } from './organigrama.service';
import { CreateOrganigramaDto } from './dto/create-organigrama.dto';
import { UpdateOrganigramaDto } from './dto/update-organigrama.dto';

@Controller('organigrama')
export class OrganigramaController {
  constructor(private readonly organigramaService: OrganigramaService) { }

  @Post()
  create(@Body() createOrganigramaDto: CreateOrganigramaDto): Promise<CreateOrganigramaDto> {
    return this.organigramaService.create(createOrganigramaDto);
  }

  @Get()
  async findAll(): Promise<CreateOrganigramaDto[]> {
    return await this.organigramaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organigramaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrganigramaDto: UpdateOrganigramaDto) {
    return this.organigramaService.update(+id, updateOrganigramaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organigramaService.remove(+id);
  }
}
