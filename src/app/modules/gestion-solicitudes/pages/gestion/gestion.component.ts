import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-gestion',
    templateUrl: './gestion.component.html',
    styleUrls: ['./gestion.component.scss'],
})
export class GestionComponent implements OnInit {
    items: MenuItem[];
    itemstab: MenuItem[];
    activeItem: MenuItem;

    constructor() {}

    ngOnInit(): void {
        this.fetchMenuGestion();
    }

    fetchMenuGestion() {
        this.items = [
            {
                label: 'Buzón',
                icon: 'pi pi-pw pi-inbox',
                expanded: true,
                items: [
                    {
                        label: 'Nuevas',
                        routerLink: 'buzon/nuevas',
                        icon: 'pi pi-fw pi-arrow-down',
                    },
                    {
                        label: 'Rechazadas',
                        routerLink: 'buzon/rechazadas',
                        icon: 'pi pi-fw pi-times',
                    },
                ],
            },
            {
                label: 'En tramite',
                icon: 'pi pi-fw pi-pencil',
                items: [
                    { label: 'En comite', icon: 'pi pi-fw pi-users' },
                    { label: 'En consejo', icon: 'pi pi-fw pi-users' },
                ],
            },
            {
                label: 'Archivo',
                icon: 'pi pi-fw pi-folder',
                items: [
                    {
                        label: 'Resueltas',
                        icon: 'pi pi-fw pi-check-circle',
                    },
                ],
            },
            {
                label: 'Ajustes',
                icon: 'pi pi-fw pi-cog',
                items: [
                    {
                        label: 'Editar',
                        icon: 'pi pi-fw pi-pencil',
                        items: [
                            {
                                label: 'Coordninador(a)',
                                icon: 'pi pi-fw pi-user-edit',
                            },
                        ],
                    },
                    {
                        label: 'Ayuda',
                        icon: 'pi pi-fw pi-question-circle',
                        items: [
                            {
                                label: 'Guia de uso',
                                icon: 'pi pi-fw pi-info-circle',
                            },
                        ],
                    },
                ],
            },
        ];
    }
}
