import {
    gestion_autenticacion,
    gestion_docentes_estudiantes,
    gestion_egresados,
    gestion_expertos,
    gestion_trabajo_grado,
} from 'src/environments/environment.prod';

export function backendAuth(path: string): string {
    return gestion_autenticacion.api_url.concat(path);
}

export function backendGestionExpertos(path: string): string {
    return gestion_expertos.api_url.concat(path);
}

export function backendGestionEgresados(path: string): string {
    return gestion_egresados.api_url.concat(path);
}

export function backendGestionTrabajoDeGrado(path: string): string {
    return gestion_trabajo_grado.api_url.concat(path);
}

export function backendGestionDocentesEstudiantes(path: string): string {
    return gestion_docentes_estudiantes.api_url.concat(path);
}
