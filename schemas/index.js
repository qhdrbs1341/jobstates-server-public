const mongoose = require('mongoose');

module.exports = () => {
    const connect = () => {
        if(process.env.NODE_ENV !== 'production'){
            mongoose.set('debug',true);
        }
        mongoose.connect(process.env.MONGO_HOST,{
            dbName: 'jobstates'
        }, (error)=>{
            if(error){
                console.log('몽고디비 연결 에러',err);
            }else{
                console.log('몽고디비 연결 성공');
            }
        })
    }
    connect();
    mongoose.connection.on('error',(error)=>{
        console.error('몽고디비 연결 에러',error);
    })
    mongoose.connection.on('disconnected',()=>{
        console.error('몽고디비 연결 재시도');
        connect();
    });
    require('./user');
    require('./tech');
}
