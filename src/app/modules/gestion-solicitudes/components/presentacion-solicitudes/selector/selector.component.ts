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
                            // Obtener la fecha desde un servidor en Bogotá
                            fetch("https://www.timeapi.io/api/Time/current/zone?timeZone=America/Bogota")
                                .then(response => response.json())
                                .then(data => {
                                    let fechaBogota = data.date;
            
                                    // Convertir de MM/DD/YYYY a YYYY-MM-DD
                                    const [month, day, year] = fechaBogota.split("/");
                                    fechaBogota = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

                                    console.log("Fecha oficial de Bogotá:", fechaBogota);
                                    

                                    const solicitudesEstudiante = respuesta.filter(tipo => {
                                        if (tipo.codigoSolicitud === "CER_VOTO") {
                                            return fechaBogota >= tipo.fechaInicio && fechaBogota <= tipo.fechaFinal;
                                        }
                                        return true;
                                    });

                                    // Asignar un nuevo array en lugar de modificar el existente
                                    this.tiposDeSolicitud = [...this.tiposDeSolicitud, ...solicitudesEstudiante];
                                })
                                .catch(error => console.error("Error al obtener la fecha de Bogotá:", error));

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
