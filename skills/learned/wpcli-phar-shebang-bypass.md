# WP-CLI PHP Binary Bypass for Phar Installs

**Extracted:** 2026-02-19
**Context:** SSH-based WP-CLI automation on managed hosting (xCloud, LiteSpeed, etc.)

## Problem

`WP_CLI_PHP=/path/to/php wp --path=...` is completely ignored when `/usr/local/bin/wp`
is a raw PHP phar file with `#!/usr/bin/env php` shebang. The shebang resolves to
the system PHP (often missing mysqli on managed hosts), ignoring `WP_CLI_PHP` entirely.

Symptoms:
- WP-CLI returns "Your PHP installation appears to be missing the MySQL extension"
- The error persists even after setting `WP_CLI_PHP` to a PHP binary that has mysqli
- `WP_CLI_PHP_ARGS` also does not help for phar-based installs

## Diagnosis

Check if `wp` is a phar (not a bash script):

```bash
head -1 $(which wp)
# If this shows: #!/usr/bin/env php
# → it's a phar. WP_CLI_PHP will be ignored.
# If this shows: #!/bin/bash or #!/usr/bin/env bash
# → it's a launcher script. WP_CLI_PHP works fine.
```

## Solution

Call the PHP binary DIRECTLY with the wp phar, bypassing the shebang:

```bash
# CORRECT — bypasses shebang
$PHP $(which wp) --path=/var/www/site --allow-root

# BROKEN — ignored when wp is a phar
WP_CLI_PHP=$PHP wp --path=/var/www/site --allow-root
```

## Node.js SSH Implementation

```typescript
const phpPaths = [
  "/usr/local/lsws/lsphp84/bin/php",
  "/usr/local/lsws/lsphp83/bin/php",
  "/usr/local/lsws/lsphp82/bin/php",
  "/usr/local/lsws/lsphp81/bin/php",
  "/usr/bin/php8.4",
  "/usr/bin/php8.3",
  "/usr/bin/php8.2",
  "/usr/bin/php8.1",
  "/usr/bin/php7.4",
].join(" ");

const wpBin = "$(which wp 2>/dev/null || echo /usr/local/bin/wp)";
const command =
  `PHP=$(for b in ${phpPaths}; do ` +
  `[ -x "$b" ] && "$b" -m 2>/dev/null | grep -q mysqli && echo "$b" && break; ` +
  `done); ` +
  `PHP=\${PHP:-$(which php 2>/dev/null || echo php)}; ` +
  `$PHP ${wpBin} --path=${wpPath} ${wpCliArgs} --allow-root 2>&1`;
```

## xCloud/LiteSpeed Notes

- lsphp binaries at `/usr/local/lsws/lsphpXX/bin/php` have mysqli loaded via their own litespeed php.ini
- Their ini lives at `/usr/local/lsws/lsphpXX/etc/php/X.X/litespeed/php.ini`
- Extension scan dir is `mods-available/` (not `/etc/php/*/cli/conf.d/`)
- `php --ini` on the lsphp binary reveals this non-standard path
- Check with: `lsphp83 -m 2>/dev/null | grep -i mysql` — should show `mysqli`, `mysqlnd`, `pdo_mysql`
- The `php -m | grep -c mysqli` count returning `0` can be a bash quoting artifact — use `grep -q` instead

## When to Use

- SSH into managed hosting server to run WP-CLI commands
- WP-CLI returns "missing MySQL extension" despite the server running WordPress fine via web
- Check `head -1 $(which wp)` — if it shows `#!/usr/bin/env php`, apply this fix
- Applies to: xCloud, Kinsta, GridPane, RunCloud, and any host where `wp` is installed as a phar
