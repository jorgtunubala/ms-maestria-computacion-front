import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AutenticacionService } from '../../services/autenticacion.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    credencialesIncorretas: boolean = false;
    camposVacios: boolean = false;
    constructor(
        private autenticacion: AutenticacionService,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.loginForm = this.fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
        });
    }

    ngOnInit(): void {}

    async verificarCredenciales() {
        if (this.loginForm.valid) {
            const { username, password } = this.loginForm.value;
            try {
                const response = await lastValueFrom(
                    this.autenticacion.login(username, password)
                );
                if (response) {
                    this.router.navigate(['']);
                } else {
                    this.credencialesIncorretas = true;
                    this.camposVacios = false;
                }
            } catch (error) {
                this.credencialesIncorretas = true;
                this.camposVacios = false;
            }
        } else {
            this.camposVacios = true;
            this.credencialesIncorretas = false;
        }
    }
}
