import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Solicitud } from '../../../models/solicitudes/solicitud.model';
import { VisorComponent } from '../visor/visor.component';
import { GestorService } from '../../../services/gestor.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { SolicitudRecibida } from '../../../models/indiceModelos';

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

    constructor(
        public gestor: GestorService,
        private router: Router,
        private route: ActivatedRoute,
        public http: HttpService,
        public dialogService: DialogService
    ) {}

    ngOnInit(): void {
        const rutaCompleta = this.route.snapshot.url.join('/');
        const filtro = rutaCompleta.split('/').pop();

        if (filtro) {
            this.cargarSolicitudes(this.proporcionarEstado(filtro));
        }
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
        let respuesta: string = '';
        switch (cadena) {
            case 'nuevas':
                respuesta = 'AVALADA';
                break;
        }

        return respuesta;
    }

    mostrarDetalles(event) {
        // Obtiene los datos completos de la solicitud
        this.gestor.solicitudSeleccionada = this.seleccionada;
        this.router.navigate(['/gestionsolicitudes/visor']);
    }
}
