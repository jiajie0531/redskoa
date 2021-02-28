const DataTypes = require('sequelize')
const db = require("./mysql-db")

module.exports = db.define("baidu_text",{
  id:{
    type:DataTypes.INTEGER(11),
    allowNull:false,
    primaryKey:true,
    autoIncrement:true
  }, 
  link:{
    type:DataTypes.STRING(255),
    allowNull:true
  },
  source:{
    type:DataTypes.STRING(50),
    allowNull:true
  }, 
  channelId:{
    type:DataTypes.STRING(128),
    allowNull:true
  },
  img:{
    type:DataTypes.STRING(255),
    allowNull:true
  },
  havePic:{
    type:DataTypes.BOOLEAN,
    allowNull:false,
    defaultValue: false
  },
  channelName:{
    type:DataTypes.STRING(128),
    allowNull:true 
  }, 
  title:{
    type:DataTypes.TEXT,
    allowNull:false
  },
  titleMd5:{
    type:DataTypes.STRING(50),
    allowNull:false 
  },
  pubDate:{
    type:DataTypes.STRING(50),
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