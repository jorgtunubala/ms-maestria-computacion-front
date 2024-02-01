import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class FakeSolicitudService {
    uploadFile(
        file: File,
        codigoEstudiante: string,
        tipoDocumento: string
    ): Observable<any> {
        const palabraClave = this.generatePalabraClave(
            codigoEstudiante,
            tipoDocumento
        );
        localStorage.setItem(palabraClave, JSON.stringify(file));

        return of({ success: true });
    }

    getFile(palabraClave: string): Observable<any> {
        const archivo = localStorage.getItem(palabraClave);
        return of(archivo ? JSON.parse(archivo) : null);
    }

    private generatePalabraClave(
        codigoEstudiante: string,
        tipoDocumento: string
    ): string {
        return `${codigoEstudiante}_${tipoDocumento}`;
    }
}
