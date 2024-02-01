import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';
import { SolicitudService } from '../../services/solicitud.service';
import { BuscadorEstudiantesComponent } from 'src/app/shared/components/buscador-estudiantes/buscador-estudiantes.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Estudiante } from 'src/app/shared/models/estudiante';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { Mensaje } from 'src/app/core/enums/enums';
import { infoMessage } from 'src/app/core/utils/message-util';
import { Solicitud } from '../../models/solicitud';

@Component({
    selector: 'app-bandeja-examen-de-valoracion',
    templateUrl: './bandeja-examen-de-valoracion.component.html',
    styleUrls: ['./bandeja-examen-de-valoracion.component.scss'],
})
export class BandejaExamenDeValoracionComponent implements OnInit {
    loading: boolean;
    estudianteSeleccionado: Estudiante;
    solicitudes: Solicitud[] = [
        {
            id: 1,
            fecha: '2023-19-12',
            estado: 'ACTIVO',
            titulo: 'Solicitud 1',
            doc_solicitud_valoracion: 'archivo1.pdf',
            doc_anteproyecto_examen: 'archivo2.pdf',
            doc_examen_valoracion: 'archivo3.pdf',
            numero_acta: 'A001',
            fecha_acta: '2023-12-20',
            doc_oficio_jurados: 'oficio.pdf',
            fecha_maxima_evaluacion: '2023-12-31',
        },
        {
            id: 2,
            fecha: '2023-19-12',
            estado: 'ACTIVO',
            titulo: 'Solicitud 2',
            doc_solicitud_valoracion: 'archivo4.pdf',
            doc_anteproyecto_examen: 'archivo5.pdf',
            doc_examen_valoracion: 'archivo6.pdf',
            numero_acta: 'A002',
            fecha_acta: '2023-12-22',
            doc_oficio_jurados: 'oficio2.pdf',
            fecha_maxima_evaluacion: '2023-12-31',
        },
        {
            id: 3,
            fecha: '2023-19-12',
            estado: 'ACTIVO',
            titulo: 'Solicitud 3',
            doc_solicitud_valoracion: 'archivo7.pdf',
            doc_anteproyecto_examen: 'archivo8.pdf',
            doc_examen_valoracion: 'archivo9.pdf',
            numero_acta: 'A003',
            fecha_acta: '2023-12-23',
            doc_oficio_jurados: 'oficio3.pdf',
            fecha_maxima_evaluacion: '2023-12-31',
        },
        {
            id: 4,
            fecha: '2023-19-12',
            estado: 'INACTIVO',
            titulo: 'Solicitud 4',
            doc_solicitud_valoracion: 'archivo10.pdf',
            doc_anteproyecto_examen: 'archivo11.pdf',
            doc_examen_valoracion: 'archivo12.pdf',
            numero_acta: 'A004',
            fecha_acta: '2023-12-24',
            doc_oficio_jurados: 'oficio4.pdf',
            fecha_maxima_evaluacion: '2023-12-31',
        },
    ];

    constructor(
        private breadcrumbService: BreadcrumbService,
        private router: Router,
        private solicitudService: SolicitudService,
        private messageService: MessageService,
        private dialogService: DialogService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.listSolicitudes();
        this.setBreadcrumb();
    }

    setBreadcrumb() {
        this.breadcrumbService.setItems([
            { label: 'Trabajos de Grado' },
            { label: 'Examen de Valoracion' },
        ]);
    }

    showBuscadorEstudiantes() {
        return this.dialogService.open(BuscadorEstudiantesComponent, {
            header: 'Seleccionar estudiante',
            width: '60%',
        });
    }

    mapEstudianteLabel(estudiante: Estudiante) {
        return {
            codigo: estudiante.codigo,
            nombre: estudiante.persona.nombre,
            apellido: estudiante.persona.apellido,
            identificacion: estudiante.persona.identificacion,
        };
    }

    onSeleccionarEstudiante() {
        const ref = this.showBuscadorEstudiantes();
        ref.onClose.subscribe({
            next: (response) => {
                if (response) {
                    this.estudianteSeleccionado =
                        this.mapEstudianteLabel(response);
                    this.solicitudService.setEstudianteSeleccionado(
                        this.mapEstudianteLabel(response)
                    );
                }
            },
        });
    }

    listSolicitudes() {
        this.loading = true;
        this.solicitudService
            .listSolicitudes()
            .subscribe({
                next: (response) =>
                    (this.solicitudes = response.filter(
                        (d) => d.estado === 'ACTIVO'
                    )),
            })
            .add(() => (this.loading = false));
    }

    limpiarEstudiante() {
        this.estudianteSeleccionado = null;
    }

    onProcesoExamen() {
        this.router.navigate(['examen-de-valoracion/solicitud']);
    }

    onEditar(id: number) {
        this.router.navigate(['examen-de-valoracion/solicitud/editar', id]);
    }

    deleteSolicitud(id: number) {
        this.solicitudService.deleteSolicitud(id).subscribe({
            next: () => {
                this.messageService.add(
                    infoMessage(Mensaje.SOLICITUD_ELIMINADA_CORRECTAMENTE)
                );
                this.listSolicitudes();
            },
        });
    }

    onDelete(event: any, id: number) {
        this.confirmationService.confirm({
            target: event.target,
            message: Mensaje.CONFIRMAR_ELIMINAR_REGISTRO,
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            acceptLabel: 'Si, eliminar',
            rejectLabel: 'No',
            accept: () => this.deleteSolicitud(id),
        });
    }
}
