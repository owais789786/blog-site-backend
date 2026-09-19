const { format, createLogger, transports } = require('winston');

const logger = createLogger({

  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  ),

  transports: [
    new transports.Console({
      level: 'info',
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message }) => `${timestamp} | [${level}] : ${message}`)
      )
    }),

    new transports.File({
      level: 'error',
      filename: 'logs/error.log',
      format: format.combine(
        format.printf(({ timestamp, level, message }) => `${timestamp} | [${level}] : ${message}`)
      )
    }),

    new transports.File({
      level: 'info',
      filename: 'logs/combined.log',
      format: format.combine(
        format.printf(({ timestamp, level, message }) => `${timestamp} | [${level}] : ${message}`)
      )
    })
  ]



})

module.exports = logger