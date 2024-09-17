import { jsPDF } from 'jspdf';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { UtilidadesService } from '../../../services/utilidades.service';

export class ApoyoEconomicoCongresosStrategy implements DocumentoPDFStrategy {
    constructor(
        private servicioRadicar: RadicarService,
        private pdfService: PdfService,
        private servicioUtilidades: UtilidadesService
    ) {}

    generarDocumento(marcaDeAgua: boolean): jsPDF {
        const doc = new jsPDF({ format: 'letter' });

        // Formatear rango de fechas
        const rangoFechas = this.servicioUtilidades.describirRangoFechas(
            this.servicioRadicar.formApoyoAsistEvento.get('fechas').value[0],
            this.servicioRadicar.formApoyoAsistEvento.get('fechas').value[1]
        );

        // Generar texto del asunto
        const textAsunto = `Asunto: Solicitud de apoyo económico para asistencia a evento presentando artículo\n`;

        // Generar texto de la solicitud
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar un apoyo económico para asistir al evento "${
            this.servicioRadicar.formApoyoAsistEvento.get('nombreCongreso')
                .value
        }" que se llevará a cabo del ${rangoFechas}, y donde se hará la publicación del trabajo titulado "${
            this.servicioRadicar.formApoyoAsistEvento.get('tituloPublicacion')
                .value
        }". La presente solicitud está avalada por la dirección del ${
            this.servicioRadicar.grupoInvestigacion
        }, adicionalmente anexo la documentación e información requerida para su estudio.`;

        // Generar texto de datos del apoyo económico
        const textDatosApoyo = `\nValor apoyo económico: COP $${
            this.servicioRadicar.formApoyoAsistEvento.get('valorApoyo').value
        }\nEntidad Bancaria: ${
            this.servicioRadicar.formApoyoAsistEvento.get('entidadBancaria')
                .value
        }\nTipo de Cuenta: ${
            this.servicioRadicar.formApoyoAsistEvento.get('tipoCuenta').value
        }\nNúmero de Cuenta: ${
            this.servicioRadicar.formApoyoAsistEvento.get('numeroCuenta').value
        }\nTitular: ${
            this.servicioRadicar.formInfoPersonal.get('nombres').value
        } ${
            this.servicioRadicar.formInfoPersonal.get('apellidos').value
        }\nCédula: ${
            this.servicioRadicar.formApoyoAsistEvento.get(
                'numeroCedulaAsociada'
            ).value
        }\nDirección: ${
            this.servicioRadicar.formApoyoAsistEvento.get('direccionResidencia')
                .value
        }\n`;

        // Adjuntar archivos
        const textAdjuntos = `${this.servicioRadicar.obtenerNombreArchivosAdjuntos()}`;

        // Añadir contenido común
        let cursorY = this.pdfService.agregarContenidoComun(doc, marcaDeAgua);

        // Añadir asunto y solicitud
        cursorY = this.pdfService.agregarAsuntoYSolicitud(
            doc,
            cursorY,
            textAsunto,
            textSolicitud,
            marcaDeAgua
        );

        // Añadir datos de apoyo económico
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
