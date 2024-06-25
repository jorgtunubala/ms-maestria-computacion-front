import { Injectable } from '@angular/core';
import { Solicitud } from '../models/solicitudes/solicitud.model';
import { HttpService } from './http.service';
import { Subject } from 'rxjs';
import { SolicitudRecibida } from '../models/indiceModelos';
import { DatosSolicitudRequest } from '../models/solicitudes/datosSolicitudRequest';

@Injectable({
    providedIn: 'root',
})
export class GestorService {
    solicitudSeleccionada: SolicitudRecibida;
    estadoSolicitud: string;

    private cargarSolicitudesSubject = new Subject<void>();
    cargarSolicitudes$ = this.cargarSolicitudesSubject.asObservable();

    constructor(private http: HttpService) {}

    setSolicitudSeleccionada(prmSolicitud: SolicitudRecibida) {
        this.solicitudSeleccionada = prmSolicitud;
    }

    getSolicitudSeleccionada(): SolicitudRecibida {
        return this.solicitudSeleccionada;
    }

    ejecutarCargarSolicitudes() {
        this.cargarSolicitudesSubject.next();
    }
}
