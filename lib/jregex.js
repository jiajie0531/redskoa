var basicNum = 0;
var add = function (a, b) {
  return a + b;
};

var urlify = function urlify(text) {
  var expression = /(https?:\/\/[^\s]+)/g;
  var regex = new RegExp(expression);
  let array1 = regex.exec(text);
  if (array1 == null) {
    return ""
  } else{
    return array1[0]
  }
};

module.exports = { 
  get basicNum(){
    return basicNum;
  }, 
  add: add, 
  urlify: urlify 
};