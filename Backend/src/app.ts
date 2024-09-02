import express, { Application, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer, Server } from 'http'; // Import http module
import { Server as SocketIOServer } from 'socket.io'; // Import Socket.IO server
import setupKeycloak from './keycloak-config.js';
import testingRouter from './routes/test.route.js';

dotenv.config({
    path: './.env',
});

const app: Application = express();
const server: Server = createServer(app); // Create HTTP server
const io: SocketIOServer = new SocketIOServer(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true,
    },
}); // Create a new Socket.IO server

const keycloak = setupKeycloak(app);

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
        allowedHeaders: ['Authorization', 'Content-Type'],
    })
);

app.options(
    '*',
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

// Log incoming request
app.use((req, res, next) => {
    console.log('Incoming request:', {
        origin: req.headers.origin,
        headers: req.headers,
    });
    next();
});

// Health check of server
app.use('/health', async (_, res: Response) => {
    res
        .status(200)
        .send("Healthy")
})

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());


app.use('/api/v1/test', testingRouter);



// Socket.IO logic
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("draw", (data) => {
        // Broadcast the drawing data to all connected clients
        socket.broadcast.emit("draw", data);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

export { app, server }; // Export both app and server
