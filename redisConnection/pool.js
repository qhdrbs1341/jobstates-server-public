require('dotenv').config();

exports.redisPool = async () => {
    const redisPool = await require('redis-connection-pool')('jobstatesPool',{
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        max_clients: 30,
        perform_check: false,
        database: 0,
        options:{
            auth_pass: process.env.REDIS_PASSWORD
        }
    })
    return redisPool
}
