import { jsPDF } from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { UtilidadesService } from '../../../services/utilidades.service';

export class RecoCredPasantiaStrategy implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private pdfService: PdfService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });

        // Texto para el asunto
        const textAsunto = `Asunto: Solicitud de reconocimiento de créditos por pasantía de investigación\n`;

        // Texto para la solicitud
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar el reconocimiento y asignación de los créditos que corresponden a la culminación satisfactoria de mi estancia de investigación. Adjunto a esta solicitud, la documentación y soportes requeridos para su revisión, así como el enlace al repositorio donde se aloja el video de socialización de la pasantía realizada.`;

        // Enlace al video de socialización
        const textVideo = `\nEnlace video de socialización: ${this.servicioRadicar.enlaceMaterialAudiovisual}`;

        // Obtener los nombres de los archivos adjuntos
        const textAdjuntos = `${this.servicioRadicar.obtenerNombreArchivosAdjuntos()}`;

        // Añadir contenido común
        let cursorY = this.pdfService.agregarContenidoComun(doc, marcaDeAgua);

        // Añadir asunto y solicitud
        cursorY = this.pdfService.agregarAsuntoYSolicitud(
            doc,
            cursorY,
            textAsunto,
            textSolicitud,
            marcaDeAgua
        );

        // Añadir enlace al video de socialización
        cursorY = this.pdfService.agregarTexto(doc, {
            text: textVideo,
            startY: cursorY,
            alignment: 'left',
            watermark: marcaDeAgua,
        });

        // Salto de línea
        doc.text('', 5, cursorY);
        cursorY += 5;

        // Añadir despedida
        cursorY = this.pdfService.agregarDespedida(doc, cursorY, marcaDeAgua);

        // Añadir espacios para firmas
        cursorY = this.pdfService.agregarEspaciosDeFirmas(
            doc,
            cursorY,
            false,
            marcaDeAgua
        );

        // Añadir listado de adjuntos
        this.pdfService.agregarListadoAdjuntos(
            doc,
            cursorY,
            textAdjuntos,
            marcaDeAgua
        );

        // Retornar el documento generado
        return doc;
    }
}
