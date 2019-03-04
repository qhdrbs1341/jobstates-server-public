const googleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();
const {User} = require('../models/index');
//
module.exports = (passport) => {
    passport.use(new googleStrategy({
        clientID: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: '/auth/google/callback'
    }, async(accessToken, refreshToken, profile, done)=>{
        try{
            console.log(profile);

            const exUser = await User.find({where: {snsId: profile.id, provider: 'google'}});
            if(exUser){
                done(null, exUser);
            }else{
                const newUser = User.create({
                    snsId: profile.id,
                    nick: profile.username,
                    profile: profile.photos[0].value,
                    github: profile.profileUrl,
                    provider: 'google'
                });
                done(null, newUser);
            }
        }catch(err){
            console.log(err);
            done(err);
        }
    }))
}
