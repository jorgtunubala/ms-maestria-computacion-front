import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';

@Component({
    selector: 'app-beca',
    templateUrl: './beca.component.html',
    styleUrls: ['./beca.component.scss'],
})
export class BecaComponent implements OnInit {
    listaTiposDeBeca: string[];
    formListaBecas: FormGroup;

    constructor(public radicar: RadicarService, private fb: FormBuilder) {
        this.listaTiposDeBeca = [
            'Seleccione una opción',
            'Beca - Trabajo',
            'Beca - Mejor promedio en pregrado',
            'Beca - Convenio (cidesco)',
        ];

        this.formListaBecas = this.fb.group({
            tipoBeca: ['', Validators.required],
            justificacion: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        if (this.radicar.tipoBeca.trim() !== '') {
            this.formListaBecas.patchValue({
                tipoBeca: this.radicar.tipoBeca,
            });
        }

        if (this.radicar.motivoDeSolicitud.trim() !== '') {
            this.formListaBecas.patchValue({
                justificacion: this.radicar.motivoDeSolicitud,
            });
        }

        this.formListaBecas.valueChanges.subscribe((value) => {
            this.radicar.tipoBeca = value.tipoBeca;
            this.radicar.motivoDeSolicitud = value.justificacion;
        });
    }

    onUpload(event, fubauto, indice) {
        for (let doc of event.files) {
            this.radicar.documentosAdjuntos[indice] = doc;
        }

        fubauto.clear();
    }

    eliminarDocumento(indice) {
        this.radicar.documentosAdjuntos[indice] = undefined;
    }
}
