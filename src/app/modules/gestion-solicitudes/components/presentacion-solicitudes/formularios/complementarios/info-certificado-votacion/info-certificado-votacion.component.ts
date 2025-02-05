import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { HttpService } from 'src/app/modules/gestion-solicitudes/services/http.service';
import { InformacionRoles } from 'src/app/modules/gestion-solicitudes/models/indiceModelos';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-info-certificado-votacion',
    templateUrl: './info-certificado-votacion.component.html',
    styleUrls: ['./info-certificado-votacion.component.scss'],
})
export class InfoCertificadoVotacionComponent implements OnInit {
    formInfoCertificadoVotacion: FormGroup;
    showWarning: boolean = false;
    tiposSolicitud: { label: string; value: string }[] = [];

    constructor(private fb: FormBuilder, private http: HttpService, public ref: DynamicDialogRef) {}

    ngOnInit(): void {
        this.formInfoCertificadoVotacion = this.fb.group({
            nombreCompleto: ['', Validators.required], // Ahora es tipo solicitud
            titulo: ['', Validators.required],
            pronombre: ['', this.customValidator()],
        });

        this.cargarTiposDeSolicitud(); // Llamada para obtener los tipos de solicitud

        this.http.consultarInfoDeRolExterno('coordinador').subscribe(
            (data: InformacionRoles) => {
                if (data) {
                    this.formInfoCertificadoVotacion.patchValue({
                        nombreCompleto: data.nombreCompleto,
                        titulo: data.titulo,
                        pronombre: data.tratamiento,
                    });
                }
            },
            (error) => {
                console.error('Error al obtener la información del coordinador:', error);
            }
        );
    }

    cargarTiposDeSolicitud() {
        this.http.obtenerTiposDeSolicitud().pipe(
            map((respuesta) => 
                respuesta.map((solicitud) => ({
                    label: solicitud.nombreSolicitud,
                    value: solicitud.codigoSolicitud,
                }))
            ),
            catchError((error) => {
                console.error('Error al obtener los tipos de solicitud:', error);
                return of([]);
            })
        ).subscribe((tipos) => {
            this.tiposSolicitud = tipos;
        });
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
        return this.formInfoCertificadoVotacion.valid;
    }

    guardarInfo() {
        if (this.formInfoCertificadoVotacion.valid) {
            const infoRoles: InformacionRoles = {
                cargo: 'Coordinador',
                nombreCompleto: this.formInfoCertificadoVotacion.get('nombreCompleto').value,
                titulo: this.formInfoCertificadoVotacion.get('titulo').value,
                tratamiento: this.formInfoCertificadoVotacion.get('pronombre').value,
            };

            this.http.guardarInfoDeRolExterno(infoRoles).subscribe(
                (response) => {
                    console.log('Información guardada correctamente:', response);
                    this.ref.close();
                },
                (error) => {
                    console.error('Error al guardar la información:', error);
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
