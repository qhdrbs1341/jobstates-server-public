module.exports = (sequelize, DataTypes) => (
    sequelize.define('news',{
        title: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        url: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        provider: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },{
        timestamps: true,
        charset: 'utf8',
        collate: 'utf8_general_ci'
    })
)
