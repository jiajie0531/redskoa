const DataTypes = require('sequelize')
const db = require("./mysql-db")

module.exports = db.define("weibo_sdk",{
  id:{
    type:DataTypes.INTEGER(11),
    allowNull:false,
    primaryKey:true,
    autoIncrement:true
  },
  code:{
    type:DataTypes.STRING(50),
    allowNull:false
  },
  appkey:{
    type:DataTypes.STRING(50),
    allowNull:false
  },
  token:{
    type:DataTypes.STRING(50),
    allowNull:false
  }
},{
  freezeTableName:true,
  timestamps:true
});