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
                        label: 'Bandeja de entrada',
                        routerLink: 'buzon',
                        icon: 'pi pi-fw pi-arrow-down',
                    },
                    { separator: true },
                    {
                        label: 'Quit',
                        routerLink: 'visor',
                        icon: 'pi pi-fw pi-times',
                    },
                ],
            },
            {
                label: 'Archivo',
                icon: 'pi pi-fw pi-pencil',
                items: [
                    { label: 'Delete', icon: 'pi pi-fw pi-trash' },
                    { label: 'Refresh', icon: 'pi pi-fw pi-refresh' },
                ],
            },
            {
                label: 'Help',
                icon: 'pi pi-fw pi-question',
                items: [
                    {
                        label: 'Contents',
                        icon: 'pi pi-pi pi-bars',
                    },
                    {
                        label: 'Search',
                        icon: 'pi pi-pi pi-search',
                        items: [
                            {
                                label: 'Text',
                                items: [
                                    {
                                        label: 'Workspace',
                                    },
                                ],
                            },
                            {
                                label: 'User',
                                icon: 'pi pi-fw pi-file',
                            },
                        ],
                    },
                ],
            },
            {
                label: 'Ajustes',
                icon: 'pi pi-fw pi-cog',
                items: [
                    {
                        label: 'Edit',
                        icon: 'pi pi-fw pi-pencil',
                        items: [
                            { label: 'Save', icon: 'pi pi-fw pi-save' },
                            { label: 'Update', icon: 'pi pi-fw pi-save' },
                        ],
                    },
                    {
                        label: 'Other',
                        icon: 'pi pi-fw pi-tags',
                        items: [{ label: 'Delete', icon: 'pi pi-fw pi-minus' }],
                    },
                ],
            },
        ];
    }
}
