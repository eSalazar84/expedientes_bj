export class CreateExpedienteDto {
    dependenciaId: number; // ID de la dependencia que crea el expediente
    titulo_expediente: string; // Título proporcionado por el usuario
    descripcion: string; // Descripción proporcionada por el usuario
}
