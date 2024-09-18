import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GestorService } from '../../../services/gestor.service';
import { DetallesRechazo } from '../../../models/indiceModelos';
import { HttpService } from '../../../services/http.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormulariorechazoComponent } from '../complementos/formulariorechazo/formulariorechazo.component';
import { PdfService } from '../../../services/pdf.service';
import { SafeResourceUrl } from '@angular/platform-browser';
import { DocumentoPDFFactory } from '../../utilidades/documentos-pdf/documento-pdf-factory';
import { UtilidadesService } from '../../../services/utilidades.service';

interface datosComiteAux {
    aval: string;
    concepto: string;
    numActa: string;
    fecha: string;
}
@Component({
    selector: 'app-tramite',
    templateUrl: './tramite.component.html',
    styleUrls: ['./tramite.component.scss'],
    providers: [ConfirmationService, MessageService],
})
export class TramiteComponent implements OnInit {
    avalComite: datosComiteAux = {
        aval: '',
        concepto: '',
        numActa: '',
        fecha: '',
    };
    bloquearConceptoComite: boolean = false;
    conceptoComiteGuardado: boolean = false;

    enviadaAComite: boolean = false;
    enviadaAConsejo: boolean = false;
    deshabilitarEnvioAComite: boolean = false;
    deshabilitarEnvioAConsejo: boolean = false;
    vaAlConcejo: boolean = true;

    habilitarRespuestaSolicitantes: boolean = false;

    mostrarBtnRechazar: boolean = false;
    mostrarBtnResolver: boolean = false;

    rechazoEnProceso: boolean = false;
    resolverEnProceso: boolean = false;

    asignaturasAprobadas: any[] = [];

    urlRespuestaComitePdf: SafeResourceUrl;
    urlOficioConcejoPdf: SafeResourceUrl;
    urlRespuestaConcejoPdf: SafeResourceUrl;

    ref: DynamicDialogRef;

    constructor(
        private confirmationService: ConfirmationService,
        public gestor: GestorService,
        public http: HttpService,
        private dialogService: DialogService,
        private servicioPDF: PdfService,
        private factory: DocumentoPDFFactory,
        private servicioUtilidades: UtilidadesService
    ) {}

    ngOnInit(): void {
        console.log(this.gestor.solicitudSeleccionada.codigoSolicitud);
        this.restringirAcciones(
            this.gestor.solicitudSeleccionada.codigoSolicitud
        );
        switch (this.gestor.estadoSolicitud) {
            case 'Avalada':
                this.mostrarBtnRechazar = true;
                this.mostrarBtnResolver = true;

                break;

            case 'RECHAZADA':
                break;
            case 'EN_COMITE':
                this.mostrarBtnRechazar = true;
                this.mostrarBtnResolver = true;
                this.enviadaAComite = true;

                break;

            case 'EN_CONSEJO':
                this.mostrarBtnRechazar = true;
                this.mostrarBtnResolver = true;
                this.enviadaAConsejo = true;
                this.deshabilitarEnvioAConsejo = true;
                break;
        }
    }

    // Método enviar orden de dascargar archivos al componente padre
    onDescargarArchivos() {
        this.gestor.emitirDescargarArchivos();
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

        this.ref = this.dialogService.open(FormulariorechazoComponent, {
            header: 'No avalar solicitud',
            width: '60%',
            contentStyle: { 'max-height': '600px', overflow: 'hidden' },
            baseZIndex: 10000,
        });

        this.ref.onClose.subscribe((motivoRechazo: string) => {
            if (motivoRechazo !== undefined) {
                //lsierra@unicauca.edu.co
                const detalles: DetallesRechazo = {
                    idSolicitud: this.gestor.solicitudSeleccionada.idSolicitud,
                    emailRevisor: 'lsierra@unicauca.edu.co',
                    estado: 'RECHAZADA',
                    comentario: motivoRechazo,
                };

                this.http.rechazarSolicitud(detalles).subscribe(
                    (resultado) => {
                        if (resultado) {
                            this.rechazoEnProceso = false;
                            this.gestor.estadoSolicitud = 'Rechazada';
                            this.confirmationService.confirm({
                                message:
                                    'La solicitud se ha sido rechazada y se ha notificado al solicitante',
                                header: 'Solicitud no avalada',
                                icon: 'pi pi-exclamation-circle',
                                acceptLabel: 'Aceptar',
                                rejectVisible: false,
                                accept: () => {
                                    this.mostrarBtnRechazar = false;
                                    this.mostrarBtnResolver = false;
                                },
                                reject: () => {
                                    this.mostrarBtnRechazar = false;
                                    this.mostrarBtnResolver = false;
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
            } else {
                // El diálogo se cerró sin confirmar
                this.rechazoEnProceso = false;
            }
        });
    }

    descargarDocumentoPDF(nombre: string, tipo: string) {
        /*
        switch (tipo) {
            case 'respuestaSolicitante': {
                const doc = this.servicioPDF.generateTemplate1(false);
                doc.save(nombre + '.pdf');
                break;
            }
            case 'respuestaTutor':
                break;
            case 'respuestaDirector':
                break;
            case 'oficioParaConcejo': {
                const doc = this.servicioPDF.generateTemplate1(false);
                doc.save(nombre + '.pdf');
                break;
            }
            case 'oficioParaViceAdmin':
                break;
            default:
                break;
        }
                */
    }

    guardarRespuestaComite() {
        this.habilitarRespuestaSolicitantes = false;

        //GUARDAR LA INFO... PENDIENTE DEL SERVICIO BACK
        if (this.conceptoComiteGuardado) {
            this.bloquearConceptoComite = false;
            this.conceptoComiteGuardado = false;

            // Lógica para editar
        } else {
            this.bloquearConceptoComite = true;
            this.conceptoComiteGuardado = true;

            // Lógica para guardar

            //Si no va al concejo o no fue aprobada por el comite habilitar respuestas tutor y solicitante
            if (!this.vaAlConcejo || this.avalComite.aval === 'No') {
                this.habilitarRespuestaSolicitantes = true;
            }
        }
    }

    restringirAcciones(tipoSolicitud: string) {
        switch (tipoSolicitud) {
            case 'RE_CRED_PUB':
            case 'RE_CRED_PAS':
            case 'RE_CRED_PR_DOC':
            case 'CU_ASIG':
                this.vaAlConcejo = false;
                break;

            default:
                break;
        }
    }

    previsualizarDocuementoPDF(
        codigoSolicitud: string | null,
        tipoDocumento: string,
        agregarMarcaDeAgua: boolean
    ) {
        // Utiliza la fábrica para obtener la estrategia basada en el código de solicitud y tipo de documento
        const estrategia = this.factory.crearEstrategia(
            codigoSolicitud,
            tipoDocumento
        );

        // Verifica si se encontró una estrategia válida
        if (!estrategia) {
            console.error(
                `No se encontró una estrategia para el código de solicitud: ${codigoSolicitud} y tipo de documento: ${tipoDocumento}`
            );
            return;
        }

        // Genera el documento PDF usando la estrategia
        const pdfDocConMarca = estrategia.generarDocumento(agregarMarcaDeAgua);

        // Función para crear un archivo PDF y asignar su URL
        const crearArchivoPDF = (pdfDoc: any, nombreArchivo: string) => {
            const pdfBlob = pdfDoc.output('blob');
            const pdfFile = new File([pdfBlob], nombreArchivo, {
                type: 'application/pdf',
            });
            return this.servicioUtilidades.crearUrlSeguroParaPDF(pdfFile);
        };

        // Genera y asigna el PDF según el tipo de documento
        switch (tipoDocumento) {
            case 'respuesta-comite':
                this.urlRespuestaComitePdf = crearArchivoPDF(
                    pdfDocConMarca,
                    'respuesta-comite.pdf'
                );
                break;
            case 'respuesta-concejo':
                this.urlRespuestaConcejoPdf = crearArchivoPDF(
                    pdfDocConMarca,
                    'respuesta-concejo.pdf'
                );
                break;
            case 'oficio-concejo':
                this.urlOficioConcejoPdf = crearArchivoPDF(
                    pdfDocConMarca,
                    'oficio-concejo.pdf'
                );
                break;
            default:
                console.warn(`Tipo de documento no manejado: ${tipoDocumento}`);
                break;
        }
    }

    cambiarestadoSolicitud(estado: string) {}
}
