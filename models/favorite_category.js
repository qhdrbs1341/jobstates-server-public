module.exports = (sequelize, DataTypes) => (
    sequelize.define('favoriteCategory',{
        title: {
            type: DataTypes.TEXT,
            allowNull: true
        },
    },{
        timestamps: true,
        charset: 'utf8',
        collate: 'utf8_general_ci'
    })
)
