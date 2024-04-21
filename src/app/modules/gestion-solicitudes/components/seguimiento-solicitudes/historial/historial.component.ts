import { Component, OnInit } from '@angular/core';
import { PrimeIcons } from 'primeng/api';

@Component({
    selector: 'app-historial',
    templateUrl: './historial.component.html',
    styleUrls: ['./historial.component.scss'],
})
export class HistorialComponent implements OnInit {
    events: any[];
    docPrueba: File;

    constructor() {}

    ngOnInit(): void {
        this.events = [
            {
                status: 'Radicada',
                date: '15/10/2020 10:30',
                icon: 'pi pi-check-circle',
                color: '#0F2041',
                image: 'game-controller.jpg',
                descripcion:
                    'La solicitud se ha creado correctamente y se ha enviado una copia al tutor/director relacionado para su revisión y aval.',
                documento: this.docPrueba,
                comentarios: '',
            },
            {
                status: 'En proceso de aval',
                date: '15/10/2020 10:30',
                icon: 'pi pi-check-circle',
                color: '#0F2041',
                image: 'game-controller.jpg',
                descripcion:
                    'La solicitud esta siendo revisada por el tutor/director relacionados este proceso puede tomar un par de dias.',
                documento: null,
                comentarios: '',
            },
            {
                status: 'No avalada',
                date: '19/10/2020 12:00',
                icon: 'pi pi-ban',
                color: '#AF0000',
                descripcion:
                    'La solicitud ha sido rechazada por su tutor/director',
                documento: this.docPrueba,
                comentarios:
                    'El anexo 1 no cumple con los requisitos de intensidad horaria establecidos por el reglamento del programa',
            },
        ];
    }
}
