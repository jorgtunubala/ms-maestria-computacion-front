import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UtilidadesService {
    constructor() {}

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
}
