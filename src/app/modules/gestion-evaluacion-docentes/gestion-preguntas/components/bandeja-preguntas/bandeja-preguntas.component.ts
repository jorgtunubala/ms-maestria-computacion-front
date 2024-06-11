import { Component, OnInit } from '@angular/core';
import { Pregunta } from '../../models/pregunta';
import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';
import { DialogModule } from 'primeng/dialog';
import { PreguntaService } from '../../services/pregunta.service';

@Component({
    selector: 'app-bandeja-preguntas',
    templateUrl: './bandeja-preguntas.component.html',
    styleUrls: ['./bandeja-preguntas.component.scss'],
})
export class BandejaPreguntasComponent implements OnInit {
    loading: boolean;
    preguntas: Pregunta[] = [];
    visible: boolean = false;
    value: any;

    constructor(
        private breadcrumbService: BreadcrumbService,
        private preguntaService: PreguntaService
    ) {}

    ngOnInit(): void {
        this.setBreadcrumb();
        this.listPreguntas();
    }

    setBreadcrumb() {
        this.breadcrumbService.setItems([
            { label: 'Gestión' },
            { label: 'Preguntas' },
        ]);
    }

    listPreguntas() {}

    showDialog() {
        this.visible = true;
    }
}
