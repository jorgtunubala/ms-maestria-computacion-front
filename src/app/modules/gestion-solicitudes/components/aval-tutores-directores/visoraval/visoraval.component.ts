import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GestorService } from '../../../services/gestor.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { RadicarService } from '../../../services/radicar.service';
import { HttpService } from '../../../services/http.service';
import { DatosSolicitudRequest } from '../../../models/solicitudes/datosSolicitudRequest';
import { OficioComponent } from '../../utilidades/oficio/oficio.component';

@Component({
    selector: 'app-visoraval',
    templateUrl: './visoraval.component.html',
    styleUrls: ['./visoraval.component.scss'],
})
export class VisoravalComponent implements OnInit {
    @ViewChild(OficioComponent) componenteHijo: OficioComponent;
    @ViewChild('firmaImage') firmaImage: ElementRef;

    segmentosContenido: HTMLImageElement[];
    mostrarOficio: boolean = false;
    mostrarBtnFirmar: boolean = false;
    firmaEnProceso: boolean = false;

    constructor(
        public gestor: GestorService,
        public radicar: RadicarService,
        public http: HttpService
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
            }, 100);
        }, 100);
    }

    guardarOficioAvalado() {}

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

    ejecutarMetodoDelComponenteHijo() {
        if (this.componenteHijo) {
            this.componenteHijo.crearPDF();
        }
    }
}
