exports.spyPropertyWrites = function (callback) {
  return {
    set: (target, prop, value) => {
      callback(target, `set("${prop.toString()}")`, value, v => Reflect.set(target, prop, v))
    },
    apply: (target, thisArg, args) => {
      let newThisArg = undefined
      callback(target, 'thisArgument(apply)', thisArg, n => { newThisArg = n })

      const newArgs = args.map(_ => undefined)
      args.forEach((a, i) => callback(target, `argument${i+1}(apply)`, a, v => { newArgs[i] = v }))
      return Reflect.apply(target, newThisArg, newArgs)
    },
    construct: (target, args) => {
      const newArgs = args.map(_ => undefined)
      args.forEach((a, i) => callback(target, `argument${i+1}(constructor)`, a, v => { newArgs[i] = v }))
      return Reflect.construct(target, newArgs)
    }
  }
}
