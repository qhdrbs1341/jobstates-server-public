require('dotenv').config();
const redis = require('redis');
//const redisPool = require('../redisConnection/pool').redisPool();
const {User,Company,Hire,Schedule,HireTech,Category,HireComment} = require('../models/index');
exports.scheduleSaver = async(userId) => {
    try{
        const client = redis.createClient({
            host: process.env.REDIS_HOST,
            no_ready_check: true,
            auth_pass: process.env.REDIS_PASSWORD,
            port: process.env.REDIS_PORT
        });
        const exSchedule = await Schedule.findAll({where: {userId: userId},
            include: [{model: Hire, 
                include: 
                [{model: Company, include: {model: Category}},{model: HireTech}]},{model: HireComment}]});
            
            const dataArray = exSchedule.map(schedule => {
                console.log("스케쥴 : ------");
                console.log(schedule);
                const data = { 
                    scheduleId: schedule.id,
                    status: schedule.status,
                    statusDate: schedule.statusDate,
                    hireId: schedule.hireId,
                    title: schedule.hire ? schedule.hire.title : null,
                    importantInfo: schedule.hire ? schedule.hire.importantInfo : null,
                    detailInfo: schedule.hire ? schedule.hire.detailInfo : null,
                    hireImage: schedule.hire ? schedule.hire.hireImage : null,
                    hireImageKey: schedule.hire ? schedule.hire.hireImageKey : null,
                    address: schedule.hire ? schedule.hire.address : null,
                    experience: schedule.hire.experience,
                    salary: schedule.hire.salary,
                    deadLine: schedule.hire.deadLine,
                    provider: schedule.hire.provider,
                    hireUrl: schedule.hire.hireUrl,
                    hireStatus: schedule.hire.status,
                    companyId: schedule.hire.companyId,
                    brand: schedule.hire.company.brand,
                    logo: schedule.hire.company.logo,
                    logoKey: schedule.hire.company.logoKey,
                    companyUrl: schedule.hire.company.companyUrl,
                    intro: schedule.hire.company.intro,
                    category: schedule.hire.company.categories.map(category => category.title),
                    hireTech: schedule.hire.hireTeches.map(hireTech => hireTech.title),
                    commentId: schedule.hireComment ? schedule.hireComment.id : null,
                    advantage: schedule.hireComment ? schedule.hireComment.advantage : null,
                    disAdvantage: schedule.hireComment ? schedule.hireComment.disAdvantage : null,
                    strategy: schedule.hireComment ? schedule.hireComment.strategy : null  
                }
                return data;
            })
            await client.hdel(userId,'schedule');
            await client.hmset(userId,'schedule',JSON.stringify(dataArray));
            await client.quit();
            return dataArray;
    }catch(err){
        console.log(err);
    }
}
