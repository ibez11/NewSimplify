import express from 'express';
import RouterServer from './routes';

const port = process.env.PORT || 5000;

class App {
  public app: express.Application;

  public constructor() {
    this.app = express();
  }

  public startApp(): void {
    const server = new RouterServer();
    server.start(Number(port));
  }
}

export default App;
