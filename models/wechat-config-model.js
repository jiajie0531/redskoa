const DataTypes = require('sequelize')
const db = require("./mysql-db")

module.exports = db.define("wechat_config",{
  id:{
    type:DataTypes.INTEGER(11),
    allowNull:false,
    primaryKey:true,
    autoIncrement:true
  },
  appId:{
    type:DataTypes.STRING(50),
    allowNull:false
  },
  mail:{
    type:DataTypes.STRING(50),
    allowNull:false
  },
  originalId:{
    type:DataTypes.STRING(50),
    allowNull:false
  },
  name:{
    type:DataTypes.STRING(50),
    allowNull:false
  },
  isEnabled:{
    type:DataTypes.INTEGER(11),
    allowNull:false
  }
},{
  freezeTableName:true,
  timestamps:true
});