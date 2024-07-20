import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Estudiante } from 'src/app/modules/gestion-estudiantes/models/estudiante';
import { BuscadorEstudiantesComponent } from 'src/app/shared/components/buscador-estudiantes/buscador-estudiantes.component';
import { LocalStorageService } from 'src/app/shared/services/localstorage.service';
import { Empresa } from '../../models/empresa';
import { CursoResponse } from '../../models/curso';
import { EmpresaService } from '../../services/empresas.service';
import { CursoService } from '../../services/cursos.service';
import { EmpresaEgresadoComponent } from '../empresa-egresados/empresa-egresados.component';
import { CursoEgresadoComponent } from '../curso-egresados/curso-egresados.component';
import { EstudianteService } from 'src/app/shared/services/estudiante.service';

@Component({
    selector: 'app-bandeja-seguimiento-a-egresados',
    templateUrl: 'bandeja-seguimiento-a-egresados.component.html',
    styleUrls: ['bandeja-seguimiento-a-egresados.component.scss'],
})
export class BandejaSeguimientoAEgresadosComponent implements OnInit {
    empresas: Empresa[] = [];
    cursos: CursoResponse[] = [];

    estudianteSeleccionado: Estudiante;

    loading: boolean;

    constructor(
        private empresaService: EmpresaService,
        private estudianteService: EstudianteService,
        private localStorageService: LocalStorageService,
        private cursoService: CursoService,
        private dialogService: DialogService
    ) {}

    ngOnInit(): void {
        this.loadData();
    }

    loadData() {
        const estudiante =
            this.localStorageService.getLocalStorage('estEgresado');
        if (estudiante) {
            this.estudianteSeleccionado = estudiante;
            this.listCursos();
            this.listEmpresas();
        }
    }

    mapEstudianteLabel(estudiante: any) {
        return {
            id: estudiante.id,
            codigo: estudiante.codigo,
            nombre: estudiante.nombre,
            apellido: estudiante.apellido,
            identificacion: estudiante.identificacion,
            periodoIngreso: estudiante.periodoIngreso,
            cohorte: estudiante.cohorte,
            fechaGrado: estudiante.fechaGrado,
            telefono: estudiante.telefono,
            correo: estudiante.correo,
        };
    }

    limpiarEstudiante() {
        this.estudianteSeleccionado = null;
        this.localStorageService.clearLocalStorage('estEgresado');
    }

    showBuscadorEstudiantes() {
        return this.dialogService.open(BuscadorEstudiantesComponent, {
            header: 'Seleccionar estudiante',
            width: '60%',
        });
    }

    onSeleccionarEstudiante() {
        this.limpiarEstudiante();
        const ref = this.showBuscadorEstudiantes();
        ref.onClose.subscribe({
            next: (estudiante) => {
                if (estudiante) {
                    this.estudianteService
                        .getEstudianteEgresado(estudiante.id)
                        .subscribe({
                            next: (response) => {
                                if (response) {
                                    this.estudianteSeleccionado =
                                        this.mapEstudianteLabel(response);
                                    this.localStorageService.saveLocalStorage(
                                        this.mapEstudianteLabel(response),
                                        'estEgresado'
                                    );
                                    this.listCursos();
                                    this.listEmpresas();
                                }
                            },
                            error: (e) => console.error(e),
                        });
                }
            },
            error: (e) => console.error(e),
        });
    }

    listEmpresas() {
        this.loading = true;
        this.empresaService
            .listEmpresas(this.estudianteSeleccionado.id)
            .subscribe({
                next: (response) => {
                    if (response) {
                        this.empresas = response.filter((d) => d.id !== null);
                    }
                },
                error: (e) => console.error(e),
            })
            .add(() => (this.loading = false));
    }

    listCursos() {
        this.loading = true;
        this.cursoService
            .listCursos(this.estudianteSeleccionado.id)
            .subscribe({
                next: (response) => {
                    if (response) {
                        this.cursos = response.filter((d) => d.nombre !== null);
                    }
                },
                error: (e) => console.error(e),
            })
            .add(() => (this.loading = false));
    }

    showAddEmpresa() {
        const ref = this.dialogService.open(EmpresaEgresadoComponent, {
            header: 'Agregar empresa',
            width: '40%',
            styleClass: 'dialog-empresa',
            data: { estudianteId: this.estudianteSeleccionado.id },
        });
        ref.onClose.subscribe(() => {
            this.listEmpresas();
        });
    }

    showUpdateEmpresa(id: number) {
        const ref = this.dialogService.open(EmpresaEgresadoComponent, {
            header: 'Editar empresa',
            width: '40%',
            styleClass: 'dialog-empresa',
            data: {
                empresaId: id,
                estudianteId: this.estudianteSeleccionado.id,
            },
        });
        ref.onClose.subscribe(() => {
            this.listEmpresas();
        });
    }

    showAddCurso() {
        const ref = this.dialogService.open(CursoEgresadoComponent, {
            header: 'Agregar curso',
            width: '40%',
            styleClass: 'dialog-curso',
            data: { estudianteId: this.estudianteSeleccionado.id },
        });
        ref.onClose.subscribe(() => {
            this.listCursos();
        });
    }

    showUpdateCurso(id: number) {
        const ref = this.dialogService.open(CursoEgresadoComponent, {
            header: 'Editar curso',
            width: '40%',
            styleClass: 'dialog-curso',
            data: { cursoId: id, estudianteId: this.estudianteSeleccionado.id },
        });
        ref.onClose.subscribe(() => {
            this.listCursos();
        });
    }
}
