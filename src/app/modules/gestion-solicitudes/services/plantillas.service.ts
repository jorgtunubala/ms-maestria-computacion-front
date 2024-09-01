import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { PdfService } from './pdf.service';
import { RadicarService } from './radicar.service';
import { UtilidadesService } from './utilidades.service';

@Injectable({
    providedIn: 'root',
})
export class PlantillasService {
    fechaActual: Date = new Date();
    nombresMes: string[] = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
    ];

    constructor(
        private servicioPDF: PdfService,
        private servicioRadicar: RadicarService,
        private servicioUtilidades: UtilidadesService
    ) {}

    adicionAsignaturas(MarcaDeAgua: boolean) {
        const doc = new jsPDF({ format: 'letter' });

        // Añadir primera página con la plantilla
        this.servicioPDF.agregarMembretes(doc, MarcaDeAgua);
        this.servicioPDF.setDefaultTextStyle(doc); // Aplicar estilo inicial

        // Texto de la Solicitud
        const textLugarFecha = `Popayán, ${this.fechaActual.getDate()} de ${
            this.nombresMes[this.fechaActual.getMonth()]
        } del ${this.fechaActual.getFullYear()}\n`;
        const textDestinatario = `Señores\nComité de Programa Maestría en Computación\nAtte: Dra Luz Marina Sierra\nCoordinadora programa\nUniversidad del Cauca\n`;
        const textAsunto = `Asunto: Solicitud de Adición de Asignaturas\n`;
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar la adición de las asignaturas relacionadas en la tabla a continuación,`;
        const textDespedida = `Sin ningún otro motivo en particular, agradezco la atención brindada y quedo a la espera de su respuesta.\n\nUniversitariamente,\n`;

        // Agregar el primer bloque de texto dinámico
        let cursorY = this.servicioPDF.agregarTexto(doc, {
            text: textLugarFecha,
            watermark: MarcaDeAgua,
        });

        // Agregar otro bloque de texto dinámico
        cursorY = this.servicioPDF.agregarTexto(doc, {
            text: textDestinatario,
            startY: cursorY,
            watermark: MarcaDeAgua,
        });

        // Agregar otro bloque de texto dinámico
        cursorY = this.servicioPDF.agregarTexto(doc, {
            text: textAsunto,
            startY: cursorY,
            watermark: MarcaDeAgua,
            fontStyle: 'bold',
        });

        cursorY = this.servicioPDF.agregarTexto(doc, {
            text: textSolicitud,
            startY: cursorY,
            watermark: MarcaDeAgua,
            alignment: 'justify',
        });

        // Datos para la tabla
        const headers = ['No.', 'Asignatura', 'Docente'];

        const data = this.servicioRadicar.datosAsignAdiCancel.map(
            (item, index) => [
                (index + 1).toString(),
                item.nombreAsignatura,
                item.docente.nombreTutor,
            ]
        );

        cursorY = this.servicioPDF.agregarTabla(
            doc,
            MarcaDeAgua,
            headers,
            data,
            20, // startX
            cursorY, // Usar la posición final del texto como startY
            175, // maxWidth
            10, // rowHeight
            doc.internal.pageSize.height,
            'center', // alignment
            cursorY // Pasar la posición actual del cursor
        );

        cursorY = this.servicioPDF.agregarTexto(doc, {
            text: textDespedida,
            startY: cursorY,
            watermark: MarcaDeAgua,
            alignment: 'justify',
        });

        // Definir datos de la firma
        let firmaSolicitante = '../assets/layout/images/FirmaEnBlanco.png';
        let firmaTutor = '../assets/layout/images/FirmaEnBlanco.png';

        const solicitanteData = {
            name:
                this.servicioRadicar.formInfoPersonal.get('nombres').value +
                ' ' +
                this.servicioRadicar.formInfoPersonal.get('apellidos').value,
            identification:
                this.servicioRadicar.formInfoPersonal.get('numeroDocumento')
                    .value,
            email: this.servicioRadicar.formInfoPersonal.get('correo').value,
            cell: this.servicioRadicar.formInfoPersonal.get('celular').value,
        };

        const tutorData = {
            name: this.servicioRadicar.tutor.nombreTutor,
        };

        if (this.servicioRadicar.firmaSolicitante) {
            firmaSolicitante =
                this.servicioRadicar.firmaSolicitanteUrl.toString();
        }

        // Agregar la firma del solicitante
        let resultadoSolicitante = this.servicioPDF.agregarFirma(
            doc,
            'Solicitante',
            firmaSolicitante,
            'left',
            solicitanteData,
            cursorY,
            MarcaDeAgua
        );

        // Si la firma del solicitante provoca un salto de página, alinea la firma del tutor en la misma nueva página
        if (resultadoSolicitante.pageNumber !== doc.internal.pages.length) {
            cursorY = 65; // Reinicia cursorY para alinear ambas firmas en la nueva página
        }

        // Agregar la firma del tutor
        const resultadoTutor = this.servicioPDF.agregarFirma(
            doc,
            'Tutor',
            firmaTutor,
            'right',
            tutorData,
            cursorY,
            MarcaDeAgua
        );

        this.servicioRadicar.firmaTutorPag = resultadoTutor.pageNumber;
        this.servicioRadicar.firmaTutorX =
            resultadoTutor.signatureCoordinates.x;
        this.servicioRadicar.firmaTutorY =
            resultadoTutor.signatureCoordinates.y;

        return doc;
    }

    cancelacionAsignaturas(MarcaDeAgua: boolean) {}
    homologacionAsignaturasPos(MarcaDeAgua: boolean) {}
    homologacionAsignaturasEsp(MarcaDeAgua: boolean) {}
    aplazamientoSemestre(MarcaDeAgua: boolean) {}

    apoyoEconomicoPasantia(MarcaDeAgua: boolean) {
        const doc = new jsPDF({ format: 'letter' });

        // Añadir primera página con la plantilla
        this.servicioPDF.agregarMembretes(doc, MarcaDeAgua);
        this.servicioPDF.setDefaultTextStyle(doc); // Aplicar estilo inicial

        const rangoFechas = this.servicioUtilidades.describirRangoFechas(
            this.servicioRadicar.fechasEstancia[0],
            this.servicioRadicar.fechasEstancia[1]
        );

        // Texto de la Solicitud
        const textLugarFecha = `Popayán, ${this.fechaActual.getDate()} de ${
            this.nombresMes[this.fechaActual.getMonth()]
        } del ${this.fechaActual.getFullYear()}\n`;
        const textDestinatario = `Señores\nComité de Programa Maestría en Computación\nAtte: Dra Luz Marina Sierra\nCoordinadora programa\nUniversidad del Cauca\n`;
        const textAsunto = `Asunto: Solicitud de Apoyo Económico para Pasantia de Investigación\n`;
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar un apoyo economico para la realización de una estancia de investigación en ${this.servicioRadicar.lugarEstancia}, en el periodo comprendido entre las fechas: ${rangoFechas}. La presente solicitud esta avalada por la direccion del ${this.servicioRadicar.grupoInvestigacion}, adicionalmente anexo la documentacion e información requerida para su estudio.`;
        const textDatosApoyo = `\nValor apoyo economico: COP $${
            this.servicioRadicar.valorApoyoEcon
        }\nEntidad Bancaria: ${this.servicioRadicar.banco}\nTipo de Cuenta: ${
            this.servicioRadicar.tipoCuenta
        }\nNumero de Cuenta: ${this.servicioRadicar.numeroCuenta}\nTitular: ${
            this.servicioRadicar.formInfoPersonal.get('nombres').value
        } ${
            this.servicioRadicar.formInfoPersonal.get('apellidos').value
        }\nCeldula: ${this.servicioRadicar.cedulaCuentaBanco}\nDirección: ${
            this.servicioRadicar.direccion
        }\n`;
        const textDespedida = `Sin ningún otro motivo en particular, agradezco la atención brindada y quedo a la espera de su respuesta.\n\nUniversitariamente,\n`;

        // Agregar el primer bloque de texto dinámico
        let cursorY = this.servicioPDF.agregarTexto(doc, {
            text: textLugarFecha,
            watermark: MarcaDeAgua,
        });

        // Agregar otro bloque de texto dinámico
        cursorY = this.servicioPDF.agregarTexto(doc, {
            text: textDestinatario,
            startY: cursorY,
            watermark: MarcaDeAgua,
        });

        // Agregar otro bloque de texto dinámico
        cursorY = this.servicioPDF.agregarTexto(doc, {
            text: textAsunto,
            startY: cursorY,
            watermark: MarcaDeAgua,
            fontStyle: 'bold',
        });

        cursorY = this.servicioPDF.agregarTexto(doc, {
            text: textSolicitud,
            startY: cursorY,
            watermark: MarcaDeAgua,
            alignment: 'justify',
        });

        cursorY = this.servicioPDF.agregarTexto(doc, {
            text: textDatosApoyo,
            startY: cursorY,
            watermark: MarcaDeAgua,
        });

        cursorY = this.servicioPDF.agregarTexto(doc, {
            text: textDespedida,
            startY: cursorY,
            watermark: MarcaDeAgua,
            alignment: 'justify',
        });

        // Definir datos de la firma
        let firmaSolicitante = '../assets/layout/images/FirmaEnBlanco.png';
        let firmaTutor = '../assets/layout/images/FirmaEnBlanco.png';
        let firmaDirector = '../assets/layout/images/FirmaEnBlanco.png';

        const solicitanteData = {
            name:
                this.servicioRadicar.formInfoPersonal.get('nombres').value +
                ' ' +
                this.servicioRadicar.formInfoPersonal.get('apellidos').value,
            identification:
                this.servicioRadicar.formInfoPersonal.get('numeroDocumento')
                    .value,
            email: this.servicioRadicar.formInfoPersonal.get('correo').value,
            cell: this.servicioRadicar.formInfoPersonal.get('celular').value,
        };

        const tutorData = {
            name: this.servicioRadicar.tutor.nombreTutor,
        };

        const directorData = {
            name: this.servicioRadicar.director.nombreTutor,
        };

        if (this.servicioRadicar.firmaSolicitante) {
            firmaSolicitante =
                this.servicioRadicar.firmaSolicitanteUrl.toString();
        }

        // Agregar la firma del solicitante
        let resultadoSolicitante = this.servicioPDF.agregarFirma(
            doc,
            'Solicitante',
            firmaSolicitante,
            'left',
            solicitanteData,
            cursorY,
            MarcaDeAgua
        );

        // Si la firma del solicitante provoca un salto de página, alinea la firma del tutor en la misma nueva página
        if (resultadoSolicitante.pageNumber !== doc.internal.pages.length) {
            cursorY = 65; // Reinicia cursorY para alinear ambas firmas en la nueva página
        }

        // Agregar la firma del tutor
        const resultadoTutor = this.servicioPDF.agregarFirma(
            doc,
            'Tutor',
            firmaTutor,
            'right',
            tutorData,
            cursorY,
            MarcaDeAgua
        );

        // Agregar la firma del Director
        const resultadoDirector = this.servicioPDF.agregarFirma(
            doc,
            'Director',
            firmaDirector,
            'right',
            directorData,
            resultadoTutor.cursorY,
            MarcaDeAgua
        );

        console.log(resultadoTutor);

        this.servicioRadicar.firmaTutorPag = resultadoTutor.pageNumber;
        this.servicioRadicar.firmaTutorX =
            resultadoTutor.signatureCoordinates.x;
        this.servicioRadicar.firmaTutorY =
            resultadoTutor.signatureCoordinates.y;

        this.servicioRadicar.firmaDirectorPag = resultadoDirector.pageNumber;
        this.servicioRadicar.firmaDirectorX =
            resultadoDirector.signatureCoordinates.x;
        this.servicioRadicar.firmaDirectorY =
            resultadoDirector.signatureCoordinates.y;

        return doc;
    }
}
