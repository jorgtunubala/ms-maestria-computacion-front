import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { backend } from 'src/app/core/constants/api-url';
import { getHeaders } from 'src/app/core/constants/header';
import { Estudiante } from 'src/app/shared/models/estudiante';

@Injectable({
    providedIn: 'root',
})
export class EstudianteService {
    constructor(private http: HttpClient) {}

    filterEstudiantes(filter: string): Observable<Estudiante[]> {
        return this.http.get<Estudiante[]>(
            backend(`estudiantes/filtrar/${filter.trim()}`),
            { headers: getHeaders() }
        );
    }

    listEstudiantes(): Observable<Estudiante[]> {
        return this.http.get<Estudiante[]>(backend('estudiantes'), {
            headers: getHeaders(),
        });
    }
}
