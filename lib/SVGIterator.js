"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const svg2vectordrawable_1 = __importDefault(require("svg2vectordrawable"));
const promises_1 = __importDefault(require("fs/promises"));
const FilePath_1 = __importDefault(require("./FilePath"));
const svgo_1 = require("svgo");
class SVGIterator {
    constructor(config) {
        this.vectordrawableOptions = {
            floatPrecision: 3,
            xmlTag: true // 添加 XML 文档声明标签，默认为 false
        };
        this.config = config;
    }
    prepare() {
        return __awaiter(this, void 0, void 0, function* () {
            yield FilePath_1.default.createFolder(this.config.outputs.svg2xml);
            yield FilePath_1.default.createFolder(this.config.outputs.svg2pdf);
            yield FilePath_1.default.createFolder(this.config.outputs.svg2iconfont);
            yield FilePath_1.default.createFolder(this.config.outputs.svg2custom_iconfont);
        });
    }
    add(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const buffer = yield this.compression(yield promises_1.default.readFile(file));
            const basename = FilePath_1.default.basename(file);
            yield this.vectordrawable(basename, buffer, file);
            yield this.pdf(basename, yield this.fixedMissiPtUnits(buffer), file);
        });
    }
    finish() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    pdf(basename, buffer, filepath) {
        return __awaiter(this, void 0, void 0, function* () {
            const filename = FilePath_1.default.filename(basename, 'pdf');
            const path = FilePath_1.default.filePath(this.config.outputs.svg2pdf, filename);
            require('shelljs').exec('inkscape ' + filepath + ' --export-type=pdf --export-filename=' + path);
        });
    }
    vectordrawable(basename, buffer, filepath) {
        return __awaiter(this, void 0, void 0, function* () {
            const xml = yield (0, svg2vectordrawable_1.default)(buffer.toString(), this.vectordrawableOptions);
            const filename = FilePath_1.default.filename(basename, 'xml');
            const path = FilePath_1.default.filePath(this.config.outputs.svg2xml, filename);
            yield promises_1.default.writeFile(path, xml);
        });
    }
    fixedMissiPtUnits(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = (0, svgo_1.optimize)(buffer, {
                path: undefined,
                plugins: [
                    {
                        name: 'SetDefaultWidthHeightUnitToPT',
                        type: 'perItem',
                        fn: (item, params, info) => {
                            if (item.type === 'element' && item.name === 'svg') {
                                if (item.attributes.width != null && Number.isNaN(Number(item.attributes.width)) === false) {
                                    const width = Number(item.attributes.width);
                                    item.attributes.width = `${width}pt`;
                                }
                                if (item.attributes.height != null && Number.isNaN(Number(item.attributes.height)) === false) {
                                    const height = Number(item.attributes.height);
                                    item.attributes.height = `${height}pt`;
                                }
                            }
                        },
                    }
                ],
                js2svg: { pretty: true }
            });
            return Buffer.from(result.data, 'utf8');
        });
    }
    compression(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = (0, svgo_1.optimize)(buffer, {
                path: undefined,
                plugins: [
                    "removeDoctype",
                    "removeXMLProcInst",
                    "removeComments",
                    "removeMetadata",
                    "removeTitle",
                    "removeDesc",
                    "removeUselessDefs",
                    "removeXMLNS",
                    "removeEditorsNSData",
                    "removeEmptyAttrs",
                    "removeHiddenElems",
                    "removeEmptyText",
                    "removeEmptyContainers",
                    "removeUnknownsAndDefaults",
                    "removeNonInheritableGroupAttrs",
                    "removeUselessStrokeAndFill",
                    "removeUnusedNS",
                    "removeScriptElement"
                ],
                js2svg: { pretty: true }
            });
            return Buffer.from(result.data, 'utf8');
        });
    }
}
module.exports = SVGIterator;
//# sourceMappingURL=SVGIterator.js.map