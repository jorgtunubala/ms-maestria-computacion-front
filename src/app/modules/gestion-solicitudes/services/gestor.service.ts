import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable, of, Subject, tap } from 'rxjs';
import { SolicitudRecibida } from '../models/indiceModelos';
import { DatosSolicitudRequest } from '../models/solicitudes/datosSolicitudRequest';

@Injectable({
    providedIn: 'root',
})
export class GestorService {
    private descargarArchivosSource = new Subject<void>();
    descargarArchivos$ = this.descargarArchivosSource.asObservable();

    solicitudSeleccionada: SolicitudRecibida;
    infoSolicitud: DatosSolicitudRequest;
    estadoSolicitud: string;

    solicitudesTutorDirectorCache: SolicitudRecibida[] = [];
    solicitudesCoordinadorCache: SolicitudRecibida[] = [];
    filtroAnterior: string = '';

    private solicitudesPorFiltro: { [filtro: string]: SolicitudRecibida[] } =
        {};
    private cacheTimestamps: { [filtro: string]: number } = {};
    private cacheTTL: number = 10 * 60 * 1000; // 10 minutos

    constructor(private http: HttpService) {}

    obtenerSolicitudesTutorDirector(
        correoUsuario: string
    ): Observable<SolicitudRecibida[]> {
        const now = Date.now();

        if (
            this.solicitudesTutorDirectorCache.length &&
            now - this.cacheTimestamps['tutorDirector'] < this.cacheTTL
        ) {
            return of(this.solicitudesTutorDirectorCache);
        }

        return this.http.obtenerListaSolPendientesAval(correoUsuario).pipe(
            tap((solicitudes) => {
                this.solicitudesTutorDirectorCache = solicitudes;
                this.cacheTimestamps['tutorDirector'] = Date.now();
            })
        );
    }

    obtenerSolicitudesCoordinador(
        filtro: string
    ): Observable<SolicitudRecibida[]> {
        const now = Date.now();

        // Si hay datos en el caché para ese filtro y no ha expirado el TTL, usa el caché
        if (
            this.solicitudesPorFiltro[filtro]?.length &&
            now - this.cacheTimestamps[filtro] < this.cacheTTL
        ) {
            this.solicitudesCoordinadorCache =
                this.solicitudesPorFiltro[filtro];
            return of(this.solicitudesCoordinadorCache); // Retorna Observable si está en cache
        }

        // Si no hay caché o el filtro cambió o expiró el TTL, hacer nueva consulta
        return this.http.consultarSolicitudesCoordinacion(filtro).pipe(
            tap((solicitudes: SolicitudRecibida[]) => {
                // Guardar el resultado en el caché por filtro
                this.solicitudesPorFiltro[filtro] = solicitudes;
                this.cacheTimestamps[filtro] = Date.now();

                // Actualizar el caché principal con las solicitudes del filtro actual
                this.solicitudesCoordinadorCache = solicitudes;
                this.filtroAnterior = filtro; // Actualizar el filtro anterior
            })
        );
    }

    // Método para limpiar cachés específicos por filtro si es necesario
    private clearCacheFiltro(filtro: string): void {
        delete this.solicitudesPorFiltro[filtro];
        delete this.cacheTimestamps[filtro];
    }

    // Limpiar todos los cachés del coordinador
    private clearAllCoordinadorCache(): void {
        this.solicitudesPorFiltro = {};
        this.cacheTimestamps = {};
    }

    emitirDescargarArchivos() {
        this.descargarArchivosSource.next();
    }

    restablecerValores() {
        this.solicitudSeleccionada = null;
        this.estadoSolicitud = '';
    }

    setSolicitudSeleccionada(prmSolicitud: SolicitudRecibida) {
        this.solicitudSeleccionada = prmSolicitud;
    }

    getSolicitudSeleccionada(): SolicitudRecibida {
        return this.solicitudSeleccionada;
    }
}
