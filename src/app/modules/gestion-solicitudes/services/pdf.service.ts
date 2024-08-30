import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

import {
    openSansRegularBase64,
    openSansBoldBase64,
} from '../../../../assets/fonts/open-sans.js';

@Injectable({
    providedIn: 'root',
})
export class PdfService {
    constructor() {}

    addTemplate(doc) {
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
        doc.addImage(imgEscudo, 'JPEG', 15, 15, 30, 40.87);

        doc.setDrawColor(0, 18, 130);
        doc.line(43, 23, 43, 48);

        // Nombre de dependencia
        doc.setFont('OpenSans', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(0, 18, 130);
        doc.text('Facultad de Ingeniería', 46, 31);
        doc.text('Electrónica y', 46, 36);
        doc.text('Telecomunicaciones', 46, 41);

        doc.setDrawColor(0, 18, 130);
        doc.line(96, 23, 96, 48);

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
        doc.text('Carrera 2 No, 3N-100 Segundo Piso, Sector Tulcán', 88, 254);
        doc.text('Popayán - Cauca - Colombia', 102, 258);
        doc.text('Teléfono (602) 8209800 Exts. 2103 - 2145', 94, 262);
        doc.setFont('OpenSans', 'bold');
        doc.text(
            'maestriacomputacion@unicauca.edu.co | www.unicauca.edu.co',
            75,
            266
        );

        // Logos de certificaciones
        doc.addImage(imgISO90001, 'JPEG', 173, 251, 12, 16);
        doc.addImage(imgIQNET, 'JPEG', 186, 253, 12, 12);
    }

    // Método para agregar contenido personalizado sobre la plantilla común
    generateTemplate1() {
        const doc = new jsPDF({ format: 'letter' });

        // Añadir primera página con la plantilla
        this.addTemplate(doc);

        // Agregar contenido personalizado
        doc.setFont('OpenSans', 'regular');
        doc.setFontSize(11);
        doc.setTextColor(79, 79, 79);
        doc.text('Popayán, XX de XXXX de XXXX', 20, 65);

        // Añadir una nueva página y repetir la plantilla
        doc.addPage();
        this.addTemplate(doc);

        // Agregar más contenido en la nueva página
        doc.setFont('OpenSans', 'regular');
        doc.setFontSize(11);
        doc.setTextColor(0, 18, 130);
        doc.text('More content on page 2', 20, 65);

        return doc;
    }

    generateTemplate3() {
        const doc = new jsPDF();
        doc.text('This is Template 3', 10, 10);
        return doc;
    }
}
