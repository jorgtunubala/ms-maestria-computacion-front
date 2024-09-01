import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RadicarService } from '../../../services/radicar.service';
import { UtilidadesService } from '../../../services/utilidades.service';

@Component({
    selector: 'app-plantillas',
    templateUrl: './plantillas.component.html',
    styleUrls: ['./plantillas.component.scss'],
})
export class PlantillasComponent implements OnInit {
    nombreArchivosAdjuntos: string[] = [];
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

    constructor(
        public radicar: RadicarService,
        private utilidades: UtilidadesService
    ) {}

    ngOnInit(): void {
        /*
        if (
            [
                'AV_PASA_INV',
                'AP_ECON_INV',
                'AP_ECON_ASI',
                'PA_PUBL_EVE',
            ].includes(this.radicar.tipoSolicitudEscogida.codigoSolicitud)
        ) {
            switch (this.radicar.tipoSolicitudEscogida.codigoSolicitud) {
                case 'AP_ECON_ASI':
                    this.convertirFechas(
                        this.radicar.formApoyoAsistEvento.get('fechas')
                            .value[0],
                        this.radicar.formApoyoAsistEvento.get('fechas').value[1]
                    );
                    break;

                case 'AP_ECON_INV':
                    this.convertirFechas(
                        this.radicar.fechasEstancia[0],
                        this.radicar.fechasEstancia[1]
                    );
                    break;

                default:
                    break;
            }
        }
            */

        this.obtenerNombreArchivosAdjuntos();
    }

    obtenerPalabra(texto: string, posicion: number): string {
        const palabras = texto.split(' ');
        if (posicion >= 0 && posicion < palabras.length) {
            return palabras[posicion];
        }
        return '';
    }

    obtenerNombreArchivosAdjuntos(): void {
        if (
            this.radicar.datosAsignaturasExternas &&
            this.radicar.datosAsignaturasExternas.length > 0
        ) {
            // Recorre cada elemento de datosAsignaturasExternas
            this.radicar.datosAsignaturasExternas.forEach((asignatura) => {
                // Verifica si hay información en 'contenidos'
                if (asignatura.contenidos) {
                    // Si hay información, extrae el nombre y guárdalo en el arreglo nombresArchivos
                    this.nombreArchivosAdjuntos.push(
                        asignatura.contenidos.name
                    );
                }
                // Verifica si hay información en 'cartaAceptacion'
                if (asignatura.cartaAceptacion) {
                    // Si hay información, extrae el nombre y guárdalo en el arreglo nombresArchivos
                    this.nombreArchivosAdjuntos.push(
                        asignatura.cartaAceptacion.name
                    );
                }
            });
        }

        if (
            this.radicar.datosAsignaturasAHomologar &&
            this.radicar.datosAsignaturasAHomologar.length > 0
        ) {
            // Recorre cada elemento de datosAsignaturasAHomologar
            this.radicar.datosAsignaturasAHomologar.forEach((asignatura) => {
                // Verifica si hay información en 'contenidos'
                if (asignatura.contenidos) {
                    // Si hay información, extrae el nombre y guárdalo en el arreglo nombresArchivos
                    this.nombreArchivosAdjuntos.push(
                        asignatura.contenidos.name
                    );
                }
            });
        }

        if (
            this.radicar.documentosAdjuntos &&
            this.radicar.documentosAdjuntos.length > 0
        ) {
            this.radicar.documentosAdjuntos.forEach((doc) => {
                this.nombreArchivosAdjuntos.push(doc.name);
            });
        }

        // Verificar adjuntosDeActividades
        if (this.radicar.adjuntosDeActividades) {
            Object.keys(this.radicar.adjuntosDeActividades).forEach(
                (actividadId) => {
                    const adjuntosActividad =
                        this.radicar.adjuntosDeActividades[Number(actividadId)];
                    if (adjuntosActividad) {
                        this.nombreArchivosAdjuntos.push(
                            `Actividad ${Number(actividadId) + 1}`
                        );
                        if (
                            adjuntosActividad.archivos &&
                            adjuntosActividad.archivos.length > 0
                        ) {
                            adjuntosActividad.archivos.forEach((archivo) => {
                                this.nombreArchivosAdjuntos.push(
                                    `- ${archivo.name}`
                                );
                            });
                        }
                        if (
                            adjuntosActividad.enlaces &&
                            adjuntosActividad.enlaces.length > 0
                        ) {
                            adjuntosActividad.enlaces.forEach((enlace) => {
                                this.nombreArchivosAdjuntos.push(
                                    `- Enlace: ${enlace}`
                                );
                            });
                        }
                    }
                }
            );
        }
    }
}
