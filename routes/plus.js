const express = require('express');
const router = express.Router()
const {User,Schedule,Hire,HireComment,FavoriteTech,News} = require('../models/index');
const redis = require('redis');

router.get('/keyboard',async (req,res,next)=>{
    try{
        const text = {
            type: 'text'
        }
        res.send(text);
    }catch(err){
        next(err);
    }
})
router.post('/message',async (req,res)=>{
    try{
        const user_key = req.body.user_key;
        const type = decodeURIComponent(req.body.type);
        const content = decodeURIComponent(req.body.content);

        if(!content.includes('@')){ // 유저키 등록이 아닌 경우
        const exUser = await User.findOne({where: { userKey: user_key}});
        if(!exUser){ // 일치하는 유저가 없는 경우
            const message = {
                'message': {
                    'text': 'Jobstates 이력서 이메일을 입력해주세요.'
                }
            }
            res.json(message);
        }else{ // 일치하는 유저가 있는 경우
                //뉴스 서비스
                const client = redis.createClient({
                    host: process.env.REDIS_HOST,
                    no_ready_check: true,
                    auth_pass: process.env.REDIS_PASSWORD,
                    port: process.env.REDIS_PORT
                });
                const techArray = await User.findOne({where: {userKey: user_key}, include: {model: FavoriteTech, include: {model: News}}});
                
                if(content.includes('뉴스') && content.includes('보여줘')){
                if(techArray.favoriteTeches.length===0){
                    res.json({
                        'message' : {
                            'text' : '설정한 관심 키워드가 없습니다.'
                        }
                    })
                    await client.quit();
                }else{
                let dataArray = [];
                techArray.favoriteTeches.map(tech=>{
                    for(index in tech.news){
                        const data = {
                            tech: tech.title,
                            title: tech.news[index].title,
                            url: tech.news[index].url
                        }
                        dataArray.push(data);
                    }
                })
                const newsData = {
                    newsCount: 0,
                    news: dataArray
                }
                await client.hmset('news',user_key,JSON.stringify(newsData));
                
                // const tech = techArray.favoriteTeches[0].title;
                // const title = techArray.favoriteTeches[0].news[0].title;
                // const url = techArray.favoriteTeches[0].news[0].url;
                //const provider = techArray.favoriteTeches[0].news[0].provider
                
                client.hmget('news',user_key,(err,obj)=>{
                    if(!obj){
                        res.json({
                            message: {
                                'text' : '뉴스 불러오기에 실패 했습니다.'
                            }
                        })
                    }else if(err){
                        throw new Error('error');
                    }else{
                        const newsObject = JSON.parse(obj);
                        const newsArray = newsObject.news;
                        var count = newsObject.newsCount;
        
                        const message = {
                            'message': {
                                'text' : newsArray[count].title,
                                'message_button':{
                                    'label' : newsArray[count].tech,
                                    'url' : newsArray[count].url
                                }
                            },
                            'keyboard': {
                                'type': 'buttons',
                                'buttons': [
                                    '다음 뉴스',
                                    '종료'
                                ]
                            }
                        }
                        console.log(count);
                        client.hmset('news',user_key,JSON.stringify({newsCount: count+1,news: newsArray}));
                        client.quit();
                        res.json(message);
                    }
                });
               
                }
                }else if(content === '다음 뉴스'){
                
                client.hmget('news',user_key,(err,obj)=>{
                    if(!obj){
                        res.json({
                            message: {
                                'text' : '뉴스 불러오기에 실패 했습니다.'
                            }
                        })
                    }else if(err){
                        throw new Error('error');
                    }else{
                        const newsObject =  JSON.parse(obj);
                        const newsArray = newsObject.news;
                        var count = newsObject.newsCount;
                    if(newsArray.length -1 < count){
                        const message = {
                            'message': {
                                'text': '더 이상 뉴스가 없습니다.'
                            }
                        }
                        console.log(count)
                        client.hmset('news',user_key,JSON.stringify({newsCount: 0,news: newsArray}));
                        client.quit();
                        res.json(message);
                    }else{
                  const message = {
                    'message': {
                        'text' : newsArray[count].title,
                        'message_button':{
                            'label' : newsArray[count].tech,
                            'url' : newsArray[count].url
                        }
                    },
                    'keyboard': {
                        'type': 'buttons',
                        'buttons': [
                            '다음 뉴스',
                            '종료'
                        ]
                    }
                }
                
                client.hmset('news',user_key,JSON.stringify({newsCount: count+1, news: newsArray}));
                client.quit();
                res.json(message);
                }
                    }
                });
                
                }else if(content === '종료'){
                await client.hdel('news',user_key);
                const message = {
                    'message' : {
                        'text' : '뉴스 알림이 종료되었습니다.'
                    }
                }
                await client.quit();
                res.json(message);
                }else{
                await client.quit();
                res.json({
                    'message': {
                        'text' : '아직 구현 중입니다.'
                    }
                })
                }
        }
        }else if(content.includes('@')){ // 유저키 등록
            console.log("----유저키----");
            console.log(user_key);
            console.log("----타입----");
            console.log(type);
            console.log("----내용----");
            console.log(content)
            const exUser = await User.findOne({where: {userKey: user_key}});
            if(!exUser){
            await User.update({userKey: user_key},{where: {email: content}});
            const newUser = await User.findOne({where: {userKey: user_key}});
            console.log("User searched!!")
            console.log(newUser);
            if(newUser){
                const message = {
                    'message': {
                        'text' : `${newUser.nick}님 환영합니다. 이제부터 Jobstates 알림 서비스를 받을 수 있습니다.`
                    }
                }
                res.json(message);
            }else{
                res.json({
                    'message':{
                        'text' : '잘못된 이메일 입니다.'
                    }
                })
            }
            }else{
                const message = {
                    'message': {
                        'text' : `${exUser.nick}님 이미 ${exUser.email}로 이메일 인증을 하셨습니다.`
                    }
                }
                res.json(message);
            }
        }
    }catch(err){
        console.log(err);
        res.json({
            'message' : {
                'text': '오류가 발생 했습니다.'}
        })
    }
})

router.delete('/friend/:user_key',async(req,res)=>{
    try{
        const client = redis.createClient({
            host: process.env.REDIS_HOST,
            no_ready_check: true,
            auth_pass: process.env.REDIS_PASSWORD,
            port: process.env.REDIS_PORT
        });
        const user_key = req.params.user_key;
        await User.update({userKey: null},{where: {userKey : user_key}});
        await client.hdel('news',user_key);
        await client.quit();
    }catch(err){
        console.log(err);
        res.json({
            'message' : {
                'text' : '오류가 발생 했습니다.'
            }
        })
    }
})

router.delete('/chat_room/:user_key',async(req,res,next)=>{
    try{
        const client = redis.createClient({
            host: process.env.REDIS_HOST,
            no_ready_check: true,
            auth_pass: process.env.REDIS_PASSWORD,
            port: process.env.REDIS_PORT
        });
        const user_key = req.params.user_key;
        await client.hdel('news',user_key);
        await client.quit();
    }catch(err){
        console.log(err);
        next(err);
    }
})

module.exports = router;
