import { jsPDF } from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { UtilidadesService } from '../../../services/utilidades.service';

export class SolicitudApoyoPublicOInscrip implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private pdfService: PdfService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });

        // Obtener el rango de fechas
        const rangoFechas = this.servicioUtilidades.describirRangoFechas(
            this.servicioRadicar.fechasEstancia[0],
            this.servicioRadicar.fechasEstancia[1]
        );

        // Texto para el asunto
        const textAsunto = `Asunto: Solicitud de apoyo económico para asistencia a evento presentando artículo\n`;

        // Texto para la solicitud de inscripción
        const textSolicitud1 = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar un apoyo económico para el pago de la inscripción al evento "${this.servicioRadicar.nombreCongreso}" que se llevará a cabo del ${rangoFechas}. La presente solicitud está avalada por la dirección del ${this.servicioRadicar.grupoInvestigacion}, adicionalmente anexo la documentación e información requerida para su estudio.`;

        // Texto para la solicitud de publicación
        const textSolicitud2 = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar un apoyo económico para el pago de la publicación del trabajo titulado "${this.servicioRadicar.tituloPublicacion}" que se llevará a cabo del ${rangoFechas}. La presente solicitud está avalada por la dirección del ${this.servicioRadicar.grupoInvestigacion}, adicionalmente anexo la documentación e información requerida para su estudio.`;

        // Texto para los datos del apoyo económico
        const textDatosApoyo = `\nValor apoyo económico: COP $${
            this.servicioRadicar.valorApoyoEcon
        }\nEntidad Bancaria: ${this.servicioRadicar.banco}\nTipo de Cuenta: ${
            this.servicioRadicar.tipoCuenta
        }\nNúmero de Cuenta: ${this.servicioRadicar.numeroCuenta}\nTitular: ${
            this.servicioRadicar.formInfoPersonal.get('nombres').value
        } ${
            this.servicioRadicar.formInfoPersonal.get('apellidos').value
        }\nCédula: ${this.servicioRadicar.cedulaCuentaBanco}\nDirección: ${
            this.servicioRadicar.direccion
        }\n`;

        // Adjuntos
        const textAdjuntos = `${this.servicioRadicar.obtenerNombreArchivosAdjuntos()}`;

        // Añadir contenido común
        let cursorY = this.pdfService.agregarContenidoComun(doc, marcaDeAgua);

        // Añadir asunto y solicitud (usar solicitud1 o solicitud2 según sea necesario)
        cursorY = this.pdfService.agregarAsuntoYSolicitud(
            doc,
            cursorY,
            textAsunto,
            textSolicitud1, // Aquí puedes cambiar a textSolicitud2 según el caso
            marcaDeAgua
        );

        // Añadir datos del apoyo económico
        cursorY = this.pdfService.agregarTexto(doc, {
            text: textDatosApoyo,
            startY: cursorY,
            watermark: marcaDeAgua,
        });

        // Añadir despedida
        cursorY = this.pdfService.agregarDespedida(doc, cursorY, marcaDeAgua);

        // Añadir espacios de firmas
        cursorY = this.pdfService.agregarEspaciosDeFirmas(
            doc,
            cursorY,
            true,
            marcaDeAgua
        );

        // Añadir adjuntos
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

export class RespuestaComiteApoyoPublicOInscrip
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

export class OficioConcejoApoyoPublicOInscrip implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        throw new Error('Method not implemented.');
    }
}

export class RespuestaConcejoApoyoPublicOInscrip
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
