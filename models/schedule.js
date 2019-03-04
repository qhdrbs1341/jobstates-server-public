module.exports = (sequelize, DataTypes) => (
    sequelize.define('schedule',{
        status: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        statusDate: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },{
        timestamps: true,
        charset: 'utf8',
        collate: 'utf8_general_ci'
    })
)
