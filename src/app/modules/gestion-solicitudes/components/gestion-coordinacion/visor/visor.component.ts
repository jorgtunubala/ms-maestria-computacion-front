import { Component, OnInit } from '@angular/core';
import { GestorService } from '../../../services/gestor.service';
import { HttpService } from '../../../services/http.service';
import { DatosSolicitudRequest } from '../../../models/solicitudes/datosSolicitudRequest';
import {
    DomSanitizer,
    SafeUrl,
    SafeResourceUrl,
} from '@angular/platform-browser';
import { UtilidadesService } from '../../../services/utilidades.service';

@Component({
    selector: 'app-visor',
    templateUrl: './visor.component.html',
    styleUrls: ['./visor.component.scss'],
})
export class VisorComponent implements OnInit {
    urlOficioPdf: SafeResourceUrl;
    urlPdf: SafeResourceUrl;
    datosSolicitud: DatosSolicitudRequest;
    docsAdjuntos: File[] = [];
    enlacesAdjuntos: string[] = [];

    constructor(
        public gestor: GestorService,
        public http: HttpService,
        private sanitizer: DomSanitizer,
        private utilidades: UtilidadesService
    ) {}

    ngOnInit(): void {
        this.cargarDatosSolicitud();
    }

    cargarDatosSolicitud() {
        this.http
            .obtenerInfoSolGuardada(
                this.gestor.solicitudSeleccionada.idSolicitud
            )
            .subscribe(
                async (infoSolicitud: DatosSolicitudRequest) => {
                    this.datosSolicitud = infoSolicitud;
                    this.AbrirOficioPdf();
                    this.extraerAdjuntos(
                        this.gestor.solicitudSeleccionada.codigoSolicitud
                    );
                },
                (error) => {
                    console.error(
                        'Error al cargar la informacion de la solicitud:',
                        error
                    );
                }
            );
    }

    mostrarArhivo(archivo) {
        window.open(archivo.url, '_blank');
    }

    AbrirOficioPdf() {
        let documento;

        if (this.datosSolicitud.datosComunSolicitud.oficioPdf) {
            documento = this.utilidades.convertirBase64AFile(
                this.datosSolicitud.datosComunSolicitud.oficioPdf
            );
        }

        if (documento) {
            const tipoMIME = 'application/pdf';
            // Crear una nueva instancia de Blob con el tipo MIME especificado
            const blob = new Blob([documento], { type: tipoMIME });

            // Crear la URL segura
            const url = URL.createObjectURL(blob);
            this.urlOficioPdf =
                this.sanitizer.bypassSecurityTrustResourceUrl(url);
        }
    }

    extraerAdjuntos(tipoSolicitud: string) {
        const procesarDocumentosAdjuntos = (
            documentosAdjuntos: any[]
        ): void => {
            documentosAdjuntos?.forEach((docAdjunto) => {
                this.docsAdjuntos.push(
                    this.utilidades.convertirBase64AFile(docAdjunto)
                );
            });
        };

        switch (tipoSolicitud) {
            case 'HO_ASIG_ESP':
            case 'HO_ASIG_POS':
                procesarDocumentosAdjuntos(
                    this.datosSolicitud.datosSolicitudHomologacion
                        .documentosAdjuntos
                );

                this.datosSolicitud.datosSolicitudHomologacion.datosAsignatura.forEach(
                    (asignatura) => {
                        if (asignatura.contenidoProgramatico) {
                            this.docsAdjuntos.push(
                                this.utilidades.convertirBase64AFile(
                                    asignatura.contenidoProgramatico
                                )
                            );
                        }
                    }
                );
                break;

            case 'CU_ASIG':
                procesarDocumentosAdjuntos(
                    this.datosSolicitud.datosSolicitudCursarAsignaturas
                        .documentosAdjuntos
                );
                break;

            case 'AV_PASA_INV':
                procesarDocumentosAdjuntos(
                    this.datosSolicitud.datoAvalPasantiaInv.documentosAdjuntos
                );
                break;

            case 'AP_ECON_INV':
                procesarDocumentosAdjuntos(
                    this.datosSolicitud.datosApoyoEconomico.documentosAdjuntos
                );
                break;

            case 'RE_CRED_PAS':
                this.datosSolicitud.datosActividadDocente?.forEach(
                    (actividad) => {
                        procesarDocumentosAdjuntos(actividad.documentos);
                        actividad.enlaces?.forEach((enlace) => {
                            this.enlacesAdjuntos.push(enlace);
                        });
                    }
                );
                break;

            case 'RE_CRED_PUB':
                procesarDocumentosAdjuntos(
                    this.datosSolicitud.datosReconocimientoCreditos
                        .documentosAdjuntos
                );
                break;

            case 'AP_ECON_ASI':
                procesarDocumentosAdjuntos(
                    this.datosSolicitud.datosApoyoEconomicoCongreso
                        .documentosAdjuntos
                );
                break;

            case 'PA_PUBL_EVE':
                procesarDocumentosAdjuntos(
                    this.datosSolicitud.datosApoyoEconomicoPublicacion
                        .documentosAdjuntos
                );
                break;

            case 'SO_BECA':
            case 'SO_DESC':
            default:
                // No se realiza ninguna acción para estos tipos de solicitud
                break;
        }
    }

    abrirArchivo(nombreDocumento: string) {
        // Buscar el archivo por su nombre
        const documento = this.docsAdjuntos.find(
            (doc) => doc.name === nombreDocumento
        );

        if (documento) {
            const tipoMIME = 'application/pdf';
            // Crear una nueva instancia de Blob con el tipo MIME especificado
            const blob = new Blob([documento], { type: tipoMIME });

            // Crear la URL segura
            const url = URL.createObjectURL(blob);
            this.urlPdf = this.sanitizer.bypassSecurityTrustResourceUrl(url);

            console.log(this.urlPdf);
        }
    }

    abrirEnlace(enlace: string): void {
        if (enlace) {
            const enlaceCompleto = enlace.startsWith('http')
                ? enlace
                : 'http://' + enlace;
            window.open(enlaceCompleto, '_blank');
        }
    }
}
