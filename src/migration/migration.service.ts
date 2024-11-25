import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Expediente } from '../expediente/entities/expediente.entity';
import { Pase } from '../pase/entities/pase.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  /* private parsearFechaHora = (fecha: string, hora: string): Date => {
    try {
      if (!fecha || !hora) return new Date();

      // Convertir DD/MM/YYYY a YYYY-MM-DD
      const [dia, mes, anio] = fecha.split('/');
      const fechaFormateada = `${anio}-${mes}-${dia} ${hora}`;

      const fechaHora = new Date(fechaFormateada);
      return isNaN(fechaHora.getTime()) ? new Date() : fechaHora;
    } catch {
      return new Date();
    }
  };

  async migrateCSV(file: Express.Multer.File) {
    const expedientes = [];
    const pases = [];
    const dependenciasCache = new Map<string, Dependencia>(); // Cache para evitar múltiples consultas

    const csvParser = require('csv-parser');
    const fs = require('fs');

    const stream = fs.createReadStream(file.path).pipe(csvParser());

    for await (const row of stream) {
      // Buscar o crear la dependencia del expediente
      const codigoDependencia = row.CODIGO;
      let guardarDependencia = dependenciasCache.get(codigoDependencia);

      if (!guardarDependencia) {
        guardarDependencia = await this.dependenciaRepository.findOne({
          where: { nombre_dependencia: codigoDependencia },
        });

        if (!guardarDependencia) {
          guardarDependencia = this.dependenciaRepository.create({
            nombre_dependencia: codigoDependencia,
            letra_identificadora: row.LETRA,
          });
          guardarDependencia = await this.dependenciaRepository.save(guardarDependencia);
        }

        dependenciasCache.set(codigoDependencia, guardarDependencia);
      }

      // Crear el expediente
      const expediente = this.expedienteRepository.create({
        anio_expediente: parseInt(row.ANIO, 10),
        nro_expediente: parseInt(row.NRO, 10),
        ruta_expediente: row.RUTA,
        titulo_expediente: row.NOM,
        descripcion: `${row.MOTIVO1} ${row.MOTIVO2 || ''}`.trim(),
        fecha_creacion: this.parsearFechaHora(row.F1, row.H1),
        dependencia_creadora: guardarDependencia,
      });

      // Guardar el expediente inmediatamente después de crearlo
      const savedExpediente = await this.expedienteRepository.save(expediente);

      // Crear los pases asociados al expediente, recorriendo las columnas F, H y P
      for (let i = 1; i <= 25; i++) {
        const fechaCol = row[`F${i}`];
        const horaCol = row[`H${i}`];
        const paseCol = row[`P${i}`];

        // Verificar que las columnas no sean nulas y que tengan datos válidos
        if (fechaCol && horaCol && paseCol) {
          const paseDependenciaCodigo = paseCol.trim().toUpperCase();

          let destinoDependencia = dependenciasCache.get(paseDependenciaCodigo);

          if (!destinoDependencia) {
            destinoDependencia = await this.dependenciaRepository.findOne({
              where: { nombre_dependencia: paseDependenciaCodigo },
            });

            if (!destinoDependencia) {
              destinoDependencia = this.dependenciaRepository.create({
                nombre_dependencia: paseDependenciaCodigo,
                letra_identificadora: row.paseCol || ''
              });
              destinoDependencia = await this.dependenciaRepository.save(destinoDependencia);
            }

            dependenciasCache.set(paseDependenciaCodigo, destinoDependencia);
          }

          // Crear el pase con la dependencia de destino encontrada o creada
          const pase = this.paseRepository.create({
            expediente: savedExpediente, // Usar el expediente guardado
            fecha_hora_migracion: this.parsearFechaHora(fechaCol, horaCol),
            destino: destinoDependencia,
          });
          pases.push(pase);
        }
      }
    }

    // Guardar todos los pases en la base de datos
    await this.paseRepository.save(pases);

    return { expedientes: expedientes.length, pases: pases.length };
  } */

  async migrateCSV(file: Express.Multer.File) {
    // Iniciar una transacción para garantizar consistencia
    const queryRunner = this.expedienteRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const expedientes = [];
      const pases = [];
      const dependenciasCache = new Map<string, Dependencia>();

      // Cargar todas las dependencias existentes al inicio
      const existingDependencias = await queryRunner.manager.find(Dependencia);
      for (const dep of existingDependencias) {
        dependenciasCache.set(dep.nombre_dependencia.trim().toUpperCase(), dep);
      }

      const csvParser = require('csv-parser');
      const fs = require('fs');
      const stream = fs.createReadStream(file.path).pipe(csvParser());

      for await (const row of stream) {
        // Normalizar el código de dependencia
        const codigoDependencia = row.CODIGO.trim().toUpperCase();
        let guardarDependencia = dependenciasCache.get(codigoDependencia);

        if (!guardarDependencia) {
          // Crear nueva dependencia solo si no existe
          guardarDependencia = queryRunner.manager.create(Dependencia, {
            nombre_dependencia: codigoDependencia,
            letra_identificadora: row.LETRA?.trim() || 'Z',
          });
          guardarDependencia = await queryRunner.manager.save(Dependencia, guardarDependencia);
          dependenciasCache.set(codigoDependencia, guardarDependencia);
        }

        // Validar datos del expediente
        if (!row.ANIO || !row.NRO || !row.RUTA) {
          throw new Error(`Datos de expediente incompletos en fila: ${JSON.stringify(row)}`);
        }

        // Crear el expediente
        const expediente = queryRunner.manager.create(Expediente, {
          anio_expediente: this.transformarAnio(row.ANIO),
          nro_expediente: parseInt(row.NRO, 10),
          ruta_expediente: parseInt(row.RUTA, 10),
          titulo_expediente: row.NOM?.trim() || 'Sin título',
          descripcion: `${row.MOTIVO1 || ''} ${row.MOTIVO2 || ''}`.trim() || 'Sin descripción',
          fecha_creacion: this.parsearFechaHora(row.F1, row.H1),
          dependencia_creadora: guardarDependencia,
        });

        const savedExpediente = await queryRunner.manager.save(Expediente, expediente);
        expedientes.push(savedExpediente);

        // Procesar pases
        for (let i = 1; i <= 25; i++) {
          const fechaCol = row[`F${i}`];
          const horaCol = row[`H${i}`];
          const paseCol = row[`P${i}`];

          if (fechaCol && horaCol && paseCol) {
            const paseDependenciaCodigo = paseCol.trim().toUpperCase();
            let destinoDependencia = dependenciasCache.get(paseDependenciaCodigo);

            if (!destinoDependencia) {
              destinoDependencia = queryRunner.manager.create(Dependencia, {
                nombre_dependencia: paseDependenciaCodigo,
                letra_identificadora: 'Z'
              });
              destinoDependencia = await queryRunner.manager.save(Dependencia, destinoDependencia);
              dependenciasCache.set(paseDependenciaCodigo, destinoDependencia);
            }

            const pase = queryRunner.manager.create(Pase, {
              expediente: savedExpediente,
              fecha_hora_migracion: this.parsearFechaHora(fechaCol, horaCol),
              destino: destinoDependencia,
            });
            pases.push(pase);
          }
        }
      }

      // Guardar todos los pases en un solo batch
      await queryRunner.manager.save(Pase, pases);
      
      // Commit de la transacción
      await queryRunner.commitTransaction();

      return {
        status: 'success',
        expedientes: expedientes.length,
        pases: pases.length,
        dependencias: dependenciasCache.size
      };

    } catch (error) {
      // Rollback en caso de error
      await queryRunner.rollbackTransaction();
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: `Error en la migración: ${error.message}`
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    } finally {
      // Liberar el queryRunner
      await queryRunner.release();
    }
  }

  private parsearFechaHora(fecha: string, hora: string): Date {
    try {
      if (!fecha || !hora) return new Date();

      const [dia, mes, anio] = fecha.split('/');
      const fechaFormateada = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')} ${hora}`;
      
      const fechaHora = new Date(fechaFormateada);
      return isNaN(fechaHora.getTime()) ? new Date() : fechaHora;
    } catch {
      return new Date();
    }
  }

  private transformarAnio(anioStr: string): number {
    const anio = parseInt(anioStr, 10);
    
    if (anio >= 0 && anio <= 23) {  // Asumiendo que 0-23 representa 2000-2023
      return 2000 + anio;
    } else if (anio >= 24 && anio <= 99) {  // 24-99 representa 1924-1999
      return 1900 + anio;
    }
    
    return anio; // Si por alguna razón ya viene con 4 dígitos
  }

  
}
