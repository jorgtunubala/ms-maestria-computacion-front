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

    adicionAsignaturas(marcaDeAgua: boolean) {
        const doc = new jsPDF({ format: 'letter' });

        const textAsunto = `Asunto: Solicitud de Adición de Asignaturas\n`;
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar la adición de las asignaturas relacionadas en la tabla a continuación,`;

        let cursorY = this.agregarContenidoComun(doc, marcaDeAgua);

        cursorY = this.agregarAsuntoYSolicitud(
            doc,
            cursorY,
            textAsunto,
            textSolicitud,
            marcaDeAgua
        );

        // Datos para la tabla
        const headers = ['No.', 'Asignatura', 'Docente'];

        const data = this.servicioRadicar.datosAsignAdiCancel.map(
            (item, index) => [
                (index + 1).toString(),
                item.nombreAsignatura,
                item.docente.nombreTutor,
            ]
        );

        cursorY = this.agregarTabla(doc, cursorY, headers, data, marcaDeAgua);
        cursorY = this.agregarDespedida(doc, cursorY, marcaDeAgua);

        cursorY = this.agregarEspaciosDeFirmas(
            doc,
            cursorY,
            false,
            marcaDeAgua
        );

        return doc;
    }

    aplazamientoSemestre(marcaDeAgua: boolean) {
        const doc = new jsPDF({ format: 'letter' });

        const textAsunto = `Asunto: Solicitud de aplazamiento de semestre\n`;
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar el aplazamiento del ${
            this.servicioRadicar.formSemestreAplazar
                .get('semestre')
                .value.split('-')[1] === '1'
                ? 'primer'
                : this.servicioRadicar.formSemestreAplazar
                      .get('semestre')
                      .value.split('-')[1] === '2'
                ? 'segundo'
                : 'proximo'
        } semestre de ${
            this.servicioRadicar.formSemestreAplazar
                .get('semestre')
                .value.split('-')[0]
        }. La presente solicitud obedece a que ${this.servicioRadicar.formSemestreAplazar
            .get('motivo')
            .value.toLowerCase()}.`;

        let cursorY = this.agregarContenidoComun(doc, marcaDeAgua);

        cursorY = this.agregarAsuntoYSolicitud(
            doc,
            cursorY,
            textAsunto,
            textSolicitud,
            marcaDeAgua
        );

        // Salto de linea
        doc.text('', 5, cursorY);
        cursorY += 5;

        cursorY = this.agregarDespedida(doc, cursorY, marcaDeAgua);

        cursorY = this.agregarEspaciosDeFirmas(
            doc,
            cursorY,
            false,
            marcaDeAgua
        );

        return doc;
    }

    homologacionAsignaturasPos(marcaDeAgua: boolean) {}
    homologacionAsignaturasEsp(marcaDeAgua: boolean) {}

    apoyoEconomicoCongresos(marcaDeAgua: boolean) {
        const doc = new jsPDF({ format: 'letter' });

        const rangoFechas = this.servicioUtilidades.describirRangoFechas(
            this.servicioRadicar.formApoyoAsistEvento.get('fechas').value[0],
            this.servicioRadicar.formApoyoAsistEvento.get('fechas').value[1]
        );

        const textAsunto = `Asunto: Solicitud de apoyo económico para asistencia a evento presentando articulo\n`;
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar un apoyo economico para asistir al evento "${
            this.servicioRadicar.formApoyoAsistEvento.get('nombreCongreso')
                .value
        }" que se llevara a cabo del ${rangoFechas}, y donde se hara la publicación del trabajo titulado "${
            this.servicioRadicar.formApoyoAsistEvento.get('tituloPublicacion')
                .value
        }". La presente solicitud esta avalada por la direccion del ${
            this.servicioRadicar.grupoInvestigacion
        }, adicionalmente anexo la documentacion e información requerida para su estudio.`;
        const textDatosApoyo = `\nValor apoyo economico: COP $${
            this.servicioRadicar.formApoyoAsistEvento.get('valorApoyo').value
        }\nEntidad Bancaria: ${
            this.servicioRadicar.formApoyoAsistEvento.get('entidadBancaria')
                .value
        }\nTipo de Cuenta: ${
            this.servicioRadicar.formApoyoAsistEvento.get('tipoCuenta').value
        }\nNumero de Cuenta: ${
            this.servicioRadicar.formApoyoAsistEvento.get('numeroCuenta').value
        }\nTitular: ${
            this.servicioRadicar.formInfoPersonal.get('nombres').value
        } ${
            this.servicioRadicar.formInfoPersonal.get('apellidos').value
        }\nCeldula: ${
            this.servicioRadicar.formApoyoAsistEvento.get(
                'numeroCedulaAsociada'
            ).value
        }\nDirección: ${
            this.servicioRadicar.formApoyoAsistEvento.get('direccionResidencia')
                .value
        }\n`;

        const textAdjuntos = `${this.servicioRadicar.obtenerNombreArchivosAdjuntos()}`;

        let cursorY = this.agregarContenidoComun(doc, marcaDeAgua);

        cursorY = this.agregarAsuntoYSolicitud(
            doc,
            cursorY,
            textAsunto,
            textSolicitud,
            marcaDeAgua
        );

        cursorY = this.servicioPDF.agregarTexto(doc, {
            text: textDatosApoyo,
            startY: cursorY,
            watermark: marcaDeAgua,
        });

        cursorY = this.agregarDespedida(doc, cursorY, marcaDeAgua);

        cursorY = this.agregarEspaciosDeFirmas(doc, cursorY, true, marcaDeAgua);

        this.agregarListadoAdjuntos(doc, cursorY, textAdjuntos, marcaDeAgua);
        return doc;
    }

    apoyoEconomicoPasantia(marcaDeAgua: boolean) {
        const doc = new jsPDF({ format: 'letter' });

        const rangoFechas = this.servicioUtilidades.describirRangoFechas(
            this.servicioRadicar.fechasEstancia[0],
            this.servicioRadicar.fechasEstancia[1]
        );

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

        const textAdjuntos = `${this.servicioRadicar.obtenerNombreArchivosAdjuntos()}`;

        let cursorY = this.agregarContenidoComun(doc, marcaDeAgua);

        cursorY = this.agregarAsuntoYSolicitud(
            doc,
            cursorY,
            textAsunto,
            textSolicitud,
            marcaDeAgua
        );

        cursorY = this.servicioPDF.agregarTexto(doc, {
            text: textDatosApoyo,
            startY: cursorY,
            watermark: marcaDeAgua,
        });

        cursorY = this.agregarDespedida(doc, cursorY, marcaDeAgua);

        cursorY = this.agregarEspaciosDeFirmas(doc, cursorY, true, marcaDeAgua);

        this.agregarListadoAdjuntos(doc, cursorY, textAdjuntos, marcaDeAgua);
        return doc;
    }

    apoyoEconomicoPublicOInscrip(marcaDeAgua: boolean) {
        const doc = new jsPDF({ format: 'letter' });

        const rangoFechas = this.servicioUtilidades.describirRangoFechas(
            this.servicioRadicar.fechasEstancia[0],
            this.servicioRadicar.fechasEstancia[1]
        );

        const textAsunto = `Asunto: Solicitud de apoyo económico para asistencia a evento presentando articulo\n`;
        const textSolicitud1 = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar un apoyo economico para el pago de la inscripción al evento "${this.servicioRadicar.nombreCongreso}" que se llevara a cabo del ${rangoFechas}. La presente solicitud esta avalada por la direccion del ${this.servicioRadicar.grupoInvestigacion}, adicionalmente anexo la documentacion e información requerida para su estudio.`;

        const textSolicitud2 = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar un apoyo economico para el pago de la publicación del trbajo titulado "${this.servicioRadicar.tituloPublicacion}" que se llevara a cabo del ${rangoFechas}. La presente solicitud esta avalada por la direccion del ${this.servicioRadicar.grupoInvestigacion}, adicionalmente anexo la documentacion e información requerida para su estudio.`;
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

        const textAdjuntos = `${this.servicioRadicar.obtenerNombreArchivosAdjuntos()}`;

        let cursorY = this.agregarContenidoComun(doc, marcaDeAgua);

        cursorY = this.agregarAsuntoYSolicitud(
            doc,
            cursorY,
            textAsunto,
            textSolicitud1,
            marcaDeAgua
        );

        cursorY = this.servicioPDF.agregarTexto(doc, {
            text: textDatosApoyo,
            startY: cursorY,
            watermark: marcaDeAgua,
        });

        cursorY = this.agregarDespedida(doc, cursorY, marcaDeAgua);

        cursorY = this.agregarEspaciosDeFirmas(doc, cursorY, true, marcaDeAgua);

        this.agregarListadoAdjuntos(doc, cursorY, textAdjuntos, marcaDeAgua);
        return doc;
    }

    avalPracticaDocente(marcaDeAgua: boolean) {
        const doc = new jsPDF({ format: 'letter' });

        const textAsunto = `Asunto: Solicitud de aval para la realización de actividades de práctica docente\n`;
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar el aval para la ralización de las actividades de practica docente descritas a continuacion:`;

        const textAdjuntos = `${this.servicioRadicar.obtenerNombreArchivosAdjuntos()}`;

        let cursorY = this.agregarContenidoComun(doc, marcaDeAgua);

        cursorY = this.agregarAsuntoYSolicitud(
            doc,
            cursorY,
            textAsunto,
            textSolicitud,
            marcaDeAgua
        );

        // Salto de linea
        doc.text('', 5, cursorY);
        cursorY += 5;

        /*
        watermark = false,
        text,
        startX = 20,
        startY = 65,
        maxWidth = 175,
        lineHeight = 5,
        pageHeight = doc.internal.pageSize.height,
        alignment = 'left',
        fontStyle = 'regular',
        */
        for (
            let index = 0;
            index < this.servicioRadicar.actividadesSeleccionadas.length;
            index++
        ) {
            const titulo = `${index + 1}. ${
                this.servicioRadicar.actividadesSeleccionadas[index].nombre
            } - ${this.servicioRadicar.horasAsignables[index]}h`;
            const descripcion = `${this.servicioRadicar.descripcionesActividades[index]}`;

            cursorY = this.servicioPDF.agregarTexto(doc, {
                text: titulo,
                startY: cursorY,
                fontStyle: 'bold',
                watermark: marcaDeAgua,
            });

            cursorY = this.servicioPDF.agregarTexto(doc, {
                text: descripcion,
                startY: cursorY,
                fontStyle: 'regular',
                alignment: 'justify',
                watermark: marcaDeAgua,
            });

            // Salto de linea
            doc.text('', 5, cursorY);
            cursorY += 5;
        }

        cursorY = this.agregarDespedida(doc, cursorY, marcaDeAgua);

        cursorY = this.agregarEspaciosDeFirmas(
            doc,
            cursorY,
            false,
            marcaDeAgua
        );

        return doc;
    }

    avalPasantia(marcaDeAgua: boolean) {
        const doc = new jsPDF({ format: 'letter' });

        const rangoFechas = this.servicioUtilidades.describirRangoFechas(
            this.servicioRadicar.fechasEstancia[0],
            this.servicioRadicar.fechasEstancia[1]
        );

        const textAsunto = `Asunto: Solicitud de aval para la realización de una pasantía de investigación\n`;
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar el aval para la realización de una estancia de investigacion en ${this.servicioRadicar.lugarEstancia} en el periodo comprendido entre las fechas: ${rangoFechas}. Adjunto a esta solicitud la documentación y formatos requeridos para su revisión.`;

        const textAdjuntos = `${this.servicioRadicar.obtenerNombreArchivosAdjuntos()}`;

        let cursorY = this.agregarContenidoComun(doc, marcaDeAgua);

        cursorY = this.agregarAsuntoYSolicitud(
            doc,
            cursorY,
            textAsunto,
            textSolicitud,
            marcaDeAgua
        );

        // Salto de linea
        doc.text('', 5, cursorY);
        cursorY += 5;

        cursorY = this.agregarDespedida(doc, cursorY, marcaDeAgua);

        cursorY = this.agregarEspaciosDeFirmas(
            doc,
            cursorY,
            false,
            marcaDeAgua
        );

        this.agregarListadoAdjuntos(doc, cursorY, textAdjuntos, marcaDeAgua);

        return doc;
    }

    cancelacionAsignaturas(marcaDeAgua: boolean) {
        const doc = new jsPDF({ format: 'letter' });

        const textAsunto = `Asunto: Solicitud de cancelación de asignaturas\n`;
        const textSolicitud = `Reciban cordial saludo, comedidamente me dirijo a ustedes con el fin de solicitar la cancelación de las asignaturas relacionadas en la tabla a continuación,`;
        const textMotivo = `La presente solicitud obedece a que ${this.servicioRadicar.motivoDeSolicitud.toLowerCase()}.`;

        let cursorY = this.agregarContenidoComun(doc, marcaDeAgua);

        cursorY = this.agregarAsuntoYSolicitud(
            doc,
            cursorY,
            textAsunto,
            textSolicitud,
            marcaDeAgua
        );

        // Datos para la tabla
        const headers = ['No.', 'Asignatura', 'Docente'];

        const data = this.servicioRadicar.datosAsignAdiCancel.map(
            (item, index) => [
                (index + 1).toString(),
                item.nombreAsignatura,
                item.docente.nombreTutor,
            ]
        );

        cursorY = this.agregarTabla(doc, cursorY, headers, data, marcaDeAgua);

        cursorY = this.servicioPDF.agregarTexto(doc, {
            text: textMotivo,
            startY: cursorY,
            alignment: 'justify',
            watermark: marcaDeAgua,
        });

        // Salto de linea
        doc.text('', 5, cursorY);
        cursorY += 5;

        cursorY = this.agregarDespedida(doc, cursorY, marcaDeAgua);

        cursorY = this.agregarEspaciosDeFirmas(
            doc,
            cursorY,
            false,
            marcaDeAgua
        );

        return doc;
    }

    private agregarContenidoComun(doc: jsPDF, marcaDeAgua: boolean) {
        // Añadir estilos institucionales
        this.servicioPDF.agregarMembretes(doc, marcaDeAgua);
        this.servicioPDF.setDefaultTextStyle(doc); // Aplicar estilo de texto al contenido

        // Lugar y fecha y destinatario
        const textLugarFecha = `Popayán, ${this.fechaActual.getDate()} de ${
            this.nombresMes[this.fechaActual.getMonth()]
        } del ${this.fechaActual.getFullYear()}\n`;
        const textDestinatario = `Señores\nComité de Programa Maestría en Computación\nAtte: Dra Luz Marina Sierra\nCoordinadora programa\nUniversidad del Cauca\n`;

        // Agregar el primer bloque de texto dinámico
        let cursorY = this.servicioPDF.agregarTexto(doc, {
            text: textLugarFecha,
            watermark: marcaDeAgua,
        });

        // Agregar otro bloque de texto dinámico
        cursorY = this.servicioPDF.agregarTexto(doc, {
            text: textDestinatario,
            startY: cursorY,
            watermark: marcaDeAgua,
        });

        return cursorY;
    }

    private agregarAsuntoYSolicitud(
        doc: jsPDF,
        posicionY: number,
        asunto: string,
        solicitud: string,
        marcaDeAgua: boolean
    ) {
        // Agregar otro bloque de texto dinámico
        let nuevaPosicionY = this.servicioPDF.agregarTexto(doc, {
            text: asunto,
            startY: posicionY,
            watermark: marcaDeAgua,
            fontStyle: 'bold',
        });

        nuevaPosicionY = this.servicioPDF.agregarTexto(doc, {
            text: solicitud,
            startY: nuevaPosicionY,
            watermark: marcaDeAgua,
            alignment: 'justify',
        });

        return nuevaPosicionY;
    }

    private agregarDespedida(
        doc: jsPDF,
        posicionY: number,
        marcaDeAgua: boolean
    ) {
        const textDespedida = `Sin ningún otro motivo en particular, agradezco la atención brindada y quedo a la espera de su respuesta.\n\nUniversitariamente,`;

        let nuevaPosicionY = this.servicioPDF.agregarTexto(doc, {
            text: textDespedida,
            startY: posicionY,
            watermark: marcaDeAgua,
            alignment: 'justify',
        });

        return nuevaPosicionY;
    }

    private agregarTabla(
        doc: jsPDF,
        posicionY: number,
        encabezados: string[],
        datos: string[][],
        marcaDeAgua: boolean
    ) {
        let nuevaPosicionY = this.servicioPDF.agregarTabla(
            doc,
            marcaDeAgua,
            encabezados,
            datos,
            20, // startX
            posicionY, // Usar la posición final del texto como startY
            175, // maxWidth
            10, // rowHeight
            doc.internal.pageSize.height,
            'center', // alignment
            posicionY // Pasar la posición actual del cursor
        );

        return nuevaPosicionY;
    }

    private agregarEspaciosDeFirmas(
        doc: jsPDF,
        posicionY: number,
        incluirDirector: boolean,
        marcaDeAgua: boolean
    ) {
        // Definir datos de la firma
        let firmaSolicitante = '../assets/layout/images/FirmaEnBlanco.png';
        let firmaTutor = '../assets/layout/images/FirmaEnBlanco.png';
        let firmaDirector = '../assets/layout/images/FirmaEnBlanco.png';

        let nuevaPosicionY = posicionY;

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
            nuevaPosicionY,
            marcaDeAgua
        );

        // Si la firma del solicitante provoca un salto de página, alinea la firma del tutor en la misma nueva página
        if (resultadoSolicitante.pageNumber !== doc.internal.pages.length) {
            nuevaPosicionY = 65; // Reinicia cursorY para alinear ambas firmas en la nueva página
        }

        // Agregar la firma del tutor
        const resultadoTutor = this.servicioPDF.agregarFirma(
            doc,
            'Tutor',
            firmaTutor,
            'right',
            tutorData,
            nuevaPosicionY,
            marcaDeAgua
        );

        nuevaPosicionY = resultadoTutor.cursorY;

        this.servicioRadicar.firmaTutorPag = resultadoTutor.pageNumber;
        this.servicioRadicar.firmaTutorX =
            resultadoTutor.signatureCoordinates.x;
        this.servicioRadicar.firmaTutorY =
            resultadoTutor.signatureCoordinates.y;

        if (incluirDirector) {
            const directorData = {
                name: this.servicioRadicar.director.nombreTutor,
            };

            // Agregar la firma del Director
            const resultadoDirector = this.servicioPDF.agregarFirma(
                doc,
                'Director',
                firmaDirector,
                'right',
                directorData,
                resultadoTutor.cursorY,
                marcaDeAgua
            );

            nuevaPosicionY = resultadoDirector.cursorY;

            this.servicioRadicar.firmaDirectorPag =
                resultadoDirector.pageNumber;
            this.servicioRadicar.firmaDirectorX =
                resultadoDirector.signatureCoordinates.x;
            this.servicioRadicar.firmaDirectorY =
                resultadoDirector.signatureCoordinates.y;
        }

        return nuevaPosicionY;
    }

    private agregarListadoAdjuntos(
        doc: jsPDF,
        posicionY: number,
        adjuntos: string,
        marcaDeAgua: boolean
    ) {
        let nuevaPosicionY = this.servicioPDF.agregarTexto(doc, {
            text: 'Documentos Adjuntos:',
            startY: posicionY,
            watermark: marcaDeAgua,
        });

        nuevaPosicionY = this.servicioPDF.agregarVinetas(doc, {
            text: adjuntos,
            startY: nuevaPosicionY,
            fontSize: 8,
            lineHeight: 4,
            bulletSpacing: 4,
        });

        return nuevaPosicionY;
    }
}
