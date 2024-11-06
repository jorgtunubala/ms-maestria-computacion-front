import { environment, gestion_solicitudes } from 'src/environments/environment';

export function backend(path: string): string {
    return environment.api_url.concat(path);
}

export function backendGestionSolicitudes(path: string): string {
    return gestion_solicitudes.api_url.concat(path);
}
