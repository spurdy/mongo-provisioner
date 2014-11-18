'use strict';

var characters = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890';
var numbers = '0123456789';

function number(digits, min){
  var n = passwd(digits, numbers);
  var i = parseInt(n,10);
  if(i <= min)
    i = min + i;
  return i.toString();
}

function passwd(length, chars){
  chars = chars || characters;
  var index = (Math.random() * (chars.length - 1)).toFixed(0);
  return length > 0 ? chars[index] + passwd(length - 1, chars) : '';
}

exports.passwd = passwd;
exports.number = number;