exports.spyPropertyWrites = function (callback) {
  return {
    set: (target, prop, value) => {
      return Reflect.set(target, prop, callback(target, `set("${prop.toString()}")`, value))
    },
    apply: (target, thisArg, args) => {
      const { thisArg: newThisArg, args: newArgs } = callback(target, 'arguments(apply())', { thisArg, args })
      return Reflect.apply(target, newThisArg, newArgs)
    },
    construct: (target, args) => {
      const newArgs = callback(target, 'arguments(constructor())', args )
      return Reflect.construct(target, newArgs)
    }
  }
}
