import parse from '../src/parse';
import { expect } from 'chai';
import 'mocha';
import { readFileSync } from 'fs';
import { join } from 'path';
import { test } from '@textlint/ast-tester';
import singlelineJson from './singleline.json';
import multilineJson from './multiline.json';

describe('#parse', () => {
    describe('when parsing .po file with single line msgstr', () => {
        const po = readFileSync(join('test', 'singleline.po'), 'utf-8');
        it('should return an expected AST', () => {
            const result = parse(po);
            test(result);
            expect(result).to.eql(singlelineJson);
        });
    });

    describe('when parsing .po file with multiple lines msgstr', () => {
        const po = readFileSync(join('test', 'multiline.po'), 'utf-8');

        it('should return an expected AST', () => {
            const result = parse(po);
            test(result);
            expect(result).to.eql(multilineJson);
        });
    });
});
