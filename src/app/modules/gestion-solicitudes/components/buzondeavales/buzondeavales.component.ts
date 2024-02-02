import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-buzondeavales',
    templateUrl: './buzondeavales.component.html',
    styleUrls: ['./buzondeavales.component.scss'],
})
export class BuzondeavalesComponent implements OnInit {
    itemsMenu: MenuItem[];

    constructor() {}

    ngOnInit(): void {
        this.cargarMenuDeOpciones();
    }

    cargarMenuDeOpciones() {
        this.itemsMenu = [
            {
                label: 'Solicitudes',
                icon: 'pi pi-pw pi-inbox',
                items: [
                    {
                        label: 'Pendientes de aval',
                        routerLink: 'pendientes',
                        icon: 'pi pi-fw pi-pencil',
                    },
                    { separator: true },
                    {
                        label: 'Quit',
                        routerLink: 'visor',
                        icon: 'pi pi-fw pi-times',
                    },
                ],
            },
        ];
    }
}
