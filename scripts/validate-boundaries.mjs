#!/usr/bin/env node

import { lstat, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const protectedDirectories = [
  "data/database",
  "data/images",
  "data/imports",
  "cache",
  "notes",
];
const allowedPlaceholder = ".gitkeep";

const violations = [];

async function inspectDirectory(relativeDirectory) {
  const absoluteDirectory = path.join(projectRoot, relativeDirectory);
  let entries;

  try {
    entries = await readdir(absoluteDirectory, { withFileTypes: true });
  } catch (error) {
    violations.push(
      `${relativeDirectory}: required boundary directory is unavailable (${error.code ?? error.message})`,
    );
    return;
  }

  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    const absolutePath = path.join(absoluteDirectory, entry.name);

    if (entry.name === allowedPlaceholder && entry.isFile()) {
      const metadata = await lstat(absolutePath);
      if (metadata.size !== 0) {
        violations.push(`${relativePath}: .gitkeep must remain empty`);
      }
      continue;
    }

    if (entry.isDirectory()) {
      await inspectDirectory(relativePath);
      continue;
    }

    const kind = entry.isSymbolicLink() ? "symbolic link" : "file";
    violations.push(`${relativePath}: unexpected ${kind} in fixture-only storage boundary`);
  }
}

for (const directory of protectedDirectories) {
  await inspectDirectory(directory);
}

if (violations.length > 0) {
  console.error("Boundary validation failed. MVP 0.1 must remain fixture-only:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Boundary validation passed: ${protectedDirectories.length} protected directories contain only empty .gitkeep placeholders.`,
  );
}
