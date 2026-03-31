Write comprehensive Vitest tests for: $ARGUMENTS

## Project context

- **Test runner:** Vitest (`bun test`)
- **Framework:** React 18 + TypeScript (strict)
- **UI:** Shadcn/ui components, Framer Motion, TanStack Router
- **State:** React Query for server state, custom hooks for local state
- **Path alias:** `@/*` → `src/*`
- **Linter:** Biome (tabs, double quotes)

## Steps before writing tests

1. Read the target file(s) in full.
2. Identify what kind of target it is (component, hook, utility, service, lib function) and choose the right testing strategy below.
3. Check for existing test files (`*.test.ts` / `*.test.tsx`) in the same directory — extend them instead of creating duplicates.
4. Place the test file next to the source file with the same name + `.test` suffix.

## Testing strategies by type

### React components (`*.tsx`)
- Use `@testing-library/react` + `@testing-library/user-event`.
- Render with all required providers: wrap with a helper that includes `QueryClientProvider` and, when routing is needed, TanStack Router's `RouterProvider` with a test router.
- Test **what the user sees and does**, not implementation details.
- Cover: default render, each visible state (loading/error/empty/populated), user interactions (clicks, input changes, form submit), and prop-driven conditional rendering.
- For Framer Motion components, mock `framer-motion` to avoid animation timers in tests.

### Custom hooks (`use*.ts`)
- Use `@testing-library/react`'s `renderHook` + `act`.
- Wrap with required providers inside `renderHook`'s `wrapper` option.
- Test: initial state, each action/mutation, cleanup (timers, subscriptions).
- Fake timers (`vi.useFakeTimers`) for hooks that use `setTimeout`/`setInterval`.

### Lib / service functions (`src/lib/*.ts`, `src/services/*.ts`)
- Plain Vitest unit tests — no React needed.
- Mock external calls (`fetch`, Pinata, wagmi) with `vi.mock` / `vi.fn`.
- Cover: happy path, error path, edge cases (empty input, network failure).

## Required test anatomy

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("<ComponentOrFunctionName>", () => {
  // shared setup
  beforeEach(() => { /* ... */ });
  afterEach(() => { vi.restoreAllMocks(); });

  describe("<sub-behaviour>", () => {
    it("should <expected behaviour>", () => {
      // Arrange → Act → Assert
    });
  });
});
```

## Coverage checklist — include tests for:

- [ ] Happy path / default render
- [ ] All conditional branches (if/else, ternary, switch)
- [ ] Loading, error, and empty states (where applicable)
- [ ] User interactions (click, type, submit, keyboard)
- [ ] Prop variations that change visible output
- [ ] Cleanup / unmount side effects (timers, subscriptions)
- [ ] Boundary / edge cases (null props, empty arrays, zero values)

## Mocking guidelines

- Mock at the module level with `vi.mock("@/lib/...", () => ({ ... }))`.
- For React Query, wrap with a fresh `QueryClient` per test (set `retry: false`).
- For TanStack Router hooks (`useRouter`, `useNavigate`), mock `@tanstack/react-router`.
- For wagmi/RainbowKit hooks, mock `wagmi` at the module level.
- Never use real timers when testing toast/animation hide logic — use `vi.useFakeTimers()`.

## Output format

- Write the full test file content ready to save.
- Include all necessary imports.
- Add a one-line comment above each `describe` block explaining its purpose.
- Do **not** add comments that just restate what the code does — only explain non-obvious choices.
