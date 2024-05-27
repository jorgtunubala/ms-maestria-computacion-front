import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';
import { Categoria } from '../../models/categoria';
import { CategoriaService } from '../../services/categoria.service';
import { infoMessage } from 'src/app/core/utils/message-util';
import { Mensaje } from 'src/app/core/enums/enums';

@Component({
    selector: 'app-bandeja-categorias',
    templateUrl: './bandeja-categorias.component.html',
    styleUrls: ['./bandeja-categorias.component.scss'],
})
export class BandejaCategoriasComponent implements OnInit {
    categorias: Categoria[] = [];
    loading: boolean = false;
    displayDialog: boolean = false;
    categoria: Categoria = { nombre: '', observacion: '' };
    isNew: boolean = true;
    mostrarInactivasFlag: boolean = true;

    constructor(
        private breadcrumbService: BreadcrumbService,
        private messageService: MessageService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private categoriaService: CategoriaService
    ) {}

    ngOnInit(): void {
        this.listCategorias();
        this.setBreadcrumb();
    }

    listCategorias() {
        this.loading = true;
        this.categoriaService
            .listCategorias()
            .subscribe({
                next: (response) =>
                    (this.categorias = response.filter(
                        (d) =>
                            d.estado ===
                            (this.mostrarInactivasFlag ? 'ACTIVO' : 'INACTIVO')
                    )),
            })
            .add(() => (this.loading = false));
    }

    showDialog() {
        this.categoria = { nombre: '', observacion: '' };
        this.isNew = true;
        this.displayDialog = true;
    }

    onEditar(id: number) {
        this.categoriaService.getCategoria(id).subscribe((data) => {
            this.categoria = { ...data };
            this.isNew = false;
            this.displayDialog = true;
        });
    }

    onSave() {
        if (this.isNew) {
            this.categoriaService
                .createCategoria(this.categoria)
                .subscribe((data) => {
                    this.categorias.push(data);
                    this.displayDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Categoría agregada con éxito',
                    });
                });
        } else {
            this.categoriaService
                .updateCategoria(this.categoria.id!, this.categoria)
                .subscribe((data) => {
                    const index = this.categorias.findIndex(
                        (categoria) => categoria.id === data.id
                    );
                    if (index !== -1) {
                        this.categorias[index] = data;
                    }
                    this.displayDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Categoría actualizada con éxito',
                    });
                });
        }
    }

    onCancel() {
        this.displayDialog = false;
    }

    onDelete(event: any, id: number) {
        this.confirmationService.confirm({
            target: event.target!,
            message: Mensaje.CONFIRMAR_ELIMINAR_CATEGORIA,
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'No',
            accept: () => this.deleteCategoria(id),
        });
    }

    deleteCategoria(id: number) {
        this.categoriaService.deleteCategoria(id).subscribe({
            next: () => {
                this.messageService.add(
                    infoMessage(Mensaje.CATEGORIA_ELIMINADA_CORRECTAMENTE)
                );
                this.listCategorias();
            },
        });
    }

    cambiarEstado(event: any, categoria: Categoria, nuevoEstado: string) {
        this.confirmationService.confirm({
            target: event.target,
            message: Mensaje.ESTADO_CATEGORIA_ACTUALIZADO_CORRECTAMENTE,
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            accept: () => this.cambiarEstadoCategoria(categoria, nuevoEstado),
        });
    }

    cambiarEstadoCategoria(categoria: Categoria, nuevoEstado: string) {
        this.categoriaService
            .cambiarEstadoCategoria(categoria.id!, nuevoEstado)
            .subscribe({
                next: () => {
                    this.messageService.add(
                        infoMessage(
                            `Categoria ${
                                nuevoEstado === 'ACTIVO'
                                    ? 'habilitado'
                                    : 'deshabilitado'
                            } correctamente`
                        )
                    );
                    this.listCategorias();
                },
            });
    }

    // cambiarEstado(categoria: Categoria, nuevoEstado: string) {
    //     this.categoriaService
    //         .cambiarEstadoCategoria(categoria.id, nuevoEstado)
    //         .subscribe({
    //             next: () => {
    //                 this.messageService.add(
    //                     infoMessage(
    //                         `Categoria ${
    //                             nuevoEstado === 'ACTIVO'
    //                                 ? 'habilitado'
    //                                 : 'deshabilitado'
    //                         } correctamente`
    //                     )
    //                 );
    //                 this.listCategorias();
    //             },
    //         });
    // }

    setBreadcrumb() {
        this.breadcrumbService.setItems([
            { label: 'Gestión' },
            { label: 'Categorías' },
        ]);
    }
}
