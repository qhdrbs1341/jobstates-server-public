const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const {User} = require('../models/index');
const {verifyToken} = require('./middlewares');
const {webPush} = require('./middlewares');
//const vapidKeys = webpush.generateVAPIDKeys();

webpush.setGCMAPIKey(process.env.FCM_KEY);
webpush.setVapidDetails(
  'mailto:qhdrbs1341@gmail.com',
  process.env.VAPID_PUBLIC,
  process.env.VAPID_PRIVATE
)

router.get('/vapidkey',async(req,res,next)=>{
    try{
        res.json({key: process.env.VAPID_PUBLIC});
    }catch(err){
        console.log(err);
        next(err);
    }
})

router.post('/send',verifyToken,async(req,res)=>{
    try{
        const subscription = req.body.subscription;
        await User.update({subscription:JSON.stringify(subscription)},{where:{id:req.user.id}});
        const data = {
            title: 'Jobstates 알림 서비스',
            body: '이제부터 채용 공고 알림 서비스를 받으실 수 있습니다.',
            url : '/'
        }
        const options = {
            TTL : 24 * 60 * 60,
            vapidDetails: {
                subject : 'mailto: qhdrbs1341@gmail.com',
                publicKey: process.env.VAPID_PUBLIC,
                privateKey: process.env.VAPID_PRIVATE
            }
        }
       
        var webpusher = () => {
            webpush.sendNotification( subscription, JSON.stringify(data), options);
        }
        setTimeout(webpusher,0);
        res.json({
            code:200,
            message:'서비스 워커 정상 등록 완료'
        })
    }catch(err){
        console.log(err);
        next(err);
    }
})

router.delete('/subscription',verifyToken,async(req,res,next)=>{
    try{
    await User.update({subscription: null},{where: {id: req.user.id}});
    res.json({
        code: 200,
        message: '알림 설정이 취소 되었습니다.'
    })
    }catch(err){
        console.log(err);
        next(err);
    }
})

router.get('/test',async(req,res,next)=>{
    setInterval(webPush,3000);
})

module.exports = router;
