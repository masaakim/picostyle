var _id = 0
var sheet = document.head.appendChild(document.createElement("style")).sheet
var serialize = JSON.stringify.bind(null)

function hyphenate(str) {
  return str.replace(/[A-Z]/g, "-$&").toLowerCase()
}

function insert(rule) {
  sheet.insertRule(rule, 0)
}

function createRule(className, decls, media) {
  var newDecls = []
  for (var property in decls) {
    typeof decls[property] !== "object" &&
      newDecls.push(hyphenate(property) + ":" + decls[property] + ";")
  }
  var rule = "." + className + "{" + newDecls.join("") + "}"
  return media ? media + "{" + rule + "}" : rule
}

function concat(str1, str2) {
  return str1 + (/^\w/.test(str2) ? " " : "") + str2
}

function parse(decls, child, media, className) {
  child = child || ""
  className = className || "p" + (_id++).toString(36)

  for (var property in decls) {
    var value = decls[property]
    if (typeof value === "object") {
      var nextMedia = /^@/.test(property) ? property : null
      var nextChild = nextMedia ? child : concat(child, property)
      parse(value, nextChild, nextMedia, className)
    }
  }

  insert(createRule(concat(className, child), decls, media))
  return className
}

export default function(h) {
  return function(type) {
    var cache = {}
    return function(decls) {
      var isDeclsFunction = typeof decls === "function"

      return function(props, children) {
        props = props || {}
        var key = serialize(props)
        cache[key] ||
          (cache[key] =
            (isDeclsFunction && parse(decls(props))) || parse(decls))
        var node = h(type, props, children)
        node.props.class = [props.class, cache[key], node.props.class].filter(Boolean).join(" ")
        return node
      }
    }
  }
}
