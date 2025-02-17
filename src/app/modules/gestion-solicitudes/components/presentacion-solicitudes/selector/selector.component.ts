import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RadicarService } from '../../../services/radicar.service';
import { HttpService } from '../../../services/http.service';
import { TipoSolicitud, RequisitosSolicitud, InfoPersonal } from '../../../models/indiceModelos';
import { AutenticacionService } from '../../../../gestion-autenticacion/services/autenticacion.service';

@Component({
    selector: 'app-selector',
    templateUrl: './selector.component.html',
    styleUrls: ['./selector.component.scss'],
})
export class SelectorComponent implements OnInit {
    @Output() cambioDePaso = new EventEmitter<number>();

    tiposDeSolicitud: TipoSolicitud[];
    tipoSolicitudEscogida: TipoSolicitud;
    requisitosSolicitudEscogida: RequisitosSolicitud;

    constructor(public radicar: RadicarService, private gestorHttp: HttpService, 
        private autenticacionService: AutenticacionService) {}

    // Al iniciar el componente, se obtienen los tipos de solicitud
    ngOnInit(): void {
        this.obtenerTipos();
    }

    // Obtiene los tipos de solicitudes de acuerdo al rol
    obtenerTipos() {
        this.gestorHttp.obtenerTiposDeSolicitud().subscribe((respuesta) => {
            let rolesUsuario = this.autenticacionService.getRole();

            // Convertimos a array el string de roles
            if (!Array.isArray(rolesUsuario)) {
                rolesUsuario = [rolesUsuario]; 
            }

            // Inicializamos la lista vacía
            this.tiposDeSolicitud = [];
    
            rolesUsuario.forEach(rol => {
                switch (rol) {
                    case "ROLE_COORDINADOR":
                    case "ROLE_DOCENTE":
                        this.tiposDeSolicitud.push(...respuesta.filter(tipo => tipo.codigoSolicitud === "SO_OTRA"));
                        break;
    
                    case "ROLE_ESTUDIANTE":
                        const fechaActual = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD
    
                        // Filtrar solo CER_VOTO si la fecha está dentro del rango permitido
                        const solicitudesEstudiante = respuesta.filter(tipo => {
                            if (tipo.codigoSolicitud === "CER_VOTO") {
                                return fechaActual >= tipo.fechaInicio && fechaActual <= tipo.fechaFinal;
                            }
                            return true; // Incluir todas las demás solicitudes
                        });
    
                        this.tiposDeSolicitud.push(...solicitudesEstudiante);
                        break;
    
                    default:
                        console.warn(`Rol no reconocido: ${rol}`);
                        break;
                }
            });
    
            this.recuperarTipoEscogido();
        });
    }

    // Verifica en el servicio radicar si ya hay un tipo escogido y lo recupera
    recuperarTipoEscogido() {
        this.tipoSolicitudEscogida = this.radicar.tipoSolicitudEscogida || this.tiposDeSolicitud[0];        
        this.obtenerRequisitosDeSolicitud();
    }

    // Obtiene los requisitos del tipo de solicitud escogida
    obtenerRequisitosDeSolicitud() {
        if (this.tipoSolicitudEscogida) {
            this.gestorHttp
                .obtenerRequisitosDeSolicitud(this.tipoSolicitudEscogida.codigoSolicitud)
                .subscribe((respuesta) => {
                    this.requisitosSolicitudEscogida = respuesta;
                });
        }
    }

    // Guarda en el servicio la información actual y navega al siguiente componente
    navigateToNext() {
        this.radicar.tipoSolicitudEscogida = this.tipoSolicitudEscogida;
        this.radicar.requisitosSolicitudEscogida = this.requisitosSolicitudEscogida;
        this.cambioDePaso.emit(1); // Avanzar al siguiente paso
    }
    
}
