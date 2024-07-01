import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GestorService } from '../../../services/gestor.service';
import { RadicarService } from '../../../services/radicar.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpService } from '../../../services/http.service';
import { DatosSolicitudRequest } from '../../../models/solicitudes/datosSolicitudRequest';
import { OficioComponent } from '../../utilidades/oficio/oficio.component';
import { DatosAvalSolicitud } from '../../../models/indiceModelos';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UtilidadesService } from '../../../services/utilidades.service';

@Component({
    selector: 'app-visoraval',
    templateUrl: './visoraval.component.html',
    styleUrls: ['./visoraval.component.scss'],
    providers: [ConfirmationService, MessageService],
})
export class VisoravalComponent implements OnInit {
    @ViewChild(OficioComponent) oficio: OficioComponent;
    @ViewChild('firmaImage') firmaImage: ElementRef;

    mostrarOficio: boolean = false;
    mostrarBtnFirmar: boolean = false;
    mostrarBtnRechazar: boolean = false;
    firmaEnProceso: boolean = false;
    mostrarBtnAvalar: boolean = false;
    mostrarPFSet: boolean = true;
    habilitarAval: boolean = false;
    deshabilitarRechazo: boolean = false;
    deshabilitarAval: boolean = false;

    urlPdf: SafeResourceUrl;

    documentosAdjuntos: File[] = [];
    enlacesAdjuntos: string[] = [];

    constructor(
        public gestor: GestorService,
        public radicar: RadicarService,
        public http: HttpService,
        private sanitizer: DomSanitizer,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private utilidades: UtilidadesService
    ) {}

    ngOnInit(): void {
        this.cargarDatosOficio();
    }

    capturarInformacionAdjunta() {
        if (this.radicar.datosAsignaturasExternas?.length > 0) {
            this.radicar.datosAsignaturasExternas.forEach((asignatura) => {
                if (asignatura.contenidos) {
                    this.documentosAdjuntos.push(asignatura.contenidos);
                }
                if (asignatura.cartaAceptacion) {
                    this.documentosAdjuntos.push(asignatura.cartaAceptacion);
                }
            });
        }

        if (this.radicar.datosAsignaturasAHomologar?.length > 0) {
            this.radicar.datosAsignaturasAHomologar.forEach((asignatura) => {
                if (asignatura.contenidos) {
                    this.documentosAdjuntos.push(asignatura.contenidos);
                }
            });
        }

        if (this.radicar.documentosAdjuntos?.length > 0) {
            this.documentosAdjuntos = this.documentosAdjuntos.concat(
                this.radicar.documentosAdjuntos
            );
        }

        if (this.radicar.adjuntosDeActividades) {
            Object.values(this.radicar.adjuntosDeActividades).forEach(
                (adjuntosActividad) => {
                    if (adjuntosActividad) {
                        if (adjuntosActividad.archivos?.length > 0) {
                            this.documentosAdjuntos.push(
                                ...adjuntosActividad.archivos
                            );
                        }
                        if (adjuntosActividad.enlaces?.length > 0) {
                            this.enlacesAdjuntos.push(
                                ...adjuntosActividad.enlaces
                            );
                        }
                    }
                }
            );
        }
    }

    /*
    capturarInformacionAdjunta() {
        if (
            this.radicar.datosAsignaturasExternas &&
            this.radicar.datosAsignaturasExternas.length > 0
        ) {
            // Recorre cada elemento de datosAsignaturasExternas
            this.radicar.datosAsignaturasExternas.forEach((asignatura) => {
                // Verifica si hay información en 'contenidos'
                if (asignatura.contenidos) {
                    // Si hay información, extrae el nombre y guárdalo en el arreglo nombresArchivos
                    this.documentosAdjuntos.push(asignatura.contenidos);
                }
                // Verifica si hay información en 'cartaAceptacion'
                if (asignatura.cartaAceptacion) {
                    // Si hay información, extrae el nombre y guárdalo en el arreglo nombresArchivos
                    this.documentosAdjuntos.push(asignatura.cartaAceptacion);
                }
            });
        }

        if (
            this.radicar.datosAsignaturasAHomologar &&
            this.radicar.datosAsignaturasAHomologar.length > 0
        ) {
            // Recorre cada elemento de datosAsignaturasAHomologar
            this.radicar.datosAsignaturasAHomologar.forEach((asignatura) => {
                // Verifica si hay información en 'contenidos'
                if (asignatura.contenidos) {
                    // Si hay información, extrae el nombre y guárdalo en el arreglo nombresArchivos
                    this.documentosAdjuntos.push(asignatura.contenidos);
                }
            });
        }

        if (
            this.radicar.documentosAdjuntos &&
            this.radicar.documentosAdjuntos.length > 0
        ) {
            this.radicar.documentosAdjuntos.forEach((doc) => {
                this.documentosAdjuntos.push(doc);
            });
        }

        // Verificar adjuntosDeActividades
        if (this.radicar.adjuntosDeActividades) {
            Object.keys(this.radicar.adjuntosDeActividades).forEach(
                (actividadId) => {
                    const adjuntosActividad =
                        this.radicar.adjuntosDeActividades[Number(actividadId)];
                    if (adjuntosActividad) {
                        if (
                            adjuntosActividad.archivos &&
                            adjuntosActividad.archivos.length > 0
                        ) {
                            adjuntosActividad.archivos.forEach((archivo) => {
                                this.documentosAdjuntos.push(archivo);
                            });
                        }
                        if (
                            adjuntosActividad.enlaces &&
                            adjuntosActividad.enlaces.length > 0
                        ) {
                            adjuntosActividad.enlaces.forEach((enlace) => {
                                this.enlacesAdjuntos.push(enlace);
                            });
                        }
                    }
                }
            );
        }
    }
*/
    cargarDatosOficio() {
        this.http
            .obtenerInfoSolGuardada(
                this.radicar.tipoSolicitudEscogida.idSolicitud
            )
            .subscribe(
                async (infoSolicitud: DatosSolicitudRequest) => {
                    await this.radicar.poblarConDatosSolicitudGuardada(
                        infoSolicitud
                    );
                    this.mostrarOficio = true;
                    this.mostrarBtnAvalar = true;
                    this.mostrarBtnRechazar = true;
                    this.capturarInformacionAdjunta();
                },
                (error) => {
                    console.error(
                        'Error al cargar la informacion de la solicitud:',
                        error
                    );
                }
            );
    }

    onUpload(event, firmante) {
        const rol: any = 'Tutor';
        const reader = new FileReader();

        switch (rol) {
            case 'Tutor':
                this.radicar.firmaTutor = event.files[0];
                this.renderizarImagen(this.radicar.firmaTutor, rol);

                reader.onload = (e) => {
                    this.firmaImage.nativeElement.src = e.target.result;
                };
                reader.readAsDataURL(this.radicar.firmaTutor);

                break;

            case 'Director':
                this.radicar.firmaDirector = event.files[0];
                this.renderizarImagen(this.radicar.firmaDirector, rol);

                reader.onload = (e) => {
                    this.firmaImage.nativeElement.src = e.target.result;
                };
                reader.readAsDataURL(this.radicar.firmaDirector);

                break;

            default:
                break;
        }
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
                this.habilitarAval = true;
            }, 100);
        }, 100);
    }

    async enviarOficioAvalado() {
        if (this.habilitarAval) {
            this.deshabilitarRechazo = true;
            await this.convertirOficioEnPDF();

            let prmfirmaTutor: string = null;
            let prmfirmaDirector: string = null;

            if (this.radicar.firmaTutor) {
                prmfirmaTutor = await this.utilidades.convertirFileABase64(
                    this.radicar.firmaTutor
                );
            }

            if (this.radicar.firmaDirector) {
                prmfirmaDirector = await this.utilidades.convertirFileABase64(
                    this.radicar.firmaDirector
                );
            }

            const aval: DatosAvalSolicitud = {
                idSolicitud: this.radicar.tipoSolicitudEscogida.idSolicitud,
                firmaTutor: prmfirmaTutor,
                firmaDirector: prmfirmaDirector,
                documentoPdfSolicitud:
                    await this.utilidades.convertirFileABase64(
                        this.radicar.oficioDeSolicitud
                    ),
            };

            this.http.guardarAvalesSolicitud(aval).subscribe(
                (resultado) => {
                    if (resultado) {
                        this.gestor.ejecutarCargarSolicitudes();
                        this.confirmationService.confirm({
                            message: 'La solicitud se ha avalado exitosamente',
                            header: 'Solicitud avalada',
                            icon: 'pi pi-exclamation-circle',
                            acceptLabel: 'Aceptar',
                            rejectVisible: false,
                            accept: () => {
                                this.mostrarBtnRechazar = false;
                                this.mostrarBtnAvalar = false;
                                this.mostrarPFSet = false;
                            },
                            reject: () => {
                                this.mostrarBtnRechazar = false;
                                this.mostrarBtnAvalar = false;
                                this.mostrarPFSet = false;
                            },
                        });
                    } else {
                        this.confirmationService.confirm({
                            message:
                                'Ha ocurrido un error inesperado al avalar la solicitud, intentelo nuevamente.',
                            header: 'Error de aval',
                            icon: 'pi pi-exclamation-triangle',
                            acceptLabel: 'Aceptar',
                            rejectVisible: false,
                            accept: () => {},
                        });
                    }
                },
                (error) => {
                    console.error('Error al enviar la solicitud:', error);
                }
            );
        } else {
            this.showWarn();
        }
    }

    rechazarSolicitud() {
        this.deshabilitarAval = true;
    }

    renderizarImagen(imagen: File, firmante: any): void {
        const reader = new FileReader();
        reader.onload = () => {
            switch (firmante) {
                case 'Tutor':
                    this.radicar.firmaTutorUrl = reader.result as string;
                    break;
                case 'Director':
                    this.radicar.firmaDirectorUrl = reader.result as string;
                    break;

                default:
                    break;
            }
        };
        reader.readAsDataURL(imagen);
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

    abrirArchivo(nombreDocumento: string) {
        // Buscar el archivo por su nombre
        const documento = this.documentosAdjuntos.find(
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

    showWarn() {
        this.messageService.add({
            severity: 'warn',
            summary: 'Oficio no firmado',
            detail: 'Firme el oficio de la solicitud',
        });
    }
}
