import {
    Component,
    ElementRef,
    OnInit,
    Renderer2,
    ViewChild,
} from '@angular/core';
import {
    ConfirmationService,
    ConfirmEventType,
    MessageService,
} from 'primeng/api';
import { Router } from '@angular/router';
import { RadicarService } from '../../../services/radicar.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AlmacenarSolicitudService } from '../../../services/almacenarSolicitud.service';

@Component({
    selector: 'app-resumen',
    templateUrl: './resumen.component.html',
    styleUrls: ['./resumen.component.scss'],
    providers: [ConfirmationService, MessageService],
})
export class ResumenComponent implements OnInit {
    @ViewChild('lineImage', { static: true }) lineImage: ElementRef;
    @ViewChild('firmaImage') firmaImage: ElementRef;
    @ViewChild('encabezadoSolicitud') encabezadoSolicitud: ElementRef;
    @ViewChild('piePaginaSolicitud') piePaginaSolicitud: ElementRef;
    @ViewChild('contenidoSolicitud') contenidoSolicitud: ElementRef;
    @ViewChild('vistaPreviaSolicitud') vistaPreviaSolicitud: ElementRef;
    @ViewChild('proporcionContenido') proporcionContenido: ElementRef;
    @ViewChild('divContenedor') divContenedor: ElementRef;

    imgDivEncabezado: HTMLImageElement;
    imgDivPiePagina: HTMLImageElement;
    imgDivContenido: HTMLImageElement;
    imgDivProporcionContenido: HTMLImageElement;

    mostrarOficio: boolean = true;

    segmentosContenido: HTMLImageElement[];

    espacioVacioEnPaginas: number[];

    generandoVistaPrevia = true;
    firmaEnProceso: boolean = false;
    guardadoEnProceso: boolean = false;
    mostrarBtnFirmar: boolean = false;
    deshabilitarEnvio: boolean = false;
    fechaActual: Date = new Date();
    nombresMes: string[] = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
    ];

    constructor(
        public radicar: RadicarService,
        public almacenar: AlmacenarSolicitudService,
        private router: Router,
        private renderer: Renderer2,
        private el: ElementRef,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {
        this.segmentosContenido = [];
        this.espacioVacioEnPaginas = [];
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
            }, 1000);
        }, 100);
    }

    crearPDF() {
        const div = this.vistaPreviaSolicitud.nativeElement;
        const scale = 3;

        html2canvas(div, { scale: scale }).then((canvas) => {
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF('p', 'mm', 'letter');

            const imgWidth = 216; // Ancho de la imagen en mm (ajústalo según tus necesidades)
            const pageHeight = 279; // Altura de la página en mm

            let position = 0;

            for (
                let index = 0;
                index < this.segmentosContenido.length;
                index++
            ) {
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, 0);

                if (index != this.segmentosContenido.length - 1) {
                    pdf.addPage();
                }

                position -= pageHeight;
            }

            // Guarda el PDF
            pdf.save('Oficio de Solicitud.pdf');
        });
    }

    enviarSolicitud() {
        this.deshabilitarEnvio = true;
        this.guardadoEnProceso = true;
        this.almacenar.almacenarSolicitudEnBD().then((resultado) => {
            if (resultado) {
                this.guardadoEnProceso = false;
                this.confirmationService.confirm({
                    message:
                        'La solicitud se ha enviado al tutor/director seleccionado para su revisión y aval.',
                    header: 'Solicitud enviada',
                    icon: 'pi pi-exclamation-circle',
                    acceptLabel: 'Aceptar',
                    rejectVisible: false,
                    accept: () => {
                        this.radicar.restrablecerValores();
                        this.router.navigate([
                            '/gestionsolicitudes/creacion/selector',
                        ]);
                    },
                });
            } else {
                this.guardadoEnProceso = false;
                this.deshabilitarEnvio = false;
                this.confirmationService.confirm({
                    message:
                        'Ha ocurrido un error inesperado al enviar la solicitud, revisela e intentelo nuevamente.',
                    header: 'Error de envio',
                    icon: 'pi pi-exclamation-triangle',
                    acceptLabel: 'Aceptar',
                    rejectVisible: false,
                    accept: () => {},
                });
            }
        });

        //this.crearPDF();
    }

    navigateToBack() {
        if (
            ['AD_ASIG', 'CA_ASIG'].includes(
                this.radicar.tipoSolicitudEscogida.codigoSolicitud
            )
        ) {
            this.router.navigate(['/gestionsolicitudes/creacion/datos']);
        } else {
            this.router.navigate(['/gestionsolicitudes/creacion/documentos']);
        }
    }

    renderizarImagen(imagen: File): void {
        const reader = new FileReader();
        reader.onload = () => {
            this.radicar.firmaSolicitanteUrl = reader.result as string;
        };
        reader.readAsDataURL(imagen);
    }
}
