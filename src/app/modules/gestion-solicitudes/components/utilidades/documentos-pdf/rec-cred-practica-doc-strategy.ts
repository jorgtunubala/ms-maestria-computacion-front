import { jsPDF } from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { UtilidadesService } from '../../../services/utilidades.service';

export class RecoCredPracticaDocenteStrategy implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private pdfService: PdfService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });

        // Texto para el asunto
        const textAsunto = `Asunto: Solicitud de reconocimiento de créditos por actividades de práctica docente\n`;

        // Texto para la solicitud
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar el reconocimiento y asignación de los créditos que corresponden a la realización de las actividades de práctica docente enumeradas a continuación, para cada una se adjunta la documentación y/o material de soporte requerido para su estudio.`;

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

        // Salto de línea
        doc.text('', 5, cursorY);
        cursorY += 5;

        // Añadir actividades seleccionadas
        for (
            let index = 0;
            index < this.servicioRadicar.actividadesSeleccionadas.length;
            index++
        ) {
            const actividad = `• Actividad ${index + 1}: ${
                this.servicioRadicar.actividadesSeleccionadas[index].nombre
            } - ${this.servicioRadicar.horasAsignables[index]}h`;

            cursorY = this.pdfService.agregarTexto(doc, {
                text: actividad,
                startY: cursorY,
                fontStyle: 'regular',
                alignment: 'left',
                watermark: marcaDeAgua,
            });
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
