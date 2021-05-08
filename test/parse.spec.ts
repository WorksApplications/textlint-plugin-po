import parse from '../src/parse';
import { expect } from 'chai';
import 'mocha';
import { readFileSync } from 'fs';
import { join } from 'path';
import { test } from '@textlint/ast-tester';
import singlelineJson from './singleline.json';

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
            expect(result).to.eql({
                type: 'Document',
                raw: po,
                range: [0, 743],
                loc: {
                    start: {
                        line: 1,
                        column: 1,
                    },
                    end: {
                        line: 32,
                        column: 6,
                    },
                },
                children: [
                    {
                        type: 'Str',
                        raw: 'msgstr ""\n"複数行にまたがる"\n"事例"',
                        value: '複数行にまたがる事例',
                        range: [605, 632],
                        loc: {
                            start: {
                                line: 22,
                                column: 1,
                            },
                            end: {
                                line: 24,
                                column: 4,
                            },
                        },
                        children: [],
                    },
                    {
                        type: 'Str',
                        raw: `msgstr \"\"\n\"複数行にまたがる\"\n\"他の事例"`,
                        value: '複数行にまたがる他の事例',
                        range: [713, 742],
                        loc: {
                            start: {
                                line: 30,
                                column: 1,
                            },
                            end: {
                                line: 32,
                                column: 6,
                            },
                        },
                        children: [],
                    },
                ],
            });
        });
    });
});
