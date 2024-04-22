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

        this.formApoyoAsistEvento = this.fb.group({
            nombreCongreso: ['', Validators.required],
            tipoCongreso: ['', this.customValidator()],
            tituloPublicacion: ['', Validators.required],
            fechas: ['', Validators.required],
            valorApoyo: ['', Validators.required],
            nombreBanco: ['', Validators.required],
            tipoCuenta: ['', this.customValidator()],
            numeroCuenta: ['', Validators.required],
            cedulaEnBanco: ['', Validators.required],
            direccionRecidencia: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        if (this.radicar.fechasEstancia.length > 0) {
            this.formApoyoAsistEvento.patchValue({
                fechas: this.radicar.fechasEstancia,
            });
        }
        if (this.radicar.nombreCongreso.trim() !== '') {
            this.formApoyoAsistEvento.patchValue({
                nombreCongreso: this.radicar.nombreCongreso,
            });
        }
        if (this.radicar.tipoCongreso.trim() !== '') {
            this.formApoyoAsistEvento.patchValue({
                tipoCongreso: this.radicar.tipoCongreso,
            });
        }
        if (this.radicar.tituloPublicacion.trim() !== '') {
            this.formApoyoAsistEvento.patchValue({
                tituloPublicacion: this.radicar.tituloPublicacion,
            });
        }
        if (this.radicar.valorApoyoEcon !== null) {
            this.formApoyoAsistEvento.patchValue({
                valorApoyo: this.radicar.valorApoyoEcon,
            });
        }
        if (this.radicar.banco.trim() !== '') {
            this.formApoyoAsistEvento.patchValue({
                nombreBanco: this.radicar.banco,
            });
        }
        if (this.radicar.tipoCuenta.trim() !== '') {
            this.formApoyoAsistEvento.patchValue({
                tipoCuenta: this.radicar.tipoCuenta,
            });
        }
        if (this.radicar.numeroCuenta.trim() !== '') {
            this.formApoyoAsistEvento.patchValue({
                numeroCuenta: this.radicar.numeroCuenta,
            });
        }
        if (this.radicar.cedulaCuentaBanco.trim() !== '') {
            this.formApoyoAsistEvento.patchValue({
                cedulaEnBanco: this.radicar.cedulaCuentaBanco,
            });
        }
        if (this.radicar.direccion.trim() !== '') {
            this.formApoyoAsistEvento.patchValue({
                direccionRecidencia: this.radicar.direccion,
            });
        }

        this.formApoyoAsistEvento.valueChanges.subscribe((value) => {
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

            this.radicar.nombreCongreso = value.nombreCongreso;
            this.radicar.tipoCongreso = value.tipoCongreso;
            this.radicar.tituloPublicacion = value.tituloPublicacion;
            this.radicar.valorApoyoEcon = value.valorApoyo;
            this.radicar.banco = value.nombreBanco;
            this.radicar.tipoCuenta = value.tipoCuenta;
            this.radicar.numeroCuenta = value.numeroCuenta;
            this.radicar.cedulaCuentaBanco = value.cedulaEnBanco;
            this.radicar.direccion = value.direccionRecidencia;
        });
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
