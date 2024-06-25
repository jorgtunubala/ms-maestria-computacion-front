import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GestorService } from '../../../services/gestor.service';

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

    constructor(
        private confirmationService: ConfirmationService,
        public gestor: GestorService
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

    cambiarestadoSolicitud(estado: string) {}
}
