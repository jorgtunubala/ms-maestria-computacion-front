import { jsPDF } from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { UtilidadesService } from '../../../services/utilidades.service';

export class SolicitudDeBeca implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private pdfService: PdfService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });

        // Obtener datos del formulario
        const tipoBeca =
            this.servicioRadicar.formSolicitudBecaDescuento.get(
                'tipoBeca'
            ).value;
        const justificacion = this.servicioRadicar.formSolicitudBecaDescuento
            .get('justificacion')
            .value.toLowerCase();

        // Texto para el asunto
        const textAsunto = `Asunto: Solicitud de ${tipoBeca}\n`;

        // Texto para la solicitud
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar el otorgamiento de una "${tipoBeca}".`;

        // Texto adicional según el tipo de beca
        const textMotivoBeca = ` La presente solicitud obedece a que ${justificacion}`;
        const textComplemento = ` Adjunto a esta solicitud el formato FA diligenciado con los datos correspondientes para su estudio.`;

        // Obtener los nombres de los archivos adjuntos
        const textAdjuntos = `${this.servicioRadicar.obtenerNombreArchivosAdjuntos()}`;

        // Añadir contenido común
        let cursorY = this.pdfService.agregarContenidoComun(doc, marcaDeAgua);

        // Añadir asunto y solicitud según el tipo de beca
        if (tipoBeca === 'Beca - Trabajo') {
            cursorY = this.pdfService.agregarAsuntoYSolicitud(
                doc,
                cursorY,
                textAsunto,
                textSolicitud + textMotivoBeca,
                marcaDeAgua
            );
        } else if (
            tipoBeca === 'Beca - Convenio (cidesco)' ||
            tipoBeca === 'Beca - Mejor promedio en pregrado'
        ) {
            cursorY = this.pdfService.agregarAsuntoYSolicitud(
                doc,
                cursorY,
                textAsunto,
                textSolicitud + textComplemento,
                marcaDeAgua
            );
        }

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

        // Añadir listado de adjuntos si es necesario
        if (
            tipoBeca === 'Beca - Convenio (cidesco)' ||
            tipoBeca === 'Beca - Mejor promedio en pregrado'
        ) {
            this.pdfService.agregarListadoAdjuntos(
                doc,
                cursorY,
                textAdjuntos,
                marcaDeAgua
            );
        }

        // Retornar el documento generado
        return doc;
    }
}

export class RespuestaComiteSolicitudDeBeca implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        throw new Error('Method not implemented.');
    }
}

export class OficioConcejoSolicitudDeBeca implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        throw new Error('Method not implemented.');
    }
}

export class RespuestaConcejoSolicitudDeBeca implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        throw new Error('Method not implemented.');
    }
}
