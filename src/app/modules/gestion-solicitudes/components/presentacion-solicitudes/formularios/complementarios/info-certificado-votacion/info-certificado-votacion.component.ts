import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { HttpService } from 'src/app/modules/gestion-solicitudes/services/http.service';

@Component({
    selector: 'app-info-certificado-votacion',
    templateUrl: './info-certificado-votacion.component.html',
    styleUrls: ['./info-certificado-votacion.component.scss'],
})
export class InfoCertificadoVotacionComponent implements OnInit {
    formInfoCertificadoVotacion: FormGroup;
    showWarning: boolean = false;

    constructor(private fb: FormBuilder, private http: HttpService, public ref: DynamicDialogRef) {}

    ngOnInit(): void {
        this.formInfoCertificadoVotacion = this.fb.group({
            nombreCompleto: [{ value: 'Registro certificado votación', disabled: true }, Validators.required],
            titulo: ['', Validators.required],
            pronombre: ['', Validators.required],
        });
    }

    guardarInfo() {
        if (this.formInfoCertificadoVotacion.valid) {
            const fechaInicio = this.formInfoCertificadoVotacion.get('titulo').value;
            const fechaFinal = this.formInfoCertificadoVotacion.get('pronombre').value;

            if (!fechaInicio || !fechaFinal) {
                this.showWarning = true;
                return;
            }

            // Construcción del objeto de la petición con valores fijos
            const body = {
                idSolicitud: 32,
                codigo: "CERT_VOTO",
                nombre: "Registro de certificado de votación",
                fechaInicio: fechaInicio.toISOString().split('T')[0],
                fechaFinal: fechaFinal.toISOString().split('T')[0]
            };

            console.log('Body enviado:', body);

            // Enviar la petición al servicio HTTP
            this.http.guardarFechaSolicitud(body).subscribe(
                (response) => {
                    console.log('Fechas actualizadas correctamente:', response);
                    this.ref.close();
                },
                (error) => {
                    console.error('Error al actualizar las fechas:', error);
                }
            );
        } else {
            this.showWarning = true;
        }
    }

    cancelar() {
        this.ref.close();
    }
}
