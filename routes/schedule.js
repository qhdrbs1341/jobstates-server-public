const express = require('express');
const router = express.Router();
const {Company,Hire,Schedule,HireTech,Category,HireComment} = require('../models/index');
const Op = require('sequelize').Op;
const {scheduleRead} = require('./middlewares');
const {scheduleSaver} = require('../redisSaver/schedule-saver');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

//유저의 스케쥴 정보 모두 검색
router.get('/',scheduleRead,async (req,res,next)=>{
    try{
        const dataArray= await scheduleSaver(req.user.id);
        res.json({
            code:200,
            data:dataArray});
    }catch(err){
        next(err);
    }
})

//기업 명 검색 시 기업정보, 채용정보 출력
router.get('/search',async(req,res,next)=>{
    try{
        const company = await Company.findAll({where: {brand: {[Op.like] : '%'+req.query.brand+'%' },provider: 'rocketpunch'},
            include:[{model: Category},{model:Hire, include:{model:HireTech}}]});
        let result = [];
        const dataArray = company.map(company => {
            for(var index in company.hires){
            const data = {
                companyId: company.id,
                brand: company.brand,
                logo: company.logo,
                logoKey: company.logoKey,
                companyUrl: company.companyUrl,
                intro: company.intro,
                provider: company.provider,
                category: company.categories.map(category => { return category.title }),
                hireId: company.hires[index].id,
                title: company.hires[index].title,
                importantInfo: company.hires[index].importantInfo,
                detailInfo: company.hires[index].detailInfo,
                hireImage: company.hires[index].hireImage,
                hireImageKey: company.hires[index].hireImageKey,
                address: company.hires[index].address,
                experience: company.hires[index].experience,
                salary: company.hires[index].salary,
                deadLine: company.hires[index].deadLine,
                hireUrl: company.hires[index].hireUrl,
                status: company.hires[index].status,
                hireTech: company.hires[index].hireTeches.map(hireTech => hireTech.title),
                
            }
            result.push(data);
            }
        })
        res.json({
            code:200,
            data:result});
    }catch(err){
        next(err);
    }
})

//스케쥴 추가
router.post('/write',async(req,res,next)=>{
    try{
        //사용자 커스텀 기업
        //const user = await User.find({where: {id: req.headers.id}}) // 나중에 req.user.id로 (사용자 아이디)
        console.log(req.body);
        if(req.body.provider!=='rocketpunch'){
            const company = await Company.create({
                brand: req.body.brand,
                logo: req.body.logo,
                logoKey: req.body.logoKey,
                companyUrl: req.body.companyUrl,
                intro: req.body.intro,
                provider: 'user'
            })

            //사용자 - 기업 관계 추가
            // await user.addCompanies(company.id)

            //
            //커스텀 채용 정보 생성 및 기업-채용 관계 추가
            const hire = await Hire.create({
                title: req.body.title,
                importantInfo: req.body.importantInfo,
                detailInfo: req.body.detailInfo,
                hireImage: req.body.hireImage,
                hireImageKey: req.body.hireImageKey,
                address: req.body.address,
                experience: req.body.experience,
                salary: req.body.salary,
                deadLine: req.body.deadLine,
                hireUrl: req.body.hireUrl,
                companyId: company.id,
                provider: 'user'
            })
            
            //커스텀 카테고리 생성
            const result = await Promise.all(
                req.body.category.map(category => (
                    Category.findOrCreate({
                        where: {title: category}
                    })
                ))
            )
            
            //커스텀 카테고리-기업 관계 추가
            await company.addCategories(result.map(r=>r[0]));

            //스케쥴 생성-유저 관계 설정
            const schedule = await Schedule.create({
                status: req.body.status,
                statusDate: req.body.statusDate,
                userId: req.user.id,
                hireId: hire.id
            })

            //채용 메모 생성-스케줄 관계 설정
            const hireComment = await HireComment.create({
                advantage: req.body.advantage,
                disAdvantage: req.body.disAdvantage,
                strategy: req.body.strategy,
                scheduleId: schedule.id
            })
            
            //채용 요구 기술 생성
            const hireTech = await Promise.all(
                req.body.hireTech.map(tech => (
                    HireTech.findOrCreate({
                        where: {title: tech}
                    })
                ))
            )
            
            //채용 요구 기술-채용 관계 설정
            await hire.addHireTeches(hireTech.map(r=>r[0]));
            const dataArray = await scheduleSaver(req.user.id);
            res.json({
                code:200,
                data:dataArray[dataArray.length-1]});
            //res.json(dataArray[dataArray.length-1]);
        }else{ //로켓 펀치 기업 정보일 때
            const hire = await Hire.find({where: {id: req.body.hireId}});
            //스케쥴 생성-채용,유저 관계 설정
            const schedule = await Schedule.create({
                status: req.body.status,
                statusDate: req.body.statusDate,
                hireId: req.body.hireId,
                userId: req.user.id
            })
            //채용 코멘트 생성-스케쥴 관계 설정
            await HireComment.create({
                advantage: req.body.advantage,
                disAdvantage: req.body.disAdvantage,
                startegy: req.body.strategy,
                scheduleId: schedule.id
            })

            // await user.addCompanies(req.body.companyId);
            const dataArray = await scheduleSaver(req.user.id);
            res.json({
                code:200,
                data:dataArray[dataArray.length-1]});
        }
    }catch(err){
        next(err)
    }
})

router.patch('/company',async (req,res,next)=>{
    try{
    await Company.addHook('beforeUpdate','company',(company,err)=>{
        console.log("이미지를 업데이트 합니다.")
        const oldCompany = company._previousDataValues;
        const newCompany = company.dataValues;
        if(oldCompany.logoKey != null && oldCompany.logoKey !== newCompany.logoKey){
            const params = {
              Bucket: 'jobstates',
              Key: oldCompany.logoKey
              }
          s3.deleteObject(params, function (err, data) {
            if (err) console.log(err, err.stack)
            else console.log(data)
          })
    }
    })

    await Company.update({
        brand: req.body.brand,
        logo: req.body.logo,
        logoKey: req.body.logoKey,
        companyUrl: req.body.companyUrl,
        intro: req.body.intro
    },{where: {id: req.body.companyId, provider: 'user'},individualHooks: true, plain: true})
    
    const result = await Promise.all(
        req.body.category.map(category => (
            Category.findOrCreate({
                where: {title: category}
            })
        ))
    )
    const updatedCompany = await Company.findOne({where: {id: req.body.companyId, provider: 'user'},attributes: ['id',['id','companyId'],'brand','logo','companyUrl','intro','provider','status','logoKey']})
    await Company.removeHook('beforeUpdate','company');
    
    await updatedCompany.setCategories(result.map(r=> r[0]));
    const dataArray = await scheduleSaver(req.user.id);
    res.json({
        code:200,
        data:updatedCompany});
        }catch(err){
            next(err)
        }
})

//

router.patch('/hire',async (req,res,next)=>{
    try{
    await Hire.addHook('beforeUpdate','schedule',(hire,err)=>{
        console.log("이미지를 업데이트 합니다.")
        const oldHire = hire._previousDataValues;
        const newHire = hire.dataValues;
        if(oldHire.hireImageKey != null && oldHire.hireImageKey !== newHire.hireImageKey){
            const params = {
              Bucket: 'jobstates',
              Key: oldHire.hireImageKey
              }
          s3.deleteObject(params, function (err, data) {
            if (err) console.log(err, err.stack)
            else console.log(data)
          })
    }
    })
    await Hire.update({
        title: req.body.title,
        importantInfo: req.body.importantInfo,
        detailInfo: req.body.detailInfo,
        hireImage: req.body.hireImage,
        hireImageKey: req.body.hireImageKey,
        address: req.body.address,
        experience: req.body.experience,
        salary: req.body.salary,
        deadLine: req.body.deadLine,
        hireUrl: req.body.hireUrl
    },{where: {id: req.body.hireId, provider: 'user'},individualHooks: true, plain: true})


    const result = await Promise.all(
        req.body.hireTech.map(tech => (
            HireTech.findOrCreate({
                where: {title: tech}
            })
        ))
    )
    const updatedHire = await Hire.findOne({where: {id: req.body.hireId}, provider: 'user', attributes: ['id',['id','hireId'],'title','importantInfo','detailInfo','hireImage','address','experience','salary','deadLine','provider','hireUrl','status','hireImageKey']});
    await Hire.removeHook('beforeUpdate','hire');
    await updatedHire.setHireTeches(result.map(r=> r[0]));
    const dataArray = await scheduleSaver(req.user.id);
    
    res.json({
        code:200,
        data:updatedHire});
        }catch(err){
            next(err)
        }
})

router.patch('/write',async(req,res,next)=>{
    try{
    await Schedule.update({
        status: req.body.status,
        statusDate: req.body.statusDate
    },{where: {id: req.body.scheduleId}});
    
    const dataArray = await scheduleSaver(req.user.id);
    const updatedSchedule = await Schedule.findOne({where: {id: req.body.scheduleId}, attributes: ['id',['id','scheduleId'],'status','statusDate']});
    res.json({
        code:200,
        data:updatedSchedule});
    }catch(err){
        next(err)
    }
})

router.patch('/comment',async(req,res,next)=>{
    try{
    await HireComment.update({
        advantage: req.body.advantage,
        disAdvantage: req.body.disAdvantage,
        strategy: req.body.strategy
    },{where: {id: req.body.commentId}});
    
    const dataArray = await scheduleSaver(req.user.id);
    const updatedHireComment = await HireComment.findOne({where: {id: req.body.commentId}, attributes: ['id',['id','commentId'],'advantage','disAdvantage','strategy']});
    // console.log("업데이트 된 코멘트");
    // console.log(updatedHireComment);
    res.json({
        code:200,
        data:updatedHireComment});
}catch(err){
    next(err);
}
})

router.delete('/',async (req,res,next)=>{
    try{
    if(req.body.provider === 'user'){
        await Company.addHook('beforeDestroy','company',(company,err)=>{
            console.log("이미지를 삭제합니다.")
            const oldCompany = company._previousDataValues;
            if(oldCompany.logoKey != null){
                const params = {
                    Bucket: 'jobstates',
                    Key: oldCompany.logoKey
                    }
                s3.deleteObject(params, function (err, data) {
                  if (err) console.log(err, err.stack)
                  else console.log(data)
                })
            }
        })
        await Hire.addHook('beforeDestroy','hire',(hire,err)=>{
            console.log("이미지를 삭제합니다.")
                const oldHire = hire._previousDataValues;
                if(oldHire.hireImageKey != null){
                    const params = {
                        Bucket: 'jobstates',
                        Key: oldHire.hireImageKey
                        }
                    s3.deleteObject(params, function (err, data) {
                      if (err) console.log(err, err.stack)
                      else console.log(data)
                    })
                }
        })

        await Company.destroy({
            where: {id: req.body.companyId,},individualHooks: true, plain: true
        })
        await Hire.destroy({
            where: {id: req.body.hireId},individualHooks: true, plain: true
        })
        await Schedule.destroy({
            where: {id: req.body.scheduleId}
        })
        await HireComment.destroy({
            where: {id: req.body.commentId}
        })

    }else{
        await Schedule.destroy({where: {id: req.body.scheduleId}});
        await HireComment.destroy({where: {id: req.body.commentId}});
        //await User.removeCompanies(req.body.companyId);
    }
    await Company.removeHook('beforeDestroy','company');
    await Hire.removeHook('beforeDestroy','hire');
    const dataArray = await scheduleSaver(req.user.id);
    res.json({
        code:200,
        data:dataArray});
    }catch(err){
        next(err);
    }
})


module.exports = router;
