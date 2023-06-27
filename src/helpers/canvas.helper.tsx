/* eslint-disable */
import React from "react";
import { createRoot } from "react-dom/client";
import ObjPath from 'object-path';

import * as Acorn from "acorn";

import { generate as generateJs } from 'escodegen';
import { transform as babelTransform } from "@babel/standalone";
import { CanvasComponentList } from "../types/component";

// TODO: type this function
function isReactNode(node: any) {
  const type = node.type; //"ExpressionStatement"
  const obj = ObjPath.get(node, "expression.callee.object.name");
  const func = ObjPath.get(node, "expression.callee.property.name");
  return (
    type === "ExpressionStatement" &&
    obj === "React" &&
    func === "createElement"
  );
}

// TODO: type this function
export function findReactNode(ast: any) {
  const { body } = ast;
  return body.find(isReactNode);
}

export function createCanvas(domElement: HTMLElement, components: CanvasComponentList) {
  const root = createRoot(domElement);

  function render(node: JSX.Element) {
    root.render(node);
  }

  function require(moduleName: string) {
    return components[moduleName];
  }

  function getWrapperFunction(code: string) {
    try {
      // 1. transform code
      const tcode = babelTransform(code, { presets: ["es2015", "react"] }).code || '';

      // 2. get AST
      const ast: any = Acorn.parse(tcode, { ecmaVersion: 6 });

      // 3. find React.createElement expression in the body of program
      const rnode = findReactNode(ast);

      console.log({rnode});

      if (rnode) {
        const nodeIndex = ast.body.indexOf(rnode);
        // 4. convert the React.createElement invocation to source and remove the trailing semicolon
        const createElSrc = generateJs(rnode).slice(0, -1);
        // 5. transform React.createElement(...) to render(React.createElement(...)),
        // where render is a callback passed from outside
        const renderCallAst = Acorn.Parser.parse(`render(${createElSrc})`, {ecmaVersion: 6});

        ast.body[nodeIndex] = renderCallAst;
      }

      // 6. create a new wrapper function with all dependency as parameters
      return new Function("React", "render", "require", generateJs(ast));
    } catch (ex: any) {
      // in case of exception render the exception message
      render(<pre style={{ color: "red" }}>{ex.message}</pre>);
    }
  }

  return {
    // returns transpiled code in a wrapper function which can be invoked later
    compile(code: string) {
      return getWrapperFunction(code);
    },

    // compiles and invokes the wrapper function
    run(code: string) {
      const runner = this.compile(code)
      if (runner) {
        try {
          runner(React, render, require);
        }catch(ex: any) {
          render(<pre style={{ color: "red" }}>{ex.message}</pre>);
        }
      }
    },

    getCompiledCode(code: string) {
      return getWrapperFunction(code)?.toString();
    }
  };
}
