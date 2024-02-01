import {
    Component,
    ElementRef,
    EventEmitter,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService, SelectItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

import { Mensaje } from 'src/app/core/enums/enums';
import { mapResponseException } from 'src/app/core/utils/exception-util';
import {
    errorMessage,
    infoMessage,
    warnMessage,
} from 'src/app/core/utils/message-util';
import { Estudiante } from 'src/app/shared/models/estudiante';
import { SolicitudService } from '../../services/solicitud.service';
import { BuscadorExpertosComponent } from 'src/app/shared/components/buscador-expertos/buscador-expertos.component';
import { BuscadorDocentesComponent } from 'src/app/shared/components/buscador-docentes/buscador-docentes.component';
import { PdfService } from 'src/app/shared/services/pdf.service';
import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';
import { Experto } from '../../models/experto';
import { Docente } from 'src/app/shared/models/docente';
import { Rol, TipoRol } from 'src/app/core/enums/domain-enum';
import { enumToSelectItems } from 'src/app/core/utils/util';
import { Orientador } from '../../models/orientador';

@Component({
    selector: 'crear-solicitud-examen',
    templateUrl: 'crear-solicitud-examen.component.html',
    styleUrls: ['crear-solicitud-examen.component.scss'],
})
export class CrearSolicitudExamenComponent implements OnInit {
    @Output() formReady = new EventEmitter<FormGroup>();
    @ViewChild('htmlData') htmlData!: ElementRef;
    crearSolicitudForm: FormGroup;
    loading = false;
    tipoSeleccionado = '';
    rolSeleccionado = '';
    fechaActual: Date;
    firmaEstudiantePreview: string | ArrayBuffer;
    estudianteSeleccionado: Estudiante = {};
    orientadores: Orientador[] = [];
    roles: SelectItem[] = enumToSelectItems(Rol);
    tipos: SelectItem[] = enumToSelectItems(TipoRol);

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private dialogService: DialogService,
        private messageService: MessageService,
        private breadcrumbService: BreadcrumbService,
        private solicitudService: SolicitudService,
        private pdfService: PdfService
    ) {}

    get estudiante(): FormControl {
        return this.crearSolicitudForm.get('estudiante') as FormControl;
    }

    get experto(): FormControl {
        return this.crearSolicitudForm.get('evaluador_externo') as FormControl;
    }

    get orientador(): FormControl {
        return this.crearSolicitudForm.get('orientador') as FormControl;
    }

    get docente(): FormControl {
        return this.crearSolicitudForm.get('evaluador_interno') as FormControl;
    }

    get tipo(): FormControl {
        return this.crearSolicitudForm.get('tipo') as FormControl;
    }

    get rol(): FormControl {
        return this.crearSolicitudForm.get('rol') as FormControl;
    }

    ngOnInit() {
        this.initForm();
        this.fechaActual = new Date();

        this.solicitudService.estudianteSeleccionado$.subscribe((response) => {
            this.estudianteSeleccionado = response;
            if (response) {
                this.estudiante.setValue(
                    this.nombreCompletoEstudiante(response)
                );
            }
        });

        this.tipo.valueChanges.subscribe(
            (response) => (this.tipoSeleccionado = response)
        );
        this.rol.valueChanges.subscribe(
            (response) => (this.rolSeleccionado = response)
        );

        if (!this.estudianteSeleccionado) {
            this.router.navigate(['examen-de-valoracion/solicitud']);
        }

        this.setBreadcrumb();
    }

    initForm(): void {
        this.crearSolicitudForm = this.fb.group({
            titulo: [null, Validators.required],
            estudiante: [null, Validators.required],
            orientador: [null, Validators.required],
            rol: [null, Validators.required],
            tipo: [null, Validators.required],
            evaluador_interno: [null, Validators.required],
            evaluador_externo: [null, Validators.required],
            firma_estudiante: [null, Validators.required],
        });

        this.formReady.emit(this.crearSolicitudForm);
    }

    onCancel() {
        this.router.navigate(['examen-de-valoracion/solicitud']);
    }

    onSave() {
        if (this.crearSolicitudForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            const data = document.getElementById('htmlData');
            this.pdfService.generatePDF(
                data,
                `${this.estudianteSeleccionado.codigo} - solicitud.pdf`
            );
            this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
        }
    }

    getFormControl(formControlName: string): FormControl {
        return this.crearSolicitudForm.get(formControlName) as FormControl;
    }

    onFirmaEstudianteChange(event: any) {
        const input = event && event.files ? event : { files: [] };

        const file = input.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                this.firmaEstudiantePreview = reader.result as string;
            };
            reader.readAsDataURL(file);

            this.crearSolicitudForm.patchValue({ firma_estudiante: file });
        }
    }

    showBuscadorExpertos() {
        return this.dialogService.open(BuscadorExpertosComponent, {
            header: 'Seleccionar experto',
            width: '40%',
        });
    }

    mapExpertoLabel(experto: Experto) {
        const ultimaUniversidad =
            experto.titulos.length > 0
                ? experto.titulos[experto.titulos.length - 1].universidad
                : 'Sin título universitario';

        return {
            id: experto.id,
            nombre: experto.persona.nombre,
            apellido: experto.persona.apellido,
            correo: experto.persona.correoElectronico,
            universidad: ultimaUniversidad,
        };
    }

    mapOrientadorLabel(orientador: Orientador) {
        return {
            id: orientador.id,
            nombre: orientador.persona.nombre,
            apellido: orientador.persona.apellido,
            correo: orientador.persona.correoElectronico,
            rol: this.rolSeleccionado,
            tipo: this.tipoSeleccionado,
        };
    }

    showBuscadorDocentes() {
        return this.dialogService.open(BuscadorDocentesComponent, {
            header: 'Seleccionar docente',
            width: '40%',
        });
    }
    nombreCompletoEstudiante(e: any) {
        return `${e.nombre} ${e.apellido}`;
    }

    mapDocenteLabel(docente: Docente) {
        const ultimaUniversidad =
            docente.titulos.length > 0
                ? docente.titulos[docente.titulos.length - 1].universidad
                : 'Sin título universitario';

        return {
            id: docente.persona.id,
            nombre: docente.persona.nombre,
            apellido: docente.persona.apellido,
            correo: docente.persona.correoElectronico,
            universidad: ultimaUniversidad,
        };
    }

    onSeleccionarExperto() {
        const ref = this.showBuscadorExpertos();
        ref.onClose.subscribe({
            next: (response) => {
                if (response) {
                    const experto = this.mapExpertoLabel(response);
                    this.experto.setValue(experto);
                }
            },
        });
    }

    onSeleccionarOrientador(tipo: string): void {
        const ref =
            tipo === 'INTERNO'
                ? this.showBuscadorDocentes()
                : this.showBuscadorExpertos();

        ref.onClose.subscribe({
            next: (response) => {
                if (response) {
                    const orientador =
                        tipo === 'INTERNO'
                            ? this.mapOrientadorLabel(response)
                            : this.mapOrientadorLabel(response);
                    this.orientador.setValue(orientador);
                    this.orientadores.push(orientador);
                }
            },
        });
    }

    onSeleccionarDocente() {
        const ref = this.showBuscadorDocentes();
        ref.onClose.subscribe({
            next: (response) => {
                if (response) {
                    const docente = this.mapDocenteLabel(response);
                    this.docente.setValue(docente);
                }
            },
        });
    }

    handlerResponseException(response: any) {
        if (response.status !== 501) return;

        const mapException = mapResponseException(response.error);
        mapException.forEach((value) => {
            this.messageService.add(errorMessage(value));
        });
    }

    setBreadcrumb() {
        this.breadcrumbService.setItems([
            { label: 'Trabajos de Grado' },
            {
                label: 'Examen de Valoracion',
                routerLink: 'examen-de-valoracion',
            },
            {
                label: 'Solicitud',
                routerLink: 'examen-de-valoracion/solicitud',
            },
        ]);
    }

    private handleSuccessMessage(message: string) {
        this.messageService.add(infoMessage(message));
    }

    private handleWarningMessage(message: string) {
        this.messageService.clear();
        this.messageService.add(warnMessage(message));
    }

    limpiarDocente() {
        this.docente.setValue(null);
    }

    limpiarOrientador(index: number) {
        this.orientador.setValue(null);
        this.orientadores.splice(index, 1);
    }

    limpiarExperto() {
        this.experto.setValue(null);
    }
}
