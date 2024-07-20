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
        const expectedRoles = route.data['expectedRole'];
        const userRoles = this.autenticacion.getRole();

        if (!expectedRoles.some((role) => userRoles.includes(role))) {
            this.router.navigate(['/pages/access']);
            return false;
        }
        return true;
    }
}
