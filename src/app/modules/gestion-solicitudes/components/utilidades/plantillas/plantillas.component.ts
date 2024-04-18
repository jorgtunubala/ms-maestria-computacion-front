import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RadicarService } from '../../../services/radicar.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-plantillas',
    templateUrl: './plantillas.component.html',
    styleUrls: ['./plantillas.component.scss'],
})
export class PlantillasComponent implements OnInit {
    rangoFechas: string = '';
    fechaActual: Date = new Date();
    nombresMes: string[] = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
    ];

    constructor(public radicar: RadicarService) {}

    ngOnInit(): void {
        if (
            ['AV_PASA_INV', 'AP_ECON_INV'].includes(
                this.radicar.tipoSolicitudEscogida.codigoSolicitud
            )
        ) {
            this.convertirFechas();
        }
    }

    obtenerPalabra(texto: string, posicion: number): string {
        const palabras = texto.split(' ');
        if (posicion >= 0 && posicion < palabras.length) {
            return palabras[posicion];
        }
        return '';
    }

    convertirFechas() {
        const fechaInicio = this.radicar.fechasEstancia[0];
        const fechaFin = this.radicar.fechasEstancia[1];

        // Obteniendo los componentes de las fechas
        const diaInicio = fechaInicio.getDate();
        const mesInicio = fechaInicio.getMonth() + 1;
        const anioInicio = fechaInicio.getFullYear();

        const diaFin = fechaFin.getDate();
        const mesFin = fechaFin.getMonth() + 1;
        const anioFin = fechaFin.getFullYear();

        // Formateando las fechas como dd/mm/aa
        const fechaInicioStr = `${diaInicio}/${mesInicio}/${anioInicio}`;
        const fechaFinStr = `${diaFin}/${mesFin}/${anioFin}`;

        // Concatenando las fechas formateadas con un guión entre ellas
        const fechaEstanciaStr = `${fechaInicioStr} - ${fechaFinStr}`;

        this.rangoFechas = fechaEstanciaStr;
    }
}
