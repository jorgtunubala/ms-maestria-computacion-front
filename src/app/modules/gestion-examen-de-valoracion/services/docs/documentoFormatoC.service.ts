import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as PizZip from 'pizzip';
import * as JSZipUtils from 'pizzip/utils/index.js';
import * as Docxtemplater from 'docxtemplater';
import { Observable, catchError, of } from 'rxjs';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable({
    providedIn: 'root',
})
export class DocumentoFormatoCService {
    private logoImage: string;
    private footerImage: string;

    constructor() {
        var logoImg = new Image();
        logoImg.src = 'assets/layout/images/logoUnicauca.png';
        logoImg.onload = () => {
            this.logoImage = this.getBase64Image(logoImg);
        };

        var footerImg = new Image();
        footerImg.src = 'assets/layout/images/logosIcontec.png';
        footerImg.onload = () => {
            this.footerImage = this.getBase64Image(footerImg);
        };
    }

    private getBase64Image(img: HTMLImageElement): string {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL('image/png');
    }

    public generateDocuments(
        formValues: any,
        estudiante: any,
        evaluador: any
    ): Observable<any> {
        const docData: any = {
            fecha: this.getFormattedDate(),
            coordinador: formValues.coordinador,
            asunto: formValues.asunto,
            titulo: formValues.titulo,
            jurado: `${evaluador.nombres}, ${evaluador.correo}, ${evaluador.universidad}`,
        };

        return new Observable((observer) => {
            this.loadFile(
                'assets/docs/formatoC.docx',
                (error: any, content: any) => {
                    if (error) {
                        observer.error(error);
                        return;
                    }

                    const zip = new PizZip(content);
                    const doc = new Docxtemplater(zip, {
                        paragraphLoop: true,
                        linebreaks: true,
                    });

                    doc.setData(docData);

                    try {
                        doc.render();
                    } catch (error) {
                        observer.error(error);
                        return;
                    }

                    const fileDoc = doc.getZip().generate({
                        type: 'blob',
                        mimeType:
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    });

                    const docDefinition = this.generateDocDefinition(
                        formValues,
                        evaluador
                    );

                    pdfMake
                        .createPdf(docDefinition)
                        .getBlob((pdfBlob: Blob) => {
                            const filePdf = new File(
                                [pdfBlob],
                                `${estudiante.codigo} - formatoC.pdf`,
                                {
                                    type: 'application/pdf',
                                }
                            );
                            observer.next({
                                docFormatoC: fileDoc,
                                pdfFormatoC: filePdf,
                            });
                            observer.complete();
                        });
                }
            );
        }).pipe(
            catchError((error) => {
                console.error('Error en la generación de documentos', error);
                return of({ doc: null, pdf: null });
            })
        );
    }

    private loadFile(
        url: string,
        callback: (error: any, content: any) => void
    ) {
        JSZipUtils.default.getBinaryContent(url, callback);
    }

    private getFormattedDate(): string {
        const rawDate = new Date();
        const day = rawDate.getDate();
        const month = rawDate.toLocaleString('default', { month: 'short' });
        const year = rawDate.getFullYear();
        return `${day} de ${month} de ${year}`;
    }

    private generateDocDefinition(formValues: any, evaluador: any) {
        const fechaActual = new Date().toLocaleDateString();
        return {
            content: [
                {
                    columns: [
                        {
                            text: 'Maestría en Computación\nFacultad de Ingeniería Electrónica y Telecomunicaciones',
                            fontSize: 14,
                            alignment: 'left',
                            margin: [0, 5, 0, 5],
                            opacity: 0.6,
                        },
                        {
                            image: this.logoImage,
                            width: 50,
                            height: 70,
                            margin: [0, -10, 0, 5],
                            alignment: 'right',
                            opacity: 0.6,
                        },
                    ],
                },
                {
                    text: 'FORMATO C',
                    style: 'header',
                    alignment: 'center',
                },
                {
                    text: `Popayán, ${fechaActual}`,
                    style: 'subheader',
                    alignment: 'left',
                },
                {
                    text: `Doctor(a) ${formValues.coordinador}\nCoordinadora\nMaestría en Computación\nUniversidad del Cauca\nPopayán`,
                    style: 'subheader',
                    width: '100%',
                },
                {
                    columns: [
                        { text: 'Asunto:', style: 'label', width: '25%' },
                        {
                            text: formValues.asunto,
                            style: 'value',
                            width: '75%',
                        },
                    ],
                    margin: [0, 10, 0, 10],
                },
                {
                    columns: [
                        {
                            text: 'Título del Trabajo:',
                            style: 'label',
                            width: '25%',
                        },
                        {
                            text: formValues.titulo,
                            style: 'value',
                            width: '75%',
                        },
                    ],
                    margin: [0, 10, 0, 10],
                },
                {
                    columns: [
                        {
                            text: 'Observaciones y recomendaciones para el estudiante:',
                            style: 'label',
                            width: '25%',
                        },
                    ],
                    margin: [0, 10, 0, 60],
                },
                {
                    stack: [
                        {
                            canvas: [
                                {
                                    type: 'line',
                                    x1: 0,
                                    y1: 0,
                                    x2: 300,
                                    y2: 0,
                                    lineWidth: 1,
                                },
                            ],
                        },
                        {
                            text: `Nombre Jurado`,
                            style: 'label',
                            width: '100%',
                        },
                        {
                            text: `${
                                evaluador.nombres + ', ' + evaluador.universidad
                            }`,
                            width: '100%',
                        },
                    ],
                },
            ],
            footer: (currentPage, pageCount) => {
                return {
                    columns: [
                        {
                            stack: [
                                {
                                    image: this.footerImage,
                                    width: 100,
                                    height: 60,
                                    alignment: 'left',
                                    margin: [0, 5, 0, 5],
                                    opacity: 0.6,
                                },
                            ],
                            width: 'auto',
                        },
                        {
                            stack: [
                                {
                                    text: 'Hacia una Universidad comprometida con la paz territorial',
                                    alignment: 'center',
                                    margin: [0, 2, 0, 2],
                                    opacity: 0.6,
                                },
                                {
                                    canvas: [
                                        {
                                            type: 'line',
                                            x1: 0,
                                            y1: 0,
                                            x2: 320,
                                            y2: 0,
                                            lineWidth: 1,
                                            color: '#ff0000',
                                        },
                                    ],
                                    margin: [0, 2, 0, 2],
                                    alignment: 'center',
                                    opacity: 0.6,
                                },
                                {
                                    text: 'Facultad de Ingeniería Electrónica y Telecomunicaciones\nCra 2 No. 4N-140 Edif. de Ingenierías - Sector Tulcán Popayán - Cauca - Colombia\nConmutador 8209800 Ext. 2145 maestriacomputacion@unicauca.edu.co\nwww.unicauca.edu.cowww.unicauca.edu.co/maestriacomputacion',
                                    alignment: 'center',
                                    fontSize: 10,
                                    margin: [0, 5, 0, 5],
                                    opacity: 0.6,
                                },
                            ],
                            width: '*',
                        },
                    ],
                    margin: [40, -60, 0, 0],
                };
            },
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10],
                },
                subheader: {
                    fontSize: 12,
                    margin: [0, 0, 0, 10],
                },
                label: {
                    fontSize: 12,
                    bold: true,
                    margin: [0, 10, 0, 2],
                },
                value: {
                    fontSize: 12,
                    margin: [0, 10, 0, 0],
                },
            },
        };
    }
}
