const express = require('express');
const router = express.Router();
const {User, Schedule, Hire, HireTech, Company, Category, sequelize, Sequelize} = require('../models/index');
const {verifyToken} = require('./middlewares');

router.get('/',verifyToken,async (req,res,next)=>{
    try{
    // const allcountTemp = await User.findAll({where: {id: req.headers.id},attributes:['id',
    // [sequelize.fn('count',sequelize.col('schedules.id')),'allCount']],include:[{model:Schedule, 
    //     attributes: []}]});
    // const allcountTemp = await User.find({where: {id: req.headers.id},attributes:[],
    // include: [{model: Schedule, attributes: [[sequelize.fn('count',sequelize.col('schedules.id')),'allCount']]}],
    // group: ['schedules.status']});
    const userCountArray = await Schedule.findAll({where: {userId: req.user.id}, attributes: ['status',[sequelize.fn('COUNT',sequelize.col('id')),'count']], group: 'status'});
    const allUserCountArray = await Schedule.findAll({attributes: ['status',[sequelize.fn('COUNT',sequelize.col('id')),'count']], group: 'status'});
    // const userHaveTech = await Schedule.findAndCountAll({where:{userId: req.headers.id},include: [{model:Hire, include:[{model: HireTech, attributes: ['title'], group: 'title'}]}]})
    //const userHaveTech = await Schedule.findAll({where: {userId: req.headers.id},attributes:['id'],include:[{model:Hire, attributes: ['title'],include: [{model: HireTech, attributes: ['title',[sequelize.fn('COUNT','id'),'count']]}]}]});
    //const userHaveTech = await Schedule.findAll({where: {userId: req.headers.id}, attributes:[], include: {model: Hire, attributes: ['title'], include: {model: HireTech}}});
    // const schedule = await Schedule.find({where: {userId: req.headers.id}})
    // const hire = await schedule.getHire();
    // const schedule = await Schedule.findAll({where:{userId: req.headers.id}, attributes:[], include: [{model:Hire, 
    //     attributes: ['title'],
    //     include: [{model: HireTech, attributes:['title',[sequelize.fn('COUNT','title'),'count']], group: ['title']}]}]});
    //const hireTech = await schedule.getHireTeches();
    const hireTechCategoryArray = await Schedule.findAll({where: {userId: req.user.id}, attributes:[], include: {model: Hire,attributes:['title'], include: [{model: HireTech, attributes: ['title']},{model: Company, attributes:['brand'], include: {model: Category, attributes: ['title']}}]}})
    const allHireTechCategoryArray = await Schedule.findAll({attributes:[], include: {model: Hire,attributes:['title'], include: [{model: HireTech, attributes: ['title']},{model: Company, attributes: ['brand'], include: [{model: Category, attributes: ['title']}]}]}});
    const userHiringTechCountTemp = {};
    const allUserHiringTechCountTemp = {};
    const userHiringCategoryCountTemp = {};
    const allUserHiringCategoryCountTemp = {};
    let techArray = [];
    let allTechArray = [];
    let categoryArray = [];
    let allCategoryArray = [];

    //개인 hireTech
    hireTechCategoryArray.map(schedule => {
        schedule.hire.hireTeches.map(tech => {
            if(userHiringTechCountTemp[tech.title]){
                userHiringTechCountTemp[tech.title] ++;
            }else{
                userHiringTechCountTemp[tech.title] =1;
            }
        })
        schedule.hire.company.categories.map(catgory => {
            if(userHiringCategoryCountTemp[catgory.title]){
                userHiringCategoryCountTemp[catgory.title] ++;
            }else{
                userHiringCategoryCountTemp[catgory.title] =1;
            }
        })
    })

    
    
    for(var key in userHiringTechCountTemp){
        const data ={
            tech: key,
            count: userHiringTechCountTemp[key]
        }
        techArray.push(data);
    }
    
    techArray.sort((a,b)=>{
        return a.count > b.count ? -1 : a.count < b.count ? 1 : 0
    })

    const userHiringTechCount = {};
    let length = techArray.length < 6 ? techArray.length : 6
    for(var i=0;i<length;i++){
        userHiringTechCount[techArray[i].tech] = techArray[i].count;
    }

    //개인 Category 
    for(var key in userHiringCategoryCountTemp){
        const data = {
            category: key,
            count: userHiringCategoryCountTemp[key]
        }
        categoryArray.push(data);
    }

    categoryArray.sort((a,b)=>{
        return a.count > b.count ? -1 : a.count < b.count ? 1 : 0
    })


    let userHiringCategoryCount = [];
    length = categoryArray.length < 6 ? categoryArray.length : 6
    for(var i=0;i<length;i++){
        console.log(categoryArray[i]);
        userHiringCategoryCount.push([categoryArray[i].category,categoryArray[i].count]);
    }

    //All hireTech
    allHireTechCategoryArray.map(schedule => {
        schedule.hire.hireTeches.map(tech => {
            if(allUserHiringTechCountTemp[tech.title]){
                allUserHiringTechCountTemp[tech.title] ++;
            }else{
                allUserHiringTechCountTemp[tech.title] =1;
            }
        })

        schedule.hire.company.categories.map(catgory => {
            if(allUserHiringCategoryCountTemp[catgory.title]){
                allUserHiringCategoryCountTemp[catgory.title] ++;
            }else{
                allUserHiringCategoryCountTemp[catgory.title] =1;
            }
        })
    })
    
    for(var key in allUserHiringTechCountTemp){
        const data ={
            tech: key,
            count: allUserHiringTechCountTemp[key]
        }
        allTechArray.push(data);
    }
    
    allTechArray.sort((a,b)=>{
        return a.count > b.count ? -1 : a.count < b.count ? 1 : 0
    })

    const allUserHiringTechCount = {};
    length = allTechArray.length < 6 ? allTechArray.length : 6
    for(var i=0;i<length;i++){
        allUserHiringTechCount[allTechArray[i].tech] = allTechArray[i].count;
    }

    //All Category
    for(var key in allUserHiringCategoryCountTemp){
        const data = {
            category: key,
            count: allUserHiringCategoryCountTemp[key]
        }
        allCategoryArray.push(data);
    }

    allCategoryArray.sort((a,b)=>{
        return a.count > b.count ? -1 : a.count < b.count ? 1 : 0
    })

    let allUserHiringCategoryCount = [];
    length = allCategoryArray.length < 6 ? allCategoryArray.length : 6
    for(var i=0;i<length;i++){
        console.log(i);
        console.log(allCategoryArray[i]);
        allUserHiringCategoryCount.push([allCategoryArray[i].category,allCategoryArray[i].count]);
    }
    
    let allCount=0,documentCount=0,meetingCount=0,passCount=0,failCount=0;
    let allUserCount=0,allUserDocument=0,allUserMeeting=0,allUserPass=0,allUserFail=0;
    
    userCountArray.map(counter => {
        allCount += counter.dataValues['count'];
        if(counter.status === '서류대기'){
            documentCount += counter.dataValues['count'];
        }else if(counter.status === '면접대기'){
            meetingCount += counter.dataValues['count'];
        }else if(counter.status === '합격'){
            passCount += counter.dataValues['count'];
        }else if(counter.status === '불합격'){
            failCount += counter.dataValues['count'];
        }
    })
    
    allUserCountArray.map(counter => {
        allUserCount += counter.dataValues['count'];
        if(counter.status === '서류대기'){
            allUserDocument += counter.dataValues['count'];
        }else if(counter.status === '면접대기'){
            allUserMeeting += counter.dataValues['count'];
        }else if(counter.status === '합격'){
            allUserPass += counter.dataValues['count'];
        }else if(counter.status === '불합격'){
            allUserFail += counter.dataValues['count'];
        }
    })

    const data = {
        allCount,
        documentCount,
        meetingCount,
        passCount,
        failCount,
        allUserCount,
        allUserDocument,
        allUserMeeting,
        allUserPass,
        allUserFail,
        userHiringTechCount,
        allUserHiringTechCount,
        userHiringCategoryCount,
        allUserHiringCategoryCount
    }
    res.json({
        code: 200,
        data: data});
    }catch(err){
        next(err);
    }
})

module.exports = router;
