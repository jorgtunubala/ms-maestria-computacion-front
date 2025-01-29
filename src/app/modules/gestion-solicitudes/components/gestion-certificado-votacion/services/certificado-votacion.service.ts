import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { httpConfig } from '../../../environments/http-config';

export interface CertificadoVotacion {
  id: number;
  id_Estudiante: string;
  estado: string;
  fecha_creacion: string;
  fecha_modificacion: string;
  periodoIngreso: string;
}

export interface DocumentoCertificadoVotacion {
  documento_firmado: Uint8Array;
}

export interface AcademicPeriod {
  label: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class CertificadoVotacionService {
  private apiUrl = httpConfig.apiUrl;
  private apiUrlSub = httpConfig.apiUrlSub;

  constructor(private http: HttpClient) {}

  private manejarError(error: any) {
    console.error('Ocurrió un error', error);
    return throwError('Algo salió mal; por favor, intenta nuevamente más tarde.');
  }

  obtenerCertificado() {
    const url = `${httpConfig.apiGesion}${httpConfig.obtenerCertificadosVotos}`;
    return this.http.get<CertificadoVotacion[]>(url).pipe(
      catchError(this.manejarError)
    );
  }

  downloadCertificado(): Observable<Blob> {
    const url = `${httpConfig.apiGesion}${httpConfig.descargarCertificadosVotos}`;
    const headers = new HttpHeaders().set('Accept', 'application/zip');
    
    return this.http.get(url, {
        responseType: 'blob',
        headers: headers,
        observe: 'response'
    }).pipe(
        map(response => {
            if (response.body) {
                return new Blob([response.body], { type: 'application/zip' });
            }
            throw new Error('Respuesta vacía del servidor');
        }),
        catchError(this.manejarError)
    );
  }

  obtenerPeriodosAcademicos(): Observable<string[]> {
    const url = `${httpConfig.apiUrl}${httpConfig.periodosIngreso}`;
    return this.http.get<string[]>(url).pipe(catchError(this.manejarError));
  }  
  
}