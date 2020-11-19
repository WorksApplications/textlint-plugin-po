import { TxtParentNode } from '@textlint/ast-node-types';
import parse from './parse';

export default class PoProcessor {
    availableExtensions() {
        return ['.po'];
    }

    processor(extension: string) {
        return {
            preProcess(text: string, filePath?: string): TxtParentNode {
                return parse(text);
            },
            postProcess(messages: any[], filePath?: string) {
                return {
                    messages,
                    filePath: filePath ? filePath : '<text>',
                };
            },
        };
    }
}
