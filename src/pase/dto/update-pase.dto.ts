import { PartialType } from '@nestjs/mapped-types';
import { CreatePaseDto } from './create-pase.dto';

export class UpdatePaseDto extends PartialType(CreatePaseDto) {}
