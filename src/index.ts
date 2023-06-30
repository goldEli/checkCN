#!/usr/bin/env node

import findChinese from "./findChinese";

const chalk = require("chalk");

const { Command } = require("commander"); // add this line
const figlet = require("figlet");
const fs = require("fs");
const path = require("path");
//add the following line
const program = new Command();

console.log(figlet.textSync("IFUN Check Chinese"));

program
  .version("1.0.0")
  .description("Check Chinese Tool")
  .option("-u, --url  [value]", "translate api")
  .option("-i, --ignore  [value]", "ignore folder")
  .option("-h, --help", "output usage information")
  .parse(process.argv);

const options = program.opts();

console.log({ options });
if (options.help) {
  console.log("Usage: Check-chinese [options]");
  console.log();
  console.log("Options:");
  console.log(
    "--i 忽略的文件夹或者文件夹, 默认过滤 node_modules 文件夹 中竖线分隔 'dir|src'"
  );
  console.log();
} else {
  console.log(chalk.green("开始检测包含文件的中文..."));
  const ignoreDirsAndFiles: string[] = options.ignore
    ? options.ignore.split("|")
    : [];

  findChinese({
    ignoreDirsAndFiles,
  });
}
