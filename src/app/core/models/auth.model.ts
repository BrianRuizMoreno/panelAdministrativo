export interface LoginRequest {
  username: string;
  password: string;
  idSerial: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  usuario: Usuario;
  empresa: Empresa | null;
  catalogo: Record<string, unknown>;
}

export interface Usuario {
  id1: string;
  id2: string | null;
  id3: string | null;
  tipo: number;
  username: string;
  nombre: string;
}

export interface Empresa {
  idEmpresa: string;
  descripcion: string;
}

export interface SessionData {
  token: string;
  refreshToken: string;
  usuario: Usuario;
  empresa: Empresa;
  catalogo: Record<string, unknown>;
  timestamp: number;
  tipoUsuario: number;
  idAuxi: string | null;
  idCtaAuxi: string | null;
}


export type AuthStatus = 'idle' | 'authenticating' | 'authenticated' | 'error';

export interface AuthError {
  code: string;
  message: string;
  statusCode: number;
}
