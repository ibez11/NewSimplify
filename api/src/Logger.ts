import appLogger from './config/winston';

class Logger {
  private filename: string;

  public constructor(filename: string) {
    this.filename = filename;
  }

  public error(message: string): void {
    appLogger.error(message, { filename: this.filename });
  }

  public warn(message: string): void {
    appLogger.warn(message, { filename: this.filename });
  }

  public info(message: string): void {
    appLogger.info(message, { filename: this.filename });
  }

  public verbose(message: string): void {
    appLogger.verbose(message, { filename: this.filename });
  }

  public debug(message: string): void {
    appLogger.debug(message, { filename: this.filename });
  }

  public silly(message: string): void {
    appLogger.silly(message, { filename: this.filename });
  }

  public log(level: string, message: string): void {
    appLogger.log(level, message, { filename: this.filename });
  }
}

export default Logger;
