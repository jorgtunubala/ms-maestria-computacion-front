import { Injectable } from '@angular/core';
import { Cuestionario } from '../models/cuestionario';
import { getHeaders } from 'src/app/core/constants/header';
import { backend } from 'src/app/core/constants/api-url';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CuestionarioService {
    constructor(private http: HttpClient) {}

    createCuestionario(cuestionario: Cuestionario) {
        return this.http.post<any>(backend('cuestionario'), cuestionario, {
            headers: getHeaders(),
        });
    }

    updateCuestionario(id: number, cuestionario: Cuestionario) {
        return this.http.put<any>(backend(`cuestionario/${id}`), cuestionario, {
            headers: getHeaders(),
        });
    }

    deleteCuestionario(id: number) {
        return this.http.patch<any>(
            backend(`cuestionario/eliminar-logico/${id}`),
            { headers: getHeaders() }
        );
    }

    listCuestionarios(): Observable<Cuestionario[]> {
        return this.http.get<Cuestionario[]>(backend('cuestionario'));
    }

    cambiarEstadoCuestionario(id: number, estado: string) {
        return this.http.patch(
            backend(`cuestionario/${id}/estado`),
            { estado },
            { headers: getHeaders(), responseType: 'text' }
        );
    }

    getCuestionario(id: number) {
        return this.http.get<Cuestionario>(backend(`cuestionario/${id}`), {
            headers: getHeaders(),
        });
    }

    addPreguntas(id: number, idPreguntas: number[]) {
        return this.http.post(
            backend(`cuestionario/preguntas`),
            { idPreguntas, idCuestionario: id},
            { headers: getHeaders() }
        );
    }
}
