import 'reflect-metadata';
import { Server } from './overnightjs/core/lib';
import bodyParser from 'body-parser';
import cors from 'cors';
import passport from 'passport';
import httpContext from 'express-http-context';
import errorHandler from 'errorhandler';

import initPassport from './config/passport';
import { addTransactionID } from './middleware/addTransactionID';

// DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
// import { sequelize } from './config/database';

import Logger from './Logger';
import * as controllers from './controllers';

const LOG = new Logger('routes.ts');

class RouterServer extends Server {
  public constructor() {
    super(true);
    this.configureMiddlewares();
    this.setupControllers();
  }

  private setupControllers(): void {
    const controllerInstances = [];
    for (const name of Object.keys(controllers)) {
      // eslint-disable-next-line
      const controller = (controllers as any)[name];
      if (typeof controller === 'function') {
        controllerInstances.push(new controller());
      }
    }
    super.addControllers(controllerInstances);
  }

  private async configureMiddlewares(): Promise<void> {
    const whitelist = (process.env.CORS_WHITELIST_ORIGIN || '').split(',').map(s => s.trim());

    this.app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin) return callback(null, true); // Allow curl/Postman

          const cleanOrigin = origin.replace(/\/$/, '');
          const isWhitelisted = whitelist.includes(cleanOrigin);
          const isSimplifySubdomain = /^https:\/\/.*\.simplify\.asia$/.test(cleanOrigin);

          if (isWhitelisted || isSimplifySubdomain) {
            callback(null, true);
          } else {
            callback(new Error(`CORS rejected origin: ${origin}`));
          }
        },
        methods: process.env.CORS_WHITELIST_ALLOW_METHODS,
        allowedHeaders: process.env.CORS_WHITELIST_ALLOW_HEADERS,
        credentials: true
      })
    );

    console.log('🚀 CORS configured with whitelist:', whitelist);

    this.app.disable('x-powered-by');
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
    this.app.use(httpContext.middleware);
    this.app.use(addTransactionID);
    this.app.use(passport.initialize());
    this.app.use(passport.session());

    if (process.env.NODE_ENV !== 'production') {
      this.app.use(errorHandler());
    }

    initPassport();
  }

  public start(port?: number): void {
    this.app.listen(port, () => {
      LOG.info('App is initialised');
    });
  }
}

export default RouterServer;
