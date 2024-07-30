import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Estudiante } from '../models/estudiante';
import { backendGestionDocentesEstudiantes } from 'src/app/core/constants/api-url';
import { getHeaders } from 'src/app/core/constants/header';
import { EstadoEstudiante } from '../models/estado-estudiante';

@Injectable({
    providedIn: 'root',
})
export class EstudianteService {
    constructor(private http: HttpClient) {}

    listEstudiantes(): Observable<Estudiante[]> {
        return this.http.get<Estudiante[]>(
            backendGestionDocentesEstudiantes('estudiantes')
        );
    }

    uploadEstudiantes(file: File): Observable<any> {
        const formData: FormData = new FormData();
        formData.append('file', file, file.name);
        return this.http.post(
            backendGestionDocentesEstudiantes('estudiantes/upload'),
            formData
        );
    }

    getEstadoEstudiante(id: number) {
        return this.http.get<EstadoEstudiante>(
            backendGestionDocentesEstudiantes(`estudiantes/ver-estado/${id}`),
            { headers: getHeaders() }
        );
    }

    createEstudiante(estudiante: Estudiante) {
        return this.http.post<any>(
            backendGestionDocentesEstudiantes('estudiantes'),
            estudiante,
            { headers: getHeaders() }
        );
    }

    deleteEstudiante(id: number) {
        return this.http.delete<any>(
            backendGestionDocentesEstudiantes(`estudiantes/${id}`),
            { headers: getHeaders() }
        );
    }

    getEstudiante(id: number) {
        return this.http.get<Estudiante>(
            backendGestionDocentesEstudiantes(`estudiantes/${id}`),
            { headers: getHeaders() }
        );
    }

    updateEstudiante(id: number, estudiante: Estudiante) {
        return this.http.put<any>(
            backendGestionDocentesEstudiantes(`estudiantes/${id}`),
            estudiante,
            { headers: getHeaders() }
        );
    }
}
