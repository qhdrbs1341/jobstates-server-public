const AWS = require('aws-sdk');
const s3 = new AWS.S3();
module.exports = (sequelize,DataTypes) => (
    sequelize.define('user',{
        snsId:{
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        email:{
            type: DataTypes.STRING(50),
            allowNull: true,
            validate: {
                isEmail: true
            }
        },
        nick:{
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        profile:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        blog:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        github:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        phone:{
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        provider:{
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        photo:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        newUser:{
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        photoKey:{
            type: DataTypes.TEXT,
            allowNull: true
        },
        userKey:{
            type: DataTypes.TEXT,
            allowNull: true
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        subscription: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },{
        timestamps: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
        hooks : {
            beforeDestroy: (user,err) => {
                console.log("이미지를 삭제합니다.")
                const oldUser = user._previousDataValues;
                if(oldUser.photoKey != null){
                    const params = {
                        Bucket: 'jobstates',
                        Key: oldUser.photoKey
                        }
                    s3.deleteObject(params, function (err, data) {
                      if (err) console.log(err, err.stack)
                      else console.log(data)
                    })
                }
            }
        }
    })
)
