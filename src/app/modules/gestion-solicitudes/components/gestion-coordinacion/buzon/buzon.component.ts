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

    // Configuraciones de personalización según estado de solicitudes
    private configuraciones: Record<string, ConfiguracionBuzon> = {
        nuevas: {
            titulo: 'Solicitudes nuevas',
            icono: 'pi pi-arrow-down',
            columnaFecha: 'Fecha de recepción',
        },
        rechazadas: {
            titulo: 'Solicitudes rechazadas',
            icono: 'pi pi-times',
            columnaFecha: 'Fecha de rechazo',
        },
        comite: {
            titulo: 'Solicitudes en comite de programa',
            icono: 'pi pi-users',
            columnaFecha: 'Fecha de envio',
        },
        consejo: {
            titulo: 'Solicitudes en consejo de facultad',
            icono: 'pi pi-users',
            columnaFecha: 'Fecha de envio',
        },
        resueltas: {
            titulo: 'Solicitudes resueltas',
            icono: 'pi pi-check-circle',
            columnaFecha: 'Fecha de cierre',
        },
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
        const filtro = this.extraerFiltroDeRuta() || 'nuevas';

        this.setConfiguracion(filtro);
        this.cargarSolicitudes(this.obtenerEstadoAsociado(filtro));
        this.restablecerValoresEnServicios();
    }

    // Extrae el filtro de la ruta actual
    extraerFiltroDeRuta(): string {
        return this.route.snapshot.url.join('/').split('/').pop();
    }

    // Personaliza la vista del buzón según el filtro
    setConfiguracion(filtro: string): void {
        const config =
            this.configuraciones[filtro] || this.configuraciones.nuevas;
        this.tituloBuzon = config.titulo;
        this.iconoBuzon = config.icono;
        this.columnaFecha = config.columnaFecha;
    }

    // Carga las solicitudes desde el servidor según el filtro
    cargarSolicitudes(prmFiltro: string): void {
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

    // Proporciona el estado asociado al filtro
    obtenerEstadoAsociado(filtro: string): string {
        const estados: Record<string, string> = {
            nuevas: 'AVALADA',
            rechazadas: 'RECHAZADA',
            comite: 'EN_COMITE',
            consejo: 'EN_CONSEJO',
            resueltas: 'RESUELTA',
        };

        return estados[filtro] || '';
    }

    // Restablece los valores de los servicios necesarios
    restablecerValoresEnServicios(): void {
        this.seguimiento.restablecerValores();
        this.gestor.restablecerValores();
    }

    // Muestra los detalles de la solicitud seleccionada
    mostrarDetalles(): void {
        localStorage.setItem(
            'solicitudSeleccionada',
            JSON.stringify(this.seleccionada)
        );
        this.router.navigate(['/gestionsolicitudes/visor']);
    }

    // Limpia los filtros de la tabla
    limpiarFiltros(table: any): void {
        table.clear();
    }

    /*
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
        */
}
