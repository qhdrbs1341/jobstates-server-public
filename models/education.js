module.exports = (sequelize, DataTypes) => (
    sequelize.define('education',{
        term: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        organization: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },{
        timestamps: true,
        charset: 'utf8',
        collate: 'utf8_general_ci'
    })
)
