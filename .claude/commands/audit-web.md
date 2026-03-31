Your goal is to audit and update vulnerable dependencies in this project.

## Steps

1. **Run the audit** to identify vulnerabilities:
   ```bash
   bun audit
   ```
   If `bun audit` is unavailable, fall back to:
   ```bash
   bunx better-npm-audit audit
   ```

2. **Review the results.** For each vulnerability found, note:
   - Package name and version
   - Severity (critical, high, moderate, low)
   - CVE identifier if available
   - Whether a fix is available

3. **Prioritize fixes** — address critical and high severity issues first.

4. **Update vulnerable packages.** For each affected package, try:
   ```bash
   bun update <package-name>
   ```
   If the fix requires a major version bump, read the package's changelog or release notes before updating, and check for breaking changes that may affect this codebase.

5. **Verify the build still works** after updates:
   ```bash
   bun check
   bun build
   ```

6. **Run the tests** to confirm nothing is broken:
   ```bash
   bun test
   ```

7. **Report findings.** Summarize:
   - Vulnerabilities found (count and severity breakdown)
   - Packages updated and their old → new versions
   - Any vulnerabilities that could NOT be fixed (e.g., no patch available, or breaking change too risky) and why
   - Any packages skipped due to major breaking changes — flag these for the user to review manually

## Notes
- This project uses **Bun** as the package manager — do not use npm or yarn commands.
- Do not blindly upgrade to a major version without checking for breaking changes.
- If a transitive (indirect) dependency is vulnerable and has no direct fix, note it clearly in the report.
