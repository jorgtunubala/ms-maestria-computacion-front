import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GestorService } from '../../services/gestor.service';
import { RadicarService } from '../../services/radicar.service';

@Component({
    selector: 'app-visoraval',
    templateUrl: './visoraval.component.html',
    styleUrls: ['./visoraval.component.scss'],
})
export class VisoravalComponent implements OnInit {
    @ViewChild('firmaImage') firmaImage: ElementRef;
    mostrarBtnFirmar = false;
    firmaEnProceso = false;

    constructor(public gestor: GestorService, public radicar: RadicarService) {}

    ngOnInit(): void {}

    onUpload(event, firmante) {
        this.radicar.firmaTutor = event.files[0];
        firmante.clear();
        this.mostrarBtnFirmar = true;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.firmaImage.nativeElement.src = e.target.result;
        };
        reader.readAsDataURL(this.radicar.firmaTutor);
    }
}
