module.exports = (sequelize, DataTypes) => (
    sequelize.define('category',{
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
