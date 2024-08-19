import { Component, OnInit } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';

@Component({
    selector: 'app-avalpasantiainvest',
    templateUrl: './avalpasantiainvest.component.html',
    styleUrls: ['./avalpasantiainvest.component.scss'],
})
export class AvalpasantiainvestComponent implements OnInit {
    formPasantiaInvest: FormGroup;

    constructor(public radicar: RadicarService, private fb: FormBuilder) {
        this.formPasantiaInvest = this.fb.group({
            fechas: ['', Validators.required],
            lugar: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        // Verificar si hay datos en las variables del servicio radicar y llenar el formulario
        if (this.radicar.fechasEstancia.length > 0) {
            this.formPasantiaInvest.patchValue({
                fechas: this.radicar.fechasEstancia,
            });
        }
        if (this.radicar.lugarEstancia.trim() !== '') {
            this.formPasantiaInvest.patchValue({
                lugar: this.radicar.lugarEstancia,
            });
        }

        // Escuchar cambios en el formulario y actualizar las variables en radicar
        this.formPasantiaInvest.valueChanges.subscribe((value) => {
            // Verificar si value.fechas es una cadena de texto
            if (typeof value.fechas === 'string') {
                // Dividir el string de fechas en fechaInicio y fechaFin
                const fechas = value.fechas
                    .split(' - ')
                    .map((dateString) => new Date(dateString.trim()));
                this.radicar.fechasEstancia = fechas;
            } else if (Array.isArray(value.fechas)) {
                // Verificar si value.fechas es un arreglo de objetos Date
                // Asignar el valor directamente
                this.radicar.fechasEstancia = value.fechas;
            }
            this.radicar.lugarEstancia = value.lugar;
        });
    }

    validarFechas(): boolean {
        // Verificar si fechasEstancia contiene exactamente 2 fechas y si ambas son distintas de null
        return (
            this.radicar.fechasEstancia.length === 2 &&
            !!this.radicar.fechasEstancia[0] &&
            !!this.radicar.fechasEstancia[1]
        );
    }

    obtenerEstadoFormulario(): boolean {
        return this.formPasantiaInvest.valid;
    }
}
