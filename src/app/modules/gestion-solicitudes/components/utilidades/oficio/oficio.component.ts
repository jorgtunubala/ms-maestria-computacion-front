import {
    Component,
    ElementRef,
    OnInit,
    Renderer2,
    ViewChild,
} from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { RadicarService } from '../../../services/radicar.service';

@Component({
    selector: 'app-oficio',
    templateUrl: './oficio.component.html',
    styleUrls: ['./oficio.component.scss'],
})
export class OficioComponent implements OnInit {
    @ViewChild('vistaPreviaSolicitud') vistaPreviaSolicitud: ElementRef;

    imgDivEncabezado: HTMLImageElement;
    imgDivPiePagina: HTMLImageElement;
    imgDivContenido: HTMLImageElement;
    segmentosContenido: HTMLImageElement[];

    constructor(private renderer: Renderer2, private radicar: RadicarService) {}

    ngOnInit(): void {
        this.cargarRecursos();
    }

    ngAfterViewInit() {
        this.cargarRecursos();
    }

    cargarRecursos() {
        setTimeout(() => {
            this.radicar.esperando = true;
        }, 100);

        setTimeout(() => {
            const promesas = [
                this.convertirDivAImagen('encabezadoSolicitud'),
                this.convertirDivAImagen('piePaginaSolicitud'),
                this.convertirDivAImagen('contenidoSolicitud'),
                this.convertirDivAImagen('proporcionContenido'),
            ];
            setTimeout(() => {
                Promise.all(promesas).then((imagenes) => {
                    this.imgDivEncabezado = imagenes[0];
                    this.imgDivPiePagina = imagenes[1];
                    this.imgDivContenido = imagenes[2];
                    //this.imgDivProporcionContenido = imagenes[3];

                    this.segmentarContenido();
                    this.componerVistaPrevia();
                    this.radicar.esperando = false;
                });
            }, 150);
        }, 150);
    }

    convertirDivAImagen(elementId: string) {
        const divElement = document.getElementById(elementId);

        if (!divElement) {
            return Promise.resolve(null);
        }

        return new Promise<HTMLImageElement>((resolve) => {
            html2canvas(divElement, {
                scale: 3,
                logging: false,
            }).then((canvas) => {
                const imagenVariable = new Image();
                imagenVariable.src = canvas.toDataURL('image/jpeg', 1.0);

                this.renderer.setStyle(divElement, 'display', 'none');
                resolve(imagenVariable);
            });
        });
    }

    encontrarLineaBlancaY(elementoImagen: HTMLImageElement, posicionY: number) {
        const canvas = document.createElement('canvas');
        canvas.width = elementoImagen.width;
        canvas.height = 1;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        while (posicionY > 0) {
            // Dibuja una línea de píxeles en el contexto
            ctx.drawImage(
                elementoImagen,
                0,
                -posicionY,
                elementoImagen.width,
                elementoImagen.height
            );

            function esLineBlanca() {
                // Obtener los datos de píxeles de la línea
                const imageData = ctx.getImageData(
                    0,
                    0,
                    elementoImagen.width,
                    1
                );
                const data = imageData.data;

                // Itera a través de los datos de píxeles y verifica si todos son blancos (255, 255, 255, 255)
                for (let i = 0; i < data.length; i += 4) {
                    if (
                        data[i] !== 255 ||
                        data[i + 1] !== 255 ||
                        data[i + 2] !== 255 ||
                        data[i + 3] !== 255
                    ) {
                        // Al menos un píxel no es blanco, así que retorna false
                        return false;
                    }
                }

                // Todos los píxeles son blancos, retorna true
                return true;
            }

            if (esLineBlanca()) {
                return posicionY;
            } else {
                posicionY -= 5;
            }
        }

        return -1;
    }

    recortarImagenPorPosicionesY(
        imagen: HTMLImageElement,
        y1: number,
        y2: number
    ): HTMLImageElement {
        const canvas = this.renderer.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Definir el tamaño del canvas igual al tamaño de la imagen
        canvas.width = imagen.width;
        canvas.height = y2 - y1;

        // Dibujar la porción de la imagen en el canvas
        ctx.drawImage(
            imagen,
            0,
            y1,
            imagen.width,
            y2 - y1,
            0,
            0,
            imagen.width,
            y2 - y1
        );

        // Crear una nueva imagen a partir del canvas
        const imagenRecortada = new Image();
        imagenRecortada.src = canvas.toDataURL('image/jpeg', 1.0);

        return imagenRecortada;
    }

    segmentarContenido() {
        this.segmentosContenido = [];
        const heightContenido = this.imgDivContenido.height;
        const heightRecorte = 2100;

        let contenidoRestante = heightContenido;
        let corteY1 = 0;
        let corteY2 = heightRecorte;

        while (contenidoRestante > 0) {
            if (contenidoRestante <= heightRecorte) {
                corteY2 = heightContenido;
                contenidoRestante = 0;
            }

            //Buscar una posicion sin texto para hacer el corte
            const corteY2Adecuado = this.encontrarLineaBlancaY(
                this.imgDivContenido,
                corteY2
            );

            //Recortar el contenido con un alto adecuado para una pagina
            const imagenRecortada: HTMLImageElement =
                this.recortarImagenPorPosicionesY(
                    this.imgDivContenido,
                    corteY1,
                    corteY2Adecuado
                );
            const heightimagenRecortada = corteY2Adecuado - corteY1;

            //Amacenar el segmento en una arreglo
            this.segmentosContenido.push(imagenRecortada);

            //Disminuir el contenido restante por cortar
            contenidoRestante -= heightimagenRecortada;

            //Actualizar las nuevas posiciones de recorte
            corteY1 = corteY2Adecuado;
            corteY2 = corteY2Adecuado + heightRecorte;
        }
    }

    componerVistaPrevia() {
        const vistaPreviaDiv = this.vistaPreviaSolicitud.nativeElement;

        vistaPreviaDiv.innerHTML = '';

        for (let i = 0; i < this.segmentosContenido.length; i++) {
            const contenedor = this.renderer.createElement('div');
            this.renderer.setStyle(contenedor, 'width', '216mm');
            this.renderer.setStyle(contenedor, 'height', '279mm');
            this.renderer.setStyle(contenedor, 'overflow', 'hidden');
            this.renderer.setStyle(contenedor, 'margin', '0');

            const encabcontent = this.renderer.createElement('div');
            this.renderer.setStyle(encabcontent, 'width', '216mm');
            this.renderer.setStyle(encabcontent, 'height', '60mm');
            this.renderer.setStyle(encabcontent, 'overflow', 'hidden');

            const cuerpo = this.renderer.createElement('div');
            this.renderer.setStyle(cuerpo, 'width', '216mm');
            this.renderer.setStyle(cuerpo, 'height', '187mm');
            this.renderer.setStyle(cuerpo, 'overflow', 'hidden');

            const pie = this.renderer.createElement('div');
            this.renderer.setStyle(pie, 'width', '216mm');
            this.renderer.setStyle(pie, 'height', '32mm');
            this.renderer.setStyle(pie, 'overflow', 'hidden');

            const encabezado = new Image();
            encabezado.src = this.imgDivEncabezado.src;
            encabezado.style.width = '100%';
            encabcontent.appendChild(encabezado);
            contenedor.appendChild(encabcontent);

            const contenido = new Image();
            contenido.src = this.segmentosContenido[i].src;
            contenido.style.width = '100%';
            cuerpo.appendChild(contenido);
            contenedor.appendChild(cuerpo);

            const piePagina = new Image();
            piePagina.src = this.imgDivPiePagina.src;
            piePagina.style.width = '100%';
            pie.appendChild(piePagina);
            contenedor.appendChild(pie);

            contenedor.style.width = '100%';

            vistaPreviaDiv.appendChild(contenedor);
        }
    }

    /*
    crearPDF(): Promise<void> {
        return new Promise((resolve, reject) => {
            const div = this.vistaPreviaSolicitud.nativeElement;
            const scale = 3;

            html2canvas(div, { scale: scale })
                .then((canvas) => {
                    const imgData = canvas.toDataURL('image/jpeg', 1.0);
                    const pdf = new jsPDF('p', 'mm', 'letter');

                    const imgWidth = 216; // Ancho de la imagen en mm 
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

                    // Convierte el PDF a Blob
                    const blob = pdf.output('blob');

                    // Crea un objeto File a partir del Blob
                    const pdfFile = new File(
                        [blob],
                        'Oficio de Solicitud.pdf',
                        {
                            type: 'application/pdf',
                        }
                    );

                    // Guarda el PDF en una variable de tipo File
                    this.radicar.oficioDeSolicitud = pdfFile;

                    // Opcional: descargar el PDF también, descomenta la línea siguiente
                    //pdf.save('Oficio de Solicitud.pdf');

                    resolve();
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
        */

    // Genera un archivo PDF a partir del contenido de un elemento HTML.
    crearPDF(): Promise<void> {
        return new Promise((resolve, reject) => {
            // Obtiene el elemento HTML que se va a convertir en PDF
            const div = this.vistaPreviaSolicitud.nativeElement;

            // Factor de escala para la imagen capturada (aumenta la calidad de la imagen)
            const scale = 3;

            // Usa html2canvas para capturar el contenido del elemento HTML como una imagen en un canvas
            html2canvas(div, { scale: scale })
                .then((canvas) => {
                    // Convierte el canvas a una URL de datos en formato JPEG con calidad máxima
                    const imgData = canvas.toDataURL('image/jpeg', 1.0);

                    // Crea una instancia de jsPDF para generar el PDF
                    const pdf = new jsPDF('p', 'mm', 'letter');

                    // Dimensiones de la imagen en el PDF (ajusta según tus necesidades)
                    const imgWidth = 216; // Ancho de la imagen en mm
                    const pageHeight = 279; // Altura de la página en mm

                    // Posición vertical inicial en la página
                    let position = 0;

                    // Itera sobre los segmentos de contenido para agregar imágenes al PDF
                    for (
                        let index = 0;
                        index < this.segmentosContenido.length;
                        index++
                    ) {
                        // Agrega la imagen al PDF en la posición actual
                        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, 0);

                        // Si no es el último segmento, agrega una nueva página al PDF
                        if (index != this.segmentosContenido.length - 1) {
                            pdf.addPage();
                        }

                        // Actualiza la posición para la próxima página (mueve hacia arriba)
                        position -= pageHeight;
                    }

                    // Convierte el PDF generado a un objeto Blob
                    const blob = pdf.output('blob');

                    // Crea un objeto File a partir del Blob con el nombre y tipo de archivo especificados
                    const pdfFile = new File(
                        [blob],
                        'Oficio de Solicitud.pdf',
                        {
                            type: 'application/pdf',
                        }
                    );

                    // Asigna el archivo PDF a una propiedad para su uso posterior
                    this.radicar.oficioDeSolicitud = pdfFile;

                    // Opcional: descomenta la siguiente línea para descargar el PDF automáticamente
                    // pdf.save('Oficio de Solicitud.pdf');

                    // Resuelve la promesa indicando que la generación del PDF ha sido exitosa
                    resolve();
                })
                .catch((error) => {
                    // Rechaza la promesa en caso de error durante la generación del PDF
                    reject(error);
                });
        });
    }
}
