import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { backend } from 'src/app/core/constants/api-url';
import { getHeaders } from 'src/app/core/constants/header';
import { Docente } from 'src/app/modules/gestion-docentes/models/docente';

@Injectable({
  providedIn: 'root'
})
export class DocenteService {

    constructor(private http: HttpClient) {}

    filterDocentes(filter: string): Observable<Docente[]> {
        return this.http.get<Docente[]>(
            backend(`docentes/filtrar/${filter.trim()}`),
            { headers: getHeaders() }
        );
    }

    listDocentes(): Observable<Docente[]> {
        return this.http.get<Docente[]>(
            backend('docentes'),
            { headers: getHeaders() }
        );
    }
}
