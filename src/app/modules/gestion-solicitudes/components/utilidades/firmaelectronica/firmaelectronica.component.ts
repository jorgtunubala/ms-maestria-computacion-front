import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FirmasService } from '../../../services/firmas.service';

@Component({
    selector: 'app-firmaelectronica',
    templateUrl: './firmaelectronica.component.html',
    styleUrls: ['./firmaelectronica.component.scss'],
})
export class FirmaelectronicaComponent implements OnInit {
    @ViewChild('firmaImage') firmaImage: ElementRef;

    constructor(public firmas: FirmasService) {}

    ngOnInit(): void {}

    onUpload(event, firmante) {
        this.firmas.firma = event.files[0];
        firmante.clear();

        const reader = new FileReader();
        reader.onload = (e) => {
            this.firmaImage.nativeElement.src = e.target.result;
        };
        reader.readAsDataURL(this.firmas.firma);
    }
}
