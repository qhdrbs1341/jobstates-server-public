const kakaoStrategy = require('passport-kakao').Strategy;
require('dotenv').config();
const {User} = require('../models/index');

module.exports = (passport) => {
    passport.use(new kakaoStrategy({
        clientID: process.env.KAKAO_ID,
        callbackURL: '/auth/kakao/callback'
    }, async(accessToken, refreshToken, profile, done)=>{
        try{
            console.log(profile);
            const exUser = await User.find({where: {snsId: profile.id, provider: 'kakao'}});
            if(exUser){
                done(null, exUser);
            }else{
                const newUser = User.create({
                    snsId: profile.id,
                    nick: profile.displayName,
                    profile: profile._json.properties.profile_image,
                    provider: 'kakao'
                });
                done(null, newUser);
            }
        }catch(err){
            console.log(err);
            done(err);
        }
    }))
}
