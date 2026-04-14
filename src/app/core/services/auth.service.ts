import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import {
    AuthResponse,
    LoginRequest,
    SessionData,
    AuthStatus,
    AuthError
} from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly storage = inject(StorageService);
    private readonly router = inject(Router);

    private readonly API_URL = `${environment.webhooks.base}${environment.webhooks.authProxy}`;
    private readonly SERIAL_ID = environment.serial;

    private readonly statusSignal = signal<AuthStatus>('idle');
    private readonly userSignal = signal<SessionData | null>(this.loadInitialUser());
    private readonly errorSignal = signal<AuthError | null>(null);

    readonly status = computed(() => this.statusSignal());
    readonly currentUser = computed(() => this.userSignal());
    readonly isAuthenticated = computed(() => this.userSignal() !== null);
    readonly isClientUser = computed(() => this.userSignal()?.tipoUsuario === 3);
    readonly userName = computed(() => this.userSignal()?.usuario?.nombre ?? '');
    readonly error = computed(() => this.errorSignal());

    constructor() {
        const session = this.storage.getSession();
        if (session && this.storage.isSessionValid()) {
            this.statusSignal.set('authenticated');
        }
    }

    private loadInitialUser(): SessionData | null {
        return this.storage.isSessionValid() ? this.storage.getSession() : null;
    }

    login(username: string, password: string): Observable<AuthResponse> {
        this.statusSignal.set('authenticating');
        this.errorSignal.set(null);

        const payload: LoginRequest = {
            username: username.trim(),
            password: password,
            idSerial: this.SERIAL_ID
        };

        // Enviar datos al servidor utilizando la URL configurada
        return this.http.post<AuthResponse>(`${this.API_URL}`, payload).pipe(

            tap((response: AuthResponse) => this.handleLoginResponse(response)),
            catchError((error: HttpErrorResponse) => this.handleError(error))
        );
    }


    private handleLoginResponse(rawResponse: AuthResponse | AuthResponse[]): void {
        const response = Array.isArray(rawResponse) ? rawResponse[0] : rawResponse;

        if (!response) {
            throw new Error('Respuesta del servidor vacía');
        }

        if (response.empresa || response.token) {
            this.completeAuthentication(response);
            this.statusSignal.set('authenticated');
            this.router.navigate(['/dashboard']);
        } else {
            throw new Error('Usuario y/o contraseña incorrectos');
        }
    }

    private completeAuthentication(response: AuthResponse): void {
        const sessionData: SessionData = {
            token: response.token,
            refreshToken: response.refreshToken,
            usuario: response.usuario,
            empresa: response.empresa!,
            catalogo: response.catalogo,
            timestamp: Date.now(),
            tipoUsuario: response.usuario.tipo,
            idAuxi: response.usuario.id1,
            idCtaAuxi: response.usuario.id2
        };

        this.storage.saveSession(sessionData);
        this.userSignal.set(sessionData);
    }

    logout(): void {
        this.storage.clearSession();
        this.userSignal.set(null);
        this.statusSignal.set('idle');
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return this.userSignal()?.token ?? null;
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        console.error('Error detallado de AuthService:', error);

        const authError: AuthError = {
            code: (error.status ?? 0).toString(),
            message: error.error?.message || error.message || 'Error de autenticación',
            statusCode: error.status || 0
        };
        this.errorSignal.set(authError);
        this.statusSignal.set('error');
        return throwError(() => authError);
    }
}
