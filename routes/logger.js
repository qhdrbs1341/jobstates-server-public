//const winston = require('winston');
const { createLogger, format, transports} = require('winston');
require('dotenv').config();
require('winston-mongodb');

const infoLogger = createLogger({
    level: 'info',
    transports: [
        new transports.MongoDB({
            db: process.env.MONGO_HOST,
            collection: 'infoLog',
        })
    ],
    capped: true
});

const errorLogger = createLogger({
    level: 'error',
    transports: [
        new transports.MongoDB({
            db: process.env.MONGO_HOST,
            collection: 'errorLog'
        })
    ],
    capped: true
})

if(process.env.NODE_ENV !== 'production'){
    infoLogger.add(new transports.Console({format : format.combine(format.colorize(),format.prettyPrint(),format.simple())}));
    errorLogger.add(new transports.Console({format : format.combine(format.colorize(),format.prettyPrint(),format.simple())}));
}

module.exports = {infoLogger, errorLogger};
