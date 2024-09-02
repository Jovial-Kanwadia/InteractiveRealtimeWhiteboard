import { server } from './app.js';
import dotenv from 'dotenv';

dotenv.config({
    path: './.env',
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
