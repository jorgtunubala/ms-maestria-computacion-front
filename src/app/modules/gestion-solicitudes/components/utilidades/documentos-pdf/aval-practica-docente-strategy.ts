import { jsPDF } from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { UtilidadesService } from '../../../services/utilidades.service';
import { GestorService } from '../../../services/gestor.service';

export class SolicitudAvalPracticaDocente implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private pdfService: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });

        // Texto para el asunto
        const textAsunto = `Asunto: Solicitud de aval para la realización de actividades de práctica docente\n`;

        // Texto para la solicitud
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar el aval para la realización de las actividades de práctica docente descritas a continuación:`;

        // Adjuntos
        const textAdjuntos = `${this.servicioRadicar.obtenerNombreArchivosAdjuntos()}`;

        // Añadir contenido común
        let cursorY = this.pdfService.agregarContenidoComun(doc, marcaDeAgua);

        // Añadir asunto y solicitud
        cursorY = this.pdfService.agregarAsuntoYSolicitud(doc, cursorY, textAsunto, textSolicitud, marcaDeAgua);

        // Salto de línea
        doc.text('', 5, cursorY);
        cursorY += 5;

        // Añadir actividades seleccionadas
        for (let index = 0; index < this.servicioRadicar.actividadesSeleccionadas.length; index++) {
            const titulo = `${index + 1}. ${this.servicioRadicar.actividadesSeleccionadas[index].nombre} - ${
                this.servicioRadicar.horasAsignables[index]
            }h`;
            const descripcion = `${this.servicioRadicar.descripcionesActividades[index]}`;

            // Añadir título de la actividad
            cursorY = this.pdfService.agregarTexto(doc, {
                text: titulo,
                startY: cursorY,
                fontStyle: 'bold',
                watermark: marcaDeAgua,
            });

            // Añadir descripción de la actividad
            cursorY = this.pdfService.agregarTexto(doc, {
                text: descripcion,
                startY: cursorY,
                fontStyle: 'regular',
                alignment: 'justify',
                watermark: marcaDeAgua,
            });

            // Salto de línea
            doc.text('', 5, cursorY);
            cursorY += 5;
        }

        // Añadir despedida
        cursorY = this.pdfService.agregarDespedida(doc, cursorY, marcaDeAgua);

        // Añadir espacios para firmas
        cursorY = this.pdfService.agregarEspaciosDeFirmas(doc, cursorY, false, marcaDeAgua);

        if (textAdjuntos != '') {
            cursorY = this.pdfService.agregarListadoAdjuntos(doc, cursorY, textAdjuntos, marcaDeAgua);
        }

        // Retornar el documento generado
        return doc;
    }
}

export class RespuestaComiteAvalPracticaDocente implements DocumentoPDFStrategy {
    // Se deben incluir todos los servicios que define la fabrica asi no se usen
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });

        const { radicado } = this.servicioGestor.infoSolicitud.datosComunSolicitud;
        const fechaComite = this.servicioGestor.conceptoComite.fechaAval.split('/');
        const mesEnLetras = this.servicioUtilidades.obtenerMesEnLetras(Number(fechaComite[1]));

        const txtAsunto = `Asunto: Respuesta a Solicitud ${radicado} de Aval para la realización de actividades de práctica docente\n`;
        const txtCuerpo = `Reciba un cordial saludo. Por medio de la presente me dirijo a usted con el fin de informar que en sesión del día ${
            fechaComite[0]
        } de ${mesEnLetras} de ${
            fechaComite[2]
        } el Comité de Programa revisó su solicitud con radicado ${radicado} referente al aval para la realización de actividades de práctica docente, ${
            this.servicioGestor.conceptoComite.avaladoComite === 'Si'
                ? 'decidiendo aprobar su solicitud bajo el siguiente concepto'
                : 'decidiendo no aprobar su solicitud bajo el siguiente concepto'
        }`;
        const txtConcepto = `\n${this.servicioGestor.conceptoComite.conceptoComite}`;
        const txtRemitente = `${this.servicioGestor.coordinador.nombre.toUpperCase()}\nCoordinador(a) Maestría en Computación`;

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

export class OficioConcejoAvalPracticaDocente implements DocumentoPDFStrategy {
    constructor(private servicioRadicar: RadicarService, private servicioPDF: PdfService) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        throw new Error('Method not implemented.');
    }
}

export class RespuestaConcejoAvalPracticaDocente implements DocumentoPDFStrategy {
    constructor(private servicioRadicar: RadicarService, private servicioPDF: PdfService) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        throw new Error('Method not implemented.');
    }
}
