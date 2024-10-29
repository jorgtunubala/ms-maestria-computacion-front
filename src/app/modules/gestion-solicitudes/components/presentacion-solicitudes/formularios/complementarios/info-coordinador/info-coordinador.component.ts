import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';

@Component({
    selector: 'app-info-coordinador',
    templateUrl: './info-coordinador.component.html',
    styleUrls: ['./info-coordinador.component.scss'],
})
export class InfoCoordinadorComponent implements OnInit {
    formInfoCoordinador: FormGroup;
    showWarning: boolean = false; // Flag para mostrar advertencia
    pronombres: string[];

    constructor(private fb: FormBuilder, private radicar: RadicarService, public ref: DynamicDialogRef) {
        this.pronombres = ['el', 'ella'];
    }

    ngOnInit(): void {
        this.formInfoCoordinador = this.fb.group({
            nombreCompleto: ['', Validators.required],
            titulo: ['', Validators.required],
            pronombre: ['', this.customValidator()],
        });

        // Verificar si ya hay datos en el servicio
        const formData = this.radicar.formInfoCoordinador.value;
        const hasData = Object.values(formData).some((value) => value !== null && value !== '');

        if (hasData) {
            // Cargar datos en el formulario desde el servicio
            this.formInfoCoordinador.patchValue(formData);
        }

        // Establecer el formulario en el servicio para compartirlo
        this.radicar.formInfoCoordinador = this.formInfoCoordinador;
    }

    customValidator() {
        return (control: AbstractControl) => {
            const tipoSeleccionado: string = control.value;
            if (!tipoSeleccionado || tipoSeleccionado === '') {
                return { tipoInvalido: true };
            }
            return null;
        };
    }

    obtenerEstadoFormulario(): boolean {
        return this.formInfoCoordinador.valid;
    }

    guardarInfo() {
        if (this.formInfoCoordinador.valid) {
            this.ref.close(); // Envía el motivo y cierra el diálogo
        } else {
            this.showWarning = true;
        }
    }

    cancelar() {
        this.ref.close(); // Cierra el diálogo sin enviar datos
    }
}
