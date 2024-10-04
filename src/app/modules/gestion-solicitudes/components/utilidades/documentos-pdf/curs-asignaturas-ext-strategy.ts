import { jsPDF } from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { UtilidadesService } from '../../../services/utilidades.service';
import { GestorService } from '../../../services/gestor.service';

export class SolicitudCursarEnOtrosProgramas implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private pdfService: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });

        // Texto para el asunto
        const textAsunto = `Asunto: Solicitud para cursar asignaturas en otros programas\n`;

        // Texto para la solicitud
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar se me permita cursar las asignaturas relacionadas en la tabla a continuación y en los programas en mención. Adicionalmente adjunto la documentación requerida para el estudio de mi solicitud.`;

        // Texto para el motivo
        const textMotivo = `La presente solicitud obedece a que ${this.servicioRadicar.motivoDeSolicitud.toLowerCase()}.`;

        // Añadir contenido común
        let cursorY = this.pdfService.agregarContenidoComun(doc, marcaDeAgua);

        // Añadir asunto y solicitud
        cursorY = this.pdfService.agregarAsuntoYSolicitud(doc, cursorY, textAsunto, textSolicitud, marcaDeAgua);

        // Datos para la tabla
        const headers = ['Asignatura', 'Código', 'Créd.', 'Intens. Horaria', 'Grupo', 'Programa', 'Docente'];

        const data = this.servicioRadicar.datosAsignaturasExternas.map((item) => [
            item.nombre,
            item.codigo,
            item.creditos.toString(),
            item.intensidad.toString(),
            item.grupo,
            item.programa,
            item.docente,
        ]);

        // Añadir tabla
        cursorY = this.pdfService.agregarTablaPersonalizada(doc, cursorY, headers, data, marcaDeAgua);

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
        cursorY = this.pdfService.agregarEspaciosDeFirmas(doc, cursorY, false, marcaDeAgua);

        // Retornar el documento generado
        return doc;
    }
}

export class RespuestaComiteCursarEnOtrosProgramas implements DocumentoPDFStrategy {
    constructor(private servicioRadicar: RadicarService, private servicioPDF: PdfService) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        throw new Error('Method not implemented.');
    }
}

export class OficioConcejoCursarEnOtrosProgramas implements DocumentoPDFStrategy {
    constructor(private servicioRadicar: RadicarService, private servicioPDF: PdfService) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        throw new Error('Method not implemented.');
    }
}

export class RespuestaConcejoCursarEnOtrosProgramas implements DocumentoPDFStrategy {
    constructor(private servicioRadicar: RadicarService, private servicioPDF: PdfService) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        throw new Error('Method not implemented.');
    }
}
