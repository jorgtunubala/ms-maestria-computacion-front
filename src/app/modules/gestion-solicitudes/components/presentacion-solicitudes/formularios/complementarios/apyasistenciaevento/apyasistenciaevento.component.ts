import { Component, OnInit } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';

@Component({
    selector: 'app-apyasistenciaevento',
    templateUrl: './apyasistenciaevento.component.html',
    styleUrls: ['./apyasistenciaevento.component.scss'],
})
export class ApyasistenciaeventoComponent implements OnInit {
    formApoyoAsistEvento: FormGroup;
    tiposCuentaBancaria: string[];
    tiposCongreso: string[];

    constructor(public radicar: RadicarService, private fb: FormBuilder) {
        this.tiposCuentaBancaria = [
            'Seleccione una opción',
            'Ahorros',
            'Corriente',
        ];
        this.tiposCongreso = ['Seleccione una opción', 'Opcion 1', 'Opcion 2'];
    }

    ngOnInit(): void {
        this.formApoyoAsistEvento = this.fb.group({
            nombreCongreso: ['', Validators.required],
            tipoCongreso: ['', this.customValidator()],
            tituloPublicacion: ['', Validators.required],
            fechas: ['', Validators.required],
            valorApoyo: ['', Validators.required],
            entidadBancaria: ['', Validators.required],
            tipoCuenta: ['', this.customValidator()],
            numeroCuenta: ['', Validators.required],
            numeroCedulaAsociada: ['', Validators.required],
            direccionResidencia: ['', Validators.required],
        });

        // Verificar si ya hay datos en el servicio
        const formData = this.radicar.formApoyoAsistEvento.value;
        const hasData = Object.values(formData).some(
            (value) => value !== null && value !== ''
        );

        if (hasData) {
            // Cargar datos en el formulario desde el servicio
            this.formApoyoAsistEvento.patchValue(formData);
        }

        // Establecer el formulario en el servicio para compartirlo
        this.radicar.formApoyoAsistEvento = this.formApoyoAsistEvento;
    }

    customValidator() {
        return (control: AbstractControl) => {
            const tipoSeleccionado: string = control.value;
            if (
                !tipoSeleccionado ||
                tipoSeleccionado === 'Seleccione una opción'
            ) {
                return { tipoInvalido: true };
            }
            return null;
        };
    }

    validarFechas(): boolean {
        return (
            this.radicar.fechasEstancia.length === 2 &&
            !!this.radicar.fechasEstancia[0] &&
            !!this.radicar.fechasEstancia[1]
        );
    }

    obtenerEstadoFormulario(): boolean {
        return this.formApoyoAsistEvento.valid;
    }
}
