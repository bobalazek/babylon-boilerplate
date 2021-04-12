const VERSION = '0.1.0';
let GAME_SERVER_HOST = 'localhost';
let GAME_SERVER_PORT = 1248;

if (typeof window !== 'undefined') {
  GAME_SERVER_HOST = window.location.hostname;
}

if (typeof process !== 'undefined') {
  if (process.env.GAME_SERVER_HOST) {
    GAME_SERVER_HOST = process.env.GAME_SERVER_HOST;
  }

  if (process.env.GAME_SERVER_PORT) {
    GAME_SERVER_PORT = Number(process.env.GAME_SERVER_PORT);
  }
}

export {
  VERSION,
  GAME_SERVER_HOST,
  GAME_SERVER_PORT,
}
