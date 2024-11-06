import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MenuService } from 'src/app/core/services/app.menu.service';

@Injectable({
    providedIn: 'root',
})
export class AutenticacionService {
    isLoggedInStatus: boolean = false;
    loginSuccess$: EventEmitter<void> = new EventEmitter<void>();
    private apiUrl = 'http://localhost:8080'; // URL del backend que redirige a Google

    constructor(private menuService: MenuService, private router: Router, private http: HttpClient) {}

    loginWithGoogle(): void {
        // Redirecciona al usuario a la URL de autenticación de Google
        window.location.href = `${this.apiUrl}/oauth2/authorization/google`;
    }

    handleGoogleLoginResponse(token: string): void {
        // Guardar el token en localStorage para futuras solicitudes
        localStorage.setItem('googleToken', token);
        this.isLoggedInStatus = true;

        // Emitir evento de éxito de inicio de sesión
        this.menuService.emitAlertLogin();
        this.loginSuccess$.emit();
    }

    logout(): void {
        this.isLoggedInStatus = false;
        localStorage.removeItem('googleToken'); // Remover el token de Google
        this.router.navigate(['']); // Redirige a la página de inicio
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('googleToken'); // Verifica si hay un token almacenado
    }

    // Método opcional para obtener la información del usuario a través del backend
    fetchUserProfile(): void {
        const token = localStorage.getItem('googleToken');
        if (token) {
            this.http
                .get(`${this.apiUrl}/userProfile`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .subscribe((user) => {
                    // Manejo de datos del usuario aquí
                    console.log('User profile:', user);
                });
        }
    }
}
