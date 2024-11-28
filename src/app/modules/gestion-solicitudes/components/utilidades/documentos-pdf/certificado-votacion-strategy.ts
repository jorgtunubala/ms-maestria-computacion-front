import { DocumentoPDFStrategy } from "../../../models/documentos/documento-pdf-strategy.model";
import { RadicarService } from "../../../services/radicar.service";
import { PdfService } from '../../../services/pdf.service';
import { GestorService } from "../../../services/gestor.service";
import { UtilidadesService } from "../../../services/utilidades.service";
import jsPDF from 'jspdf';
import { PDFDocument } from 'pdf-lib';

export class SolicitudRegistroVoto implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });
        const asunto = `Asunto: Solicitud de Registro de certificado votación\n`;
        const cuerpoSolicitud = `Reciban un cordial saludo. Comedidamente me dirijo a ustedes con el fin de solicitar la adición de las asignaturas relacionadas a continuación.`;
        const datosRemitente =`${this.servicioRadicar.formInfoPersonal.get('nombres').value} ${this.servicioRadicar.formInfoPersonal.get('apellidos').value}`;
        
        let cursorY = this.servicioPDF.agregarContenidoComun(documento, marcaDeAgua);
        cursorY = this.servicioPDF.agregarAsuntoYSolicitud(documento, cursorY, asunto, cuerpoSolicitud, marcaDeAgua);

        const textAdjuntos = `${this.servicioRadicar.obtenerNombreArchivosAdjuntos()}`;

        cursorY = this.servicioPDF.agregarDespedida(documento, cursorY, marcaDeAgua);
        cursorY = this.servicioPDF.agregarTexto(documento, { text: datosRemitente, startY: cursorY+10, alignment: 'left' });

        // Añadir adjuntos
        cursorY = this.servicioPDF.agregarListadoAdjuntos(documento, cursorY, textAdjuntos, marcaDeAgua);
        
        return documento;
    }
}