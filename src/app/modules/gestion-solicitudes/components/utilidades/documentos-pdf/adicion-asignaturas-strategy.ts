import jsPDF from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { GestorService } from '../../../services/gestor.service';

// Subestrategia para la carta de solicitud
export class SolicitudAdicionAsignaturas implements DocumentoPDFStrategy {
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

// Subestrategia para la respuesta del comité
export class RespuestaComiteAdicionAsignaturas implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService,
        private servicioGestor: GestorService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });
        console.log(this.servicioGestor.estadoSolicitud);

        const textAsunto = `Asunto: Respuesta a Solicitud ${this.servicioGestor.infoSolicitud.datosComunSolicitud.radicado} de Adición de Asignaturas\n`;
        const textCuerpo = `Reciba un cordial saludo. Por medio de la presente me dirijo a usted con el fin de informar que en sesión del dia XX de XXXX de XXXX el Comité de Programa revisó su solicitud con radicado ${this.servicioGestor.infoSolicitud.datosComunSolicitud.radicado} referente a la Adición de Asignaturas, emitiendo el siguiente concepto:`;
        const textConcepto = `\nAval del comite: Si/No\nConcepto emitido: 'Simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias desde el año 1500, cuando un impresor (N. del T. persona que se dedica a la imprenta) desconocido usó una galería de textos y los mezcló de tal manera que logró hacer un libro de textos especimen. No sólo sobrevivió 500 años, sino que tambien ingresó como texto de relleno en documentos electrónicos, quedando esencialmente igual al original. Fue popularizado en los 60s con la creación de las hojas "Letraset", las cuales contenian pasajes de Lorem Ipsum, y más recientemente con software de autoedición, como por ejemplo Aldus PageMaker, el cual incluye versiones de Lorem Ipsum'`;

        let cursorY = this.servicioPDF.agregarContenidoComun(
            doc,
            marcaDeAgua,
            'solicitante'
        );
        cursorY = this.servicioPDF.agregarAsuntoYSolicitud(
            doc,
            cursorY,
            textAsunto,
            textCuerpo,
            marcaDeAgua
        );

        cursorY = this.servicioPDF.agregarTexto(doc, {
            text: textConcepto,
            startY: cursorY,
        });

        cursorY = this.servicioPDF.agregarDespedida(doc, cursorY, marcaDeAgua);

        return doc;
    }
}

// Subestrategia para el oficio para el concejo
export class OficioConcejoAdicionAsignaturas implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });

        const textAsunto = `Asunto: Oficio al Concejo sobre Adición de Asignaturas\n`;
        const textCuerpo = `Me permito remitir al Concejo la solicitud de adición de asignaturas...`;

        let cursorY = this.servicioPDF.agregarContenidoComun(doc, marcaDeAgua);
        cursorY = this.servicioPDF.agregarAsuntoYSolicitud(
            doc,
            cursorY,
            textAsunto,
            textCuerpo,
            marcaDeAgua
        );

        cursorY = this.servicioPDF.agregarDespedida(doc, cursorY, marcaDeAgua);

        return doc;
    }
}

// Subestrategia para el oficio para el concejo
export class RespuestaConcejoAdicionAsignaturas
    implements DocumentoPDFStrategy
{
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });

        const textAsunto = `Asunto: Oficio al Concejo sobre Adición de Asignaturas\n`;
        const textCuerpo = `Me permito remitir al Concejo la solicitud de adición de asignaturas...`;

        let cursorY = this.servicioPDF.agregarContenidoComun(doc, marcaDeAgua);
        cursorY = this.servicioPDF.agregarAsuntoYSolicitud(
            doc,
            cursorY,
            textAsunto,
            textCuerpo,
            marcaDeAgua
        );

        cursorY = this.servicioPDF.agregarDespedida(doc, cursorY, marcaDeAgua);

        return doc;
    }
}
