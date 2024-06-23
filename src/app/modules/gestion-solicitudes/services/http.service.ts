import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { httpConfig } from '../environments/http-config';
import {
    TiposSolicitudResponse,
    RequisitosSolicitudResponse,
    TutoresYDirectoresResponse,
    SolicitudSave,
    SolicitudRecibida,
    DatosAvalSolicitud,
    InfoActividadesReCreditos,
    EventoHistorial,
    NumeroRadicado,
} from '../models/indiceModelos';
import { InfoPersonalResponse } from '../models/solicitante/infoPersonalResponse';
import { DatosSolicitudRequest } from '../models/solicitudes/datosSolicitudRequest';

@Injectable({
    providedIn: 'root',
})
export class HttpService {
    private apiUrl = httpConfig.apiUrl;
    private apiUrlSub = httpConfig.apiUrlSub;

    constructor(private http: HttpClient) {}

    private manejarError(error: any) {
        console.error('Ocurrió un error', error);
        return throwError(
            'Algo salió mal; por favor, intenta nuevamente más tarde.'
        );
    }

    obtenerTiposDeSolicitud() {
        const url = `${this.apiUrl}${httpConfig.obtenerTiposDeSolicitudUrl}`;
        return this.http.get<TiposSolicitudResponse>(url).pipe(
            map((respuesta) => respuesta.tipoSolicitudDto),
            catchError(this.manejarError)
        );
    }

    obtenerRequisitosDeSolicitud(codigo: string) {
        const url = `${this.apiUrl}${httpConfig.obtenerRequisitosDeSolicitudUrl}${codigo}`;
        return this.http.get<RequisitosSolicitudResponse>(url).pipe(
            map((respuesta) => respuesta.doRequeridoSolicitudDto),
            catchError(this.manejarError)
        );
    }

    obtenerInfoPersonalSolicitante(correo: string) {
        const url = `${this.apiUrl}${httpConfig.obtenerInfoPersonalSolicitanteUrl}${correo}`;
        return this.http.get<InfoPersonalResponse>(url).pipe(
            map((respuesta) => respuesta.informacionPersonalDto),
            catchError(this.manejarError)
        );
    }

    obtenerTutoresYDirectores() {
        const url = `${this.apiUrl}${httpConfig.obtenerTutoresYDirectoresUrl}`;
        return this.http.get<TutoresYDirectoresResponse>(url).pipe(
            map((respuesta) => respuesta.tutores),
            catchError(this.manejarError)
        );
    }

    guardarSolicitud(objeto: SolicitudSave): Observable<any> {
        const url = `${this.apiUrl}${httpConfig.guardarSolicitudUrl}`;
        return this.http.post(url, objeto, { responseType: 'text' }).pipe(
            map((response) => {
                try {
                    return JSON.parse(response);
                } catch (e) {
                    // Si la respuesta no es JSON, devolverla como está.
                    return response;
                }
            }),
            catchError(this.manejarError)
        );
    }

    guardarAvalesSolicitud(objeto: DatosAvalSolicitud): Observable<any> {
        const url = `${this.apiUrl}${httpConfig.guardarAvalesSolicitudUrl}`;
        return this.http.post(url, objeto).pipe(catchError(this.manejarError));
    }

    obtenerListaSolPendientesAval(
        correo: string
    ): Observable<SolicitudRecibida[]> {
        const url = `${this.apiUrl}${httpConfig.obtenerListaSolPendientesAvalUrl}${correo}`;
        return this.http
            .get<SolicitudRecibida[]>(url)
            .pipe(catchError(this.manejarError));
    }

    obtenerInfoSolGuardada(id: number): Observable<DatosSolicitudRequest> {
        const url = `${this.apiUrl}${httpConfig.obtenerInfoSolGuardadaUrl}${id}`;
        return this.http
            .get<DatosSolicitudRequest>(url)
            .pipe(catchError(this.manejarError));
    }

    obtenerActividadesReCreditos() {
        const url = `${this.apiUrlSub}${httpConfig.obtenerActividadesReCreditosUrl}`;
        return this.http.get<InfoActividadesReCreditos[]>(url).pipe(
            map((respuesta) => respuesta),
            catchError(this.manejarError)
        );
    }

    consultarHistorialSolicitud(id: string): Observable<EventoHistorial[]> {
        const url = `${this.apiUrl}${httpConfig.obtenerHistorialDeSolicitudUrl}${id}`;
        return this.http
            .get<EventoHistorial[]>(url)
            .pipe(catchError(this.manejarError));
    }

    consultarSolicitudesCoordinacion(estado: string) {
        const url = `${this.apiUrl}${httpConfig.obtenerSolicitudesCoordinacion}${estado}`;
        return this.http.get<SolicitudRecibida[]>(url).pipe(
            map((respuesta) => respuesta),
            catchError(this.manejarError)
        );
    }
}
