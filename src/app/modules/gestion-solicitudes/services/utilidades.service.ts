import { Injectable } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class UtilidadesService {
    constructor(private sanitizer: DomSanitizer, private primengConfig: PrimeNGConfig) {}

    // Método para establecer la traducción del calendario al español
    configurarIdiomaCalendario(): void {
        this.primengConfig.setTranslation({
            dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
            dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
            dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
            monthNames: [
                'enero',
                'febrero',
                'marzo',
                'abril',
                'mayo',
                'junio',
                'julio',
                'agosto',
                'septiembre',
                'octubre',
                'noviembre',
                'diciembre',
            ],
            monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
            today: 'Hoy',
            clear: 'Limpiar',
            dateFormat: 'dd/mm/yy',
            weekHeader: 'Sm',
        });
    }

    async convertirFileABase64(archivo: File | null): Promise<string | null> {
        return new Promise((resolve, reject) => {
            if (!archivo) {
                resolve(null);
                return;
            }

            const lector = new FileReader();

            lector.readAsDataURL(archivo);

            lector.onload = () => {
                if (typeof lector.result === 'string') {
                    const nombre = archivo.name;
                    const contenidoBase64 = lector.result.split(',')[1];
                    const base64ConNombre = `${nombre}:${contenidoBase64}`;
                    resolve(base64ConNombre);
                } else {
                    reject(null);
                }
            };

            lector.onerror = () => {
                reject(null);
            };
        });
    }

    convertirBase64AFile(base64String: string): File | null {
        // Divide la cadena base64 en nombre y contenido
        const partes = base64String.split(':');
        if (partes.length !== 2) {
            return null; // La cadena base64 no tiene el formato esperado
        }

        const nombre = partes[0];
        const contenidoBase64 = partes[1];

        // Decodifica el contenido base64 en un ArrayBuffer
        const binaryString = window.atob(contenidoBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Crea un nuevo archivo Blob a partir del ArrayBuffer
        const blob = new Blob([bytes]);

        // Crea un nuevo objeto File a partir del Blob y asigna el nombre del archivo
        const archivo = new File([blob], nombre);

        return archivo;
    }

    // Crea una URL segura para mostrar el archivo PDF
    crearUrlSeguroParaPDF(documento: File): SafeResourceUrl {
        const tipoMIME = 'application/pdf';
        const blob = new Blob([documento], { type: tipoMIME });
        const url = URL.createObjectURL(blob);
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    // Abre un enlace en una nueva pestaña
    abrirEnlaceExterno(enlace: string): void {
        if (enlace) {
            const enlaceCompleto = enlace.startsWith('http') ? enlace : `http://${enlace}`;
            window.open(enlaceCompleto, '_blank');
        }
    }

    extraerFechaDeRange(campoFechas: Date[], posicionFecha: number, separador: string, orden: number): string {
        if (posicionFecha < 0 || posicionFecha >= campoFechas.length || (orden !== 0 && orden !== 1)) {
            throw new Error('Parámetros inválidos');
        }

        const fecha = campoFechas[posicionFecha];
        const [dia, mes, anio] = [
            fecha.getDate().toString().padStart(2, '0'),
            (fecha.getMonth() + 1).toString().padStart(2, '0'),
            fecha.getFullYear(),
        ];

        return orden === 0
            ? `${dia}${separador}${mes}${separador}${anio}`
            : `${anio}${separador}${mes}${separador}${dia}`;
    }

    describirRangoFechas(fechaInicio: any, fechaFin: any) {
        // Obteniendo los componentes de las fechas
        const diaInicio = fechaInicio.getDate();
        const mesInicio = fechaInicio.getMonth() + 1;
        const anioInicio = fechaInicio.getFullYear();

        const diaFin = fechaFin.getDate();
        const mesFin = fechaFin.getMonth() + 1;
        const anioFin = fechaFin.getFullYear();

        // Formateando las fechas como dd/mm/aa
        const fechaInicioStr = `${diaInicio}/${mesInicio}/${anioInicio}`;
        const fechaFinStr = `${diaFin}/${mesFin}/${anioFin}`;

        // Concatenando las fechas formateadas con un guión entre ellas
        const fechaEstanciaStr = `${fechaInicioStr} al ${fechaFinStr}`;

        return fechaEstanciaStr;
    }

    obtenerMesEnLetras(mes: number): string {
        const mesesEnLetras = [
            'enero',
            'febrero',
            'marzo',
            'abril',
            'mayo',
            'junio',
            'julio',
            'agosto',
            'septiembre',
            'octubre',
            'noviembre',
            'diciembre',
        ];
        return mesesEnLetras[mes - 1]; // Ajuste porque getMonth() devuelve 0-11
    }

    // Método para validar la seguridad de un enlace
    validarUrlSegura(enlace: string): boolean {
        // Expresión regular para validar el formato de la URL
        const URL_REGEX = /^https:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(\/[^\s]*)?$/;

        // Validar el formato de la URL
        const urlValida = URL_REGEX.test(enlace);
        if (!urlValida) {
            return false;
        }

        // Intentar analizar la URL
        let parsedUrl: URL;
        try {
            parsedUrl = new URL(enlace);
        } catch (error) {
            return false;
        }

        // Patrones sospechosos
        const SUSPICIOUS_PATTERNS = [
            /.*(\/redirect|\/click).*/, // URLs de redirección
            /.*(malicious|phishing|scam).*/i, // Palabras clave sospechosas
            /.*\?.*=(.*)&.*=.*[^\w]/, // Parámetros inusuales
        ];

        // Verificar si la URL coincide con patrones sospechosos
        const isSuspicious = SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(enlace));
        if (isSuspicious) {
            return false;
        }

        // Si todas las validaciones son exitosas
        return true;
    }
}
