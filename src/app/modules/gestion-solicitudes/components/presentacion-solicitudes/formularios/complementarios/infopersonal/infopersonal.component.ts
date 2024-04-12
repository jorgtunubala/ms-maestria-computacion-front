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

        this.formInfoPersonal = this.fb.group({
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
    }

    ngOnInit(): void {
        if (this.radicar.datosSolicitante.nombres == null) {
            this.obtenerInfoDeSolicitante();
        } else {
            // Si ya hay información en datosSolicitante, cargarla en el formulario
            this.formInfoPersonal.patchValue(this.radicar.datosSolicitante);
        }
    }

    obtenerInfoDeSolicitante() {
        this.gestorHttp
            .obtenerInfoPersonalSolicitante(this.identificadorSolicitante)
            .subscribe((respuesta) => {
                // Al recibir la respuesta, actualizar tanto el formulario como los datos en el servicio
                this.formInfoPersonal.patchValue(respuesta);
                this.radicar.datosSolicitante = respuesta;
            });
    }
}
