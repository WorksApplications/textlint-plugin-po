import parse from '../src/parse';
import { readFileSync } from 'fs';
import { join } from 'path';
import { test } from '@textlint/ast-tester';
import singlelineJson from './singleline.json';
import multilineJson from './multiline.json';
import { describe, expect, it } from "@jest/globals"

describe('#parse', () => {
    describe('when parsing .po file with single line msgstr', () => {
        const po = readFileSync(join('test', 'singleline.po'), 'utf-8');
        it('should return an expected AST', () => {
            const result = parse(po);
            test(result);
            expect(result).toEqual(singlelineJson);
        });
    });

    describe('when parsing .po file with multiple lines msgstr', () => {
        const po = readFileSync(join('test', 'multiline.po'), 'utf-8');

        it('should return an expected AST', () => {
            const result = parse(po);
            test(result);
            expect(result).toEqual(multilineJson);
        });
    });
});
