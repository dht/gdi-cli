"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceTextByMap = exports.replaceText = void 0;
const replaceText = (text, regexString, replaceWith, context) => {
    const regex = new RegExp('(' + regexString + ')', 'g');
    return text.replace(regex, () => {
        return replaceWith(context);
    });
};
exports.replaceText = replaceText;
const replaceTextByMap = (text, replaceMap, context) => {
    let output = text;
    Object.keys(replaceMap).forEach((regexString) => {
        output = (0, exports.replaceText)(output, regexString, replaceMap[regexString], context);
    });
    return output;
};
exports.replaceTextByMap = replaceTextByMap;
