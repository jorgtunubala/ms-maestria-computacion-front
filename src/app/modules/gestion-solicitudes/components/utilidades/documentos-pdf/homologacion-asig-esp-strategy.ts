import { jsPDF } from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { UtilidadesService } from '../../../services/utilidades.service';

export class SolicitudHomologAsignaturasEsp implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private pdfService: PdfService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });

        // Texto para el asunto
        const textAsunto = `Asunto: Solicitud de homologación de asignaturas Especialización en Desarrollo de Soluciones Informáticas\n`;

        // Texto para la solicitud
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar la homologación de las asignaturas relacionadas en la tabla a continuación, las cuales fueron cursadas en el programa de posgrado, ${this.servicioRadicar.datosInstitucionHomologar.programa} de la ${this.servicioRadicar.datosInstitucionHomologar.institucion}.`;

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
        const headers = [
            'Asignatura',
            'Créditos',
            'Intensidad (h/semana)',
            'Calificación',
        ];

        const data = this.servicioRadicar.datosAsignaturasAHomologar.map(
            (item) => [
                item.asignatura,
                item.creditos.toString(),
                item.intensidad.toString(),
                item.calificacion.toString(),
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

export class RespuestaComiteHomologAsignaturasEsp
    implements DocumentoPDFStrategy
{
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        throw new Error('Method not implemented.');
    }
}

export class OficioConcejoHomologAsignaturasEsp
    implements DocumentoPDFStrategy
{
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        throw new Error('Method not implemented.');
    }
}

export class RespuestaConcejoHomologAsignaturasEsp
    implements DocumentoPDFStrategy
{
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        throw new Error('Method not implemented.');
    }
}
