const DataTypes = require('sequelize')
const db = require("./mysql-db")

module.exports = db.define("weibo_text",{
  id:{
    type:DataTypes.INTEGER(11),
    allowNull:false,
    primaryKey:true,
    autoIncrement:true
  }, 
  uid:{
    type:DataTypes.STRING(50),
    allowNull:false
  },
  mid:{
    type:DataTypes.STRING(50),
    allowNull:false,
    unique: true
  },
  text:{
    type:DataTypes.TEXT,
    allowNull:false
  },
  textLength:{
    type:DataTypes.INTEGER(11),
    allowNull:false
  },
  textMd5:{
    type:DataTypes.STRING(50),
    allowNull:false
  },
  thumbnail_pic:{
    type:DataTypes.STRING(255),
    allowNull:true
  },
  bmiddle_pic:{
    type:DataTypes.STRING(255),
    allowNull:true
  },
  original_pic:{
    type:DataTypes.STRING(255),
    allowNull:true
  }
},{
  freezeTableName:true,
  timestamps:true
});