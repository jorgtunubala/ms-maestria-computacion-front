import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { backend } from 'src/app/core/constants/api-url';
import { getHeaders } from 'src/app/core/constants/header';
import { Experto } from 'src/app/modules/gestion-expertos/models/experto';

@Injectable({
  providedIn: 'root'
})
export class ExpertoService {

    constructor(private http: HttpClient) {}

    filterExpertos(filter: string): Observable<Experto[]> {
        return this.http.get<Experto[]>(
            backend(`expertos/filtrar/${filter.trim()}`),
            { headers: getHeaders() }
        );
    }

    listDocentes(): Observable<Experto[]> {
        return this.http.get<Experto[]>(
            backend('expertos'),
            { headers: getHeaders() }
        );
    }
}