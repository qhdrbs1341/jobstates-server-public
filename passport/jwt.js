const {User} = require('../models/index');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const opts = {}
opts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

module.exports = (passport) => {
    passport.use(new JwtStrategy(opts,
        async function (jwtPayload, cb) {
            //find the user in db if needed
            
            return await User.findOne({where : {id: jwtPayload.id}})
                .then(user => {
                    return cb(null, user);
                })
                .catch(err => {
                    console.log(err);
                    return cb(err,null);
                });
        }
        ));
}
