import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SessionStorageService {
    private sessionStorageEvent: EventEmitter<void> = new EventEmitter<void>();

    constructor() { }

    getItem(key: string): string {
        return sessionStorage.getItem(key);
    }

    setItem(key: string, value: string): void {
        sessionStorage.setItem(key, value);
        this.sessionStorageEvent.emit();
    }

    removeItem(key: string): void {
        sessionStorage.removeItem(key);
        this.sessionStorageEvent.emit();
    }

    getSessionStorageEvent(): EventEmitter<void> {
        return this.sessionStorageEvent;
    }
}
