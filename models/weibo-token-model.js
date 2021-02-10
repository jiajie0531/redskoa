const DataTypes = require('sequelize')
const db = require("./mysql-db")

module.exports = db.define("weibo_token",{
  id:{
    type:DataTypes.INTEGER(11),
    allowNull:false,
    primaryKey:true,
    autoIncrement:true
  },
  access_token:{
    type:DataTypes.STRING(50),
    allowNull:false
  },
  remind_in:{
    type:DataTypes.STRING(50),
    allowNull:false
  },
  expires_in:{
    type:DataTypes.INTEGER(20),
    allowNull:false
  },
  uid:{
    type:DataTypes.STRING(50),
    allowNull:false
  },
  isRealName:{
    type:DataTypes.STRING(50),
    allowNull:false
  }
},{
  freezeTableName:true,
  timestamps:true
});