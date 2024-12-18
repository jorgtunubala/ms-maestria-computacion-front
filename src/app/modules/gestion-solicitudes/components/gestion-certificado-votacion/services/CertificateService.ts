/*
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { httpConfig } from '../environments/http.config';
import {
    TiposSolicitudResponse,
    SolicitudSave,
    SolicitudRecibida,
};

@Injectable({
    providedIn: 'root',
})
export class HttpService {
    private apiUrl = httpConfig.apiUrl;
    private apiUrlSub = httpConfig.apiUrlSub;

    constructor(private http: HttpClient) {}

    private manejarError(error: any) {
        console.error('Ocurrió un error', error);
        return throwError('Algo salió mal; por favor, intenta nuevamente más tarde.');
    }

    obtenerTiposDeSolicitud() {
        const url = `${this.apiUrl}${httpConfig.obtenerTiposDeSolicitudUrl}`;
        return this.http.get<TiposSolicitudResponse>(url).pipe(
            map((respuesta) => respuesta.tipoSolicitudDto),
            catchError(this.manejarError)
        );
    }

}

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Certificate } from '../components/tramitecertificado/tramitecertificado.component';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private certificates: Certificate[] = [
    {
      academicCode: '134566',
      id: 3,
      certificatePdf: 'Documentos.pdf',
      deliveryDate: '22/11/2024',
      reviewDate: '25/11/2024',
      state: 'Aprobado'
    },
    {
      academicCode: '897441',
      id: 2,
      certificatePdf: 'Documentos.pdf',
      deliveryDate: '22/11/2024',
      reviewDate: '24/11/2024',
      state: 'No enviado'
    }
  ];

  getCertificates(): Observable<Certificate[]> {
    return of(this.certificates);
  }
}
*/