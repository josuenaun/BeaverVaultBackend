// Capa 2: Application - src/application/dtos/AuthDTO.ts

export interface LoginInputDTO {
  correo: string;
  contrasena: string;
}

export interface AuthResponseDTO {
  token: string;
  superAdmin: {
    superAdminId: string;
    nombre: string;
    correo: string;
  };
}
