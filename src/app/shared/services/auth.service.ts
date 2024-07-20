import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { backendAuth } from 'src/app/core/constants/api-url';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
    private roleSubject = new BehaviorSubject<string[]>(
        this.getRoleFromStorage()
    );
    private usernameSubject = new BehaviorSubject<string>(
        this.getUsernameFromStorage()
    );

    loggedIn$ = this.loggedIn.asObservable();
    role$ = this.roleSubject.asObservable();
    username$ = this.usernameSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) {}

    login(username: string, password: string): Observable<any> {
        return this.http
            .post<any>(backendAuth('auth/signin'), { username, password })
            .pipe(
                tap((response) => {
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('role', JSON.stringify(response.role));
                    localStorage.setItem('usuario', response.usuario);
                    this.loggedIn.next(true);
                    this.roleSubject.next(response.role);
                    this.usernameSubject.next(response.usuario);
                })
            );
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('usuario');
        localStorage.removeItem('est');
        this.loggedIn.next(false);
        this.roleSubject.next([]);
        this.usernameSubject.next('');
        this.router.navigate(['/login']);
    }

    isLoggedIn(): Observable<boolean> {
        return this.loggedIn.asObservable();
    }

    getToken(): string {
        return localStorage.getItem('token') || '';
    }

    getRole(): string[] {
        return JSON.parse(localStorage.getItem('role') || '[]');
    }

    getUsername(): Observable<string> {
        return this.usernameSubject.asObservable();
    }

    private hasToken(): boolean {
        return !!localStorage.getItem('token');
    }

    private getRoleFromStorage(): string[] {
        return JSON.parse(localStorage.getItem('role') || '[]');
    }

    private getUsernameFromStorage(): string {
        return localStorage.getItem('username') || '';
    }
}
