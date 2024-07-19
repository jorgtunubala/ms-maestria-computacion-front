import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AutenticacionService } from '../../services/autenticacion.service';

@Component({
    selector: 'app-dynamiclogin',
    templateUrl: './dynamiclogin.component.html',
    styleUrls: ['./dynamiclogin.component.scss'],
})
export class DynamicloginComponent implements OnInit {
    loginForm: FormGroup;
    credencialesIncorretas: boolean = false;
    camposVacios: boolean = false;

    constructor(
        private autenticacion: AutenticacionService,
        private ref: DynamicDialogRef,
        private fb: FormBuilder
    ) {
        this.loginForm = this.fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
        });
    }

    ngOnInit(): void {}

    verificarCredenciales() {
        if (this.loginForm.valid) {
            const { username, password } = this.loginForm.value;
            this.autenticacion.login(username, password).subscribe({
                next: (response) => {
                    if (response) {
                        this.ref.close();
                    } else {
                        this.credencialesIncorretas = true;
                        this.camposVacios = false;
                    }
                },
            });
        } else {
            this.camposVacios = true;
            this.credencialesIncorretas = false;
        }
    }
}
