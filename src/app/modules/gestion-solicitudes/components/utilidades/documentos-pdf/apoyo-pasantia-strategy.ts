import { jsPDF } from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { UtilidadesService } from '../../../services/utilidades.service';
import { GestorService } from '../../../services/gestor.service';

export class SolicitudApoyoEconomicoPasantia implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService,
        private servicioGestor: GestorService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });

        // Obtener el rango de fechas de la estancia
        const rangoFechas = this.servicioUtilidades.describirRangoFechas(
            this.servicioRadicar.fechasEstancia[0],
            this.servicioRadicar.fechasEstancia[1]
        );

        // Texto para el asunto
        const textAsunto = `Asunto: Solicitud de Apoyo Económico para Pasantía de Investigación\n`;

        // Texto para la solicitud
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar un apoyo económico para realizar una estancia de investigación en la ${this.servicioRadicar.UniversidadExternaPasantia}, ${this.servicioRadicar.lugarEstancia}, durante el periodo comprendido entre el ${rangoFechas}. Esta solicitud está avalada por la dirección del ${this.servicioRadicar.grupoInvestigacion} de la Universidad del Cauca. Adicionalmente, la pasantía se llevará a cabo con la colaboración del ${this.servicioRadicar.grupoInvestigacionExternoPanatia} de la ${this.servicioRadicar.UniversidadExternaPasantia} bajo la supervisión del docente ${this.servicioRadicar.docenteExternoPas}. Anexo la documentación requerida para este proceso.`;

        // Texto para los datos del apoyo económico
        const textDatosApoyo = `\nA continuación, incluyo los detalles del apoyo solicitado:
        \nValor apoyo económico: COP $${this.servicioUtilidades.numeroAMoneda(
            this.servicioRadicar.valorApoyoEcon
        )}\nEntidad Bancaria: ${this.servicioRadicar.banco}\nTipo de Cuenta: ${
            this.servicioRadicar.tipoCuenta
        }\nNúmero de Cuenta: ${this.servicioRadicar.numeroCuenta}\nTitular: ${
            this.servicioRadicar.formInfoPersonal.get('nombres').value
        } ${this.servicioRadicar.formInfoPersonal.get('apellidos').value}\nCédula: ${
            this.servicioRadicar.formInfoPersonal.get('numeroDocumento').value
        }\n\nContacto:
        \nCelular: ${this.servicioRadicar.formInfoPersonal.get('celular').value}\nCorreo: ${
            this.servicioRadicar.formInfoPersonal.get('correo').value
        }\nDirección: ${this.servicioRadicar.direccion}\n`;

        // Adjuntar archivos
        const textAdjuntos = `${this.servicioRadicar.obtenerNombreArchivosAdjuntos()}`;

        // Añadir contenido común al documento
        let cursorY = this.servicioPDF.agregarContenidoComun(doc, marcaDeAgua);

        // Añadir asunto y solicitud
        cursorY = this.servicioPDF.agregarAsuntoYSolicitud(doc, cursorY, textAsunto, textSolicitud, marcaDeAgua);

        // Añadir los datos del apoyo económico
        cursorY = this.servicioPDF.agregarTexto(doc, {
            text: textDatosApoyo,
            startY: cursorY,
            watermark: marcaDeAgua,
        });

        // Añadir despedida
        cursorY = this.servicioPDF.agregarDespedida(doc, cursorY, marcaDeAgua);

        // Añadir espacios de firmas
        cursorY = this.servicioPDF.agregarEspaciosDeFirmas(doc, cursorY, true, marcaDeAgua);

        // Añadir adjuntos
        this.servicioPDF.agregarListadoAdjuntos(doc, cursorY, textAdjuntos, marcaDeAgua);

        // Retornar el documento generado
        return doc;
    }
}

export class RespuestaComiteApoyoEconomicoPasantia implements DocumentoPDFStrategy {
    constructor(private servicioRadicar: RadicarService, private servicioPDF: PdfService) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });
        return documento;
    }
}

export class OficioConcejoApoyoEconomicoPasantia implements DocumentoPDFStrategy {
    constructor(private servicioRadicar: RadicarService, private servicioPDF: PdfService) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });
        return documento;
    }
}

export class RespuestaConcejoApoyoEconomicoPasantia implements DocumentoPDFStrategy {
    constructor(private servicioRadicar: RadicarService, private servicioPDF: PdfService) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const documento = new jsPDF({ format: 'letter' });
        return documento;
    }
}
