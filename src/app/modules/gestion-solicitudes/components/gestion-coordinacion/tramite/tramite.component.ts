import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GestorService } from '../../../services/gestor.service';
import { DetallesRechazo, SolicitudEnComiteResponse } from '../../../models/indiceModelos';
import { HttpService } from '../../../services/http.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormulariorechazoComponent } from '../complementos/formulariorechazo/formulariorechazo.component';
import { PdfService } from '../../../services/pdf.service';
import { SafeResourceUrl } from '@angular/platform-browser';
import { DocumentoPDFFactory } from '../../utilidades/documentos-pdf/documento-pdf-factory';
import { UtilidadesService } from '../../../services/utilidades.service';

interface RespuestaConcejo {
    aval: string;
    concepto: string;
    fecha: string;
}
@Component({
    selector: 'app-tramite',
    templateUrl: './tramite.component.html',
    styleUrls: ['./tramite.component.scss'],
    providers: [ConfirmationService, MessageService],
})
export class TramiteComponent implements OnInit {
    fechaSeleccionada: Date;
    avalComite: SolicitudEnComiteResponse = {
        idSolicitud: null,
        enComite: false,
        avaladoComite: '',
        conceptoComite: '',
        numeroActa: '',
        fechaAval: '',
    };

    respuestaConsejo: RespuestaConcejo = {
        aval: '',
        concepto: '',
        fecha: '',
    };

    bloquearConceptoComite: boolean = false;
    conceptoComiteGuardado: boolean = false;

    bloquearConceptoConsejo: boolean = false;
    conceptoConsejoGuardado: boolean = false;
    habilitarRespuestaSolicitantesConsejo: boolean = false;

    enviadaAComite: boolean = false;
    enviadaAConsejo: boolean = false;
    deshabilitarEnvioAComite: boolean = false;
    deshabilitarEnvioAConsejo: boolean = false;
    vaAlConcejo: boolean = true;
    habilitarConcejo: boolean = false;
    habilitarComite: boolean = false;

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
        this.http.consultarConceptoComite(this.gestor.solicitudSeleccionada.idSolicitud).subscribe(
            async (infoComite: SolicitudEnComiteResponse) => {
                console.log(infoComite);
                this.avalComite = infoComite;
                this.gestor.conceptoComite = infoComite;

                if (infoComite.fechaAval) {
                    this.fechaSeleccionada = this.convertirCadenaAFecha(infoComite.fechaAval);
                    this.formatearFecha(this.fechaSeleccionada);
                }

                //Esta linea se debe llamar despues de haber consultado toda la info de comite/concejo en la BD
                this.restringirAcciones(this.gestor.solicitudSeleccionada.codigoSolicitud);
            },
            (error) => {
                console.error('Error al cargar la información del comité:', error);
            }
        );
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

                    this.enviarSolicitudAComite();
                    this.deshabilitarEnvioAComite = true;
                },
                reject: () => {
                    this.avalComite.enComite = false;
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
                            this.habilitarComite = false;
                            this.rechazoEnProceso = false;
                            this.gestor.estadoSolicitud = 'Rechazada';
                            this.gestor.moverSolicitud(this.gestor.solicitudSeleccionada, 'AVALADA', 'RECHAZADA');
                            this.confirmationService.confirm({
                                message: 'La solicitud se ha sido rechazada y se ha notificado al solicitante',
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

    enviarSolicitudAComite() {
        this.avalComite.enComite = true;

        this.avalComite.idSolicitud = this.gestor.solicitudSeleccionada.idSolicitud;
        console.log(this.avalComite);
        this.http.guardarConceptoComite(this.avalComite).subscribe(
            (response) => {},
            (error) => {
                console.error('Error al cambiar el estado de la solicitud:', error);
            }
        );

        this.mostrarBtnRechazar = false;
    }

    guardarRespuestaComite() {
        this.habilitarRespuestaSolicitantes = false;
        this.habilitarConcejo = false;

        if (this.conceptoComiteGuardado) {
            this.bloquearConceptoComite = false;
            this.conceptoComiteGuardado = false;

            // Lógica para editar
        } else {
            this.bloquearConceptoComite = true;
            this.conceptoComiteGuardado = true;

            // Lógica para guardar
            this.formatearFecha(this.fechaSeleccionada);
            this.gestor.conceptoComite = this.avalComite;

            console.log(this.avalComite);
            this.http.guardarConceptoComite(this.avalComite).subscribe(
                (response) => {},
                (error) => {
                    console.error('Error al guardar el concepto:', error);
                }
            );

            //Si no va al concejo o no fue aprobada por el comite
            //habilitar respuestas tutor y solicitante y deshabilitar concejo
            if (!this.vaAlConcejo || this.avalComite.avaladoComite === 'No') {
                this.habilitarRespuestaSolicitantes = true;
            }

            //Si va al concejo y fue aprobada por el comite habilitar el apartado del concejo
            if (this.vaAlConcejo && this.avalComite.avaladoComite === 'Si') {
                this.habilitarConcejo = true;
            }
        }
    }

    guardarRespuestaConsejo() {
        this.habilitarRespuestaSolicitantesConsejo = false;

        if (this.conceptoConsejoGuardado) {
            this.bloquearConceptoConsejo = false;
            this.conceptoConsejoGuardado = false;

            // Lógica para editar
        } else {
            this.bloquearConceptoConsejo = true;
            this.conceptoConsejoGuardado = true;

            // Lógica para guardar
            //this.gestor.conceptoConsejo = this.respuestaConsejo;
            /*
            this.http.guardarConceptoComite(this.avalComite).subscribe(
                (response) => {},
                (error) => {
                    console.error('Error al guardar el concepto:', error);
                }
            );
            */

            //habilitar respuestas tutor y solicitante
            if (this.avalComite.avaladoComite != '') {
                this.habilitarRespuestaSolicitantesConsejo = true;
            }
        }
    }

    enviarOficoAConcejo() {
        this.validarCambioEstadoConcejo();

        //Logica para enviar oficio por correo pendiente BACKEND
    }

    restringirAcciones(tipoSolicitud: string) {
        // Cuando la solicitud ya este en comite mostrar los campos para ingresar la respuesta
        if (this.avalComite.enComite) {
            this.deshabilitarEnvioAComite = true;

            //Bloquear la edicion si ya se han llenado los campos
            if (this.avalComite.avaladoComite != null) {
                this.conceptoComiteGuardado = true;
                this.bloquearConceptoComite = true;
            }
        }

        // Mostrar seccion de respuestas cuando la solicitud es rechazada por comite o solo requiere de su aval
        if (this.avalComite.avaladoComite === 'No' || (this.avalComite.avaladoComite === 'Si' && !this.vaAlConcejo)) {
            this.habilitarRespuestaSolicitantes = true;
        }

        // Habilitar envio al consejo si la solicitud fue avalada por el comité
        if (this.avalComite.avaladoComite === 'Si' && this.vaAlConcejo) {
            this.habilitarConcejo = true;
        }

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

        switch (this.gestor.estadoSolicitud) {
            case 'Avalada':
                this.mostrarBtnRechazar = true;
                this.habilitarComite = true;

                break;

            case 'RECHAZADA':
                break;
            case 'En comité':
                this.enviadaAComite = true;
                this.habilitarComite = true;
                this.mostrarBtnRechazar = false;

                break;

            case 'EN_CONSEJO':
                this.enviadaAConsejo = true;
                this.deshabilitarEnvioAConsejo = true;
                break;
        }
    }

    previsualizarDocuementoPDF(codigoSolicitud: string | null, tipoDocumento: string, agregarMarcaDeAgua: boolean) {
        // Utiliza la fábrica para obtener la estrategia basada en el código de solicitud y tipo de documento
        const estrategia = this.factory.crearEstrategia(codigoSolicitud, tipoDocumento);

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
                this.urlRespuestaComitePdf = crearArchivoPDF(pdfDocConMarca, 'respuesta-comite.pdf');
                break;
            case 'respuesta-consejo':
                this.urlRespuestaConcejoPdf = crearArchivoPDF(pdfDocConMarca, 'respuesta-consejo.pdf');
                break;
            case 'oficio-consejo':
                this.urlOficioConcejoPdf = crearArchivoPDF(pdfDocConMarca, 'oficio-consejo.pdf');
                break;
            default:
                console.warn(`Tipo de documento no manejado: ${tipoDocumento}`);
                break;
        }
    }

    formatearFecha(fecha: Date) {
        if (fecha) {
            const dia = ('0' + fecha.getDate()).slice(-2); // Asegura que tenga dos dígitos
            const mes = ('0' + (fecha.getMonth() + 1)).slice(-2); // getMonth() es 0-11
            const anio = fecha.getFullYear();
            this.avalComite.fechaAval = `${dia}/${mes}/${anio}`; // Formato dd/mm/yyyy

            console.log('fecha guardada: ' + this.avalComite.fechaAval);
        }
    }

    convertirCadenaAFecha(fechaStr: string): Date {
        const [dia, mes, anio] = fechaStr.split('/').map(Number);
        // Crea la fecha sin considerar la hora, ajustando la zona horaria si es necesario
        return new Date(Date.UTC(anio, mes - 1, dia));
    }

    cambiarestadoSolicitud(estado: string) {}
}
