import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

import {
    openSansRegularBase64,
    openSansBoldBase64,
} from '../../../../assets/fonts/open-sans.js';

interface AgregarTextoOptions {
    watermark?: boolean;
    text: string;
    startX?: number;
    startY?: number;
    maxWidth?: number;
    lineHeight?: number;
    pageHeight?: number;
    alignment?: 'left' | 'center' | 'right' | 'justify';
    fontStyle?: 'regular' | 'bold' | 'italic' | 'bolditalic';
}

@Injectable({
    providedIn: 'root',
})
export class PdfService {
    constructor() {}

    agregarMembretes(doc, watermark: Boolean) {
        const imgBannerSup = '../assets/layout/images/motivoencabezado.png';
        const imgEscudo = '../assets/layout/images/escudo-unicauca.png';
        const imgISO90001 = '../assets/layout/images/Logo_ISO_9001.png';
        const imgIQNET = '../assets/layout/images/IQNET-Azul-2.png';

        // Fuentes de texto personalizadas
        doc.addFileToVFS('OpenSans-Bold.ttf', openSansBoldBase64);
        doc.addFont('OpenSans-Bold.ttf', 'OpenSans', 'bold');
        doc.addFileToVFS('OpenSans-Regular.ttf', openSansRegularBase64);
        doc.addFont('OpenSans-Regular.ttf', 'OpenSans', 'regular');

        // ENCABEZADO DE LA PLANTILLA

        // Banner 'Diversidad'
        doc.addImage(imgBannerSup, 'JPEG', 0, 0, 216, 7);

        // Escudo Unicauca
        doc.addImage(imgEscudo, 'JPEG', 15, 13.5, 30, 40.87);

        doc.setDrawColor(0, 18, 130);
        doc.line(43, 23, 43, 46);

        // Nombre de dependencia
        doc.setFont('OpenSans', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(0, 18, 130);
        doc.text('Facultad de Ingeniería', 46, 31);
        doc.text('Electrónica y', 46, 36);
        doc.text('Telecomunicaciones', 46, 41);

        doc.setDrawColor(0, 18, 130);
        doc.line(96, 23, 96, 46);

        // Nombre del programa
        doc.setFont('OpenSans', 'regular');
        doc.setFontSize(12);
        doc.setTextColor(0, 18, 130);
        doc.text('Maestría en', 99, 33);
        doc.text('Computación', 99, 38);

        // PIE DE PAGINA DE LA PLANTILLA

        // Datos de contacto y direccion
        doc.setFont('OpenSans', 'regular');
        doc.setFontSize(8);
        doc.setTextColor(0, 18, 130);
        doc.text('Carrera 2 No, 3N-100 Segundo Piso, Sector Tulcán', 85, 254);
        doc.text('Popayán - Cauca - Colombia', 99, 258);
        doc.text('Teléfono (602) 8209800 Exts. 2103 - 2145', 91, 262);
        doc.setFont('OpenSans', 'bold');
        doc.text(
            'maestriacomputacion@unicauca.edu.co | www.unicauca.edu.co',
            72,
            266
        );

        // Logos de certificaciones
        doc.addImage(imgISO90001, 'JPEG', 170, 251, 12, 16);
        doc.addImage(imgIQNET, 'JPEG', 183, 253, 12, 12);

        // Agregar marca de agua si es necesario
        if (watermark) {
            this.agregarMarcaDeAgua(doc);
        }
    }

    setDefaultTextStyle(doc) {
        // Configurar la fuente, tamaño y color de texto predeterminados
        doc.setFont('OpenSans', 'regular');
        doc.setFontSize(11);
        doc.setTextColor(79, 79, 79);
    }

    agregarTexto(doc: jsPDF, options: AgregarTextoOptions): number {
        // Valores predeterminados
        const {
            watermark = false,
            text,
            startX = 20,
            startY = 65,
            maxWidth = 175,
            lineHeight = 5,
            pageHeight = doc.internal.pageSize.height,
            alignment = 'left',
            fontStyle = 'regular',
        } = options;

        // Configurar la fuente según la opción de estilo
        doc.setFont('OpenSans', fontStyle);

        // Dividir el texto en párrafos primero
        const paragraphs = text.split('\n\n');
        let cursorY = startY;
        const marginBottom = 30; // Espacio para pie de página

        paragraphs.forEach((paragraph, paragraphIndex) => {
            // Dividir el párrafo en líneas según el ancho máximo permitido
            const textLines = doc.splitTextToSize(paragraph, maxWidth);

            textLines.forEach((line, lineIndex) => {
                if (cursorY + lineHeight > pageHeight - marginBottom) {
                    // Si el texto excede la página, añade una nueva
                    doc.addPage();
                    this.agregarMembretes(doc, watermark);
                    this.setDefaultTextStyle(doc); // Reaplicar estilo de texto
                    cursorY = 65; // Restablecer cursor a la parte superior del área de contenido
                }

                // Alineación de texto
                let textX = startX;

                // Verificar si la línea es la última de un párrafo
                const isLastLineOfParagraph =
                    lineIndex === textLines.length - 1;

                if (alignment === 'center') {
                    textX =
                        (doc.internal.pageSize.width - doc.getTextWidth(line)) /
                        2;
                } else if (alignment === 'right') {
                    textX = maxWidth + startX - doc.getTextWidth(line);
                } else if (alignment === 'justify' && !isLastLineOfParagraph) {
                    // Justificación de la línea (excepto si es la última línea del párrafo)
                    const words = line.split(' ');
                    const totalWordsWidth = words.reduce(
                        (acc, word) => acc + doc.getTextWidth(word),
                        0
                    );
                    const spaceWidth =
                        (maxWidth - totalWordsWidth) / (words.length - 1);
                    let justifiedTextX = startX;

                    words.forEach((word, index) => {
                        doc.text(word, justifiedTextX, cursorY);
                        justifiedTextX += doc.getTextWidth(word) + spaceWidth;
                    });
                    cursorY += lineHeight;
                    return;
                }

                // Renderizar la línea en la posición X calculada
                doc.text(line, textX, cursorY);
                cursorY += lineHeight;
            });

            // Añadir un espacio entre párrafos si no es el último
            if (paragraphIndex < paragraphs.length - 1) {
                cursorY += lineHeight;
            }
        });

        // Devuelve la posición Y final después de agregar todo el texto
        return cursorY;
    }

    agregarTabla(
        doc,
        watermark: Boolean,
        headers: string[],
        data: string[][],
        startX: number,
        startY: number,
        maxWidth: number,
        rowHeight: number,
        pageHeight: number,
        alignment: 'left' | 'center' | 'right' = 'left',
        currentY: number
    ): number {
        const marginBottom = 30; // Espacio para pie de página
        let cursorY = currentY; // Usar la posición actual del cursor

        // Calcular el ancho de las columnas basado en el contenido más largo
        const columnWidths = this.calculateColumnWidths(
            doc,
            headers,
            data,
            maxWidth
        );
        const tableWidth = columnWidths.reduce((acc, width) => acc + width, 0);

        // Función para calcular la altura máxima de una fila
        const calculateRowHeight = (row: string[]): number => {
            return Math.max(
                ...row.map((cell, index) => {
                    const cellWidth = columnWidths[index];
                    const lines = doc.splitTextToSize(cell, cellWidth);
                    return lines.length * 7; // Ajusta el multiplicador según el tamaño de la fuente
                })
            );
        };

        // Función para dibujar una fila de la tabla
        const drawRow = (
            row: string[],
            y: number,
            isHeader: boolean = false
        ) => {
            const rowHeight = calculateRowHeight(row); // Calcula la altura de la fila
            let currentX = startX;

            // Ajuste de la altura de línea para reducir espacio
            const lineHeight = 4; // Ajusta este valor según sea necesario

            if (isHeader) {
                // Aplicar negrita a los encabezados
                doc.setFont('OpenSans', 'bold');
            } else {
                // Volver a la fuente regular para las filas de datos
                doc.setFont('OpenSans', 'regular');
            }

            // Dibujar las celdas
            row.forEach((cell, index) => {
                const cellWidth = columnWidths[index];
                const cellHeight = calculateRowHeight([cell]);
                const lines = doc.splitTextToSize(cell, cellWidth);
                const verticalAlignY =
                    y + (rowHeight - lines.length * lineHeight) / 2;

                // Dibujar el texto dentro de la celda
                lines.forEach((line, lineIndex) => {
                    let textX = currentX;
                    if (alignment === 'center') {
                        textX =
                            currentX + (cellWidth - doc.getTextWidth(line)) / 2;
                    } else if (alignment === 'right') {
                        textX = currentX + cellWidth - doc.getTextWidth(line);
                    }
                    // Alineación vertical corregida
                    doc.text(
                        line,
                        textX,
                        verticalAlignY + lineIndex * lineHeight + lineHeight
                    );
                });

                // Dibujar el borde de la celda
                doc.rect(currentX, y, cellWidth, rowHeight);

                currentX += cellWidth;
            });

            // Dibujar la línea inferior de la fila
            doc.line(startX, y + rowHeight, startX + tableWidth, y + rowHeight);

            // Dibujar las líneas verticales de la tabla
            let verticalX = startX;
            columnWidths.forEach((width) => {
                doc.line(verticalX, y, verticalX, y + rowHeight);
                verticalX += width;
            });
        };

        // Dibujar encabezados
        drawRow(headers, cursorY, true);
        cursorY += calculateRowHeight(headers); // Ajustar cursorY según la altura de los encabezados

        // Dibujar filas de datos
        data.forEach((row) => {
            const rowHeight = calculateRowHeight(row); // Calcular la altura para la fila actual

            if (cursorY + rowHeight > pageHeight - marginBottom) {
                // Si el texto excede la página, añade una nueva
                doc.addPage();
                this.agregarMembretes(doc, watermark);
                this.setDefaultTextStyle(doc); // Reaplicar estilo de texto
                cursorY = 65; // Restablecer cursor a la parte superior del área de contenido

                // Redibujar encabezados en la nueva página
                drawRow(headers, cursorY, true);
                cursorY += calculateRowHeight(headers); // Ajustar cursorY según la altura de los encabezados
            }

            // Dibujar la fila actual
            drawRow(row, cursorY);
            cursorY += rowHeight; // Ajustar cursorY según la altura de la fila
        });

        // Devuelve la posición Y final después de agregar la tabla
        return cursorY + 7;
    }

    private calculateColumnWidths(
        doc,
        headers: string[],
        data: string[][],
        maxWidth: number
    ): number[] {
        // Calcular anchos de columna basados en encabezados y contenido
        const columnWidths = headers.map(
            (header) => doc.getTextWidth(header) + 10
        ); // Ancho inicial basado en encabezados
        data.forEach((row) => {
            row.forEach((cell, index) => {
                const cellWidth = doc.getTextWidth(cell) + 10; // Ancho adicional para cada celda
                if (cellWidth > columnWidths[index]) {
                    columnWidths[index] = cellWidth;
                }
            });
        });

        // Calcular el ancho total de la tabla
        const totalWidth = columnWidths.reduce((acc, width) => acc + width, 0);

        if (totalWidth < maxWidth) {
            // Si el ancho total es menor que maxWidth, redistribuir el espacio restante
            const remainingWidth = maxWidth - totalWidth;
            const additionalWidthPerColumn =
                remainingWidth / columnWidths.length;

            return columnWidths.map(
                (width) => width + additionalWidthPerColumn
            );
        } else if (totalWidth > maxWidth) {
            // Si el ancho total excede el maxWidth, reducir proporcionalmente
            const scaleFactor = maxWidth / totalWidth;
            return columnWidths.map((width) => width * scaleFactor);
        }

        // Si el ancho total es exactamente igual a maxWidth, devolver los anchos calculados inicialmente
        return columnWidths;
    }

    private agregarMarcaDeAgua(doc) {
        const watermarkText = 'MEC';

        // Configurar la fuente, tamaño y color del texto para la marca de agua
        const fontSize = 13; // Tamaño de fuente más pequeño para una cobertura densa
        doc.setFontSize(fontSize);
        doc.setFont('OpenSans', 'bold');
        doc.setTextColor(240, 240, 240); // Gris claro (sin opacidad)

        // Obtener las dimensiones de la página
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const spacing = 7; // Espaciado más pequeño entre repeticiones del texto

        // Calcular el ancho y alto del texto para colocar en la malla
        const textWidth = doc.getTextWidth(watermarkText);
        const textHeight = fontSize; // Ajustar según el tamaño de la fuente

        // Agregar el texto en una malla densa
        for (let x = -textWidth; x < pageWidth; x += spacing) {
            for (let y = -textHeight; y < pageHeight; y += spacing) {
                doc.text(watermarkText, x, y, {
                    angle: -45, // Ángulo en el que se dibuja el texto
                    align: 'center',
                    baseline: 'middle',
                    maxWidth: textWidth,
                });
            }
        }
    }

    agregarFirma(
        doc: jsPDF,
        signatureType: 'Solicitante' | 'Tutor' | 'Director' | 'Coordinador',
        signatureImage: string,
        position: 'left' | 'right',
        signatureData: {
            name: string;
            identification?: string;
            email?: string;
            cell?: string;
            additionalText?: string;
        },
        cursorY: number,
        waterMark: boolean,
        imageOffset: number = 10 // Añadir un ajuste vertical para la imagen
    ): {
        cursorY: number;
        pageNumber: number;
        signatureCoordinates: { x: number; y: number };
    } {
        const pageWidth = doc.internal.pageSize.width;
        const marginLeft = 20;
        const marginRight = 20;
        const signatureWidth = (pageWidth - marginLeft - marginRight) / 3; // Un tercio del ancho disponible
        console.log(signatureWidth);
        const signatureHeight = 20; // Altura fija para la imagen de la firma
        const lineHeight = 4;
        const signatureBottomMargin = 30; // Espacio para pie de página
        const pageNumber = doc.internal.pages.length; // Obtener el número de páginas actuales

        // Calcular la posición X basada en la alineación
        let positionX =
            position === 'left'
                ? marginLeft
                : pageWidth - signatureWidth - marginRight;

        // Comprobar si cabe en la página actual
        if (
            cursorY + signatureHeight + lineHeight + signatureBottomMargin >
            doc.internal.pageSize.height - 30
        ) {
            doc.addPage();
            this.agregarMembretes(doc, waterMark); // Añadir plantilla si es necesario
            cursorY = 65; // Restablecer cursorY a la parte superior del área de contenido
        }

        // Ajustar la posición Y para la imagen de la firma dentro del bloque
        const adjustedImageY = cursorY + signatureHeight - imageOffset;

        // Agregar imagen de la firma
        doc.addImage(
            signatureImage,
            'PNG',
            positionX,
            adjustedImageY,
            signatureWidth,
            signatureHeight
        );

        // Línea de firma
        doc.setDrawColor(79, 79, 79);
        doc.line(
            positionX,
            cursorY + signatureHeight + 10,
            positionX + signatureWidth,
            cursorY + signatureHeight + 10
        );

        // Datos del firmante
        doc.setFont('OpenSans', 'regular');
        doc.setFontSize(10);
        doc.setTextColor(79, 79, 79);
        let textY = cursorY + signatureHeight + lineHeight + 10;

        if (signatureType === 'Solicitante') {
            doc.text(`${signatureData.name.toUpperCase()}`, positionX, textY);
            doc.text(
                `Identificación: ${signatureData.identification}`,
                positionX,
                textY + lineHeight
            );
            doc.text(
                `Email: ${signatureData.email}`,
                positionX,
                textY + lineHeight * 2
            );
            doc.text(
                `Celular: ${signatureData.cell}`,
                positionX,
                textY + lineHeight * 3
            );
        } else if (signatureType === 'Tutor') {
            doc.text(
                `VoBo. ${signatureData.name.toUpperCase()}`,
                positionX,
                textY
            );
            doc.text(`Tutor(a) de Solicitante`, positionX, textY + lineHeight);
        } else if (signatureType === 'Director') {
            doc.text(
                `VoBo: ${signatureData.name.toUpperCase()}`,
                positionX,
                textY
            );
            doc.text(
                `Director(a) grupo de Investigación`,
                positionX,
                textY + lineHeight
            );
        } else if (signatureType === 'Coordinador') {
            doc.text(
                `VoBo. ${signatureData.name.toUpperCase()}`,
                positionX,
                textY
            );
            doc.text(
                `Coordinador(a) del programa`,
                positionX,
                textY + lineHeight
            );
        }

        // Retornar las coordenadas de la firma, número de página y la nueva posición Y después de agregar la firma
        return {
            cursorY: textY + lineHeight * 4 + 5,
            pageNumber,
            signatureCoordinates: {
                x: positionX,
                y: adjustedImageY,
            },
        };
    }
}
