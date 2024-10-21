import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Expediente } from '../expediente/entities/expediente.entity';
import { Pase } from '../pase/entities/pase.entity';
import * as fastCsv from 'fast-csv';
import * as fs from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Dependencia } from 'src/organigrama/entities/dependencia.entity';


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

  /* async migrateCSV(filePath: string): Promise<{ status: number; message: string }> {
    return new Promise((resolve, reject) => {
      const expedientesMap = new Map<number, Expediente>(); // Mapa para expedientes
      const dependenciasMap = new Map<string, Dependencia>(); // Mapa para dependencias

      const stream = fs.createReadStream(filePath);
      const csvParser = fastCsv.parse({ headers: true, delimiter: ',' });

      stream.pipe(csvParser)
        .on('data', async (row) => {
          try {
            // Normalizar el código de la dependencia para evitar problemas con espacios en blanco o mayúsculas
            const codigoDependencia = row.CODIGO.trim().toUpperCase();

            // Verificar si la dependencia ya está en el mapa
            let guardarDependencia = dependenciasMap.get(codigoDependencia);

            if (!guardarDependencia) {
              // Si no está en el mapa, buscar en la base de datos
              guardarDependencia = await this.dependenciaRepository.findOne({
                where: { nombre_dependencia: codigoDependencia },
              });

              if (!guardarDependencia) {
                // Si no existe, crear y guardar una nueva dependencia
                const dependenciaData = {
                  nombre_dependencia: codigoDependencia
                };

                guardarDependencia = this.dependenciaRepository.create(dependenciaData);
                guardarDependencia = await this.dependenciaRepository.save(guardarDependencia);
              }

              // Guardar la dependencia en el mapa para futuras referencias
              dependenciasMap.set(codigoDependencia, guardarDependencia);
            }

            // Procesar el expediente con la dependencia obtenida
            const expedienteData = {
              anio_expediente: parseInt(row.ANIO, 10),
              letra_identificadora: row.LETRA,
              nro_expediente: parseInt(row.NRO, 10),
              ruta_expediente: row.RUTA,
              dependencia: guardarDependencia, // Relacionar con la dependencia
              titulo_expediente: row.NOM,
              descripcion: `${row.MOTIVO1} ${row.MOTIVO2 || ''}`.trim(),
            };

            let expediente = this.expedienteRepository.create(expedienteData);
            expediente = await this.expedienteRepository.save(expediente);
            expedientesMap.set(expediente.idExpediente, expediente);

            // Crear los pases
            for (let i = 1; i <= 25; i++) {
              const fechaCol = row[`F${i}`];
              const horaCol = row[`H${i}`];
              const paseCol = row[`P${i}`];

              if (fechaCol && horaCol && paseCol) {
                const paseDependenciaCodigo = paseCol.trim().toUpperCase();

                // Verificar si la dependencia destino ya está en el mapa
                let destinoDependencia = dependenciasMap.get(paseDependenciaCodigo);

                if (!destinoDependencia) {
                  // Si no está en el mapa, buscar en la base de datos
                  destinoDependencia = await this.dependenciaRepository.findOne({
                    where: { nombre_dependencia: paseDependenciaCodigo },
                  });

                  if (!destinoDependencia) {
                    // Si no existe, crear y guardar una nueva dependencia destino
                    const destinoDependenciaData = {
                      nombre_dependencia: paseDependenciaCodigo,
                    };
                    destinoDependencia = this.dependenciaRepository.create(destinoDependenciaData);
                    destinoDependencia = await this.dependenciaRepository.save(destinoDependencia);
                  }

                  // Guardar la dependencia destino en el mapa
                  dependenciasMap.set(paseDependenciaCodigo, destinoDependencia);
                }

                // Crear y guardar el pase
                const pase = this.paseRepository.create({
                  expediente,
                  fecha_hora_migracion: new Date(`${fechaCol} ${horaCol}`),
                  destino: destinoDependencia,
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
  } */

  async migrateCSV(filePath: string): Promise<{ status: number; message: string }> {
    return new Promise((resolve, reject) => {
      const expedientesMap = new Map<number, Expediente>(); // Mapa para expedientes
      const dependenciasMap = new Map<string, Dependencia>(); // Mapa para dependencias

      const stream = fs.createReadStream(filePath);
      const csvParser = fastCsv.parse({ headers: true, delimiter: ',' });

      stream.pipe(csvParser)
        .on('data', async (row) => {
          try {
            // Normalizar el código de la dependencia para evitar problemas con espacios en blanco o mayúsculas
            const codigoDependencia = row.CODIGO.trim().toUpperCase(); // Asegúrate que sea consistente

            // Verificar si la dependencia ya está en el mapa
            let guardarDependencia = dependenciasMap.get(codigoDependencia);

            if (!guardarDependencia) {
              // Si no está en el mapa, buscar en la base de datos (asegúrate que trim() y toUpperCase() sean consistentes)
              guardarDependencia = await this.dependenciaRepository.findOne({
                where: { nombre_dependencia: codigoDependencia }, // Comparación consistente
              });

              if (!guardarDependencia) {
                // Si no existe, crear y guardar una nueva dependencia
                const dependenciaData = {
                  nombre_dependencia: codigoDependencia
                };

                guardarDependencia = this.dependenciaRepository.create(dependenciaData);
                guardarDependencia = await this.dependenciaRepository.save(guardarDependencia);
              }

              // Guardar la dependencia en el mapa para futuras referencias
              dependenciasMap.set(codigoDependencia, guardarDependencia);
            }

            // Procesar el expediente con la dependencia obtenida
            const expedienteData = {
              anio_expediente: parseInt(row.ANIO, 10),
              letra_identificadora: row.LETRA,
              nro_expediente: parseInt(row.NRO, 10),
              ruta_expediente: row.RUTA,
              dependencia: guardarDependencia, // Relacionar con la dependencia
              titulo_expediente: row.NOM,
              descripcion: `${row.MOTIVO1} ${row.MOTIVO2 || ''}`.trim(),
            };

            let expediente = this.expedienteRepository.create(expedienteData);
            expediente = await this.expedienteRepository.save(expediente);
            expedientesMap.set(expediente.idExpediente, expediente);

            // Crear los pases
            for (let i = 1; i <= 25; i++) {
              const fechaCol = row[`F${i}`];
              const horaCol = row[`H${i}`];
              const paseCol = row[`P${i}`];

              if (fechaCol && horaCol && paseCol) {
                const paseDependenciaCodigo = paseCol.trim().toUpperCase();

                // Declarar la variable destinoDependencia
                let destinoDependencia: Dependencia;

                // Verificar si el pase es hacia la misma dependencia del expediente
                if (paseDependenciaCodigo === codigoDependencia) {
                  // Si es la misma dependencia, reutilizar la dependencia ya asociada al expediente
                  destinoDependencia = guardarDependencia;
                } else {
                  // Verificar si la dependencia destino ya está en el mapa
                  let destinoDependencia = dependenciasMap.get(paseDependenciaCodigo);

                  if (!destinoDependencia) {
                    // Si no está en el mapa, buscar en la base de datos
                    destinoDependencia = await this.dependenciaRepository.findOne({
                      where: { nombre_dependencia: paseDependenciaCodigo },
                    });

                    if (!destinoDependencia) {
                      // Si no existe, crear y guardar una nueva dependencia destino
                      const destinoDependenciaData = {
                        nombre_dependencia: paseDependenciaCodigo,
                      };
                      destinoDependencia = this.dependenciaRepository.create(destinoDependenciaData);
                      destinoDependencia = await this.dependenciaRepository.save(destinoDependencia);
                    }

                    // Guardar la dependencia destino en el mapa
                    dependenciasMap.set(paseDependenciaCodigo, destinoDependencia);
                  }
                }

                // Crear y guardar el pase
                const pase = this.paseRepository.create({
                  expediente,
                  fecha_hora_migracion: new Date(`${fechaCol} ${horaCol}`),
                  dependenciaId: destinoDependencia.idDependencia,
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

  async findAll(): Promise<Expediente[]> {
    return await this.expedienteRepository.find({ relations: ['pases', 'dependencia', 'pases.dependencia'] });
  }

  async findOneExpediente(id: number): Promise<Expediente> {
    const query: FindOneOptions = { where: { idExpediente: id }, relations: ['pases', 'dependencia', 'pases.dependencia'] }
    const expedienteFound = await this.expedienteRepository.findOne(query)
    if (!expedienteFound) throw new HttpException({
      status: HttpStatus.NOT_FOUND,
      error: `No existe el expediente que esta buscando`
    }, HttpStatus.NOT_FOUND)
    return expedienteFound;
  }
  
  update(id: number, updateMigrationDto) {
    return `This action updates a #${id} migration`;
  }

  remove(id: number) {
    return `This action removes a #${id} migration`;
  }
}
