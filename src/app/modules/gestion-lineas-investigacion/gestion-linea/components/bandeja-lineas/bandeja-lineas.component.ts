import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';
import { Linea } from '../../models/linea';
import { LineaService } from '../../services/linea.service';
import { Categoria } from '../../models/categoria';
import { CategoriaService } from '../../../gestion-categoria/services/categoria.service';
import { Mensaje } from 'src/app/core/enums/enums';
import { infoMessage } from 'src/app/core/utils/message-util';

@Component({
    selector: 'app-bandeja-lineas',
    templateUrl: './bandeja-lineas.component.html',
    styleUrls: ['./bandeja-lineas.component.scss'],
})
export class BandejaLineasComponent implements OnInit {
    lineas: Linea[] = [];
    categorias: Categoria[] = [];
    loading: boolean = false;
    displayDialog: boolean = false;
    linea: Linea = { titulo: '', idCategoria: null };
    isNew: boolean = true;
    mostrarInactivasFlag: boolean = true;

    constructor(
        private breadcrumbService: BreadcrumbService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private lineaService: LineaService,
        private categoriaService: CategoriaService
    ) {}

    ngOnInit(): void {
        this.listLineas();
        this.listCategorias();
        this.setBreadcrumb();
    }

    listLineas() {
        this.loading = true;
        this.lineaService.listLineas().subscribe({
            next: (response) => {
                this.lineas = response.filter(
                    (d) =>
                        d.estado ===
                        (this.mostrarInactivasFlag ? 'ACTIVO' : 'INACTIVO')
                );
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar líneas',
                });
            },
            complete: () => {
                this.loading = false;
            },
        });
    }

    listCategorias() {
        this.categoriaService.listCategorias().subscribe({
            next: (data: Categoria[]) => {
                this.categorias = data;
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar categorías',
                });
            },
        });
    }

    showDialog() {
        this.linea = { titulo: '', idCategoria: null };
        this.isNew = true;
        this.displayDialog = true;
    }

    onEditar(id: number) {
        this.lineaService.getLinea(id).subscribe({
            next: (data) => {
                this.linea = { ...data };
                this.linea.idCategoria = data.categoria?.id || null;
                this.isNew = false;
                this.displayDialog = true;
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar la línea',
                });
            },
        });
    }

    onSave() {
        if (this.isNew) {
            this.lineaService.createLinea(this.linea).subscribe({
                next: (data) => {
                    // Asignar la categoría correspondiente a la nueva línea
                    const categoria = this.categorias.find(
                        (cat) => cat.id === this.linea.idCategoria
                    );
                    if (categoria) {
                        data.categoria = categoria;
                    }
                    this.lineas.push(data);
                    this.displayDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Línea agregada con éxito',
                    });
                },
                error: (err) => {
                    console.error(err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al agregar línea',
                    });
                },
            });
        } else {
            this.lineaService
                .updateLinea(this.linea.id!, this.linea)
                .subscribe({
                    next: (data) => {
                        const index = this.lineas.findIndex(
                            (linea) => linea.id === data.id
                        );
                        if (index !== -1) {
                            // Asignar la categoría correspondiente a la línea actualizada
                            const categoria = this.categorias.find(
                                (cat) => cat.id === this.linea.idCategoria
                            );
                            if (categoria) {
                                data.categoria = categoria;
                            }
                            this.lineas[index] = data;
                        }
                        this.displayDialog = false;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Línea actualizada con éxito',
                        });
                    },
                    error: (err) => {
                        console.error(err);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al actualizar línea',
                        });
                    },
                });
        }
    }

    onCancel() {
        this.displayDialog = false;
    }

    onDelete(event: any, id: number) {
        this.confirmationService.confirm({
            target: event.target!,
            message: Mensaje.CONFIRMAR_ELIMINAR_LINEA,
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'No',
            accept: () => this.deleteLinea(id),
        });
    }

    deleteLinea(id: number) {
        this.lineaService.deleteLinea(id).subscribe({
            next: () => {
                this.messageService.add(
                    infoMessage(Mensaje.LINEA_ELIMINADA_CORRECTAMENTE)
                );
                this.listLineas();
            },
        });
    }

    cambiarEstado(event: any, linea: Linea, nuevoEstado: string) {
        this.confirmationService.confirm({
            target: event.target,
            message: Mensaje.ESTADO_LINEA_ACTUALIZADO_CORRECTAMENTE,
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            accept: () => this.cambiarEstadoLinea(linea, nuevoEstado),
        });
    }

    cambiarEstadoLinea(linea: Linea, nuevoEstado: string) {
        this.lineaService.cambiarEstadoLinea(linea.id!, nuevoEstado).subscribe({
            next: () => {
                this.messageService.add(
                    infoMessage(
                        `Línea ${
                            nuevoEstado === 'ACTIVO'
                                ? 'habilitada'
                                : 'deshabilitada'
                        } correctamente`
                    )
                );
                this.listLineas();
            },
        });
    }

    setBreadcrumb() {
        this.breadcrumbService.setItems([
            { label: 'Gestión' },
            { label: 'Líneas de Investigación' },
        ]);
    }
}
