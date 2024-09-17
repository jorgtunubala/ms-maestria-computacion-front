import jsPDF from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';

export class AplazamientoSemestreStrategy implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });
        const textAsunto = `Asunto: Solicitud de aplazamiento de semestre\n`;

        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar el aplazamiento del ${
            this.servicioRadicar.formSemestreAplazar
                .get('semestre')
                .value.split('-')[1] === '1'
                ? 'primer'
                : 'segundo'
        } semestre de ${
            this.servicioRadicar.formSemestreAplazar
                .get('semestre')
                .value.split('-')[0]
        }. La presente solicitud obedece a que ${this.servicioRadicar.formSemestreAplazar
            .get('motivo')
            .value.toLowerCase()}.`;

        let cursorY = this.servicioPDF.agregarContenidoComun(doc, marcaDeAgua);
        cursorY = this.servicioPDF.agregarAsuntoYSolicitud(
            doc,
            cursorY,
            textAsunto,
            textSolicitud,
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
