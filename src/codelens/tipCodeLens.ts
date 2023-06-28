import { CodeLens, Range } from "vscode";

export default class TipCodeLens extends CodeLens {
  constructor(
    fileName: string,
    range: Range,
    alias: string,
    value: string
  ) {
    super(range, {
      arguments: [alias, value, fileName, range],
      command: "cb-plugin.codelensAction",
      title: `${value} can be replaced by ${alias},click to replace`
    });
  }
}



