import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { catchError, firstValueFrom, of } from 'rxjs';
import { Estudiante } from 'src/app/modules/gestion-estudiantes/models/estudiante';
import { BuscadorEstudiantesComponent } from 'src/app/shared/components/buscador-estudiantes/buscador-estudiantes.component';
import { LocalStorageService } from 'src/app/shared/services/localstorage.service';
import { EstudianteService } from 'src/app/shared/services/estudiante.service';
import { Empresa } from '../../models/empresa';
import { CursoResponse } from '../../models/curso';
import { EmpresaService } from '../../services/empresas.service';
import { CursoService } from '../../services/cursos.service';
import { EmpresaEgresadoComponent } from '../empresa-egresados/empresa-egresados.component';
import { CursoEgresadoComponent } from '../curso-egresados/curso-egresados.component';

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
        private cursoService: CursoService,
        private dialogService: DialogService,
        private empresaService: EmpresaService,
        private estudianteService: EstudianteService,
        private localStorageService: LocalStorageService
    ) {}

    ngOnInit() {
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

    async onSeleccionarEstudiante() {
        this.limpiarEstudiante();
        const ref = this.showBuscadorEstudiantes();

        try {
            const estudiante = await firstValueFrom(ref.onClose);

            if (estudiante) {
                const response = await firstValueFrom(
                    this.estudianteService
                        .getEstudianteEgresado(estudiante.id)
                        .pipe(
                            catchError((error) => {
                                console.error(error);
                                return of(null);
                            })
                        )
                );

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
            }
        } catch (error) {
            console.error(error);
        }
    }

    async listEmpresas(): Promise<void> {
        this.loading = true;
        try {
            const response = await firstValueFrom(
                this.empresaService
                    .listEmpresas(this.estudianteSeleccionado.id)
                    .pipe(
                        catchError((error) => {
                            console.error(error);
                            return of([]);
                        })
                    )
            );

            if (response) {
                this.empresas = response.filter((d) => d.id !== null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            this.loading = false;
        }
    }

    async listCursos(): Promise<void> {
        this.loading = true;
        try {
            const response = await firstValueFrom(
                this.cursoService
                    .listCursos(this.estudianteSeleccionado.id)
                    .pipe(
                        catchError((error) => {
                            console.error(error);
                            return of([]);
                        })
                    )
            );
            if (response) {
                this.cursos = response.filter((d) => d.nombre !== null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            this.loading = false;
        }
    }

    async waitForDialogClose(dialogRef: any): Promise<void> {
        return firstValueFrom(dialogRef.onClose);
    }

    async showAddEmpresa() {
        const ref = this.dialogService.open(EmpresaEgresadoComponent, {
            header: 'Agregar empresa',
            width: '40%',
            styleClass: 'dialog-empresa',
            data: { estudianteId: this.estudianteSeleccionado.id },
        });
        try {
            await this.waitForDialogClose(ref);
            await this.listEmpresas();
        } catch (error) {
            console.error(error);
        }
    }

    async showUpdateEmpresa(id: number) {
        const ref = this.dialogService.open(EmpresaEgresadoComponent, {
            header: 'Editar empresa',
            width: '40%',
            styleClass: 'dialog-empresa',
            data: {
                empresaId: id,
                estudianteId: this.estudianteSeleccionado.id,
            },
        });
        try {
            await this.waitForDialogClose(ref);
            await this.listEmpresas();
        } catch (error) {
            console.error(error);
        }
    }

    async showAddCurso() {
        const ref = this.dialogService.open(CursoEgresadoComponent, {
            header: 'Agregar curso',
            width: '40%',
            styleClass: 'dialog-curso',
            data: { estudianteId: this.estudianteSeleccionado.id },
        });
        try {
            await this.waitForDialogClose(ref);
            await this.listCursos();
        } catch (error) {
            console.error(error);
        }
    }

    async showUpdateCurso(id: number) {
        const ref = this.dialogService.open(CursoEgresadoComponent, {
            header: 'Editar curso',
            width: '40%',
            styleClass: 'dialog-curso',
            data: { cursoId: id, estudianteId: this.estudianteSeleccionado.id },
        });
        try {
            await this.waitForDialogClose(ref);
            await this.listCursos();
        } catch (error) {
            console.error(error);
        }
    }
}
