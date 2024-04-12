import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';

@Component({
    selector: 'app-semestreaplazar',
    templateUrl: './semestreaplazar.component.html',
    styleUrls: ['./semestreaplazar.component.scss'],
})
export class SemestreaplazarComponent implements OnInit {
    formSemestreAplazar: FormGroup;

    constructor(public radicar: RadicarService, private fb: FormBuilder) {
        this.formSemestreAplazar = this.fb.group({
            semestre: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        if (this.radicar.semestreAplazamiento.trim() !== '') {
            this.formSemestreAplazar.patchValue({
                semestre: this.radicar.semestreAplazamiento,
            });
        }

        // Escuchar cambios en el formulario y actualizar el motivoDeSolicitud en radicar
        this.formSemestreAplazar.valueChanges.subscribe((value) => {
            this.radicar.semestreAplazamiento = value.semestre;
        });
    }

    obtenerEstadoFormulario(): boolean {
        return this.formSemestreAplazar.valid;
    }
}
