import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable, of, Subject, tap } from 'rxjs';
import { SolicitudEnComiteResponse, SolicitudRecibida } from '../models/indiceModelos';
import { DatosSolicitudRequest } from '../models/solicitudes/datosSolicitudRequest';

interface InfoDecano {
    nombre: string;
    titulo: string;
}

interface InfoCoordinador {
    nombre: string;
    titulo: string;
}

@Injectable({
    providedIn: 'root',
})
export class GestorService {
    private descargarArchivosSource = new Subject<void>();
    descargarArchivos$ = this.descargarArchivosSource.asObservable();

    solicitudSeleccionada: SolicitudRecibida;
    infoSolicitud: DatosSolicitudRequest;
    estadoSolicitud: string;
    conceptoComite: SolicitudEnComiteResponse;
    respuestaConsejo: any;
    asignaturasAceptadas: any[];

    decano: InfoDecano = { nombre: 'Alejandro Toledo Tovar', titulo: 'Magister' };
    coordinador: InfoCoordinador = { nombre: 'Hugo Armando Ordoñez Erazo', titulo: 'Doctor' };

    solicitudesTutorDirectorCache: SolicitudRecibida[] = [];
    solicitudesCoordinadorCache: SolicitudRecibida[] = [];
    filtroAnterior: string = '';

    private solicitudesPorFiltro: { [filtro: string]: SolicitudRecibida[] } = {};
    private cacheTimestamps: { [filtro: string]: number } = {};
    private cacheTTL: number = 10 * 60 * 1000; // Tiempo de vida del caché (10 minutos)

    constructor(private http: HttpService) {}

    // Obtiene las solicitudes de tutor o director, usando caché si es posible.
    obtenerSolicitudesTutorDirector(correoUsuario: string): Observable<SolicitudRecibida[]> {
        const now = Date.now();

        // Si hay datos en el caché y no ha expirado, devolver caché
        if (this.solicitudesTutorDirectorCache.length && now - this.cacheTimestamps['tutorDirector'] < this.cacheTTL) {
            return of(this.solicitudesTutorDirectorCache);
        }

        // Si el caché ha expirado o no existe, hacer la petición al servidor
        return this.http.obtenerListaSolPendientesAval(correoUsuario).pipe(
            tap((solicitudes) => {
                this.solicitudesTutorDirectorCache = solicitudes;
                this.cacheTimestamps['tutorDirector'] = Date.now();
            })
        );
    }

    // Obtiene las solicitudes del coordinador, usando caché si es posible.
    obtenerSolicitudesCoordinador(filtro: string): Observable<SolicitudRecibida[]> {
        const now = Date.now();

        // Si hay datos en el caché para el filtro y no ha expirado el TTL, devolver caché
        if (this.solicitudesPorFiltro[filtro]?.length && now - this.cacheTimestamps[filtro] < this.cacheTTL) {
            this.solicitudesCoordinadorCache = this.solicitudesPorFiltro[filtro];
            return of(this.solicitudesCoordinadorCache);
        }

        // Si el caché ha expirado o no existe, hacer la petición al servidor
        return this.http.consultarSolicitudesCoordinacion(filtro).pipe(
            tap((solicitudes: SolicitudRecibida[]) => {
                this.solicitudesPorFiltro[filtro] = solicitudes;
                this.cacheTimestamps[filtro] = Date.now();
                this.solicitudesCoordinadorCache = solicitudes;
                this.filtroAnterior = filtro;
            })
        );
    }

    // Mueve una solicitud de un estado a otro, actualizando las listas en caché o recargando desde la base de datos.
    moverSolicitud(solicitud: SolicitudRecibida, estadoActual: string, nuevoEstado: string): void {
        this.eliminarSolicitudDeLista(solicitud, estadoActual);
        this.agregarSolicitudANuevaLista(solicitud, nuevoEstado);
    }

    // Elimina una solicitud de la lista del filtro actual.
    private eliminarSolicitudDeLista(solicitud: SolicitudRecibida, filtro: string): void {
        if (this.solicitudesPorFiltro[filtro]) {
            this.solicitudesPorFiltro[filtro] = this.solicitudesPorFiltro[filtro].filter(
                (sol) => sol.idSolicitud !== solicitud.idSolicitud
            );
        }
    }

    // Agrega una solicitud a la lista del nuevo estado en caché o la carga desde la base de datos si el caché ha expirado.
    private agregarSolicitudANuevaLista(solicitud: SolicitudRecibida, filtro: string): void {
        const now = Date.now();

        // Si el caché para el nuevo estado es válido, agregar la solicitud directamente
        if (this.solicitudesPorFiltro[filtro]?.length && now - this.cacheTimestamps[filtro] < this.cacheTTL) {
            this.solicitudesPorFiltro[filtro].push(solicitud);
        } else {
            // Si el caché ha expirado o no existe, recargar desde la base de datos
            this.http.consultarSolicitudesCoordinacion(filtro).subscribe(
                (solicitudes: SolicitudRecibida[]) => {
                    this.solicitudesPorFiltro[filtro] = solicitudes;
                    this.cacheTimestamps[filtro] = Date.now();
                    this.solicitudesPorFiltro[filtro].push(solicitud); // Agregar la nueva solicitud
                },
                (error) => {
                    console.error('Error al actualizar la lista del filtro:', error);
                }
            );
        }
    }

    // Emite un evento para descargar archivos.
    emitirDescargarArchivos() {
        this.descargarArchivosSource.next();
    }

    // Restablece los valores seleccionados de la solicitud.
    restablecerValores() {
        this.solicitudSeleccionada = null;
        this.estadoSolicitud = '';
    }

    /*
    setSolicitudSeleccionada(prmSolicitud: SolicitudRecibida) {
        this.solicitudSeleccionada = prmSolicitud;
    }

    getSolicitudSeleccionada(): SolicitudRecibida {
        return this.solicitudSeleccionada;
    }
    */
}

//CODIGO ANTIGUO - ELIMINAR EN CASAO DE QUE FUNCIONE LO DE ARRIBA
/*
import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable, of, Subject, tap } from 'rxjs';
import { SolicitudEnComiteResponse, SolicitudRecibida } from '../models/indiceModelos';
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
    conceptoComite: SolicitudEnComiteResponse;

    solicitudesTutorDirectorCache: SolicitudRecibida[] = [];
    solicitudesCoordinadorCache: SolicitudRecibida[] = [];
    filtroAnterior: string = '';

    private solicitudesPorFiltro: { [filtro: string]: SolicitudRecibida[] } = {};
    private cacheTimestamps: { [filtro: string]: number } = {};
    private cacheTTL: number = 10 * 60 * 1000; // 10 minutos

    constructor(private http: HttpService) {}

    obtenerSolicitudesTutorDirector(correoUsuario: string): Observable<SolicitudRecibida[]> {
        const now = Date.now();

        if (this.solicitudesTutorDirectorCache.length && now - this.cacheTimestamps['tutorDirector'] < this.cacheTTL) {
            return of(this.solicitudesTutorDirectorCache);
        }

        return this.http.obtenerListaSolPendientesAval(correoUsuario).pipe(
            tap((solicitudes) => {
                this.solicitudesTutorDirectorCache = solicitudes;
                this.cacheTimestamps['tutorDirector'] = Date.now();
            })
        );
    }

    obtenerSolicitudesCoordinador(filtro: string): Observable<SolicitudRecibida[]> {
        const now = Date.now();

        // Si hay datos en el caché para ese filtro y no ha expirado el TTL, usa el caché
        if (this.solicitudesPorFiltro[filtro]?.length && now - this.cacheTimestamps[filtro] < this.cacheTTL) {
            this.solicitudesCoordinadorCache = this.solicitudesPorFiltro[filtro];
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

    // Método genérico para actualizar las listas al cambiar el estado de una solicitud
    moverSolicitud(solicitud: SolicitudRecibida, estadoActual: string, nuevoEstado: string): void {
        // Eliminar la solicitud de la lista del estado actual (caché local)
        this.eliminarSolicitudDeLista(solicitud, estadoActual);

        // Intentar agregar la solicitud a la nueva lista en caché
        this.agregarSolicitudANuevaLista(solicitud, nuevoEstado);
    }

    // Eliminar solicitud de la lista del filtro actual
    private eliminarSolicitudDeLista(solicitud: SolicitudRecibida, filtro: string): void {
        if (this.solicitudesPorFiltro[filtro]) {
            this.solicitudesPorFiltro[filtro] = this.solicitudesPorFiltro[filtro].filter(
                (sol) => sol.idSolicitud !== solicitud.idSolicitud // Asumiendo que la solicitud tiene un 'id' único
            );
        }
    }

    // Agregar solicitud a la nueva lista, o cargar desde la BD si el cache está vencido
    private agregarSolicitudANuevaLista(solicitud: SolicitudRecibida, filtro: string): void {
        const now = Date.now();

        // Si el caché para el nuevo estado existe y no ha expirado, agregar la solicitud directamente
        if (this.solicitudesPorFiltro[filtro]?.length && now - this.cacheTimestamps[filtro] < this.cacheTTL) {
            this.solicitudesPorFiltro[filtro].push(solicitud);
        } else {
            // Si el caché ha expirado o no existe, recargar desde la base de datos
            this.http.consultarSolicitudesCoordinacion(filtro).subscribe(
                (solicitudes: SolicitudRecibida[]) => {
                    // Actualizar el caché con la nueva lista desde la BD
                    this.solicitudesPorFiltro[filtro] = solicitudes;
                    this.cacheTimestamps[filtro] = Date.now(); // Actualizar la marca de tiempo del cache

                    // Asegurarse de que la nueva solicitud también se agregue a la lista
                    this.solicitudesPorFiltro[filtro].push(solicitud);
                },
                (error) => {
                    console.error('Error al actualizar la lista del filtro:', error);
                }
            );
        }
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
*/
