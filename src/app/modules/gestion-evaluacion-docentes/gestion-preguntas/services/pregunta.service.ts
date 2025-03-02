import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pregunta } from '../models/pregunta';
import { backend } from 'src/app/core/constants/api-url';
import { getHeaders } from 'src/app/core/constants/header';

@Injectable({
    providedIn: 'root',
})
export class PreguntaService {
    constructor(private http: HttpClient) {}

    createPregunta(pregunta: Pregunta) {
        return this.http.post<any>(backend('pregunta'), pregunta, {
            headers: getHeaders(),
        });
    }

    updatePregunta(id: number, pregunta: Pregunta) {
        return this.http.put<any>(backend(`pregunta/${id}`), pregunta, {
            headers: getHeaders(),
        });
    }

    getPregunta(id: number) {
        return this.http.get<Pregunta>(backend(`pregunta/${id}`), {
            headers: getHeaders(),
        });
    }

    listPreguntas(): Observable<Pregunta[]> {
        return this.http.get<Pregunta[]>(backend('pregunta'));
    }

    deletePregunta(id: number) {
        return this.http.patch<any>(backend(`pregunta/eliminar-logico/${id}`), {
            headers: getHeaders(),
        });
    }

    cambiarEstadoPregunta(id: number, estado: string) {
        return this.http.patch(
            backend(`pregunta/${id}/estado`),
            { estado },
            { headers: getHeaders(), responseType: 'text' }
        );
    }
}
