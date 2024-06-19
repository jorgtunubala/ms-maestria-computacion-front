import { Component, OnInit } from '@angular/core';
import { PrimeIcons } from 'primeng/api';
import { SeguimientoService } from '../../../services/seguimiento.service';
import { EventoHistorial } from '../../../models/indiceModelos';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-historial',
    templateUrl: './historial.component.html',
    styleUrls: ['./historial.component.scss'],
})
export class HistorialComponent implements OnInit {
    eventos: EventoHistorial[];
    docPrueba: File;

    personalizacion: {
        [estadoSolicitud: string]: { color: string; icon: string };
    } = {
        Radicada: { color: '#0F2041', icon: 'pi pi-check-circle' },
        'No Avalada': { color: '#AF0000', icon: 'pi pi-ban' },
    };

    constructor(
        public seguimiento: SeguimientoService,
        private datePipe: DatePipe
    ) {}

    ngOnInit(): void {
        this.eventos = this.seguimiento.historial;
    }

    cambiarFormatoFecha(fecha: string): string {
        return this.datePipe.transform(fecha, 'dd-MM-yyyy h:mm a') || '';
    }
}
