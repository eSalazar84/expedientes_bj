import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';
import { DependenciaService } from './dependencia/dependencia.service';
import { Rol } from './auth/enums/rol.enum';
import * as bcrypt from "bcrypt";
import { SUPERADMIN_DEPENDENCIA, SUPERADMIN_EMAIL, USER_DB_PASSWORD } from "config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors()
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,//permite realizar una limpieza de todas las propiedades que no están definidas en el DTO, 
    //para que el objeto enviado al controlador como body solo tenga las propiedades que se han definido en el DTO.
    forbidNonWhitelisted: true,
  }));

  const dependenciaService = app.get(DependenciaService);

  const superAdminDependencia = await dependenciaService.finByRole(Rol.SUPER_ADMIN)

  if (!superAdminDependencia) {
    console.log(`No SUPERADMIN found. Creating one....`);
    const dependenciaNombre = process.env.SUPERADMIN_DEPENDENCIA;
    const dependenciaEmail = process.env.SUPERADMIN_EMAIL;
    const dependenciaPass = process.env.SUPERADMIN_PASSWORD;

    await dependenciaService.createInitialUser({
      nombre_dependencia: dependenciaNombre,
      email_dependencia: dependenciaEmail,
      password: await bcrypt.hash(dependenciaPass, 10),
      rol: Rol.SUPER_ADMIN,
      telefono: '2292452381'
    })
    console.log(`SUPERADMIN created: ${dependenciaEmail}`);
  }

  await app.listen(3000);
}
bootstrap();
