import PO from 'pofile';
import { ASTNodeTypes, TxtParentNode } from '@textlint/ast-node-types';

interface TxtDocumentData {
    rawData: string;
    startLine: number;
    endLine: number;
    startRange: number;
    endRange: number;
    endColumn: number;
}
export default function parse(text: string): TxtParentNode {
    const tempText = text.replace(/\r\n/g, '\n');
    const lines = tempText.split('\n');

    let linesLength = lines.length,
        linesIndex = linesLength - 1,
        columnVal = lines[linesIndex].length;

    const indexes: number[] = [],
        textDataLength = text.length,
        po = PO.parse(text),
        poItems = po.items;

    let children: TxtParentNode[] = [];
    let itr = 0;

    /**Finding an lines of 'msgstr' from the po data and store it in the indexes array */
    lines.forEach((elem) => {
        if (elem.toString().startsWith('msgstr')) {
            indexes.push(itr);
        }
        itr++;
    });

    itr = 1;
    poItems.forEach((element: { msgstr: string[] } | null) => {
        if (element !== null) {
            var child = getChild(element.msgstr[0], text, indexes[itr], tempText);
            children.push(child);
            itr++;
        }
    });

    return {
        type: ASTNodeTypes.Document,
        raw: text,
        range: [0, textDataLength],
        loc: {
            start: {
                line: 1,
                column: 1,
            },
            end: {
                line: linesLength,
                column: columnVal,
            },
        },
        children: children,
    };
}
function getChild(value: string, rawData: string, indNum: number, tempText: string): TxtParentNode {
    /**
     * Here is the call back function which will return the  rawData and it's start, end lines
     */
    var documentData = getDocumentData(rawData, indNum, tempText);

    return {
        type: ASTNodeTypes.Str,
        raw: documentData.rawData,
        value: value,
        range: [documentData.startRange, documentData.endRange],
        loc: {
            start: {
                line: documentData.startLine,
                column: 1,
            },
            end: {
                line: documentData.endLine,
                column: documentData.endColumn,
            },
        },
        children: [],
    };
}

function getDocumentData(rawData: string, strIndex: number, tempText: string): TxtDocumentData {
    /**
     * Converting CRLF to LF format for common \n splitting usage
     * Because CRLF filesystem has \r\n escape sequence format
     * LF filesytem has \n escape sequence format
     *
     * increamenter variable used increament the splitted value
     * Eg: \r\n - increamenter ->2
     *     \n - increamenter   ->1
     */
    const increamenter = rawData.includes('\r\n') ? 2 : 1;
    /**
     *This method will find the rawData, start and end lines,ranges and endcolumn values
     */
    var line = tempText.split('\n');

    var newString: string = '',
        startLine: number = 0,
        endLine: number = 0,
        startRange: number = 0,
        endRange: number = 0,
        endColumn: number = 0;

    var dataLength = line.length;
    var rawValues: string[] = [];

    startLine = strIndex + 1;

    /**Pushing it to an indexArray for start and end line*/

    for (var itr = 0; itr < dataLength; itr++) {
        if (itr < strIndex) {
            if (line[itr] == '') {
                startRange = startRange + 1;
            } else {
                startRange = startRange + (line[itr].length + increamenter);
            }
        }
        if (line[itr].startsWith('msgstr') && itr == strIndex) {
            startRange = startRange + 1;
            var i = itr;
            while (i) {
                if (line[i] == undefined || line[i].startsWith('#')) {
                    /**
                     * End of the lines array and last msgstr
                     * Loop until the # appear and push it in the rawValues array
                     */
                    break;
                }
                rawValues.push(line[i]);
                i++;
            }
        }
    }

    /**
     * Validating array
     */

    rawValues = popEmptyValues(rawValues);

    for (var i = 0; i < rawValues.length; i++) {
        if (rawValues.length != 1) {
            /** For multi line PO */

            /**
             * This if case omits the '\n' appearance in the end of the string
             * By calculating the end of rawValues array
             */
            if (i != rawValues.length - 1) {
                newString = newString + rawValues[i] + '\n';
            } else {
                newString = newString + rawValues[i];
                endColumn = rawValues[i].length;
            }
        } else {
            /** For single line PO */
            newString = rawValues[i];
            endColumn = rawValues[i].length;
        }
    }
    /**
     * Calculating end index by start index and rawValues array's length
     */
    endLine = startLine + rawValues.length - 1;

    /**
     * End range logic
     * (startrange)                               = > getting start range of the char
     * (newString.length)                         = > Overall length of raw data
     * (rawValues.length - 1)                     = > rawValues is an array of raw data with in the seperate index
     *                                                array value  - 1 is the count of newlines, We don't need to
     * (newString.length + (rawValues.length - 1) = > Because newString.length omit the \n count
     */
    endRange = startRange + (newString.length + (rawValues.length - 1));

    return {
        rawData: newString,
        startLine: startLine,
        endLine: endLine,
        startRange: startRange,
        endRange: endRange,
        endColumn: endColumn,
    };
}
function popEmptyValues(array: string[] = []) {
    /**
     * This will remove the '' and unwated data from the array by reverse order and subtract the value of unwanted strings too
     * because we don't need '',\n in the end of the raw data
     */
    var i = array.length - 1;
    while (i) {
        if ((array[i].startsWith('"') && array[i].endsWith('"')) || array[i].startsWith('msgstr')) {
            break;
        }
        array.pop();
        i--;
    }
    return array;
}
