module.exports = (sequelize, DataTypes) => (
    sequelize.define('company',{
        brand: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        logo: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        companyUrl: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        intro: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        provider: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        status: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        logoKey: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },{
        timestamps: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
)
