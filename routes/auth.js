const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const {authCheck} = require('./middlewares');

router.get('/check',authCheck);

router.get('/kakao',passport.authenticate('kakao'));
router.get('/kakao/callback',passport.authenticate('kakao',{
    failureMessage: '잘못된 카카오 회원 입니다.',
    session: false
}), async(req,res,next)=>{
    try{
        const token = await jwt.sign({
            id: req.user.id,
            snsId : req.user.snsId,
            nick: req.user.nick,
            profile: req.user.profile,
            provider: 'kakao'
        }, process.env.JWT_SECRET,{
            expiresIn : '48h',
            issuer: 'jobstates'
        });
        const BearerToken = "Bearer " + token;
        res.redirect(`https://www.jobstates.net/userprofile?token=${BearerToken}&nick=${req.user.nick}&profile=${req.user.profile}`)
    }catch(err){
        console.log(err);
        next(err);
    }
})

router.get('/naver',passport.authenticate('naver'));
router.get('/naver/callback',passport.authenticate('naver',{
    failureMessage: '잘못된 네이버 회원 입니다.',
    session: false
}), async (req,res,next)=>{
    try{
        const token = await jwt.sign({
            id: req.user.id,
            snsId : req.user.snsId,
            nick: req.user.nick,
            profile: req.user.profile,
            provider: 'naver'
        }, process.env.JWT_SECRET,{
            expiresIn : '48h',
            issuer: 'jobstates'
        });
        const BearerToken = "Bearer " + token;
        res.redirect(`https://www.jobstates.net/userprofile?token=${BearerToken}&nick=${req.user.nick}&profile=${req.user.profile}`)
    }catch(err){
        console.log(err);
        next(err);
    }
})

router.get('/google',passport.authenticate('google',{scope: ['profile','email']}));
router.get('/google/callback',passport.authenticate('google',{
    failureMessage: '잘못된 구글 회원 입니다.',
    session: false
}), async (req,res,next)=>{
    try{
        const token = await jwt.sign({
            id: req.user.id,
            snsId : req.user.snsId,
            nick: req.user.nick,
            profile: req.user.profile,
            provider: 'google'
        }, process.env.JWT_SECRET,{
            expiresIn : '48h',
            issuer: 'jobstates'
        });
        const BearerToken = "Bearer " + token;
        res.redirect(`https://www.jobstates.net/userprofile?token=${BearerToken}&nick=${req.user.nick}&profile=${req.user.profile}`)
    }catch(err){
        console.log(err);
        next(err);
    }
})

router.get('/github', passport.authenticate('github', {scope: ['user:email']}));
router.get('/github/callback',passport.authenticate('github',{
    failureMessage: '잘못된 깃헙 회원 입니다.',
    session: false
}), async(req,res,next)=>{
    try{
        const token = await jwt.sign({
            id: req.user.id,
            snsId : req.user.snsId,
            nick: req.user.nick,
            profile: req.user.profile,
            provider: 'github'
        }, process.env.JWT_SECRET,{
            expiresIn : '48h',
            issuer: 'jobstates'
        });
        const BearerToken = "Bearer " + token;
        res.redirect(`https://www.jobstates.net/userprofile?token=${BearerToken}&nick=${req.user.nick}&profile=${req.user.profile}`)
    }catch(err){
        console.log(err);
        next(err);
    }
})


module.exports = router;
