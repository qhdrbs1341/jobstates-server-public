const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const flash = require('connect-flash');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const {sequelize} = require('./models/index');
const passport = require('passport');
const passportConfig = require('./passport/index');
const {infoLogger,errorLogger} = require('./routes/logger');
const helmet = require('helmet');
const hpp = require('hpp');
require('dotenv').config();
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const scheduleRouter = require('./routes/schedule');
const analyticsRouter = require('./routes/analytics');
const imageRouter = require('./routes/image');
const connect = require('./schemas/index');
const plusRouter = require('./routes/plus');
const pushRouter = require('./routes/webpush');
const {verifyToken,webPush} = require('./routes/middlewares');
const http = require('http');
const https = require('https');
const cron = require('node-cron');
const jwt = require('jsonwebtoken');

passportConfig(passport);

const lex = require('greenlock-express').create({
  version: 'v02',
  configDir: '/etc/letsencrypt',
  server: 'https://acme-v02.api.letsencrypt.org/directory',
  approveDomains: (opts,certs,cb)=>{
    if(certs){
      opts.domains = ['jobstate.xyz','www.jobstate.xyz'];
    }else{
      opts.email = 'qhdrbs1341@gmail.com';
      opts.agreeTos = true;
    }
    cb(null,{options: opts, certs});
  },
  renewWithin: 81*24*60*60*1000,
  renewBy: 80*24*60*60*1000
})

app.set('port',process.env.PORT);
app.use(cors());


if(process.env.NODE_ENV === 'production'){
  app.use(morgan('combined'));
  // app.use(helmet());
  // app.use(hpp());
}else{
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser(process.env.COOKIE_SECRET))
const sessionOption = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false
  }
}

if(process.env.NODE_ENV==='production'){
  sessionOption.proxy = true;
  sessionOption.cookie.secure = true;
}

app.use(session(sessionOption))

app.use(flash());

connect();
sequelize.sync();
app.use('/auth',authRouter);
app.use('/user',verifyToken,userRouter);
app.use('/schedule',verifyToken,scheduleRouter);
app.use('/analytics',verifyToken,analyticsRouter);
app.use('/push',pushRouter);
app.use('/image',imageRouter);
app.use('/plus',plusRouter);

app.use((req,res,next) => {
  res.json({
    code: 404,
    message: '잘못된 경로 입니다.'
  })
  errorLogger.error({
    message: 'Not Found',
    meta: { ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress}
  });
})

app.use((err, req, res) => {
  res.json({
    code: err.status || 500,
    message: err.message
  })
  errorLogger.error({
    message: err.message,
    meta: { ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress}
  });
})

cron.schedule('30 1 * * *',()=>{
  webPush();
})

https.createServer(lex.httpsOptions, lex.middleware(app)).listen(process.env.SSL_PORT || 443);
http.createServer(lex.middleware(require('redirect-https')())).listen(process.env.PORT || 80);
