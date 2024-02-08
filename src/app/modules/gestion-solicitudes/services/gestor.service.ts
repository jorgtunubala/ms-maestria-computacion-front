import { Injectable } from '@angular/core';
import { Solicitud } from '../models/solicitud.model';

@Injectable({
    providedIn: 'root',
})
export class GestorService {
    solicitudSeleccionada: any;

    constructor() {}

    setSolicitudSeleccionada(prmSolicitud: any) {
        this.solicitudSeleccionada = prmSolicitud;
    }

    getSolicitudSeleccionada(): any {
        return this.solicitudSeleccionada;
    }
}
