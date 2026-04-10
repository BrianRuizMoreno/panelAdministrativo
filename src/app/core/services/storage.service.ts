import { Injectable } from '@angular/core';
import { SessionData } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private readonly SESSION_KEY = 'physis_session';

    saveSession(data: SessionData): void {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(data));
    }

    getSession(): SessionData | null {
        const session = localStorage.getItem(this.SESSION_KEY);
        return session ? JSON.parse(session) : null;
    }

    clearSession(): void {
        localStorage.removeItem(this.SESSION_KEY);
    }

    isSessionValid(): boolean {
        const session = this.getSession();
        if (!session) return false;
        
        // Se puede agregar lógica de expiración de token aquí
        const now = Date.now();
        const duration = 24 * 60 * 60 * 1000; // 24 horas por ejemplo
        return (now - session.timestamp) < duration;
    }
}

