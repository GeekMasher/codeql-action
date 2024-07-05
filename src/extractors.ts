
import * as core from "@actions/core";
import * as toolcache from "@actions/tool-cache";
import * as github from "@actions/github";
import { getRequiredInput } from "./actions-util";

// Trusted organizations for CodeQL extractors.
export const TRUSTED_ORGANIZATIONS = [
  "github",
  "codeql",
  "advanced-security",
];

/**
 * Extractors information.
 */
export interface Extractor {
    // Organization name.
    organization: string;
    // Repository name.
    repository: string;
    // Version.
    version?: undefined | string;
    // GitHub Instance (unused for now)
    instance?: undefined | string;
    // Path to the extractor.
    path?: string;
}

/**
 * Parse the input string to extractors and return an array of Extractor.
 * @param extractors
 * @returns Extractor[]
 */
export function parseExtractors(input: string): Extractor[] {
    let result: Extractor[] = [];

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
        let regex =
          /^([a-zA-Z0-9-_]+)\/(codeql-extractor-[a-zA-Z0-9-_]+)(@[a-zA-Z0-9-_\.\/]*)?$/g;
        let parts = regex.exec(input);

        if (parts === null) {
            throw new Error(
              `Invalid extractor format of 'owner/repo[@version]': ${input} :: ${parts}`,
            );
        }
        let extractor: Extractor;

        if (parts.length === 3) {
            extractor = {
              organization: parts[1],
              repository: parts[2],
            };
        } else if (parts.length === 4) {
            let version: string | undefined = parts[3] == undefined ? undefined : parts[3].replace("@", "");
            // If no version is provided, set it to undefined.
            if (version === "") {
              version = undefined;
            }
            extractor = {
              organization: parts[1],
              repository: parts[2],
              version,
            };
        } else {
            throw new Error(
              `Invalid extractor format of "owner/repo[@version]": "${parts}"`,
            );
        }

        // Check if the organization is trusted.
        if (!TRUSTED_ORGANIZATIONS.includes(extractor.organization)) {
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
export async function getExtractors(input?: string | undefined, token?: string | undefined): Promise<Extractor[]> {
  if (input !== undefined && input !== "") {
    let extractors = parseExtractors(input);
    extractors.forEach((extractor) => {
        downloadExtractor(extractor, token || getRequiredInput("token"));
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
export async function downloadExtractor(
  extractor: Extractor,
  token: string,
): Promise<Extractor> {
  const octokit = github.getOctokit(token);

  core.debug(`Downloading and installing extractor...`);

  if (extractor.version === undefined || extractor.version === "latest") {
    var release = await octokit.rest.repos.getLatestRelease({
      owner: extractor.organization,
      repo: extractor.repository,
    });
    core.info(`Using extractor version: '${release.data.tag_name}'`);
  } else {
    var release = await octokit.rest.repos.getReleaseByTag({
      owner: extractor.organization,
      repo: extractor.repository,
      tag: extractor.version,
    });
  }
  // we assume there is only one tar.gz asset
  const assets = release.data.assets.filter((asset) =>
    asset.browser_download_url.endsWith(".tar.gz"),
  );

  if (assets.length !== 1) {
    throw new Error(
      `Expected 1 asset to be found, but found ${assets.length} instead.`,
    );
  }
  var asset = assets[0];
  core.debug(`Downloading extractor from ${asset}`);

  // use the toolcache to download the extractor
  var extractorPath = await toolcache.downloadTool(
    asset.url,
    undefined,  // download to temp directory by default
    `token ${token}`,
    {
      accept: "application/octet-stream",
    },
  );
  core.debug(`Extractor downloaded to ${extractor.path}`);
  core.debug(`Extracting extractor tar...`);

  extractor.path = await toolcache.extractTar(extractorPath, extractor.path);
  core.debug(`Extracted extractor to ${extractor.path}`);

  core.debug(`Successfully installed extractor`);
  return extractor;
}