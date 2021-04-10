import express from 'express';
import cors from 'cors';
import basicAuth from 'express-basic-auth';
import {
  createServer,
} from 'http';
import {
  Server,
} from 'colyseus';
import {
  monitor,
} from '@colyseus/monitor';

import {
  LobbyRoom,
} from './Network/Rooms/LobbyRoom';
import {
  GAME_SERVER_HOST,
  GAME_SERVER_PORT,
} from './Config';

const app = express();

app.use(cors());
app.use(express.json());

const gameServer = new Server({
  server: createServer(app),
});

gameServer.define('lobby', LobbyRoom);

const basicAuthMiddleware = basicAuth({
    users: {
        admin: 'password',
    },
    challenge: true
});
app.use('/colyseus', basicAuthMiddleware, monitor());

gameServer.listen(GAME_SERVER_PORT);

console.log(`Game server is listening on http://${GAME_SERVER_HOST}:${GAME_SERVER_PORT}`);
