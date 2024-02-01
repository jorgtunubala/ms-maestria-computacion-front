import { Component, OnInit } from '@angular/core';
import { Solicitud } from '../../models/solicitud.model';
import { DialogService } from 'primeng/dynamicdialog';
import { GestorService } from '../../services/gestor.service';
import { VisoravalComponent } from '../visoraval/visoraval.component';

@Component({
    selector: 'app-pendientesaval',
    templateUrl: './pendientesaval.component.html',
    styleUrls: ['./pendientesaval.component.scss'],
    providers: [DialogService],
})
export class PendientesavalComponent implements OnInit {
    solicitudes: Solicitud[];
    seleccionada: Solicitud;

    constructor(
        public gestor: GestorService,
        public dialogService: DialogService
    ) {}

    ngOnInit(): void {
        this.cargarSolicitudes();
    }

    cargarSolicitudes() {
        let docs: any[] = [
            {
                name: 'radicado de solicitud',
                url: 'https://www.ugr.es/~fjperez/textos/calculo_diferencial_integral_func_una_var.pdf',
            },
            {
                name: 'Certificado de notas',
                url: 'https://www.uv.mx/personal/pmartinez/files/2021/03/Libro-completo-Introduccion-a-la-programacion.pdf',
            },
        ];
        const solicitud1 = new Solicitud(
            'Adición Asignaturas',
            '22/08/2023',
            'Juan Esteban',
            'Arenas Turbay',
            '1054813433',
            '1045832227435',
            'Pendiente de aval',
            docs
        );

        const solicitud2 = new Solicitud(
            'Aplazamiento Semestre',
            '20/08/2023',
            'Maria Camila',
            'Muñoz Paz',
            '1054813436',
            '1045832229435',
            'Pendiente de aval',
            docs
        );

        const solicitud3 = new Solicitud(
            'Prorroga Examen',
            '20/08/2023',
            'Carlos Andres',
            'Rodriguez Torres',
            '1054813434',
            '1045832227438',
            'Pendiente de aval',
            docs
        );

        this.solicitudes = [solicitud1, solicitud2, solicitud3];
    }

    mostrarDetalles(event) {
        this.gestor.setSolicitudSeleccionada(this.seleccionada);

        const ref = this.dialogService.open(VisoravalComponent, {
            data: {
                id: '51gF4',
            },
            header: 'Detalles de la solicitud',
            width: '80%',
        });
    }
}
