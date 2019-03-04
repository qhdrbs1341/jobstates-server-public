const kakao = require('./kakaoStrategy');
const naver = require('./naverStrategy');
const google = require('./googleStrategy');
const github = require('./githubStrategy');
const jwt = require('./jwt');
module.exports=(passport)=>{
    kakao(passport);
    google(passport);
    naver(passport);
    github(passport);
    jwt(passport);
}
