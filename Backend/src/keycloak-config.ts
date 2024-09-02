import Keycloak from 'keycloak-connect';
import session from 'express-session';
import { Application } from 'express';

export default function setupKeycloak(app: Application) {
    const memoryStore = new session.MemoryStore();

    app.use(
        session({
            secret: 'some secret',
            resave: false,
            saveUninitialized: true,
            store: memoryStore,
        })
    );

    const keycloak = new Keycloak({ store: memoryStore }, {
        "realm": "Whiteboard",
        "bearer-only": true,
        "auth-server-url": "http://localhost:8000/auth",
        "ssl-required": "external",
        "resource": "whiteboard-backend",
        "confidential-port": 0,
    });

    app.use(keycloak.middleware());

    return keycloak;
}
