import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/app/modules/gestion-solicitudes/services/http.service';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';

@Component({
    selector: 'app-prueba',
    templateUrl: './prueba.component.html',
    styleUrls: ['./prueba.component.scss'],
})
export class PruebaComponent implements OnInit {
    identificadorSolicitante: string = 'ctorres@unicauca.edu.co';
    tiposIdentificacion: string[];
    formInfoDePrueba: FormGroup;

    constructor(
        public radicar: RadicarService,
        private fb: FormBuilder,
        private gestorHttp: HttpService
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
        this.formInfoDePrueba = this.fb.group({
            nombres: ['', Validators.required],
            apellidos: ['', Validators.required],
            correo: ['', [Validators.required, Validators.email]],
            celular: ['', Validators.required],
            codigoAcademico: ['', Validators.required],
            tipoDocumento: ['', Validators.required],
            numeroDocumento: ['', Validators.required],
        });

        // Verificar si hay datos en el servicio
        if (this.radicar.formInfoDePrueba.value.nombres) {
            // Cargar datos en el formulario desde el servicio
            this.formInfoDePrueba.patchValue(
                this.radicar.formInfoDePrueba.value
            );
        } else {
            // Obtener información del solicitante desde la base de datos
            this.obtenerInfoDeSolicitante();
        }

        // Establecer el formulario en el servicio para compartirlo
        this.radicar.formInfoDePrueba = this.formInfoDePrueba;
    }

    obtenerInfoDeSolicitante(): void {
        this.gestorHttp
            .obtenerInfoPersonalSolicitante(this.identificadorSolicitante)
            .subscribe((respuesta) => {
                // Al recibir la respuesta, actualizar tanto el formulario como los datos en el servicio
                this.formInfoDePrueba.patchValue(respuesta);
                // Actualizar datos en el servicio
                if (this.radicar.formInfoDePrueba) {
                    this.radicar.formInfoDePrueba.patchValue(respuesta);
                }
            });
    }
}
