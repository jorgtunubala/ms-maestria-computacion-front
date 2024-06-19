import { Injectable } from '@angular/core';
import { EventoHistorial } from '../models/indiceModelos';

@Injectable({
    providedIn: 'root',
})
export class SeguimientoService {
    radicado: string = '';
    historial: EventoHistorial[] = [];

    constructor() {}

    restablecerValores() {
        this.radicado = '';
        this.historial = [];
    }
}
