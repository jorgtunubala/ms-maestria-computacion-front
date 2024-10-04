import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';
import { UtilidadesService } from 'src/app/modules/gestion-solicitudes/services/utilidades.service';

@Component({
    selector: 'app-apypublicacion',
    templateUrl: './apypublicacion.component.html',
    styleUrls: ['./apypublicacion.component.scss'],
})
export class ApypublicacionComponent implements OnInit {
    formApoyoPagoPublic: FormGroup;
    tiposCuentaBancaria: string[];
    tiposCongreso: string[];

    constructor(
        public radicar: RadicarService,
        private fb: FormBuilder,
        private servicioUtilidades: UtilidadesService
    ) {
        this.tiposCuentaBancaria = ['Seleccione una opción', 'Ahorros', 'Corriente'];
        this.tiposCongreso = [
            'Seleccione una opción',
            'Articulo en revista indexada categoría A1 o A2 de Publindex',
            'Articulo en revista indexada categoría B de Publindex',
            'Articulo en revista indexada categoría C de Publindex',
            'Articulo en revista no indexada de Publindex',
            'Articulo en memoria de evento arbitrario internacional con ISBN',
            'Articulo en memoria de evento arbitrario nacional con ISBN',
        ];

        this.formApoyoPagoPublic = this.fb.group({
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
        this.servicioUtilidades.configurarIdiomaCalendario();

        if (this.radicar.fechasEstancia.length > 0) {
            this.formApoyoPagoPublic.patchValue({
                fechas: this.radicar.fechasEstancia,
            });
        }
        if (this.radicar.nombreCongreso.trim() !== '') {
            this.formApoyoPagoPublic.patchValue({
                nombreCongreso: this.radicar.nombreCongreso,
            });
        }
        if (this.radicar.tipoCongreso.trim() !== '') {
            this.formApoyoPagoPublic.patchValue({
                tipoCongreso: this.radicar.tipoCongreso,
            });
        }
        if (this.radicar.tituloPublicacion.trim() !== '') {
            this.formApoyoPagoPublic.patchValue({
                tituloPublicacion: this.radicar.tituloPublicacion,
            });
        }
        if (this.radicar.valorApoyoEcon !== null) {
            this.formApoyoPagoPublic.patchValue({
                valorApoyo: this.radicar.valorApoyoEcon,
            });
        }
        if (this.radicar.banco.trim() !== '') {
            this.formApoyoPagoPublic.patchValue({
                nombreBanco: this.radicar.banco,
            });
        }
        if (this.radicar.tipoCuenta.trim() !== '') {
            this.formApoyoPagoPublic.patchValue({
                tipoCuenta: this.radicar.tipoCuenta,
            });
        }
        if (this.radicar.numeroCuenta.trim() !== '') {
            this.formApoyoPagoPublic.patchValue({
                numeroCuenta: this.radicar.numeroCuenta,
            });
        }
        if (this.radicar.cedulaCuentaBanco.trim() !== '') {
            this.formApoyoPagoPublic.patchValue({
                cedulaEnBanco: this.radicar.cedulaCuentaBanco,
            });
        }
        if (this.radicar.direccion.trim() !== '') {
            this.formApoyoPagoPublic.patchValue({
                direccionRecidencia: this.radicar.direccion,
            });
        }

        this.formApoyoPagoPublic.valueChanges.subscribe((value) => {
            // Verificar si value.fechas es una cadena de texto
            if (typeof value.fechas === 'string') {
                // Dividir el string de fechas en fechaInicio y fechaFin
                const fechas = value.fechas.split(' - ').map((dateString) => new Date(dateString.trim()));
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
            if (!tipoSeleccionado || tipoSeleccionado === 'Seleccione una opción') {
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
        return this.formApoyoPagoPublic.valid;
    }
}
