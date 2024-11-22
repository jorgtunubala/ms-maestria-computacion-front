import { DocumentoPDFStrategy } from "../../../models/documentos/documento-pdf-strategy.model";
import { RadicarService } from "../../../services/radicar.service";
import { PdfService } from '../../../services/pdf.service';
import { GestorService } from "../../../services/gestor.service";
import { UtilidadesService } from "../../../services/utilidades.service";
import jsPDF from 'jspdf';

export class SolicitudAdicionAsignaturas implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });
        const asunto = `Asunto: Solicitud de Adición de Asignaturas\n`;
        const cuerpoSolicitud = `Reciban un cordial saludo. Comedidamente me dirijo a ustedes con el fin de solicitar la adición de las asignaturas relacionadas a continuación.`;

        let cursorY = this.servicioPDF.agregarContenidoComun(documento, marcaDeAgua);
        cursorY = this.servicioPDF.agregarAsuntoYSolicitud(documento, cursorY, asunto, cuerpoSolicitud, marcaDeAgua);

        const encabezados = ['No.', 'Asignatura', 'Grupo', 'Docente'];
        const datosTabla = this.servicioRadicar.datosAsignAdiCancel.map((item, index) => [
            (index + 1).toString(),
            item.nombreAsignatura,
            item.grupoAsignatura,
            item.docente.nombreTutor,
        ]);

        cursorY = this.servicioPDF.agregarTablaPersonalizada(documento, cursorY, encabezados, datosTabla, marcaDeAgua);
        cursorY = this.servicioPDF.agregarDespedida(documento, cursorY, marcaDeAgua);
        cursorY = this.servicioPDF.agregarEspaciosDeFirmas(documento, cursorY, false, true, marcaDeAgua);

        return documento;
    }
}