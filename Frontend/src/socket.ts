// src/socket.ts
import { io, Socket } from 'socket.io-client';

// Create a socket instance and connect to the server
const socket: Socket = io("http://localhost:8000");

export default socket;