module.exports = (sequelize, DataTypes) => (
    sequelize.define('hireTech',{
        title: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },{
        timestamps: true,
        charset: 'utf8',
        collate: 'utf8_general_ci'
    })
)
