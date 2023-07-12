import { CodeLens, Range } from "vscode";

export default class TipCodeLens extends CodeLens {
  constructor(
    range: Range,
    value: string
  ) {
    super(range, {
        command: '',
        title: `${value}`
    });
  }
}



