/**
 * Module with useful operations.
 */

 var os = require('os');

 

/**
 * Verifies if two arrays have the exact same elements. It does not considers their order.
 * @param {Array} a 
 * @param {Array} b 
 * @returns {Boolean} True if the arrays have the same elements and false otherwise
 */
function sameElements (a, b) {
    return a.length === b.length && a.every(e => b.includes(e)) && b.every(e => a.includes(e))
  }

/**
 * Removes all ocurrences of an element from an array.
 * @param {*} elem The element to be removed.
 * @param {Array} arr The array to remove the element.
 */
function removeElem (elem,arr) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === elem) {
        arr.splice(i, 1);
    }
  }
}


function obtainPath(parts) {
  var finalPath = __dirname;
  for (let part of parts) {
    if (os.type() == 'Windows_NT') {
      finalPath += '\\' + part;
    } else {
      finalPath += '/' + part;
    }
  }
  return finalPath;
}


module.exports.sameElements = sameElements
module.exports.removeElem = removeElem
module.exports.obtainPath = obtainPath
