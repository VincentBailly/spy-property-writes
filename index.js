exports.spyPropertyWrites = function (callback) {
  return {
    set: (target, prop, value) => {
      return callback(target, `set("${prop.toString()}")`, value, (v) => Reflect.set(target, prop, v))
    }
  }
}
