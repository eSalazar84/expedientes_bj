import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMigrationDto } from './dto/create-migration.dto';
import { UpdateMigrationDto } from './dto/update-migration.dto';
import { Expediente } from './entities/expediente.entity';
import { Pase } from './entities/pase.entity';
import * as fastCsv from 'fast-csv';
import * as fs from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Dependencia } from '../organigrama/entities/dependencia.entity';


@Injectable()
export class MigrationService {
  constructor(
    @InjectRepository(Expediente)
    private readonly expedienteRepository: Repository<Expediente>,
    @InjectRepository(Pase)
    private readonly paseRepository: Repository<Pase>,
    @InjectRepository(Dependencia)
    private readonly dependenciaRepository: Repository<Dependencia>
  ) { }

  async migrateCSV(filePath: string): Promise<{ status: number; message: string }> {
    return new Promise((resolve, reject) => {
      const expedientesMap = new Map<number, Expediente>(); // Mapa para expedientes, ahora por ID

      const stream = fs.createReadStream(filePath);
      const csvParser = fastCsv.parse({ headers: true, delimiter: ',' });

      stream.pipe(csvParser)
        .on('data', async (row) => {
          try {
            //para crear el origen del expediente
            const dependenciaData = {
              dependencia: row.CODIGO
            }

            const asignarDependencia = this.dependenciaRepository.create(dependenciaData)
            const guardarDependencia = await this.dependenciaRepository.save(asignarDependencia)

            // Procesar las columnas para crear el expediente
            const expedienteData = {
              anio_expediente: parseInt(row.ANIO, 10),
              letra_identificadora: row.LETRA,
              nro_expediente: parseInt(row.NRO, 10),
              ruta_expediente: row.RUTA,
              dependencia: { id: guardarDependencia.id },
              titulo_expediente: row.NOM,
              descripcion: `${row.MOTIVO1} ${row.MOTIVO2 || ''}`.trim(), // Juntamos MOTIVO1 y MOTIVO2
            };

            // Crear y guardar el expediente en la base de datos
            let expediente = this.expedienteRepository.create(expedienteData);
            expediente = await this.expedienteRepository.save(expediente);

            // Usamos el `id` generado por la base de datos como clave en el mapa
            expedientesMap.set(expediente.id, expediente);

            // Crear pases
            for (let i = 1; i <= 25; i++) {
              const fechaCol = row[`F${i}`];
              const horaCol = row[`H${i}`];
              const paseCol = row[`P${i}`];

              const dependenciaData = {
                dependencia: row[`P${i}`]
              }

              const asignarDependencia = this.dependenciaRepository.create(dependenciaData)
              const guardarDependencia = await this.dependenciaRepository.save(asignarDependencia)


              if (fechaCol && horaCol && paseCol) {

                const pase = this.paseRepository.create({
                  expediente,
                  fecha_hora_migracion: new Date(`${fechaCol} ${horaCol}`), // Formateamos fecha y hora
                  destino: { id: guardarDependencia.id },
                });

                await this.paseRepository.save(pase);
              }
            }
          } catch (error) {
            reject({
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              message: `Migration failed: ${error.message}`,
            });
          }
        })
        .on('end', () => {
          resolve({
            status: HttpStatus.CREATED,
            message: `Migration completed successfully.`,
          });
        })
        .on('error', (error) => {
          reject({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Error during CSV migration: ${error.message}`,
          });
        });
    });
  }

  async findAll():Promise<Expediente[]> {
    return await this.expedienteRepository.find({ relations: ['pases', 'dependencia', 'pases.destino'] });
  }

  async findOneExpediente(id: number): Promise<Expediente> {
    const query: FindOneOptions = { where: { id: id }, relations: ['pases', 'dependencia', 'pases.destino'] }
    const expedienteFound = await this.expedienteRepository.findOne(query)
    if (!expedienteFound) throw new HttpException({
      status: HttpStatus.NOT_FOUND,
      error: `No existe el expediente que esta buscando`
    }, HttpStatus.NOT_FOUND)
    return expedienteFound;
  }

  update(id: number, updateMigrationDto: UpdateMigrationDto) {
    return `This action updates a #${id} migration`;
  }

  remove(id: number) {
    return `This action removes a #${id} migration`;
  }
}
