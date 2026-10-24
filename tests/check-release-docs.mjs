import fs from "node:fs";
import path from "node:path";

// The release matrix must fail closed when either canonical document is missing.
// A version number alone is insufficient: the named visitor-facing feature must
// match the changelog heading before a Pages release can pass validation.
function readRegularFile(root, name, failures) {
  const file = path.join(root, name);
  try {
    if (!fs.statSync(file).isFile()) {
      failures.push(name + " must be a regular file");
      return null;
    }
    return fs.readFileSync(file, "utf8");
  } catch {
    failures.push(name + " must exist and be readable");
    return null;
  }
}

export function checkVersionDocumentation(root, version, feature) {
  const failures = [];
  const readme = readRegularFile(root, "README.md", failures);
  const changelog = readRegularFile(root, "CHANGELOG.md", failures);

  if (readme !== null && !readme.includes("Current development version: v" + version)) {
    failures.push("README current development version must be v" + version);
  }
  if (changelog !== null && !changelog.startsWith("## v" + version + " — " + feature + "\n")) {
    failures.push("CHANGELOG must begin with v" + version + " — " + feature);
  }
  return failures;
}
