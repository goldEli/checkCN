const chalk = require("chalk");
const ora = require("ora");
const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const resultFiles = require("./resultFiles");

const log = {
  warn: (msg: string) => {
    console.log("%s", chalk.yellow(msg));
  },
  error: (msg: string) => {
    console.log("%s", chalk.red(msg));
  },
  suc: (msg: string) => {
    console.log("%s", chalk.green(msg));
  },
  normal: (msg: string) => {
    console.log("%s", chalk.gray(msg));
  },
};

export const createLoading = (msg: string) => {
  const spinner = ora(msg).start();
  return spinner;
};

/**
 * 文件遍历方法
 * @param dirPath 需要遍历的文件路径
 */
export async function getAllFilesByDir(
  options: {
    ignoreDirsAndFiles: string[];
    dirPath: string;
    fileExtension: string[];
  },
  callback: any
) {
  const { dirPath, fileExtension, ignoreDirsAndFiles } = options;
  fs.readdirSync(dirPath).forEach((fileName: string) => {
    const filePath = path.join(dirPath, fileName);
    fs.stat(filePath, function (error: any, stats: any) {
      if (error) {
        console.error(error);
        return;
      }
      const isFile = stats.isFile();
      const isDir = stats.isDirectory();
      if (
        isFile &&
        !ignoreDirsAndFiles.some((item) => filePath.includes(item))
      ) {
        if (fileExtension.some((item) => filePath.endsWith(item))) {
          callback(filePath);
        }
      }
      if (isDir && !ignoreDirsAndFiles.includes(fileName)) {
        getAllFilesByDir(
          {
            dirPath: filePath,
            fileExtension,
            ignoreDirsAndFiles,
          },
          callback
        );
      }
    });
  });
}

export async function checkCodeHasChinese(code: string, fileName: string) {
  // log.normal(`正在检测：${fileName}`);
  // console.log(code);
  // console.log(code);
  try {
    const ast = codeToAst(code);
    // console.log(ast);
    await handleAst(ast);
    log.suc(`👉️ 文件包含中文：${fileName}`);
    resultFiles.addFile(fileName);
  } catch (error) {
    log.normal(`👉️ ${fileName} 文件报错，可能包含无法识别的语法，建议忽略`);
    console.error(error);
  }
}

export function readFile(path: string) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err: any, data: string) => {
      if (err) {
        console.error(err);
        return;
      }
      resolve(data);
    });
  });
}

/**
 * 遍历语法树，将中文替换成变量
 * @param {*} ast
 */
function handleAst(ast: any) {
  return new Promise((resolve, reject) => {
    // 遍历语法树
    traverse(ast, {
      StringLiteral({ node }: any) {
        if (node && isChinese(node.value)) {
          // log.normal(node.value)
          resolve(true);
        }
      },
      TemplateElement({ node }: any) {
        if (
          node &&
          node.value &&
          node.value.cooked &&
          isChinese(node.value.cooked)
        ) {
          // console.log(node);
          // const ast = codeToAst(node.value.cooked);
          // // 过滤 jsx 中出现的注释
          // if (ast.comments.length > 0) {
          //   return;
          // }
          // log.normal(node.value.cooked)
          resolve(true);
        }
      },
      JSXText({ node }: any) {
        if (node && isChinese(node.value)) {
          // log.normal(node.value)
          resolve(true);
        }
      },
    });
  });
}

export function getFileType(fileName: string) {
  if (fileName.endsWith(".ts")) {
    return "ts";
  }
  if (fileName.endsWith(".vue")) {
    return "vue";
  }
  if (fileName.endsWith(".js")) {
    return "js";
  }
  if (fileName.endsWith(".tsx")) {
    return "tsx";
  }
  console.log(chalk.red(`${fileName},文件类型不支持`));
  return "unknown";
}

function isChinese(str: string) {
  var filter = /[\u4E00-\u9FA5\uF900-\uFA2D]{1,}/;
  if (filter.test(str)) {
    return true;
  } else {
    return false;
  }
}

/**
 * 代码字符串转成语法树
 * @param {*} code
 */
function codeToAst(code: string) {
  const ast = parser.parse(code, {
    sourceType: "module", // 识别ES Module
    // sourceType: "script",
    // other babel config
    presets: [],
    plugins: [
      //   "vue",
      // ref: https://github.com/babel/babel/issues/14871
      ["typescript"],
      // "jsx", // enable jsx
      // "classProperties",
      // "dynamicconst",
      // "optionalChaining",
      // "decorators-legacy",
      // "asyncDoExpressions ",
      // "asyncGenerators",

      "jsx", // enable jsx
      "classProperties",
      "dynamicconst",
      "optionalChaining",
      "decorators-legacy",
    ],
  });
  return ast;
}
