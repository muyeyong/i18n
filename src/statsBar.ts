import {StatusBarAlignment, StatusBarItem, window, ExtensionContext } from 'vscode';

 class StatsBar {
    private statusBar !: StatusBarItem ;

    init(context: ExtensionContext) {
      this.statusBar  = window.createStatusBarItem(StatusBarAlignment.Right, 100);
      context.subscriptions.push(this.statusBar)
    }

    public update(msg: string) {
        this.statusBar.text = msg
        this.statusBar.show()
    }

    public hide (msg?: string) {
      const delayTime = msg ? 3000 : 0
      if (msg) {
        this.statusBar.text  = msg
        this.statusBar.show()
      } 
      setTimeout(() => {
        this.statusBar.hide()
      }, delayTime)
    }

   dispose() {
      this.statusBar.dispose();
	}
}

export const statsBar = new StatsBar();