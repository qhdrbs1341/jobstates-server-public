const path = require('path');
const Sequelize = require('sequelize');
require('dotenv').config();
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname , '/../config/config'))[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  null,
  null,
  {
    dialect: 'mysql',
    port: process.env.RDS_PORT,
    replication: {
      read: [
        {host: process.env.RDS_SLAVE_HOST,username: process.env.RDS_USERNAME,password:process.env.RDS_PASSWORD}
      ],
      write: {host: process.env.RDS_MASTER_HOST,username:process.env.RDS_USERNAME,password:process.env.RDS_PASSWORD}
    },
    pool:{
      max: 20,
      idle: 3000
    },
    logging: false
  },
)

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require('./user')(sequelize, Sequelize);
db.Category = require('./category')(sequelize,Sequelize);
db.Company = require('./company')(sequelize,Sequelize);
db.Education = require('./education')(sequelize,Sequelize);
db.Experience = require('./experience')(sequelize,Sequelize);
db.FavoriteCategory = require('./favorite_category')(sequelize,Sequelize);
db.FavoriteTech = require('./favorite_tech')(sequelize,Sequelize);
db.HaveTech = require('./have_tech')(sequelize,Sequelize);
db.HireComment = require('./hire_comment')(sequelize,Sequelize);
db.HireTech = require('./hire_tech')(sequelize,Sequelize);
db.Hire = require('./hire')(sequelize,Sequelize);
db.News = require('./news')(sequelize,Sequelize);
db.Project = require('./project')(sequelize,Sequelize);
db.Schedule = require('./schedule')(sequelize,Sequelize);


db.User.hasMany(db.Education);
db.Education.belongsTo(db.User);

db.User.hasMany(db.Project);
db.Project.belongsTo(db.User);

db.User.hasMany(db.Experience);
db.Experience.belongsTo(db.User);

// db.User.belongsToMany(db.Company, {through: 'UserCompany'});
// db.Company.belongsToMany(db.User, {through: 'UserCompany'});

db.User.belongsToMany(db.FavoriteCategory, {through: 'UserFavoriteCategory'});
db.FavoriteCategory.belongsToMany(db.User, {through: 'UserFavoriteCategory'});

db.User.belongsToMany(db.FavoriteTech, {through: 'UserFavoriteTech'});
db.FavoriteTech.belongsToMany(db.User, {through: 'UserFavoriteTech'});

db.FavoriteTech.hasMany(db.News);
db.News.belongsTo(db.FavoriteTech);

db.User.belongsToMany(db.HaveTech, {through: 'UserHaveTech'});
db.HaveTech.belongsToMany(db.User, {through: 'UserHaveTech'});

db.User.hasMany(db.Schedule);
db.Schedule.belongsTo(db.User);

db.Hire.hasMany(db.Schedule);
db.Schedule.belongsTo(db.Hire);

db.Schedule.hasOne(db.HireComment);
db.HireComment.belongsTo(db.Schedule);

//추가된 관계

// db.Company.hasMany(db.Schedule);
// db.Schedule.belongsTo(db.Company);

// db.Schedule.belongsToMany(db.HireTech, {through: 'ScheduleHireTech'});
// db.HireTech.belongsToMany(db.Schedule, {through: 'ScheduleHireTech'});

// db.Schedule.belongsToMany(db.Category, {through: 'ScheduleCategory'});
// db.Category.belongsToMany(db.Schedule, {through: 'ScheduleCategory'});

//

db.Company.belongsToMany(db.Category, {through: 'CompanyCategory'});
db.Category.belongsToMany(db.Company, {through: 'CompanyCategory'});

//추가된 관계
// db.Company.hasMany(db.Schedule);
// db.Schedule.belongsTo(db.Company);

db.Company.hasMany(db.Hire);
db.Hire.belongsTo(db.Company);

db.Hire.belongsToMany(db.HireTech,{through: 'HireHireTech'});
db.HireTech.belongsToMany(db.Hire,{through: 'HireHireTech'});

module.exports = db
