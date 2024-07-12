import { EventEmitter } from 'events';
import { statsBar } from './statsBar';

class ExtensionEmitter extends EventEmitter {}

export const extensionEmitter = new ExtensionEmitter();

extensionEmitter.on('statsBarShow', (msg: string) => {
  statsBar.update(msg)
});

extensionEmitter.on('statsBarHide' , (msg?: string) => {
  statsBar.hide(msg)
})