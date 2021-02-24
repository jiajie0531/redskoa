const DataTypes = require('sequelize')
const db = require("./mysql-db")

module.exports = db.define("hupu_text",{
  id:{
    type:DataTypes.INTEGER(11),
    allowNull:false,
    primaryKey:true,
    autoIncrement:true
  }, 
  title:{
    type:DataTypes.TEXT,
    allowNull:false
  },
  titleMd5:{
    type:DataTypes.STRING(50),
    allowNull:false 
  },
  titleLength:{
    type:DataTypes.INTEGER(11),
    allowNull:false
  },
  href:{
    type:DataTypes.STRING(255),
    allowNull:false
  },
  hrefUrl:{
    type:DataTypes.STRING(255),
    allowNull:false
  }, 
  uname:{
    type:DataTypes.STRING(128),
    allowNull:false
  },
  detail:{
    type:DataTypes.TEXT,
    allowNull:true
  },
  isDetailed:{
    type:DataTypes.INTEGER(11),
    allowNull:false,
    defaultValue: 0
  },
  isSynced:{
    type:DataTypes.INTEGER(11),
    allowNull:false,
    defaultValue: 0
  } 
},{
  freezeTableName:true,
  timestamps:true,
  indexes: [{unique: true, fields: ['titleMd5']}]
});