import { jsPDF } from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { UtilidadesService } from '../../../services/utilidades.service';
import { GestorService } from '../../../services/gestor.service';

export class SolicitudAvalPracticaDocente implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private pdfService: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });

        // Texto para el asunto
        const textAsunto = `Asunto: Solicitud de aval para la realización de actividades de práctica docente\n`;

        // Texto para la solicitud
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar el aval para la realización de las actividades de práctica docente descritas a continuación:`;

        // Adjuntos
        const textAdjuntos = `${this.servicioRadicar.obtenerNombreArchivosAdjuntos()}`;

        // Añadir contenido común
        let cursorY = this.pdfService.agregarContenidoComun(doc, marcaDeAgua);

        // Añadir asunto y solicitud
        cursorY = this.pdfService.agregarAsuntoYSolicitud(doc, cursorY, textAsunto, textSolicitud, marcaDeAgua);

        // Salto de línea
        doc.text('', 5, cursorY);
        cursorY += 5;

        // Añadir actividades seleccionadas
        for (let index = 0; index < this.servicioRadicar.actividadesSeleccionadas.length; index++) {
            const titulo = `${index + 1}. ${this.servicioRadicar.actividadesSeleccionadas[index].nombre} - ${
                this.servicioRadicar.horasAsignables[index]
            }h`;
            const descripcion = `${this.servicioRadicar.descripcionesActividades[index]}`;

            // Añadir título de la actividad
            cursorY = this.pdfService.agregarTexto(doc, {
                text: titulo,
                startY: cursorY,
                fontStyle: 'bold',
                watermark: marcaDeAgua,
            });

            // Añadir descripción de la actividad
            cursorY = this.pdfService.agregarTexto(doc, {
                text: descripcion,
                startY: cursorY,
                fontStyle: 'regular',
                alignment: 'justify',
                watermark: marcaDeAgua,
            });

            // Salto de línea
            doc.text('', 5, cursorY);
            cursorY += 5;
        }

        // Añadir despedida
        cursorY = this.pdfService.agregarDespedida(doc, cursorY, marcaDeAgua);

        // Añadir espacios para firmas
        cursorY = this.pdfService.agregarEspaciosDeFirmas(doc, cursorY, false, marcaDeAgua);

        // Retornar el documento generado
        return doc;
    }
}

export class RespuestaComiteAvalPracticaDocente implements DocumentoPDFStrategy {
    constructor(private servicioRadicar: RadicarService, private servicioPDF: PdfService) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        throw new Error('Method not implemented.');
    }
}

export class OficioConcejoAvalPracticaDocente implements DocumentoPDFStrategy {
    constructor(private servicioRadicar: RadicarService, private servicioPDF: PdfService) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        throw new Error('Method not implemented.');
    }
}

export class RespuestaConcejoAvalPracticaDocente implements DocumentoPDFStrategy {
    constructor(private servicioRadicar: RadicarService, private servicioPDF: PdfService) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        throw new Error('Method not implemented.');
    }
}
