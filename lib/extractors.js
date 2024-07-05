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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRUSTED_ORGANIZATIONS = void 0;
exports.parseExtractors = parseExtractors;
exports.getExtractors = getExtractors;
exports.downloadExtractor = downloadExtractor;
const core = __importStar(require("@actions/core"));
const toolcache = __importStar(require("@actions/tool-cache"));
const github = __importStar(require("@actions/github"));
const actions_util_1 = require("./actions-util");
// Trusted organizations for CodeQL extractors.
exports.TRUSTED_ORGANIZATIONS = [
    "github",
    "codeql",
    "advanced-security",
];
/**
 * Parse the input string to extractors and return an array of Extractor.
 * @param extractors
 * @returns Extractor[]
 */
function parseExtractors(input) {
    let result = [];
    if (input === undefined || input === "") {
        return result;
    }
    // Split the input string by comma.
    input.trim().split(",").forEach((extractor_input) => {
        let input = extractor_input.trim();
        if (input === "") {
            return;
        }
        // Global
        let regex = /^([a-zA-Z0-9-_]+)\/(codeql-extractor-[a-zA-Z0-9-_]+)(@[a-zA-Z0-9-_\.\/]*)?$/g;
        let parts = regex.exec(input);
        if (parts === null) {
            throw new Error(`Invalid extractor format of 'owner/repo[@version]': ${input} :: ${parts}`);
        }
        let extractor;
        if (parts.length === 3) {
            extractor = {
                organization: parts[1],
                repository: parts[2],
            };
        }
        else if (parts.length === 4) {
            let version = parts[3] == undefined ? undefined : parts[3].replace("@", "");
            // If no version is provided, set it to undefined.
            if (version === "") {
                version = undefined;
            }
            extractor = {
                organization: parts[1],
                repository: parts[2],
                version,
            };
        }
        else {
            throw new Error(`Invalid extractor format of "owner/repo[@version]": "${parts}"`);
        }
        // Check if the organization is trusted.
        if (!exports.TRUSTED_ORGANIZATIONS.includes(extractor.organization)) {
            throw new Error(`Organization "${extractor.organization}" is not trusted`);
        }
        result.push(extractor);
    });
    return result;
}
/**
 * Parse, download, and install all provided extractors.
 * @param input comma separated list of extractors
 * @param token authentication token for github
 * @returns
 */
async function getExtractors(input, token) {
    if (input !== undefined && input !== "") {
        let extractors = parseExtractors(input);
        extractors.forEach((extractor) => {
            downloadExtractor(extractor, token || (0, actions_util_1.getRequiredInput)("token"));
        });
        return extractors;
    }
    return [];
}
/**
 * Download CodeQL Extractor for the given extractor.
 * @param extractor
 * @param token
 * @returns
 */
async function downloadExtractor(extractor, token) {
    const octokit = github.getOctokit(token);
    core.debug(`Downloading and installing extractor...`);
    if (extractor.version === undefined || extractor.version === "latest") {
        var release = await octokit.rest.repos.getLatestRelease({
            owner: extractor.organization,
            repo: extractor.repository,
        });
        core.info(`Using extractor version: '${release.data.tag_name}'`);
    }
    else {
        var release = await octokit.rest.repos.getReleaseByTag({
            owner: extractor.organization,
            repo: extractor.repository,
            tag: extractor.version,
        });
    }
    // we assume there is only one tar.gz asset
    const assets = release.data.assets.filter((asset) => asset.browser_download_url.endsWith(".tar.gz"));
    if (assets.length !== 1) {
        throw new Error(`Expected 1 asset to be found, but found ${assets.length} instead.`);
    }
    var asset = assets[0];
    core.debug(`Downloading extractor from ${asset}`);
    // use the toolcache to download the extractor
    var extractorPath = await toolcache.downloadTool(asset.url, undefined, // download to temp directory by default
    `token ${token}`, {
        accept: "application/octet-stream",
    });
    core.debug(`Extractor downloaded to ${extractor.path}`);
    core.debug(`Extracting extractor tar...`);
    extractor.path = await toolcache.extractTar(extractorPath, extractor.path);
    core.debug(`Extracted extractor to ${extractor.path}`);
    core.debug(`Successfully installed extractor`);
    return extractor;
}
//# sourceMappingURL=extractors.js.map