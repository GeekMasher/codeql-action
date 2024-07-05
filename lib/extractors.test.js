"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const testing_utils_1 = require("./testing-utils");
const extractors = __importStar(require("./extractors"));
(0, testing_utils_1.setupTests)(ava_1.default);
(0, ava_1.default)(`Parse Extractor inputs`, (t) => {
    let github_ext = extractors.parseExtractors("github/codeql-extractor-misc");
    t.is(github_ext.length, 1);
    t.is(github_ext[0].organization, "github");
    t.is(github_ext[0].repository, "codeql-extractor-misc");
    t.is(github_ext[0].version, undefined);
    let advsec_ext = extractors.parseExtractors("advanced-security/codeql-extractor-iac");
    t.is(advsec_ext.length, 1);
    t.is(advsec_ext[0].organization, "advanced-security");
    t.is(advsec_ext[0].repository, "codeql-extractor-iac");
    t.is(advsec_ext[0].version, undefined);
});
(0, ava_1.default)(`Parse Extractor inputs with version`, (t) => {
    let github_ext = extractors.parseExtractors("github/codeql-extractor-misc@v1.0.0");
    t.is(github_ext.length, 1);
    t.is(github_ext[0].organization, "github");
    t.is(github_ext[0].repository, "codeql-extractor-misc");
    t.is(github_ext[0].version, "v1.0.0");
    // Missing version (should be undefined)
    let ext = extractors.parseExtractors("github/codeql-extractor-misc@");
    t.is(ext.length, 1);
    t.is(ext[0].version, undefined);
});
(0, ava_1.default)(`Parse empty extractor inputs`, (t) => {
    let exts = extractors.parseExtractors("");
    t.is(exts.length, 0);
    exts = extractors.parseExtractors(",");
    t.is(exts.length, 0);
});
(0, ava_1.default)("Parse multiple Extractor inputs", (t) => {
    let exts = extractors.parseExtractors("github/codeql-extractor-misc,advanced-security/codeql-extractor-iac");
    t.is(exts.length, 2);
    t.is(exts[0].organization, "github");
    t.is(exts[0].repository, "codeql-extractor-misc");
    t.is(exts[1].organization, "advanced-security");
    t.is(exts[1].repository, "codeql-extractor-iac");
});
(0, ava_1.default)(`Parse Extractor inputs with multiple versions`, (t) => {
    let exts = extractors.parseExtractors("github/codeql-extractor-misc@v1.0.0,advanced-security/codeql-extractor-iac@v2.0.0");
    t.is(exts.length, 2);
    t.is(exts[0].organization, "github");
    t.is(exts[0].repository, "codeql-extractor-misc");
    t.is(exts[0].version, "v1.0.0");
    t.is(exts[1].organization, "advanced-security");
    t.is(exts[1].repository, "codeql-extractor-iac");
    t.is(exts[1].version, "v2.0.0");
});
(0, ava_1.default)("Parsing spec with various issues", (t) => {
    const throwable_inputs = [
        // Missing repository
        "github/",
        // Missing organisation
        "/codeql-extractor-misc",
        // Too many slashes
        "github/codeql-extractor-misc/this-is-a-version",
        // Spaces
        "github / codeql-extractor-misc@1",
        "github/codeql-extractor-misc     @1",
        "github / codeql-extractor-misc     @1",
        "   github / codeql-extractor-misc     @1",
        "github/codeql-extractor-misc@      1",
        // Version tag with special characters
        "github/codeql-extractor-misc@v1.0.0!",
    ];
    throwable_inputs.forEach((input) => {
        t.throws(() => {
            extractors.parseExtractors(input);
        });
    });
});
(0, ava_1.default)("Version with tag like path", (t) => {
    let ext = extractors.parseExtractors("github/codeql-extractor-misc@this/version");
    t.is(ext.length, 1);
    t.is(ext[0].organization, "github");
    t.is(ext[0].repository, "codeql-extractor-misc");
    t.is(ext[0].version, "this/version"); // This is a valid release version name
});
(0, ava_1.default)(`Parse arbitrary organisation`, (t) => {
    // Expect to throw an exception
    t.throws(() => {
        extractors.parseExtractors("unknown-org/codeql-extractor-misc");
    });
    t.throws(() => {
        extractors.parseExtractors("github-rand/codeql-extractor-misc");
    });
    t.throws(() => {
        extractors.parseExtractors("advanced_security/codeql-extractor-misc");
    });
});
(0, ava_1.default)(`Parse arbitrary repository`, (t) => {
    t.throws(() => {
        extractors.parseExtractors("github/codeql");
    });
    t.throws(() => {
        extractors.parseExtractors("github/codeql-extractor");
    });
});
//# sourceMappingURL=extractors.test.js.map