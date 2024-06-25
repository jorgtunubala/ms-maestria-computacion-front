import {
    Component,
    ElementRef,
    HostListener,
    OnInit,
    Renderer2,
    ViewChild,
} from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';

import { Router } from '@angular/router';
import { RadicarService } from '../../../services/radicar.service';
import { AlmacenarSolicitudService } from '../../../services/almacenarSolicitud.service';
import { OficioComponent } from '../../utilidades/oficio/oficio.component';

@Component({
    selector: 'app-resumen',
    templateUrl: './resumen.component.html',
    styleUrls: ['./resumen.component.scss'],
    providers: [ConfirmationService, MessageService],
})
export class ResumenComponent implements OnInit {
    @ViewChild(OficioComponent) oficio: OficioComponent;
    @ViewChild('firmaImage') firmaImage: ElementRef;

    codTipoSolicitudEscogida: string;

    @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHander(event: Event) {
        event.returnValue = true;
        return '¿Estás seguro de que quieres salir de la página?';
    }

    mostrarOficio: boolean = true;

    firmaEnProceso: boolean = false;
    guardadoEnProceso: boolean = false;
    mostrarBtnFirmar: boolean = false;
    habilitarEnvio: boolean = false;

    constructor(
        public radicar: RadicarService,
        public almacenar: AlmacenarSolicitudService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {
        try {
            this.codTipoSolicitudEscogida =
                this.radicar.tipoSolicitudEscogida.codigoSolicitud;
        } catch (error) {
            if (
                error instanceof TypeError &&
                error.message.includes('codigoSolicitud')
            ) {
                this.router.navigate([
                    '/gestionsolicitudes/portafolio/radicar/selector',
                ]);
            } else {
                console.error('Error no esperado:', error);
            }
        }
    }

    ngOnInit() {}

    onUpload(event, firmante) {
        this.radicar.firmaSolicitante = event.files[0];
        this.renderizarImagen(this.radicar.firmaSolicitante);
        const reader = new FileReader();
        reader.onload = (e) => {
            this.firmaImage.nativeElement.src = e.target.result;
        };
        reader.readAsDataURL(this.radicar.firmaSolicitante);
        firmante.clear();
        this.mostrarBtnFirmar = true;
    }

    firmarSolicitud() {
        this.firmaEnProceso = true;

        setTimeout(() => {
            this.mostrarOficio = false;

            setTimeout(() => {
                this.mostrarOficio = true;
                this.firmaEnProceso = false;
                this.mostrarBtnFirmar = false;
                this.habilitarEnvio = true;
            }, 1000);
        }, 100);
    }

    showWarn() {
        this.messageService.add({
            severity: 'warn',
            summary: 'Oficio no firmado',
            detail: 'Firme el oficio de la solicitud',
        });
    }

    validarFirmaCargada() {
        if (this.radicar.firmaSolicitanteUrl && !this.mostrarBtnFirmar) {
            this.habilitarEnvio = true;
            return true;
        }
        return false;
    }

    async enviarSolicitud() {
        if (this.validarFirmaCargada()) {
            this.guardadoEnProceso = true;

            try {
                await this.convertirOficioEnPDF();

                const resultado = await this.almacenar.almacenarSolicitudEnBD();

                if (resultado != null) {
                    this.guardadoEnProceso = false;
                    this.confirmationService.confirm({
                        message:
                            'IMPORTANTE: Conserve este número de radicado ' +
                            resultado +
                            ' para que pueda hacer seguimiento posterior del estado de su solicitud.',
                        header: 'Solicitud Radicada: ' + resultado,
                        icon: 'pi pi-exclamation-circle',
                        acceptLabel: 'Aceptar',
                        rejectVisible: false,
                        accept: () => {
                            this.radicar.restrablecerValores();
                            this.router.navigate([
                                '/gestionsolicitudes/portafolio/opciones',
                            ]);
                        },
                        reject: () => {
                            this.radicar.restrablecerValores();
                            this.router.navigate([
                                '/gestionsolicitudes/portafolio/opciones',
                            ]);
                        },
                    });
                } else {
                    this.guardadoEnProceso = false;
                    this.habilitarEnvio = false;
                    this.confirmationService.confirm({
                        message:
                            'Ha ocurrido un error inesperado al enviar la solicitud, revisela e intente enviarla nuevamente.',
                        header: 'Error de envio',
                        icon: 'pi pi-exclamation-triangle',
                        acceptLabel: 'Aceptar',
                        rejectVisible: false,
                        accept: () => {},
                    });
                }
            } catch (error) {
                this.guardadoEnProceso = false;
                this.habilitarEnvio = false;
                this.confirmationService.confirm({
                    message:
                        'Ha ocurrido un error inesperado al enviar la solicitud, revisela e intente enviarla nuevamente.',
                    header: 'Error',
                    icon: 'pi pi-exclamation-triangle',
                    acceptLabel: 'Aceptar',
                    rejectVisible: false,
                    accept: () => {},
                });
            }
        } else {
            this.showWarn();
        }
    }

    convertirOficioEnPDF(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.oficio) {
                this.oficio
                    .crearPDF()
                    .then(() => {
                        resolve();
                    })
                    .catch((error) => {
                        reject(error);
                    });
            } else {
                resolve();
            }
        });
    }

    renderizarImagen(imagen: File): void {
        const reader = new FileReader();
        reader.onload = () => {
            this.radicar.firmaSolicitanteUrl = reader.result as string;
        };
        reader.readAsDataURL(imagen);
    }

    navigateToBack() {
        if (
            [
                'AD_ASIG',
                'CA_ASIG',
                'AP_SEME',
                'CU_ASIG',
                'RE_CRED_PAS',
                'AV_COMI_PR',
            ].includes(this.radicar.tipoSolicitudEscogida.codigoSolicitud)
        ) {
            this.router.navigate([
                '/gestionsolicitudes/portafolio/radicar/formulario',
            ]);
        } else {
            this.router.navigate([
                '/gestionsolicitudes/portafolio/radicar/adjuntos',
            ]);
        }
    }
}
