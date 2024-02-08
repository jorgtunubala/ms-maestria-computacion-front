import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    TiposSolicitudResponse,
    RequisitosSolicitudResponse,
    TutoresYDirectoresResponse,
    SolicitudSave,
    SolicitudPendienteAval,
} from '../models';
import { Observable, catchError, map } from 'rxjs';
import { InfoPersonalResponse } from '../models/infoPersonalResponse';
import { DatosSolicitudRequest } from '../models/solicitudes/datosSolicitudRequest';

@Injectable({
    providedIn: 'root',
})
export class HttpService {
    private apiUrl = 'http://localhost:8095/msmaestriac/gestionSolicitud/save';

    constructor(private http: HttpClient) {}

    obtenerTiposDeSolicitud() {
        const url =
            'http://localhost:8095/msmaestriac/gestionSolicitud/tiposSolicitud';
        return this.http.get<TiposSolicitudResponse>(url).pipe(
            map((respuesta) => {
                return respuesta.tipoSolicitudDto;
            })
        );
    }

    obtenerRequisitosDeSolicitud(codigo: string) {
        const url =
            'http://localhost:8095/msmaestriac/gestionSolicitud/requisitoSolicitud/' +
            codigo;
        return this.http.get<RequisitosSolicitudResponse>(url).pipe(
            map((respuesta) => {
                return respuesta.doRequeridoSolicitudDto;
            })
        );
    }

    obtenerInfoPersonalSolicitante(correo: string) {
        const url =
            'http://localhost:8095/msmaestriac/gestionSolicitud/obtenerInfoPersonal/' +
            correo;
        return this.http.get<InfoPersonalResponse>(url).pipe(
            map((respuesta) => {
                return respuesta.informacionPersonalDto;
            })
        );
    }

    obtenerTutoresYDirectores() {
        const url =
            'http://localhost:8095/msmaestriac/gestionSolicitud/obtenerTutores';
        return this.http.get<TutoresYDirectoresResponse>(url).pipe(
            map((respuesta) => {
                return respuesta.tutores;
            })
        );
    }

    guardarSolHomologPost(objeto: SolicitudSave): Observable<any> {
        console.log(objeto);
        return this.http.post(this.apiUrl, objeto);
    }

    obtenerListaSolPendientesAval(
        correo: string
    ): Observable<SolicitudPendienteAval[]> {
        const url =
            'http://localhost:8095/msmaestriac/gestionSolicitud/obtener-solicitudes-pendientes/' +
            correo;
        return this.http.get<SolicitudPendienteAval[]>(url);
    }

    obtenerInfoSolGuardada(id: number): Observable<DatosSolicitudRequest> {
        const url =
            'http://localhost:8095/msmaestriac/gestionSolicitud/obtener-datos-solicitud/' +
            id;
        return this.http.get<DatosSolicitudRequest>(url);
    }
}
