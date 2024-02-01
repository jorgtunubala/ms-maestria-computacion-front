import { Injectable } from '@angular/core';
import { Solicitud } from '../models/solicitud.model';

@Injectable({
    providedIn: 'root',
})
export class GestorService {
    solicitudSeleccionada: Solicitud;

    constructor() {}

    setSolicitudSeleccionada(prmSolicitud: Solicitud) {
        this.solicitudSeleccionada = prmSolicitud;
    }

    getSolicitudSeleccionada(): Solicitud {
        return this.solicitudSeleccionada;
    }
}
