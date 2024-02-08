import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { RadicarService } from '../../../services/radicar.service';
import { Subscription, filter } from 'rxjs';

@Component({
    selector: 'app-contenedorpasos',
    templateUrl: './contenedorpasos.component.html',
    styleUrls: ['./contenedorpasos.component.scss'],
})
export class ContenedorPasosComponent implements OnInit {
    itemsPasos: MenuItem[];
    private navigationSubscription: Subscription;

    constructor(public radicar: RadicarService, private router: Router) {}

    ngOnInit(): void {
        this.fetchPasos();
    }

    ngOnDestroy(): void {
        this.radicar.restrablecerValores();
    }

    fetchPasos() {
        this.itemsPasos = [
            { label: 'Tipo', routerLink: 'selector' },
            { label: 'Datos', routerLink: 'datos' },
            { label: 'Adjuntos', routerLink: 'documentos' },
            { label: 'Resumen', routerLink: 'resumen' },
        ];
    }
}
