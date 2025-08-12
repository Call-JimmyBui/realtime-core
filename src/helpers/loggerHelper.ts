import { LoggerService } from '@nestjs/common';
import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';
const DailyRotateFile = require('winston-daily-rotate-file');
const chalk = require('chalk').default;

// READ https://github.com/winstonjs/winston

export class Logger implements LoggerService {
  private static winston: WinstonLogger = createLogger({
    level: 'info',
    format: format.combine(
      format.label({ label: 'my-nest-app' }),
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.printf((info) => {
        const levelColor =
          info.level === 'error' ? chalk.red :
          info.level === 'warn' ? chalk.yellow :
          info.level === 'info' ? chalk.blue :
          chalk.white;

        return `${chalk.gray(info.timestamp)} ${chalk.magenta('[' + info.label + ']')} ${levelColor(info.level)}: ${chalk.white(info.message)}`;
      })
    ),
    transports: [
      new transports.Console(),
      new transports.File({
        filename: 'logs/testMaxsize.log',
        maxsize: 5242880,
        maxFiles: 5,
        tailable: true,
      }),
      new DailyRotateFile({
        filename: 'logs/%DATE%-all.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
      })
    ],
  });

  log(message: any, ...optionalParams: any[]) {
    Logger.winston.info(message, ...optionalParams);
  }
  error(message: any, ...optionalParams: any[]) {
    Logger.winston.error(message, ...optionalParams);
  }
  warn(message: any, ...optionalParams: any[]) {
    Logger.winston.warn(message, ...optionalParams);
  }
  debug(message: any, ...optionalParams: any[]) {
    Logger.winston.debug(message, ...optionalParams);
  }
  verbose(message: any, ...optionalParams: any[]) {
    Logger.winston.verbose(message, ...optionalParams);
  }

  // Thêm method info để gọi trực tiếp
  static info(message: any, ...optionalParams: any[]) {
    Logger.winston.info(message, ...optionalParams);
  }
}
