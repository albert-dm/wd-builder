# wd-builder

This is a tool for building React Blocks, grouping existing components in a tree. Do all that through UI.

Developers can use is as a tool for speeding up development process. Designers can use it to create a library of components for developers.

## How to use

Install it as a dependency:

```shell
npm install @webdrops/wd-builder
```

## Run local example

```shell
npm run dev
```

## How to develop

1. Clone this repo
2. Run `npm install`
3. Run `npm run build`

Build files will be in `dist` folder.

You can link it to your project by running `npm link` on root folder and `npm link @webdrops/wd-builder` in your project's folder.

You can run `npm run build:watch` to watch for changes and rebuild automatically.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:watch` - Build and watch for changes
- `npm run test` - Run tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run Biome linter
- `npm run lint:fix` - Run Biome linter with auto-fix
- `npm run format` - Format code with Biome

## Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification. Commit messages are enforced using Commitlint with Husky git hooks.

Valid commit types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI configuration changes
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverting a previous commit

Example commit message:
```
feat: add new component tree visualization
```

## CI/CD

This project uses:
- **Biome** for linting and formatting in CI
- **Vitest** for testing
- **Semantic Release** for automated versioning and publishing to npm

Releases are triggered by creating a new release in GitHub.

---

developed by albert-dm
@[webdrops.app](https://webdrops.app)
