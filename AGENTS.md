# Foundry Project Agent Guidelines

This monorepo uses **Turborepo** with **pnpm workspaces** and **Ultracite** for code quality standards.

## Project Structure

- `apps/` - Frontend applications (web, desktop)
- `packages/` - Shared libraries (ui, database, types, configs)
- `services/` - Backend services
- Uses workspace dependencies with `workspace:*` protocol

## Build & Development Commands

### Root Level Commands
```bash
# Development (runs all packages)
pnpm dev

# Build all packages
pnpm build

# Type checking across all packages
pnpm check-types

# Code quality (Ultracite)
pnpm check      # Lint and format check
pnpm fix        # Auto-fix linting and formatting issues

# Database operations
pnpm db:check   # Database health checks
pnpm db:auth    # Database authentication setup
```

### Package-Specific Commands
```bash
# Run commands in specific workspace
pnpm --filter @foundry/web dev
pnpm --filter @foundry/backend dev
pnpm --filter @foundry/ui ui:add

# Build specific package
pnpm --filter @foundry/web build
```

### Testing
Currently no test framework is configured. When adding tests:
- Use Vitest or Jest as appropriate
- Place test files alongside source files with `.test.ts` suffix
- Run single test: `pnpm --filter <package> test <path-to-test>`

## Code Style & Standards

This project enforces **Ultracite** standards (Biome-based) with custom configuration in `biome.jsonc`:

### Quick Reference
- **Format**: `pnpm dlx ultracite fix`
- **Check**: `pnpm dlx ultracite check`
- **Diagnose**: `pnpm dlx ultracite doctor`

### TypeScript & JavaScript
- Use explicit types for function parameters/returns when clarity is needed
- Prefer `unknown` over `any`
- Use `const` by default, `let` only for reassignment
- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()`
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Use template literals over string concatenation
- Destructure objects and arrays when helpful

### React & JSX
- Function components only (no classes)
- Hooks at top level, never conditional
- Correct dependency arrays in hooks
- Use `key` prop for iterables (prefer unique IDs)
- Nest children between tags, not as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes

### Async Code
- Always `await` promises in async functions
- Use `async/await` over promise chains
- Handle errors with try-catch blocks
- Don't use async functions as Promise executors

### Imports & Exports
- Prefer specific imports over namespace imports
- Avoid barrel files (index re-exports)
- Use ES modules (`import`/`export`)
- Workspace imports use `workspace:*` in package.json

### Error Handling
- Throw `Error` objects with descriptive messages
- Use `try-catch` meaningfully, don't just rethrow
- Prefer early returns for error cases
- Remove `console.log`, `debugger`, `alert` from production

### Performance & Security
- Add `rel="noopener"` for `target="_blank"` links
- Avoid `dangerouslySetInnerHTML`
- Don't use `eval()` or direct `document.cookie` assignment
- Use Next.js `<Image>` component, not `<img>`
- Validate and sanitize user input

### Framework-Specific

**Next.js (web app):**
- Use Server Components for async data fetching
- Use App Router metadata API for head elements
- Proper image optimization with `<Image>`

**React 19+:**
- Use `ref` as prop instead of `React.forwardRef`

**Hono (backend):**
- Follow Hono patterns for middleware and routes
- Use standard validators for request/response validation

## Development Workflow

1. Install dependencies: `pnpm install`
2. Start development: `pnpm dev`
3. Make changes following Ultracite standards
4. Run `pnpm fix` before committing
5. Use `pnpm check` to verify code quality

## Package Management

- **Package manager**: pnpm@10.28.0
- **Node version**: >=25.2.1
- **Workspace config**: pnpm-workspace.yaml
- **Build orchestrator**: Turborepo
- **Code quality**: Ultracite (Biome)

## Environment Variables

Key environment variables (defined in turbo.json):
- `NEXT_PUBLIC_APP_URL`, `NEXT_SERVER_APP_URL`
- `DATABASE_URL`
- `AUTH_SECRET`, `AUTH_*_ID`, `AUTH_*_SECRET` (OAuth providers)

## Adding New Packages

1. Create package in appropriate directory (`apps/`, `packages/`, `services/`)
2. Add to pnpm-workspace.yaml if needed
3. Use `workspace:*` for internal dependencies
4. Add build/dev scripts to package.json
5. Configure in turbo.json if needed

## UI Components

- Uses shadcn/ui components in `@foundry/ui` package
- Add components: `pnpm --filter @foundry/ui ui:add <component>`
- Follow Radix UI patterns for accessibility
- Uses Tailwind CSS for styling

Most formatting and linting issues are automatically fixed by Ultracite. Run `pnpm fix` before committing to ensure compliance.