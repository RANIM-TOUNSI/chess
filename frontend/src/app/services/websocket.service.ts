import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import SockJS from 'sockjs-client';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    private client: Client;
    private connected$ = new BehaviorSubject<boolean>(false);

    constructor(private authService: AuthService) {
        this.client = new Client({
            webSocketFactory: () => new SockJS(`${environment.apiUrl}/ws`),
            debug: (str) => {
                console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = (frame) => {
            console.log('Connected: ' + frame);
            this.connected$.next(true);
        };

        this.client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };
    }

    connect() {
        this.client.activate();
    }

    disconnect() {
        this.client.deactivate();
        this.connected$.next(false);
    }

    subscribe(topic: string, callback: (message: Message) => void) {
        // Wait until connected to subscribe
        const sub = this.connected$.subscribe(connected => {
            if (connected) {
                this.client.subscribe(topic, callback);
            }
        });
    }

    sendMessage(destination: string, body: any) {
        if (this.client.connected) {
            this.client.publish({ destination, body: JSON.stringify(body) });
        }
    }

    isConnected(): Observable<boolean> {
        return this.connected$.asObservable();
    }
}
