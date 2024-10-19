import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';

@Component({
    selector: 'app-info-presidente-consejo',
    templateUrl: './info-presidente-consejo.component.html',
    styleUrls: ['./info-presidente-consejo.component.scss'],
})
export class InfoPresidenteConsejoComponent implements OnInit {
    formInfoPresidenteConsejo: FormGroup;
    showWarning: boolean = false; // Flag para mostrar advertencia

    constructor(private fb: FormBuilder, private radicar: RadicarService, public ref: DynamicDialogRef) {}

    ngOnInit(): void {
        this.formInfoPresidenteConsejo = this.fb.group({
            nombreCompleto: ['', Validators.required],
            titulo: ['', Validators.required],
        });

        // Verificar si ya hay datos en el servicio
        const formData = this.radicar.formInfoCoordinador.value;
        const hasData = Object.values(formData).some((value) => value !== null && value !== '');

        if (hasData) {
            // Cargar datos en el formulario desde el servicio
            this.formInfoPresidenteConsejo.patchValue(formData);
        }

        // Establecer el formulario en el servicio para compartirlo
        this.radicar.formInfoPresidenteConsejo = this.formInfoPresidenteConsejo;
    }

    obtenerEstadoFormulario(): boolean {
        return this.formInfoPresidenteConsejo.valid;
    }

    guardarInfo() {
        if (this.formInfoPresidenteConsejo.valid) {
            this.ref.close(); // Envía el motivo y cierra el diálogo
        } else {
            this.showWarning = true;
        }
    }

    cancelar() {
        this.ref.close(); // Cierra el diálogo sin enviar datos
    }
}
