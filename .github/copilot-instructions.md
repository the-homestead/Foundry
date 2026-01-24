---
applyTo: "**/*.{ts,tsx,js,jsx}"
---

# Foundry AI instructions

## Architecture
- Monorepo with Turborepo + pnpm workspaces: apps (Next.js), services (Hono API), packages (ui/database/configs/types).
- Web app uses Next.js App Router under [apps/web/src/app](apps/web/src/app), with root layout in [apps/web/src/app/layout.tsx](apps/web/src/app/layout.tsx#L1) that wires Theme providers, sidebar layout, and UI CSS from @foundry/ui.
- UI components live in [packages/ui/src](packages/ui/src); prefer imports from @foundry/ui (see exported entrypoints in [packages/ui/package.json](packages/ui/package.json#L1)).
- Backend service is Hono in [services/backend/src/index.ts](services/backend/src/index.ts#L1): registers routes, serves OpenAPI at /openapi.json, rate-limits requests, and listens on port 3100.
- Route pattern: use `createRouter()` from [services/backend/src/lib/create-app.ts](services/backend/src/lib/create-app.ts#L1) with Zod v4 schemas from [services/backend/src/schemas/index.ts](services/backend/src/schemas/index.ts#L1) and `hono-openapi` describeRoute/validator (example in [services/backend/src/routes/main.ts](services/backend/src/routes/main.ts#L1)).

## Auth + DB
- Auth is configured in [services/backend/src/lib/auth.ts](services/backend/src/lib/auth.ts#L1) using Better Auth + Drizzle adapter; OAuth providers are enabled only when env vars are present.
- Client auth hooks live in [apps/web/src/lib/auth-client.ts](apps/web/src/lib/auth-client.ts#L1); use `useSession()` and client-side redirects for auth-gated pages.
- Database setup is in [packages/database/src/index.ts](packages/database/src/index.ts#L1) (Drizzle + pg pool + dotenv-mono). `DATABASE_URL` is required.
- Auth tables are auto-generated in [packages/database/src/schemas/users/tables.ts](packages/database/src/schemas/users/tables.ts#L1). Update schema via [services/backend/src/lib/auth.ts](services/backend/src/lib/auth.ts#L1) and regenerate using [services/backend/src/lib/auth-db.ts](services/backend/src/lib/auth-db.ts#L1); do not edit generated tables directly.

## Commands
- Web dev: `pnpm --filter @foundry/web dev`. Backend dev: `pnpm --filter @foundry/backend dev`.
- Lint/format: `pnpm dlx ultracite check` and `pnpm dlx ultracite fix`.
- DB tools: `pnpm --filter @foundry/database db:check|db:migrate|db:generate`.
- UI components: `pnpm --filter @foundry/ui ui:add <component>`.

## Code Standards

# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `pnpm dlx ultracite fix`
- **Check for issues**: `pnpm dlx ultracite check`
- **Diagnose setup**: `pnpm dlx ultracite doctor`

Biome (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**
- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**
- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**
- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Biome. Run `pnpm dlx ultracite fix` before committing to ensure compliance.
