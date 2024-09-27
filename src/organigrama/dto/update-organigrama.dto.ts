import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganigramaDto } from './create-organigrama.dto';

export class UpdateOrganigramaDto extends PartialType(CreateOrganigramaDto) {}
