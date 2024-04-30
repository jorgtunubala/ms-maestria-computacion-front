import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GestorService } from '../../../services/gestor.service';
import { RadicarService } from '../../../services/radicar.service';
import { HttpService } from '../../../services/http.service';
import { DatosSolicitudRequest } from '../../../models/solicitudes/datosSolicitudRequest';
import { OficioComponent } from '../../utilidades/oficio/oficio.component';
import { DatosAvalSolicitud } from '../../../models/indiceModelos';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
    selector: 'app-visoraval',
    templateUrl: './visoraval.component.html',
    styleUrls: ['./visoraval.component.scss'],
    providers: [ConfirmationService, MessageService],
})
export class VisoravalComponent implements OnInit {
    @ViewChild(OficioComponent) oficio: OficioComponent;
    @ViewChild('firmaImage') firmaImage: ElementRef;

    segmentosContenido: HTMLImageElement[];
    mostrarOficio: boolean = false;
    mostrarBtnFirmar: boolean = false;
    firmaEnProceso: boolean = false;
    mostrarBtnAvalar: boolean = false;
    mostrarPFSet: boolean = true;

    constructor(
        public gestor: GestorService,
        public radicar: RadicarService,
        public http: HttpService,
        private router: Router,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.cargarDatosOficio();
    }

    cargarDatosOficio() {
        this.http
            .obtenerInfoSolGuardada(
                this.radicar.tipoSolicitudEscogida.idSolicitud
            )
            .subscribe(
                (infoSolicitud: DatosSolicitudRequest) => {
                    this.radicar.poblarConDatosSolicitudGuardada(infoSolicitud);
                    this.mostrarOficio = true;
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
                this.mostrarBtnAvalar = true;
            }, 100);
        }, 100);
    }

    async enviarOficioAvalado() {
        this.convertirOficioEnPDF();

        const aval: DatosAvalSolicitud = {
            idSolicitud: this.radicar.tipoSolicitudEscogida.idSolicitud,
            firmaTutor: await this.convertirABase64(this.radicar.firmaTutor),
            firmaDirector: await this.convertirABase64(
                this.radicar.firmaDirector
            ),
            documentoPdfSolicitud: await this.convertirABase64(
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
                // Manejar errores en caso de que ocurran durante la solicitud HTTP
                console.error('Error al enviar la solicitud:', error);
                // Mostrar mensaje de error u otras acciones necesarias
            }
        );
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

    convertirOficioEnPDF() {
        if (this.oficio) {
            this.oficio.crearPDF();
        }
    }

    abrirArchivo(nombreDocumento: string) {
        // Buscar el archivo por su nombre
        const documento = this.radicar.documentosAdjuntos.find(
            (doc) => doc.name === nombreDocumento
        );

        if (documento) {
            // Crear un objeto URL para el archivo
            const url = URL.createObjectURL(documento);

            // Crear un enlace de descarga
            const link = document.createElement('a');
            link.href = url;
            link.download = nombreDocumento;

            // Simular un clic en el enlace para iniciar la descarga
            link.click();

            // Liberar el objeto URL
            URL.revokeObjectURL(url);
        } else {
            console.error('El documento no se encontró');
        }
    }

    abrirEnlace(): void {
        const enlace = this.radicar.enlaceMaterialAudiovisual;
        if (enlace) {
            const enlaceCompleto = enlace.startsWith('http')
                ? enlace
                : 'http://' + enlace;
            window.open(enlaceCompleto, '_blank');
        }
    }

    async convertirABase64(archivo: File | null): Promise<string | null> {
        return new Promise((resolve, reject) => {
            if (!archivo) {
                resolve(null);
                return;
            }

            const lector = new FileReader();

            lector.readAsDataURL(archivo);

            lector.onload = () => {
                if (typeof lector.result === 'string') {
                    const nombre = archivo.name;
                    const contenidoBase64 = lector.result.split(',')[1];
                    const base64ConNombre = `${nombre}:${contenidoBase64}`;
                    resolve(base64ConNombre);
                } else {
                    reject(null);
                }
            };

            lector.onerror = () => {
                reject(null);
            };
        });
    }
}
