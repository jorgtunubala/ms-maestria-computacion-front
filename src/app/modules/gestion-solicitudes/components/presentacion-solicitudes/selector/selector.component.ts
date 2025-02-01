import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RadicarService } from '../../../services/radicar.service';
import { HttpService } from '../../../services/http.service';
import { TipoSolicitud, RequisitosSolicitud, InfoPersonal } from '../../../models/indiceModelos';

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

    // Variables para la validación de fecha
    fechaLimite: Date; // Fecha ingresada por el usuario
    solicitudHabilitada: boolean = true; // Habilitar o deshabilitar la solicitud basada en la fecha
    es: any;

    constructor(public radicar: RadicarService, private gestorHttp: HttpService) {}

    // Al iniciar el componente, se obtienen los tipos de solicitud
    ngOnInit(): void {
        this.obtenerTipos();

        // Configuración del idioma español para el calendario
        this.es = {
            firstDayOfWeek: 1,
            dayNames: [
                'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado',
            ],
            dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
            dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
            monthNames: [
                'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
            ],
            monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
            today: 'Hoy',
            clear: 'Limpiar',
        };        
        console.log('Configuración del idioma:', this.es);
    }
    
    // Obtiene los tipos de solicitud y selecciona el primero por defecto
    obtenerTipos() {
        this.gestorHttp.obtenerTiposDeSolicitud().subscribe((respuesta) => {
            this.tiposDeSolicitud = respuesta;
            this.recuperarTipoEscogido();
        });
    }

    // Verifica en el servicio radicar si ya hay un tipo escogido y lo recupera
    recuperarTipoEscogido() {
        this.tipoSolicitudEscogida = this.radicar.tipoSolicitudEscogida || this.tiposDeSolicitud[0];
        console.log('Tipo de solicitud escogida:', this.tipoSolicitudEscogida.codigoSolicitud); // Verificar el valor
        this.obtenerRequisitosDeSolicitud();
    }

    // Obtiene los requisitos del tipo de solicitud escogida
    obtenerRequisitosDeSolicitud() {
        if (this.tipoSolicitudEscogida) {
            this.gestorHttp
                .obtenerRequisitosDeSolicitud(this.tipoSolicitudEscogida.codigoSolicitud)
                .subscribe((respuesta) => {
                    this.requisitosSolicitudEscogida = respuesta;
                     // Validar habilitación solo si es CER_VOTO
                     if (this.tipoSolicitudEscogida.codigoSolicitud === 'CER_VOTO') {
                        this.validarFechaHabilitada();
                    } else {
                        this.solicitudHabilitada = true; // Habilitar otras solicitudes
                    }
                });
        }
    }

    validarFechaHabilitada() {
        const hoy = new Date(); // Fecha actual
        this.solicitudHabilitada = this.fechaLimite ? hoy <= this.fechaLimite : true;
    }

    // Guarda en el servicio la información actual y navega al siguiente componente
    navigateToNext() {
        this.radicar.tipoSolicitudEscogida = this.tipoSolicitudEscogida;
        this.radicar.requisitosSolicitudEscogida = this.requisitosSolicitudEscogida;
        this.cambioDePaso.emit(1); // Avanzar al siguiente paso
    }
    
}
