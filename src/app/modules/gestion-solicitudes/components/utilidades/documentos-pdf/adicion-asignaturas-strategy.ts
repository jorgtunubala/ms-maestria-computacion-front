import jsPDF from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { GestorService } from '../../../services/gestor.service';
import { UtilidadesService } from '../../../services/utilidades.service';

// Subestrategia para la carta de solicitud
export class SolicitudAdicionAsignaturas implements DocumentoPDFStrategy {
    constructor(private servicioRadicar: RadicarService, private servicioPDF: PdfService) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });

        const textAsunto = `Asunto: Solicitud de Adición de Asignaturas\n`;
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar la adición de las asignaturas relacionadas en la tabla a continuación,`;

        let cursorY = this.servicioPDF.agregarContenidoComun(doc, marcaDeAgua);
        cursorY = this.servicioPDF.agregarAsuntoYSolicitud(doc, cursorY, textAsunto, textSolicitud, marcaDeAgua);

        const headers = ['No.', 'Asignatura', 'Docente'];
        const data = this.servicioRadicar.datosAsignAdiCancel.map((item, index) => [
            (index + 1).toString(),
            item.nombreAsignatura,
            item.docente.nombreTutor,
        ]);

        cursorY = this.servicioPDF.agregarTablaPersonalizada(doc, cursorY, headers, data, marcaDeAgua);
        cursorY = this.servicioPDF.agregarDespedida(doc, cursorY, marcaDeAgua);
        cursorY = this.servicioPDF.agregarEspaciosDeFirmas(doc, cursorY, false, marcaDeAgua);

        return doc;
    }
}

// Subestrategia para la respuesta del comité
export class RespuestaComiteAdicionAsignaturas implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService, // NO ELIMINAR
        private servicioPDF: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });

        const { radicado } = this.servicioGestor.infoSolicitud.datosComunSolicitud;
        const fechaComite = this.servicioGestor.conceptoComite.fecha.split('/');
        const mesEnLetras = this.servicioUtilidades.obtenerMesEnLetras(Number(fechaComite[1]));

        const txtAsunto = `Asunto: Respuesta a Solicitud ${radicado} de Adición de Asignaturas\n`;
        const txtCuerpo = `Reciba un cordial saludo. Por medio de la presente me dirijo a usted con el fin de informar que en sesión del día ${fechaComite[0]} de ${mesEnLetras} de ${fechaComite[2]} el Comité de Programa revisó su solicitud con radicado ${radicado} referente a la Adición de Asignaturas, decidiendo NO AVALAR la solicitud y emite el siguiente concepto:`;
        const txtConcepto = `\n${this.servicioGestor.conceptoComite.concepto}`;
        const txtRemitente = `NOMBRE COORDINADOR DEL PROGRAMA\nCoordinador(a) Maestría en Computación`;

        let posicionY = this.servicioPDF.agregarContenidoComun(documento, marcaDeAgua, 'solicitante');
        posicionY = this.servicioPDF.agregarAsuntoYSolicitud(documento, posicionY, txtAsunto, txtCuerpo, marcaDeAgua);
        posicionY = this.servicioPDF.agregarTexto(documento, {
            text: txtConcepto,
            startY: posicionY,
            alignment: 'justify',
        });

        posicionY = this.servicioPDF.agregarDespedida(documento, posicionY + 5, marcaDeAgua, 'respuesta');
        posicionY = this.servicioPDF.agregarTexto(documento, {
            text: txtRemitente,
            startY: posicionY + 10,
            watermark: marcaDeAgua,
        });

        return documento;
    }
}

// Subestrategia para el oficio para el concejo
export class OficioConcejoAdicionAsignaturas implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService,
        private servicioGestor: GestorService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });

        const textAsunto = `Asunto: Solicitud de Adicion de Asignaturas para la estudiante ${this.servicioGestor.infoSolicitud.datosComunSolicitud.nombreSolicitante} ${this.servicioGestor.infoSolicitud.datosComunSolicitud.apellidoSolicitante} \n`;
        const textCuerpo = `Me permito remitir al Concejo la solicitud de adición de asignaturas...`;
        const txtRemitente = `NOMBRE COORDINADOR DEL PROGRAMA\nCoordinador(a) Maestría en Computación`;

        let posicionY = this.servicioPDF.agregarContenidoComun(documento, marcaDeAgua, 'consejo');
        posicionY = this.servicioPDF.agregarAsuntoYSolicitud(documento, posicionY, textAsunto, textCuerpo, marcaDeAgua);

        posicionY = this.servicioPDF.agregarDespedida(documento, posicionY + 5, marcaDeAgua);
        posicionY = this.servicioPDF.agregarTexto(documento, {
            text: txtRemitente,
            startY: posicionY + 10,
            watermark: marcaDeAgua,
        });

        return documento;
    }
}

// Subestrategia para el oficio para el concejo
export class RespuestaConcejoAdicionAsignaturas implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });

        const { radicado } = this.servicioGestor.infoSolicitud.datosComunSolicitud;

        const txtAsunto = `Asunto: Respuesta a Solicitud ${radicado} de Adición de Asignaturas\n`;
        const txtCuerpo = `Reciba un cordial saludo. Por medio de la presente me dirijo a usted con el fin de informar que su solicitud con radicado ${radicado} referente a la Adición de Asignaturas, fue revisada por el Consejo de Facultad decidiendo... `;
        const txtRemitente = `NOMBRE COORDINADOR DEL PROGRAMA\nCoordinador(a) Maestría en Computación`;

        let posicionY = this.servicioPDF.agregarContenidoComun(documento, marcaDeAgua, 'solicitante');
        posicionY = this.servicioPDF.agregarAsuntoYSolicitud(documento, posicionY, txtAsunto, txtCuerpo, marcaDeAgua);

        posicionY = this.servicioPDF.agregarDespedida(documento, posicionY + 5, marcaDeAgua, 'respuesta');
        posicionY = this.servicioPDF.agregarTexto(documento, {
            text: txtRemitente,
            startY: posicionY + 10,
            watermark: marcaDeAgua,
        });

        return documento;
    }
}
