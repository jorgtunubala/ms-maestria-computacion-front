import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { backend } from 'src/app/core/constants/api-url';
import { getHeaders } from 'src/app/core/constants/header';
import { Solicitud } from '../models/solicitud';
import { Estudiante } from '../../../shared/models/estudiante';

@Injectable({
    providedIn: 'root',
})
export class SolicitudService {
    constructor(private http: HttpClient) {}

    private estudianteSeleccionadoSubject = new BehaviorSubject<Estudiante>(
        null
    );

    estudianteSeleccionado$: Observable<Estudiante> =
        this.estudianteSeleccionadoSubject.asObservable();

    createSolicitud(solicitud: Solicitud) {
        return this.http.post<any>(backend('solicitud'), solicitud, {
            headers: getHeaders(),
        });
    }

    listSolicitudes(): Observable<Solicitud[]> {
        return this.http.get<Solicitud[]>(backend('solicitud'), {
            headers: getHeaders(),
        });
    }

    setEstudianteSeleccionado(estudiante: Estudiante) {
        this.estudianteSeleccionadoSubject.next(estudiante);
    }

    deleteSolicitud(id: number) {
        return this.http.delete<any>(backend(`solicitud/${id}`), {
            headers: getHeaders(),
        });
    }

    updateEstudiante(id: number, solicitud: Solicitud) {
        return this.http.put<any>(backend(`solicitud/${id}`), solicitud, {
            headers: getHeaders(),
        });
    }

    getSolicitud(id: number) {
        return this.http.get<Solicitud>(backend(`solicitud/${id}`), {
            headers: getHeaders(),
        });
    }

    // logFormData(formData: FormData): void {
    //     const formDataObject: { [key: string]: any } = {};
    //     formData.forEach((value, key) => {
    //         formDataObject[key] = value;
    //     });
    //     console.log(formDataObject);
    // }

    uploadFile(file: File, codigoEstudiante: string, tipoDocumento: string) {
        const formData: FormData = new FormData();
        const palabraClave = this.generatePalabraClave(
            codigoEstudiante,
            tipoDocumento
        );
        localStorage.setItem(palabraClave, palabraClave);
        formData.append('file', file, file.name);
        formData.append('codigoEstudiante', codigoEstudiante);
        formData.append('tipoDocumento', tipoDocumento);
        // this.logFormData(formData);
        return this.http.post<any>(backend('solicitud/upload'), formData, {
            headers: getHeaders(),
        });
    }

    getFile(palabraClave: string): Observable<any> {
        const filter = localStorage.getItem(palabraClave);
        const params = new HttpParams().set('filter', filter);
        return this.http.get<any>(backend('solicitud/getFile'), {
            headers: getHeaders(),
            params: params,
        });
    }

    generatePalabraClave(
        codigoEstudiante: string,
        tipoDocumento: string
    ): string {
        return `${codigoEstudiante}_${tipoDocumento}`;
    }
}
