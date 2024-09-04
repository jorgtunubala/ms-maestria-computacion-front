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
import { SafeResourceUrl } from '@angular/platform-browser';
import { PlantillasService } from '../../../services/plantillas.service';
import { UtilidadesService } from '../../../services/utilidades.service';

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
    urlVistaPreviaSolicitudPDF: SafeResourceUrl;

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
    bloquearBoton: boolean = false;

    constructor(
        public radicar: RadicarService,
        public almacenar: AlmacenarSolicitudService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private servicioPlantillas: PlantillasService,
        private servicioUtilidades: UtilidadesService
    ) {
        try {
            this.codTipoSolicitudEscogida =
                this.radicar.tipoSolicitudEscogida.codigoSolicitud;

            this.cargarVistaPreviaPDF(this.codTipoSolicitudEscogida, true);
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

    cargarVistaPreviaPDF(codigoSolicitud: string, agregarMarcaDeAgua: boolean) {
        // Mapa que asocia el código de solicitud con la función correspondiente de servicioPlantillas
        const funcionesPlantillas: { [key: string]: Function } = {
            AD_ASIG: this.servicioPlantillas.adicionAsignaturas.bind(
                this.servicioPlantillas
            ),
            AP_SEME: this.servicioPlantillas.aplazamientoSemestre.bind(
                this.servicioPlantillas
            ),
            AP_ECON_ASI: this.servicioPlantillas.apoyoEconomicoCongresos.bind(
                this.servicioPlantillas
            ),
            AP_ECON_INV: this.servicioPlantillas.apoyoEconomicoPasantia.bind(
                this.servicioPlantillas
            ),
            PA_PUBL_EVE:
                this.servicioPlantillas.apoyoEconomicoPublicOInscrip.bind(
                    this.servicioPlantillas
                ),

            AV_COMI_PR: this.servicioPlantillas.avalPracticaDocente.bind(
                this.servicioPlantillas
            ),
            AV_PASA_INV: this.servicioPlantillas.avalPasantia.bind(
                this.servicioPlantillas
            ),
            CA_ASIG: this.servicioPlantillas.cancelacionAsignaturas.bind(
                this.servicioPlantillas
            ),
            CU_ASIG: this.servicioPlantillas.cursarEnOtrosProgramas.bind(
                this.servicioPlantillas
            ),
            HO_ASIG_ESP:
                this.servicioPlantillas.homologacionAsignaturasEsp.bind(
                    this.servicioPlantillas
                ),
            HO_ASIG_POS:
                this.servicioPlantillas.homologacionAsignaturasPos.bind(
                    this.servicioPlantillas
                ),
            RE_CRED_PR_DOC:
                this.servicioPlantillas.recoCredPracticaDocente.bind(
                    this.servicioPlantillas
                ),
            RE_CRED_PAS: this.servicioPlantillas.recoCredPasantia.bind(
                this.servicioPlantillas
            ),
            RE_CRED_PUB: this.servicioPlantillas.recoCredPublicacion.bind(
                this.servicioPlantillas
            ),
            SO_BECA: this.servicioPlantillas.solicitudDeBeca.bind(
                this.servicioPlantillas
            ),
        };

        // Verifica si el código de solicitud es válido
        if (!funcionesPlantillas[codigoSolicitud]) {
            return; // Salir si el código no está en el mapa
        }

        // Obtiene la función correspondiente y genera el documento PDF
        const generarPDF = funcionesPlantillas[codigoSolicitud];

        // Función para crear un archivo PDF y asignar su URL
        const crearArchivoPDF = (pdfDoc: any, nombreArchivo: string) => {
            const pdfBlob = pdfDoc.output('blob');
            const pdfFile = new File([pdfBlob], nombreArchivo, {
                type: 'application/pdf',
            });
            return this.servicioUtilidades.crearUrlSeguroParaPDF(pdfFile);
        };

        // Genera y asigna el PDF con marca de agua
        const pdfDocConMarca = generarPDF(agregarMarcaDeAgua);
        this.urlVistaPreviaSolicitudPDF = crearArchivoPDF(
            pdfDocConMarca,
            'Solicitud.pdf'
        );

        // Genera y asigna el PDF sin marca de agua
        const pdfDocSinMarca = generarPDF(false);
        const pdfFileSinMarca = new File(
            [pdfDocSinMarca.output('blob')],
            'Oficio de Solicitud.pdf',
            { type: 'application/pdf' }
        );
        this.radicar.oficioDeSolicitud = pdfFileSinMarca;
    }

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
        this.cargarVistaPreviaPDF(this.codTipoSolicitudEscogida, true);

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
        if (this.guardadoEnProceso) {
            return;
        }

        //this.bloquearBoton = true;

        if (this.validarFirmaCargada()) {
            this.guardadoEnProceso = true;

            try {
                //await this.convertirOficioEnPDF();

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

    /*
    convertirOficioEnPDF() {
        const pdfDoc = this.servicioPlantillas.adicionAsignaturas(false);
        const pdfBlob = pdfDoc.output('blob');
        const pdfFile = new File([pdfBlob], 'Solicitud.pdf', {
            type: 'application/pdf',
        });
    }
*/

    renderizarImagen(imagen: File): void {
        const reader = new FileReader();
        reader.onload = () => {
            this.radicar.firmaSolicitanteUrl = reader.result as string;
        };
        reader.readAsDataURL(imagen);
    }

    navigateToBack() {
        if (this.guardadoEnProceso) {
            return;
        }

        console.log(this.radicar.tipoSolicitudEscogida.codigoSolicitud);

        if (
            [
                'AD_ASIG',
                'CA_ASIG',
                'AP_SEME',
                'CU_ASIG',
                'RE_CRED_PR_DOC',
                'AV_COMI_PR',
                'SO_BECA',
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
