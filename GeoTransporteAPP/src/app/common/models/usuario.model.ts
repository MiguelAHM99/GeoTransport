export interface UsuarioI {
    id: string;
    correo: string;
    contrasenna: string;
    socio: boolean;
    conductores?: string[]; // IDs de los conductores asociados
  }