const getIsHookCall = path => {
  const name = path.node.callee.name || path.node.callee.property.name;

  if (/seDebugValue\d+/.test(name)) return;

  const isHookCall = /^use[A-Z]/.test(name);

  if (!path.parent.id) return;

  let stateName = (
    path.parent.id && path.parent.id.elements && path.parent.id.elements[0] && path.parent.id.elements[0].name
  ) || ( path.parent.id && path.parent.id.name)

  if (isHookCall) return { name, stateName };
};

module.exports = function(babel) {
  const {types: t} = babel;

  let i = 0;

  return {
    name: "ast-transform", // not required
    visitor: {
      CallExpression(path) {
        const {name, stateName} = getIsHookCall(path) || {}

        if (name) {
          const newNode = {
            ...path.node,
            arguments: [t.spreadElement(t.identifier('args'))]
          }

          const id = t.identifier("useDebugValue" + i++);

          path.scope.path.parentPath.scope.block.body.unshift(
              t.variableDeclaration(
                  'const', [
                    t.variableDeclarator(
                        id,
                        t.arrowFunctionExpression([
                          t.restElement(t.identifier('args'))
                        ], t.blockStatement([
                          t.expressionStatement(t.callExpression( t.memberExpression(
                              t.identifier('React'), t.identifier('useDebugValue')
                          ), [
                            t.stringLiteral(stateName)
                          ])),
                          t.returnStatement(newNode)
                        ]))
                    )
                  ])
          );

          path.replaceWith(t.callExpression(id, path.node.arguments));
        }
      }
    }
  };
};
