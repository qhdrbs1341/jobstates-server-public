const githubStrategy = require('passport-github2').Strategy;
require('dotenv').config();
const {User} = require('../models/index');

module.exports = (passport) => {
    passport.use(new githubStrategy({
        clientID: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
        callbackURL: '/auth/github/callback'
    }, async(accessToken, refreshToken, profile, done)=>{
        try{
            console.log("------깃헙 유저 정보------");
            console.log(profile);
            const exUser = await User.find({where: {snsId: profile.id, provider: 'github'}});
            if(exUser){
                done(null, exUser);
            }else{
                const newUser = User.create({
                    snsId: profile.id,
                    nick: profile.displayName,
                    profile: profile.photos[0].value,
                    provider: 'github'
                });
                done(null, newUser);
            }
        }catch(err){
            console.log(err);
            done(err);
        }
    }))
}
