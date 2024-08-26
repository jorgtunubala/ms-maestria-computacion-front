import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { GestorService } from '../../../services/gestor.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { SolicitudRecibida } from '../../../models/indiceModelos';
import { SeguimientoService } from '../../../services/seguimiento.service';

interface ConfiguracionBuzon {
    titulo: string;
    icono: string;
    columnaFecha: string;
}

@Component({
    selector: 'app-buzon',
    templateUrl: './buzon.component.html',
    styleUrls: ['./buzon.component.scss'],
    providers: [DialogService],
})
export class BuzonComponent implements OnInit {
    solicitudes: SolicitudRecibida[];
    seleccionada: SolicitudRecibida;

    cargandoSolicitudes: boolean = true;

    tituloBuzon: string;
    iconoBuzon: string;
    columnaFecha: string;

    private configuraciones: Record<string, ConfiguracionBuzon> = {
        nuevas: {
            titulo: 'Solicitudes nuevas',
            icono: 'pi pi-arrow-down',
            columnaFecha: 'Recibida',
        },
        rechazadas: {
            titulo: 'Solicitudes rechazadas',
            icono: 'pi pi-times',
            columnaFecha: 'Rechazada',
        },
        // Agregar más configuraciones según sea necesario
    };

    constructor(
        public gestor: GestorService,
        private router: Router,
        private route: ActivatedRoute,
        public seguimiento: SeguimientoService,
        public http: HttpService,
        public dialogService: DialogService
    ) {}

    ngOnInit(): void {
        const filtro =
            this.route.snapshot.url.join('/').split('/').pop() || 'nuevas';

        this.setConfiguracion(filtro);
        this.cargarSolicitudes(this.proporcionarEstado(filtro));
        this.seguimiento.restablecerValores();
        this.gestor.restablecerValores();
    }

    private setConfiguracion(filtro: string): void {
        const config =
            this.configuraciones[filtro] || this.configuraciones.nuevas;
        this.tituloBuzon = config.titulo;
        this.iconoBuzon = config.icono;
        this.columnaFecha = config.columnaFecha;
    }

    cargarSolicitudes(prmFiltro: string) {
        this.http.consultarSolicitudesCoordinacion(prmFiltro).subscribe(
            (solicitudes: SolicitudRecibida[]) => {
                this.solicitudes = solicitudes;
                this.cargandoSolicitudes = false;
            },
            (error) => {
                console.error('Error al cargar las solicitudes:', error);
            }
        );
    }

    proporcionarEstado(cadena: string): string {
        const estados: { [key: string]: string } = {
            nuevas: 'AVALADA',
            rechazadas: 'RECHAZADA',
        };

        return estados[cadena] || '';
    }

    mostrarDetalles() {
        localStorage.removeItem('solicitudSeleccionada');

        localStorage.setItem(
            'solicitudSeleccionada',
            JSON.stringify(this.seleccionada)
        );
        this.router.navigate(['/gestionsolicitudes/visor']);
    }

    obtenerTituloIconoYColumna(filtro: string): {
        titulo: string;
        icono: string;
        columnaRecibido: string;
    } {
        const configuraciones: {
            [key: string]: {
                titulo: string;
                icono: string;
                columnaRecibido: string;
            };
        } = {
            nuevas: {
                titulo: 'Solicitudes nuevas',
                icono: 'pi pi-arrow-down',
                columnaRecibido: 'Recibida',
            },
            rechazadas: {
                titulo: 'Solicitudes rechazadas',
                icono: 'pi pi-times',
                columnaRecibido: 'Rechazada',
            },
        };

        return (
            configuraciones[filtro] || {
                titulo: 'Bandeja de entrada',
                icono: 'pi pi-arrow-down',
                columnaRecibido: 'Recibida',
            }
        );
    }

    clear(table: any) {
        table.clear();
    }
}
