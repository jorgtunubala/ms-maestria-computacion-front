import { Injectable } from '@angular/core';
import { Solicitud } from '../models/solicitud.model';
import { HttpService } from './http.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GestorService {
    solicitudSeleccionada: any;
    private cargarSolicitudesSubject = new Subject<void>();
    cargarSolicitudes$ = this.cargarSolicitudesSubject.asObservable();

    constructor(private http: HttpService) {}

    setSolicitudSeleccionada(prmSolicitud: any) {
        this.solicitudSeleccionada = prmSolicitud;
    }

    getSolicitudSeleccionada(): any {
        return this.solicitudSeleccionada;
    }

    ejecutarCargarSolicitudes() {
        this.cargarSolicitudesSubject.next();
    }
}
