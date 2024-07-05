import test from "ava";
import { setupTests } from "./testing-utils";

import * as extractors from "./extractors";

setupTests(test);

test(`Parse Extractor inputs`, (t) => {
  let github_ext = extractors.parseExtractors("github/codeql-extractor-misc");
  
  t.is(github_ext.length, 1);
  t.is(github_ext[0].organization, "github");
  t.is(github_ext[0].repository, "codeql-extractor-misc");
  t.is(github_ext[0].version, undefined);

  let advsec_ext = extractors.parseExtractors(
    "advanced-security/codeql-extractor-iac",
  );

  t.is(advsec_ext.length, 1);
  t.is(advsec_ext[0].organization, "advanced-security");
  t.is(advsec_ext[0].repository, "codeql-extractor-iac");
  t.is(advsec_ext[0].version, undefined);
});

test(`Parse Extractor inputs with version`, (t) => {
  let github_ext = extractors.parseExtractors(
    "github/codeql-extractor-misc@v1.0.0",
  );

  t.is(github_ext.length, 1);
  t.is(github_ext[0].organization, "github");
  t.is(github_ext[0].repository, "codeql-extractor-misc");
  t.is(github_ext[0].version, "v1.0.0");

  // Missing version (should be undefined)
  let ext = extractors.parseExtractors("github/codeql-extractor-misc@");
  t.is(ext.length, 1);
  t.is(ext[0].version, undefined);
});

test(`Parse empty extractor inputs`, (t) => {
  let exts = extractors.parseExtractors("");
  t.is(exts.length, 0);

  exts = extractors.parseExtractors(",");
  t.is(exts.length, 0);
});

test("Parse multiple Extractor inputs", (t) => {
  let exts = extractors.parseExtractors(
    "github/codeql-extractor-misc,advanced-security/codeql-extractor-iac",
  );

  t.is(exts.length, 2);
  t.is(exts[0].organization, "github");
  t.is(exts[0].repository, "codeql-extractor-misc");
  t.is(exts[1].organization, "advanced-security");
  t.is(exts[1].repository, "codeql-extractor-iac");
});

test(`Parse Extractor inputs with multiple versions`, (t) => {
  let exts = extractors.parseExtractors(
    "github/codeql-extractor-misc@v1.0.0,advanced-security/codeql-extractor-iac@v2.0.0",
  );

  t.is(exts.length, 2);
  t.is(exts[0].organization, "github");
  t.is(exts[0].repository, "codeql-extractor-misc");
  t.is(exts[0].version, "v1.0.0");
  t.is(exts[1].organization, "advanced-security");
  t.is(exts[1].repository, "codeql-extractor-iac");
  t.is(exts[1].version, "v2.0.0");
});

test("Parsing spec with various issues", (t) => {
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

test("Version with tag like path", (t) => {
  let ext = extractors.parseExtractors(
    "github/codeql-extractor-misc@this/version",
  );
  t.is(ext.length, 1);
  t.is(ext[0].organization, "github");
  t.is(ext[0].repository, "codeql-extractor-misc");
  t.is(ext[0].version, "this/version"); // This is a valid release version name
});

test(`Parse arbitrary organisation`, (t) => {
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

test(`Parse arbitrary repository`, (t) => {
  t.throws(() => {
    extractors.parseExtractors("github/codeql");
  });
  t.throws(() => {
    extractors.parseExtractors("github/codeql-extractor");
  });
});
