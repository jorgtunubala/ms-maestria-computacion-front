// prevent-login.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AutenticacionService } from 'src/app/modules/gestion-autenticacion/services/autenticacion.service';

@Injectable({
    providedIn: 'root',
})
export class PreventLoginGuard implements CanActivate {
    constructor(
        private authService: AutenticacionService,
        private router: Router
    ) {}

    canActivate(): boolean {
        if (this.authService.isLoggedIn()) {
            this.router.navigate(['']); // Redirige al inicio de la app
            return false;
        }
        return true;
    }
}
