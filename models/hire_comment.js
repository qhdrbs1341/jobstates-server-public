module.exports = (sequelize, DataTypes) => (
    sequelize.define('hireComment',{
        advantage: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        disAdvantage: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        strategy: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },{
        timestamps: true,
        charset: 'utf8',
        collate: 'utf8_general_ci'
    })
)
