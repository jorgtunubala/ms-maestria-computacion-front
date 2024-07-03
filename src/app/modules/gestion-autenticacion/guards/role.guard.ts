import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AutenticacionService } from '../services/autenticacion.service';

@Injectable({
    providedIn: 'root',
})
export class RoleGuard implements CanActivate {
    constructor(
        private autenticacion: AutenticacionService,
        private router: Router
    ) {}

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const expectedRole = route.data.expectedRole;
        const currentRole = this.autenticacion.getRole();

        if (this.autenticacion.isLoggedIn() && currentRole === expectedRole) {
            return true;
        } else {
            this.router.navigate(['/unauthorized']);
            return false;
        }
    }
}
