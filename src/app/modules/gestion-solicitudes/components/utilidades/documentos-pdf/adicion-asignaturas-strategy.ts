import jsPDF from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';

export class AdicionAsignaturasStrategy implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });

        const textAsunto = `Asunto: Solicitud de Adición de Asignaturas\n`;
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar la adición de las asignaturas relacionadas en la tabla a continuación,`;

        let cursorY = this.servicioPDF.agregarContenidoComun(doc, marcaDeAgua);
        cursorY = this.servicioPDF.agregarAsuntoYSolicitud(
            doc,
            cursorY,
            textAsunto,
            textSolicitud,
            marcaDeAgua
        );

        const headers = ['No.', 'Asignatura', 'Docente'];
        const data = this.servicioRadicar.datosAsignAdiCancel.map(
            (item, index) => [
                (index + 1).toString(),
                item.nombreAsignatura,
                item.docente.nombreTutor,
            ]
        );

        cursorY = this.servicioPDF.agregarTablaPersonalizada(
            doc,
            cursorY,
            headers,
            data,
            marcaDeAgua
        );
        cursorY = this.servicioPDF.agregarDespedida(doc, cursorY, marcaDeAgua);
        cursorY = this.servicioPDF.agregarEspaciosDeFirmas(
            doc,
            cursorY,
            false,
            marcaDeAgua
        );

        return doc;
    }
}
