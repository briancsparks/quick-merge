
/**
 *
 */
const sg                      = require('sgsg');
const _                       = sg._;

const ARGV                    = sg.ARGV();
const argvGet                 = sg.argvGet;
const argvExtract             = sg.argvExtract;
const setOnn                  = sg.setOnn;
const deref                   = sg.deref;

var lib = {};

var merge, mergeObjects;

var merges = {};

mergeObjects = function(a, b) {
  var   [aKeys, len, keys]    = keyMirrorFromObject(a);
  var   [bKeys]               = keyMirrorFromObject(b);
  var   result                = {};

  for (var i = 0; i < len; ++i) {
    const key = keys[i];
    if (!bKeys[key]) {
      result[key] = a[key];
    } else {
      result[key] = merge(a[key], b[key]);
      delete bKeys[key];
    }
  }

  // keys in b, but not in a
  keys  = Object.keys(bKeys);
  len   = keys.length;
  for (var i = 0; i < len; ++i) {
    const key = keys[i];
    result[key] = b[key];
  }

  return result;
};

const mergeObjectAndNonObject = function(a, b) {
  // b clobbers
  return b;
};

merges.object = {};
merges.object.object = mergeObjects;

merges.object.function = function(a, b) {
  return merge(a, b());
};

merges.function = {};
merges.function.object = function(a, b) {
  return merge(a(), b);
};

merges.function.function = function(a, b) {
  return merge(a(), b());
};

var   misMerges = {};   // mis-match merges

misMerges.object = function(a, b) {
  return mergeObjectAndNonObject(a, b);
};

misMerges.function = function(a, b) {
  return merge(a(), b);
};

merge = function(a, b) {
  if (b === null || b === void 0) {
    return a;
  }

  const tA      = typeof a;
  const tB      = typeof b;
  const mergeA  = merges[tA] || {};

  if (typeof mergeA === 'object' && !!mergeA) {
    const mergeAB = mergeA[tB];

    if (typeof mergeAB === 'function') {
      return mergeAB(a,b);
    }

    const misMerge = misMerges[tA];
    if (typeof misMerge === 'function') {
      return misMerge(a, b);
    }

    if (tA === 'function') {
      return merge(a(), b);
    }

    if (tB === 'function') {
      return merge(a, b());
    }
    return mergeObjectAndNonObject(a, b);
  }

  return b;
};

//...
lib.quickMerge = lib.qm = function(a, b) {
  return mergeObjects(a, b);
//  var   [aKeys, len, keys]    = keyMirrorFromObject(a);
//  var   [bKeys]               = keyMirrorFromObject(b);
//  var   result                = {};
//console.log({aKeys, bKeys, len});
//
//  for (var i = 0; i < len; ++i) {
//    const key = keys[i];
//    result[key] = {...a[key], ...(b[key] || {})};
//console.log({key, result, a, b});
//  }
//  return result;
};




_.each(lib, (value, key) => {
  exports[key] = value;
});

function keyMirrorFromObject(obj) {
  var   result = {};
  const keys    = Object.keys(obj);
  const l       = keys.length;

  for (var i = 0; i < l; ++i) {
    const key = keys[i];
    result[key] = key;
  }

  return [result, l, keys];
}

