import { EventEmitter } from 'events';
import { statsBar } from './statsBar';

class ExtensionEmitter extends EventEmitter {}

export const extensionEmitter = new ExtensionEmitter();

extensionEmitter.on('translating', (msg: string) => {
  statsBar.update(msg)
});

extensionEmitter.on('translated' , (msg?: string) => {
  statsBar.hide(msg)
})