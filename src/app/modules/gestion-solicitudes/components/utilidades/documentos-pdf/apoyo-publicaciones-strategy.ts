import { jsPDF } from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { UtilidadesService } from '../../../services/utilidades.service';
import { Console } from 'console';
import { GestorService } from '../../../services/gestor.service';

export class SolicitudApoyoPublicOInscrip implements DocumentoPDFStrategy {
    // Se deben incluir todos los servicios que define la fabrica asi no se usen
    constructor(
        private servicioRadicar: RadicarService,
        private pdfService: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });

        // Obtener el rango de fechas

        let rangoFechas = '';

        if (this.servicioRadicar.tipoApoyo === 'inscripcion') {
            rangoFechas = this.servicioUtilidades.describirRangoFechas(
                this.servicioRadicar.fechasEstancia[0],
                this.servicioRadicar.fechasEstancia[1]
            );
        }

        // Texto para el asunto
        let textAsunto = '';
        let textSolicitud = '';

        if (this.servicioRadicar.tipoApoyo === 'inscripcion') {
            textAsunto = `Asunto: Solicitud de apoyo económico para el pago de inscripción a evento\n`;
            textSolicitud = `Reciban cordial saludo. Comedidamente, me dirijo a ustedes con el fin de solicitar un apoyo económico para el pago de la inscripción al evento "${this.servicioRadicar.nombreCongreso}" que se llevará a cabo en ${this.servicioRadicar.lugarEstancia} del ${rangoFechas}. La presente solicitud está avalada por la dirección del ${this.servicioRadicar.grupoInvestigacion}.`;
        }
        if (this.servicioRadicar.tipoApoyo === 'publicacion') {
            textAsunto = `Asunto: Solicitud de apoyo económico para el pago de publicación de ${this.servicioRadicar.tipoCongreso}\n`;

            const nombreRevistaLibro = this.servicioRadicar.nombreRevistaLibro
                ? ` en "${this.servicioRadicar.nombreRevistaLibro}"`
                : '';

            textSolicitud = `Reciban cordial saludo. Comedidamente, me dirijo a ustedes con el fin de solicitar un apoyo económico para cubrir los gastos de publicación del trabajo titulado "${this.servicioRadicar.tituloPublicacion}", el cual ha sido aceptado para su publicación como ${this.servicioRadicar.tipoCongreso}${nombreRevistaLibro}. La presente solicitud está avalada por la dirección del ${this.servicioRadicar.grupoInvestigacion}.`;
        }

        // Texto para los datos del apoyo económico
        const textDatosApoyo = `\nValor apoyo económico: COP $${this.servicioUtilidades.numeroAMoneda(
            this.servicioRadicar.valorApoyoEcon
        )}\nEntidad Bancaria: ${this.servicioRadicar.banco}\nTipo de Cuenta: ${
            this.servicioRadicar.tipoCuenta
        }\nNúmero de Cuenta: ${this.servicioRadicar.numeroCuenta}
        \nDatos del solicitante:
        \nNombre: ${this.servicioRadicar.formInfoPersonal.get('nombres').value} ${
            this.servicioRadicar.formInfoPersonal.get('apellidos').value
        }\nCédula: ${this.servicioRadicar.formInfoPersonal.get('numeroDocumento').value}\nCelular: ${
            this.servicioRadicar.formInfoPersonal.get('celular').value
        }\nCorreo: ${this.servicioRadicar.formInfoPersonal.get('correo').value}\nDirección: ${
            this.servicioRadicar.direccion
        }
        \nInstrucciones especiales para el pago de la factura: ${this.servicioRadicar.InfoDePago}\n`;

        // Adjuntos
        const textAdjuntos = `${this.servicioRadicar.obtenerNombreArchivosAdjuntos()}`;

        // Añadir contenido común
        let cursorY = this.pdfService.agregarContenidoComun(doc, marcaDeAgua);

        // Añadir asunto y solicitud (usar solicitud1 o solicitud2 según sea necesario)
        cursorY = this.pdfService.agregarAsuntoYSolicitud(
            doc,
            cursorY,
            textAsunto,
            textSolicitud, // Aquí puedes cambiar a textSolicitud2 según el caso
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
        cursorY = this.pdfService.agregarEspaciosDeFirmas(doc, cursorY, true, true, marcaDeAgua);

        // Añadir adjuntos
        this.pdfService.agregarListadoAdjuntos(doc, cursorY, textAdjuntos, marcaDeAgua);

        // Retornar el documento generado
        return doc;
    }
}

export class RespuestaComiteApoyoPublicOInscrip implements DocumentoPDFStrategy {
    // Se deben incluir todos los servicios que define la fabrica asi no se usen
    constructor(
        private servicioRadicar: RadicarService,
        private pdfService: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });
        return documento;
    }
}

export class OficioConcejoApoyoPublicOInscrip implements DocumentoPDFStrategy {
    // Se deben incluir todos los servicios que define la fabrica asi no se usen
    constructor(
        private servicioRadicar: RadicarService,
        private pdfService: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });
        return documento;
    }
}

export class RespuestaConcejoApoyoPublicOInscrip implements DocumentoPDFStrategy {
    // Se deben incluir todos los servicios que define la fabrica asi no se usen
    constructor(
        private servicioRadicar: RadicarService,
        private pdfService: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });
        return documento;
    }
}
