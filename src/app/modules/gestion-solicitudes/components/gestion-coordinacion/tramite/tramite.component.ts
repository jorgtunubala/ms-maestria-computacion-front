import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GestorService } from '../../../services/gestor.service';
import { DetallesRechazo } from '../../../models/indiceModelos';
import { HttpService } from '../../../services/http.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-tramite',
    templateUrl: './tramite.component.html',
    styleUrls: ['./tramite.component.scss'],
    providers: [ConfirmationService, MessageService],
})
export class TramiteComponent implements OnInit {
    conceptoComite: string;
    enviadaAComite: boolean = false;
    enviadaAConsejo: boolean = false;
    deshabilitarEnvioAComite: boolean = false;
    deshabilitarEnvioAConsejo: boolean = false;

    rechazoEnProceso: boolean = false;
    resolverEnProceso: boolean = false;

    constructor(
        private confirmationService: ConfirmationService,
        public gestor: GestorService,
        public http: HttpService,
        private router: Router
    ) {}

    ngOnInit(): void {
        switch (this.gestor.estadoSolicitud) {
            case 'EN_COMITE':
                this.enviadaAComite = true;

                break;

            case 'EN_CONSEJO':
                this.enviadaAConsejo = true;
                this.deshabilitarEnvioAConsejo = true;
                break;
        }
    }

    validarCambioEstadoConcejo() {
        if (this.deshabilitarEnvioAConsejo == false) {
            this.confirmationService.confirm({
                message:
                    '¿Esta seguro de cambiar el estado actual de la solicitud?. Este cambio no se puede deshacer y se reflejará en el historial de seguimiento.',
                header: 'Confirmar acción',
                icon: 'pi pi-exclamation-circle',
                acceptLabel: 'Si',
                rejectVisible: true,
                rejectLabel: 'No',
                accept: () => {
                    this.cambiarestadoSolicitud('EN_CONSEJO');
                    this.enviadaAConsejo = true;
                    this.deshabilitarEnvioAConsejo = true;
                },
                reject: () => {
                    this.enviadaAConsejo = false;
                },
            });
        }
    }

    validarCambioEstadoComite() {
        if (this.deshabilitarEnvioAComite == false) {
            this.confirmationService.confirm({
                message:
                    '¿Esta seguro de cambiar el estado actual de la solicitud?. Este cambio no se puede deshacer y se reflejará en el historial de seguimiento.',
                header: 'Confirmar acción',
                icon: 'pi pi-exclamation-circle',
                acceptLabel: 'Si',
                rejectVisible: true,
                rejectLabel: 'No',
                accept: () => {
                    this.cambiarestadoSolicitud('EN_COMITE');
                    this.enviadaAComite = true;
                    this.deshabilitarEnvioAComite = true;
                },
                reject: () => {
                    this.enviadaAComite = false;
                },
            });
        }
    }

    rechazarSolicitud() {
        if (this.rechazoEnProceso || this.resolverEnProceso) {
            return;
        }

        this.rechazoEnProceso = true;

        const detalles: DetallesRechazo = {
            idSolicitud: this.gestor.solicitudSeleccionada.idSolicitud,
            emailRevisor: '',
            estado: 'RECHAZADA',
            comentario:
                'Los documentos aportados no se corresponden con los requisitos para dar tramite a esta solicitud',
        };

        this.http.rechazarSolicitud(detalles).subscribe(
            (resultado) => {
                if (resultado) {
                    this.rechazoEnProceso = false;
                    this.confirmationService.confirm({
                        message:
                            'La solicitud se ha sido rechazada y se ha notificado al solicitante',
                        header: 'Solicitud no avalada',
                        icon: 'pi pi-exclamation-circle',
                        acceptLabel: 'Aceptar',
                        rejectVisible: false,
                        accept: () => {
                            console.log(this.gestor.rutaPrevia);
                            this.router.navigate([this.gestor.rutaPrevia]);
                        },
                        reject: () => {
                            this.router.navigate([this.gestor.rutaPrevia]);
                        },
                    });
                } else {
                    this.rechazoEnProceso = false;
                    this.confirmationService.confirm({
                        message:
                            'Ha ocurrido un error inesperado al rechazar la solicitud, intentelo nuevamente.',
                        header: 'Error al rechazar',
                        icon: 'pi pi-exclamation-triangle',
                        acceptLabel: 'Aceptar',
                        rejectVisible: false,
                        accept: () => {},
                    });
                }
            },
            (error) => {
                console.error('Error al rechazar la solicitud:', error);
            }
        );
    }

    cambiarestadoSolicitud(estado: string) {}
}
