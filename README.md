NanosTS CLI
=================

official NanosTypescript CLI

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g nanosts
$ nanosts COMMAND
running command...
$ nanosts (--version)
nanosts/1.0.2 win32-x64 node-v16.15.0
$ nanosts --help [COMMAND]
USAGE
  $ nanosts COMMAND
...
```
<!-- usagestop -->
```sh-session
$ npm install -g nanosts
$ nanosts COMMAND
running command...
$ nanosts (--version)
nanosts/1.0.2 win32-x64 node-v16.15.0
$ nanosts --help [COMMAND]
USAGE
  $ nanosts COMMAND
...
```
<!-- usagestop -->

# Commands
<!-- commands -->
* [`nanosts generate`](#nanosts-generate)
* [`nanosts help [COMMAND]`](#nanosts-help-command)
* [`nanosts project NAME`](#nanosts-project-name)

## `nanosts generate`

Generates Nanos TypeScript declarations from the Docs JSON API

```
USAGE
  $ nanosts generate -o <value> [-b] [-s]

FLAGS
  -b, --bleeding        Use the bleeding edge version instead of the stable version
  -o, --output=<value>  (required) Output directory for the generated files
  -s, --skip            Whether to skip existing files or not

DESCRIPTION
  Generates Nanos TypeScript declarations from the Docs JSON API
```

_See code: [dist/commands/generate.ts](https://github.com/NanosWorldTS/nanos-typescript-cli/blob/v1.0.2/dist/commands/generate.ts)_

## `nanosts help [COMMAND]`

Display help for nanosts.

```
USAGE
  $ nanosts help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for nanosts.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.12/src/commands/help.ts)_

## `nanosts project NAME`

Creates a new Nanos TypeScript project

```
USAGE
  $ nanosts project [NAME] [-a <value>] [-v <value>] [-t <value>] [-s <value>]

ARGUMENTS
  NAME  Name of the project

FLAGS
  -a, --author=<value>         Author of the project
  -s, --scriptFolders=<value>  Script folders of the project
  -t, --type=<value>           Type of the project
  -v, --version=<value>        [default: 1.0.0] Version of the project

DESCRIPTION
  Creates a new Nanos TypeScript project
```

_See code: [dist/commands/project.ts](https://github.com/NanosWorldTS/nanos-typescript-cli/blob/v1.0.2/dist/commands/project.ts)_
<!-- commandsstop -->
* [`nanosts generate`](#nanosts-generate)
* [`nanosts help [COMMAND]`](#nanosts-help-command)
* [`nanosts project NAME`](#nanosts-project-name)

## `nanosts generate`

Generates Nanos TypeScript declarations from the Docs JSON API

```
USAGE
  $ nanosts generate -o <value> [-b] [-s]

FLAGS
  -b, --bleeding        Use the bleeding edge version instead of the stable version
  -o, --output=<value>  (required) Output directory for the generated files
  -s, --skip            Whether to skip existing files or not

DESCRIPTION
  Generates Nanos TypeScript declarations from the Docs JSON API
```

_See code: [dist/commands/generate.ts](https://github.com/NanosWorldTS/nanos-typescript-cli/blob/v1.0.2/dist/commands/generate.ts)_

## `nanosts help [COMMAND]`

Display help for nanosts.

```
USAGE
  $ nanosts help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for nanosts.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.12/src/commands/help.ts)_

## `nanosts project NAME`

Creates a new Nanos TypeScript project

```
USAGE
  $ nanosts project [NAME] [-a <value>] [-v <value>] [-t <value>] [-s <value>]

ARGUMENTS
  NAME  Name of the project

FLAGS
  -a, --author=<value>         Author of the project
  -s, --scriptFolders=<value>  Script folders of the project
  -t, --type=<value>           Type of the project
  -v, --version=<value>        [default: 1.0.0] Version of the project

DESCRIPTION
  Creates a new Nanos TypeScript project
```

_See code: [dist/commands/project.ts](https://github.com/NanosWorldTS/nanos-typescript-cli/blob/v1.0.2/dist/commands/project.ts)_
<!-- commandsstop -->
* [`nanosts generate`](#nanosts-generate)
* [`nanosts help [COMMAND]`](#nanosts-help-command)
* [`nanosts project NAME`](#nanosts-project-name)

## `nanosts generate`

Generates Nanos TypeScript declarations from the Docs JSON API

```
USAGE
  $ nanosts generate -o <value> [-b] [-s]

FLAGS
  -b, --bleeding        Use the bleeding edge version instead of the stable version
  -o, --output=<value>  (required) Output directory for the generated files
  -s, --skip            Whether to skip existing files or not

DESCRIPTION
  Generates Nanos TypeScript declarations from the Docs JSON API
```

_See code: [dist/commands/generate.ts](https://github.com/NanosWorldTS/nanos-typescript-cli/blob/v1.0.1/dist/commands/generate.ts)_

## `nanosts help [COMMAND]`

Display help for nanosts.

```
USAGE
  $ nanosts help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for nanosts.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.12/src/commands/help.ts)_

## `nanosts project NAME`

Creates a new Nanos TypeScript project

```
USAGE
  $ nanosts project [NAME] [-a <value>] [-v <value>] [-t <value>] [-s <value>]

ARGUMENTS
  NAME  Name of the project

FLAGS
  -a, --author=<value>         Author of the project
  -s, --scriptFolders=<value>  Script folders of the project
  -t, --type=<value>           Type of the project
  -v, --version=<value>        [default: 1.0.0] Version of the project

DESCRIPTION
  Creates a new Nanos TypeScript project
```

_See code: [dist/commands/project.ts](https://github.com/NanosWorldTS/nanos-typescript-cli/blob/v1.0.1/dist/commands/project.ts)_
<!-- commandsstop -->
* [`nanosts generate`](#nanosts-generate)
* [`nanosts help [COMMAND]`](#nanosts-help-command)
* [`nanosts project NAME`](#nanosts-project-name)

## `nanosts generate`

Generates Nanos TypeScript declarations from the Docs JSON API

```
USAGE
  $ nanosts generate -o <value> [-b] [-s]

FLAGS
  -b, --bleeding        Use the bleeding edge version instead of the stable version
  -o, --output=<value>  (required) Output directory for the generated files
  -s, --skip            Whether to skip existing files or not

DESCRIPTION
  Generates Nanos TypeScript declarations from the Docs JSON API
```

_See code: [dist/commands/generate.ts](https://github.com/NanosWorldTS/nanos-typescript-cli/blob/v1.0.0/dist/commands/generate.ts)_

## `nanosts help [COMMAND]`

Display help for nanosts.

```
USAGE
  $ nanosts help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for nanosts.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.12/src/commands/help.ts)_

## `nanosts project NAME`

Creates a new Nanos TypeScript project

```
USAGE
  $ nanosts project [NAME] [-a <value>] [-v <value>] [-t <value>] [-s <value>]

ARGUMENTS
  NAME  Name of the project

FLAGS
  -a, --author=<value>         Author of the project
  -s, --scriptFolders=<value>  Script folders of the project
  -t, --type=<value>           Type of the project
  -v, --version=<value>        [default: 1.0.0] Version of the project

DESCRIPTION
  Creates a new Nanos TypeScript project
```

_See code: [dist/commands/project.ts](https://github.com/NanosWorldTS/nanos-typescript-cli/blob/v1.0.0/dist/commands/project.ts)_
