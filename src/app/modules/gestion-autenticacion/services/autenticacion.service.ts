import { EventEmitter, Injectable } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MenuService } from 'src/app/core/services/app.menu.service';
import { DynamicloginComponent } from '../components/dynamiclogin/dynamiclogin.component';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { backendAuth } from 'src/app/core/constants/api-url';

interface Usuario {
    username: string;
    email: string;
    role: string[];
}

@Injectable({
    providedIn: 'root',
})
export class AutenticacionService {
    isLoggedInStatus: boolean = false;
    userRole: string = '';
    loggedInUser: Usuario | null = null;
    dialogRef: DynamicDialogRef;

    loginSuccess$: EventEmitter<void> = new EventEmitter<void>();

    constructor(
        private dialogService: DialogService,
        private menuService: MenuService,
        private router: Router,
        private http: HttpClient // Agregamos HttpClient
    ) {
        // Verificar el estado de inicio de sesión al inicializar el servicio
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
            this.isLoggedInStatus = true;
            this.loggedInUser = JSON.parse(storedUser);
        }
    }

    login(username: string, password: string): Observable<any> {
        return this.http
            .post<any>(backendAuth('auth/signin'), { username, password })
            .pipe(
                tap((response) => {
                    localStorage.setItem('token', response.token);
                    localStorage.setItem(
                        'loggedInUser',
                        JSON.stringify({
                            username: response.usuario,
                            email: response.email,
                            role: response.role,
                        })
                    );
                    this.isLoggedInStatus = true;
                    this.loggedInUser = {
                        username: response.usuario,
                        email: response.email,
                        role: response.role,
                    };

                    // Emitir la alerta después de que loggedInUser se actualice correctamente
                    this.menuService.emitAlertLogin();
                })
            );
    }

    logout(): void {
        this.isLoggedInStatus = false;
        this.loggedInUser = null;
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('token');
        localStorage.removeItem('est');
        localStorage.removeItem('estEgresado');
        this.router.navigate(['']);
    }

    isLoggedIn(): boolean {
        return this.isLoggedInStatus;
    }

    getLoggedInUser(): Usuario | null {
        return this.loggedInUser;
    }

    getRole(): string[] | null {
        return this.loggedInUser ? this.loggedInUser.role : [];
    }

    getFullName(): string {
        return this.loggedInUser ? this.loggedInUser.username : '';
    }

    getEmail(): string {
        return this.loggedInUser ? this.loggedInUser.email : '';
    }

    hasRole(role: string): boolean {
        return this.loggedInUser
            ? this.loggedInUser.role.includes(role)
            : false;
    }

    openLoginDialog(): void {
        this.dialogRef = this.dialogService.open(DynamicloginComponent, {
            header: 'Inicie sesión',
            width: '30%',
        });
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }
}
