import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { backendGestionDocentesEstudiantes } from 'src/app/core/constants/api-url';
import { Docente } from '../models/docente';
import { getHeaders } from 'src/app/core/constants/header';

@Injectable({
    providedIn: 'root',
})
export class DocenteService {
    constructor(private http: HttpClient) {}

    createDocente(docente: Docente) {
        return this.http.post<any>(
            backendGestionDocentesEstudiantes('docentes'),
            docente,
            { headers: getHeaders() }
        );
    }

    updateDocente(id: number, docente: Docente) {
        return this.http.put<any>(
            backendGestionDocentesEstudiantes(`docentes/${id}`),
            docente,
            { headers: getHeaders() }
        );
    }

    getDocente(id: number) {
        return this.http.get<Docente>(
            backendGestionDocentesEstudiantes(`docentes/${id}`),
            { headers: getHeaders() }
        );
    }

    uploadDocentes(file: File): Observable<any> {
        const formData: FormData = new FormData();
        formData.append('file', file, file.name);
        return this.http.post(
            backendGestionDocentesEstudiantes('docentes/upload'),
            formData
        );
    }

    listDocentes(): Observable<Docente[]> {
        return this.http.get<Docente[]>(
            backendGestionDocentesEstudiantes('docentes'),
            { headers: getHeaders() }
        );
    }

    deleteDocente(id: number) {
        return this.http.patch<any>(
            backendGestionDocentesEstudiantes(`docentes/eliminar-logico/${id}`),
            { headers: getHeaders() }
        );
    }
}
