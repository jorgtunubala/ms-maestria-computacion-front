import { Component, OnInit } from '@angular/core';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/app/modules/gestion-solicitudes/services/http.service';

@Component({
    selector: 'app-infopersonal',
    templateUrl: './infopersonal.component.html',
    styleUrls: ['./infopersonal.component.scss'],
})
export class InfopersonalComponent implements OnInit {
    identificadorSolicitante: string = 'ctorres@unicauca.edu.co';
    tiposIdentificacion: string[];
    formInfoPersonal: FormGroup;

    constructor(
        public radicar: RadicarService,
        private gestorHttp: HttpService,
        private fb: FormBuilder
    ) {
        this.tiposIdentificacion = [
            'Cédula de ciudadania',
            'Cédula de extrangeria',
            'Tarjeta de identidad',
            'Pasaporte',
            'CC',
        ];
    }

    ngOnInit(): void {
        // Inicializar el formulario
        this.formInfoPersonal = this.fb.group({
            id: [null], // Campo `id` agregado
            nombres: [{ value: '', disabled: true }, Validators.required],
            apellidos: [{ value: '', disabled: true }, Validators.required],
            correo: [
                { value: '', disabled: true },
                [Validators.required, Validators.email],
            ],
            celular: [{ value: '', disabled: true }, Validators.required],
            codigoAcademico: [
                { value: '', disabled: true },
                Validators.required,
            ],
            tipoDocumento: [{ value: '', disabled: true }, Validators.required],
            numeroDocumento: [
                { value: '', disabled: true },
                Validators.required,
            ],
        });

        // Verificar si ya hay datos en el servicio
        const formData = this.radicar.formInfoPersonal.value;
        const hasData = Object.values(formData).some(
            (value) => value !== null && value !== ''
        );

        if (hasData) {
            // Cargar datos en el formulario desde el servicio
            this.formInfoPersonal.patchValue(formData);
        } else {
            // Obtener información del solicitante desde la base de datos
            this.obtenerInfoDeSolicitante();
        }

        // Establecer el formulario en el servicio para compartirlo
        this.radicar.formInfoPersonal = this.formInfoPersonal;
    }

    obtenerInfoDeSolicitante() {
        this.gestorHttp
            .obtenerInfoPersonalSolicitante(this.identificadorSolicitante)
            .subscribe((respuesta) => {
                // Al recibir la respuesta, actualizar tanto el formulario como los datos en el servicio
                this.formInfoPersonal.patchValue(respuesta);

                // Actualizar datos en el servicio
                if (this.radicar.formInfoPersonal) {
                    this.radicar.formInfoPersonal.patchValue(respuesta);
                }
            });
    }
}
