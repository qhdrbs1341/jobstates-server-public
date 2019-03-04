require('dotenv').config()
const redis = require('redis');
const {Schedule,Sequelize,Hire,User,HireTech,FavoriteTech} = require('../models/index');
const Op = Sequelize.Op;
const jwt = require('jsonwebtoken');
const passport = require('passport');
const webpush = require('web-push');

webpush.setGCMAPIKey(process.env.FCM_KEY);
webpush.setVapidDetails(
  'mailto:qhdrbs1341@gmail.com',
  process.env.VAPID_PUBLIC,
  process.env.VAPID_PRIVATE
)
exports.verifyToken = async (req,res,next)=>{
    try{
      let token = req.headers.authorization;
      
      if(token.startsWith('Bearer ')){
        token = token.slice(7, token.length).trimLeft();
      }
      const tokenTest = await jwt.verify(token, process.env.JWT_SECRET);
  
      passport.authenticate('jwt',{session: false},(error,user)=>{
        if(error){
          return res.json({
            code: 408,
            message: '데이터 베이스 에러'
          })
        }
        if(!user){
          return res.json({
            code: 407,
            message: '일치하는 회원이 없습니다'
          })
        }
        req.user = user;
        return next();
      })(req,res,next);
    }catch(err){
        if(err.name === 'TokenExpiredError'){
          res.json({
            code: 406,
            message: '토큰이 만료 되었습니다.'
          })
        }else{
          res.json({
            code : 405,
            message : '유효하지 않은 토큰입니다.'
          })
        }
    }
  }
  
  exports.profileRead = async (req,res,next) => {
    try{
        console.log(req.body);
        const client = redis.createClient({
            host: process.env.REDIS_HOST,
            no_ready_check: true,
            auth_pass: process.env.REDIS_PASSWORD,
            port: process.env.REDIS_PORT
        });
        await client.hmget(req.user.id, 'profile', (err,obj)=>{
            if(!obj[0]){
                next();
            }else if(err){
                next(err);
            }
            else{
                console.log(obj);
                res.json({
                    code:200,
                    data:JSON.parse(obj)});
                client.quit();
            }
        })
       
    }catch(err){
        next(err);
    }
}

exports.scheduleRead = async(req,res,next)=>{
    try{
        const client = redis.createClient({
            host: process.env.REDIS_HOST,
            no_ready_check: true,
            auth_pass: process.env.REDIS_PASSWORD,
            port: process.env.REDIS_PORT
        });
        await client.hmget(req.user.id,'schedule', (err,obj)=>{
            if(!obj[0]){
                next();
            }else if(err){
                next(err);
            }
            else{
                console.log("redis 발동!!")
                console.log(obj)
                res.json({
                    code:200,
                    data:JSON.parse(obj)});
                client.quit();
            }
        })
        
    }catch(err){
        next(err);
    }
}

exports.authCheck = async (req,res)=>{
    try{
      let token = req.headers.authorization;
      if(token.startsWith('Bearer ')){
        token = token.slice(7, token.length).trimLeft();
      }
      const tokenTest = await jwt.verify(token, process.env.JWT_SECRET);
  
      passport.authenticate('jwt',{session: false},(error,user)=>{
        if(error){
          return res.json({
            code: 408,
            message: '데이터 베이스 에러'
          })
        }else if(!user){
          return res.json({
            code: 407,
            message: '일치하는 회원이 없습니다'
          })
        }else{
        return res.json({
            code: 200,
            message: '정상적인 토큰 입니다.'
        })
        }
      })(req,res);
    }catch(err){
        if(err.name === 'TokenExpiredError'){
          res.json({
            code: 406,
            message: '토큰이 만료 되었습니다.'
          })
        }else{
            console.log(err);
          res.json({
            code : 405,
            message : '유효하지 않은 토큰입니다.'
          })
        }
    }
  }

  exports.webPush = async()=>{
    try{
      console.log("웹 푸시 호출");
      const exUser = await User.findAll({where: {subscription: {[Op.ne]:null} }, include: [{model: Schedule, include: [{model: Hire,where:{status:'update'}}]},{model: FavoriteTech, attributes: ['title']}]});
      
      exUser.map(async user => {
        //유저별 subscription
        const subscription = JSON.parse(user.subscription);
        console.log("subscription: ",subscription);
        const options = {
          TTL: 24 * 60 * 60,
          vapidDetails: {
           subject: 'mailto: qhdrbs1341@gmail.com',
            publicKey: process.env.VAPID_PUBLIC,
            privateKey: process.env.VAPID_PRIVATE
          }
        };
        

        const dataArray = user.schedules.map(schedule => {
          // console.log("hire: ",schedule.hire);
          // console.log("hireStatus: ",schedule.hire.status);
          // console.log("hireUrl: ", schedule.hireUrl);
          const data = {
            title: schedule.hire.title,
            body: '업데이트 된 채용 공고 입니다.',
            tag: `${new Date()*Math.random()}`,
            params: {
              url: schedule.hire.hireUrl
            }
          }
          console.log("----업데이트된 타이틀-----")
          console.log(schedule.hire.title);
          return data;
        })
        dataArray.map(data => {
          webpush.sendNotification(subscription,JSON.stringify(data),options)
          .then(status=>{
            console.log(status);
          })
          .catch(err=> {
            console.log(err);
          })
        })
        
        const favoriteTechArray = user.favoriteTeches.map(tech => (tech.title));
        const newHireArray = await Hire.findAll({where: {status: 'new'},include:[{model:HireTech, attributes:['title']}]});
        //  newHireArray.map(hire => {
          console.log("새로운 공고 찾기 시작!!!!!!!!!!!!!!!!!!")
          hireLoop:
          for(var i=0;i<newHireArray.length;i++){
          // console.log("채용 타이틀: ",newHireArray[i].title);
          // newHireArray[index].hireTeches.map(tech => {
            for(var j=0;j<newHireArray[i].hireTeches.length;j++){
            console.log("기술명: ",newHireArray[i].hireTeches[j].title)
            for(var index in favoriteTechArray){
              if((newHireArray[i].hireTeches[j].title.toLowerCase()).includes(favoriteTechArray[index].toLowerCase())){
                console.log("Searched NewHire!!!!!!!!")
                console.log('유저 아이디: ',user.id);
                const data = {
                  title: newHireArray[i].title,
                  body: '새로운 채용 공고 입니다.',
                  tag: `${new Date()*Math.random()}`,
                  params: {
                    url: newHireArray[i].hireUrl
                  }
                }
                console.log(data);
                webpush.sendNotification(subscription,JSON.stringify(data),options)
                .then(status=>{
                  console.log(status);
                })
                .catch(err=> {
                  console.log(err);
                })
                continue hireLoop;
              }
            }
          }
          // })
        }
        // })
      })
    }catch(err){
      console.log(err)
    }
  }
