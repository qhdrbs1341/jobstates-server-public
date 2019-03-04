module.exports = (sequelize, DataTypes) => (
    sequelize.define('hire',{
        title: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        importantInfo: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        detailInfo: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        hireImage: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        experience: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        salary: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        deadLine: {
            type: DataTypes.DATE,
            allowNull: true
        },
        provider: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        hireUrl: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        hireImageKey: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },{
        timestamps: true,
        charset: 'utf8',
        collate: 'utf8_general_ci'
    })
)
