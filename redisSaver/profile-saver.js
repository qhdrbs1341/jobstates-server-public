require('dotenv').config();
const redis = require('redis');
// const redisPool = require('../redisConnection/pool').redisPool();
const {User, Project, Education, Experience, HaveTech, FavoriteTech, FavoriteCategory} = require('../models/index');
exports.profileSaver = async (userId) => {
    try{
        const client = redis.createClient({
            host: process.env.REDIS_HOST,
            no_ready_check: true,
            auth_pass: process.env.REDIS_PASSWORD,
            port: process.env.REDIS_PORT
        });
const exUser = await User.find({where: { id: userId}, 
    include: [{model: HaveTech, attributes: ['title']},{model: FavoriteTech, attributes: ['title']},
{model: FavoriteCategory, attributes: ['title']},{model: Project},{model: Education},{model: Experience}]});
 const data = {
     id: exUser.id,
     snsId: exUser.snsId,
     profile: exUser.profile,
     newUser: exUser.newUser,
     nick: exUser.nick,
     name: exUser.name,
     photo: exUser.photo,
     photoKey: exUser.photoKey,
     email: exUser.email,
     github: exUser.github,
     blog: exUser.blog,
     phone: exUser.phone,
     education: exUser.education,
     project: exUser.projects,
     experience: exUser.experiences,
     haveTech: exUser.haveTeches.map(r => r.title),
     favoriteTech: exUser.favoriteTeches.map(r => r.title),
     favoriteCategory: exUser.favoriteCategories.map(r => r.title)
 };
 await client.hdel(userId,'profile');
await client.hmset(userId,'profile',JSON.stringify(data));
await client.quit();
return data;
    }catch(err){
        console.log(err);
    }
}
