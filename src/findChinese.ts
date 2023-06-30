import chalk from "chalk";
import {
  checkCodeHasChinese,
  getAllFilesByDir,
  getFileType,
  readFile,
} from "./utils";
const compiler = require("@vue/compiler-sfc");

const findChinese = (options: { ignoreDirsAndFiles: string[] }) => {
  const { ignoreDirsAndFiles = [] } = options;
  const rootDir = process.cwd();
  console.log(chalk.gray(`脚本运行的路径:${rootDir}`));
  const defaultIgnoreDirsAndFiles = [
    "node_modules",
    "webpack.config.js",
    ".nuxt",
    "_nuxt",
  ];

  getAllFilesByDir(
    {
      dirPath: rootDir,
      fileExtension: [".js", ".vue", ".ts", ".tsx", ".jsx"],
      ignoreDirsAndFiles: defaultIgnoreDirsAndFiles.concat(ignoreDirsAndFiles),
    },
    async (filePath: string) => {
      const code = (await readFile(filePath)) as string;
      const fileType = getFileType(filePath);
      if (["ts", "js", "tsx", "jsx"].includes(fileType)) {
        handleTsAndJs(code, filePath);
        return;
      }
      if (["vue"].includes(fileType)) {
        handleVue(code, filePath);
        return;
      }
    }
  );
};

function handleTsAndJs(code: string, fileName: string) {
  checkCodeHasChinese(code, fileName);
}

function handleVue(code: string, fileName: string) {
  const parsed = compiler.parse(code);

  const compileTemplate = compiler.compileTemplate({
    source: parsed.descriptor.template.content,
  });
  checkCodeHasChinese(compileTemplate.code, fileName);
  if (parsed.descriptor && parsed.descriptor.scriptSetup) {
    const content = parsed.descriptor.scriptSetup.content;
    let compileredScript = compiler.compileScript(parsed.descriptor, {
      source: content,
    });
    checkCodeHasChinese(compileredScript.content, fileName);
  }
}

export default findChinese;
