import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';

@Component({
    selector: 'app-becadescuento',
    templateUrl: './becadescuento.component.html',
    styleUrls: ['./becadescuento.component.scss'],
})
export class BecaDescuentoComponent implements OnInit {
    listaTiposDeBeca: string[];
    formSolicitudBecaDescuento: FormGroup;

    constructor(public radicar: RadicarService, private fb: FormBuilder) {
        this.listaTiposDeBeca = [
            'Beca - Trabajo',
            'Beca - Mejor promedio en pregrado',
            'Beca - Convenio (cidesco)',
        ];
    }

    ngOnInit(): void {
        this.formSolicitudBecaDescuento = this.fb.group({
            tipoBeca: ['', Validators.required],
            justificacion: ['', Validators.required],
        });

        // Verificar si ya hay datos en el servicio
        const formData = this.radicar.formSolicitudBecaDescuento.value;
        const hasData = Object.values(formData).some(
            (value) => value !== null && value !== ''
        );

        if (hasData) {
            // Cargar datos en el formulario desde el servicio
            this.formSolicitudBecaDescuento.patchValue(formData);
        }

        // Establecer el formulario en el servicio para compartirlo
        this.radicar.formSolicitudBecaDescuento =
            this.formSolicitudBecaDescuento;
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
