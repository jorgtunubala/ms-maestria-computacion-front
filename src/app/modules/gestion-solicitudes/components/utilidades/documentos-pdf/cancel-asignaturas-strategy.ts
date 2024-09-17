import { jsPDF } from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { UtilidadesService } from '../../../services/utilidades.service';

export class CancelacionAsignaturasStrategy implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private pdfService: PdfService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });

        // Texto para el asunto
        const textAsunto = `Asunto: Solicitud de cancelación de asignaturas\n`;

        // Texto para la solicitud
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar la cancelación de las asignaturas relacionadas en la tabla a continuación,`;

        // Texto para el motivo
        const textMotivo = `La presente solicitud obedece a que ${this.servicioRadicar.motivoDeSolicitud.toLowerCase()}.`;

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

        // Datos para la tabla
        const headers = ['No.', 'Asignatura', 'Docente'];
        const data = this.servicioRadicar.datosAsignAdiCancel.map(
            (item, index) => [
                (index + 1).toString(),
                item.nombreAsignatura,
                item.docente.nombreTutor,
            ]
        );

        // Añadir tabla
        cursorY = this.pdfService.agregarTablaPersonalizada(
            doc,
            cursorY,
            headers,
            data,
            marcaDeAgua
        );

        // Añadir motivo
        cursorY = this.pdfService.agregarTexto(doc, {
            text: textMotivo,
            startY: cursorY,
            alignment: 'justify',
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

        // Retornar el documento generado
        return doc;
    }
}
