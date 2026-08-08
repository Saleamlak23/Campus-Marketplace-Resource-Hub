# Team Standards — Campus Marketplace & Resource Hub

Every member follows these rules. The goal isn't bureaucracy — it's making sure five people's code merges together without friction, and that the final codebase reads like it was written by one disciplined team, not five different habits stitched together.

---

## 1. Code Style

### JavaScript/TypeScript
- **ES6+ syntax only.** No `var` — use `const` by default, `let` only when reassignment is genuinely needed.
- Use arrow functions for callbacks/handlers; use named `function` declarations for top-level exported functions (better stack traces, hoisting).
- Use `async/await` over raw `.then()` chains. Always wrap `await` calls in `try/catch` (backend) or handle errors via TanStack Query's error state (frontend) — never leave a rejected promise unhandled.
- Use destructuring for objects/arrays where it improves readability (`const { id, name } = user`), but don't destructure so deeply it hurts clarity.
- Use template literals (`` `Hello ${name}` ``) instead of string concatenation.
- Prefer `Array.map/filter/reduce` over manual `for` loops unless performance-critical.
- **TypeScript is mandatory on both frontend and backend.** No `any` unless there's a documented reason (comment explaining why) — use `unknown` and narrow it, or define a proper type/interface.
- All shared types (API request/response shapes) live in a single source of truth (see Section 5) — never redefine the same shape twice in frontend and backend.
- **Backend uses genuine ES modules, not CommonJS.** `backend/package.json` has `"type": "module"`, so `require()`/`module.exports` are never used — only `import`/`export`. This means **every relative import in the backend must include an explicit `.js` extension**, even though the source file is `.ts` — e.g. `import { errorHandler } from './middleware/errorHandler.js'`, not `'./middleware/errorHandler'`. This is a Node.js ESM requirement, not a style choice — omitting the extension will fail at runtime with a "Cannot find module" error. Package imports (`from 'express'`, `from '@prisma/client'`) are unaffected and need no extension.

### Formatting & Linting
- **ESLint + Prettier** run on every file. No arguing about style in PR comments — if the linter doesn't catch it, it's not worth debating.
- Run `npm run lint` and `npm run format` before every commit. CI will reject a PR that fails lint.
- 2-space indentation, single quotes, semicolons required, trailing commas in multi-line structures — configured once in `.eslintrc` / `.prettierrc`, not a personal choice per file.

### Naming Conventions
| What | Convention | Example |
|---|---|---|
| Variables/functions | camelCase | `getUserListings`, `isVerified` |
| React components | PascalCase | `ListingCard.tsx`, `ChatWindow.tsx` |
| Files (non-component) | camelCase or kebab-case, pick one and stay consistent | `authService.ts` / `auth-service.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_UPLOAD_SIZE_MB` |
| DB tables/columns (Prisma) | snake_case in DB, camelCase in Prisma models (Prisma handles the mapping) | `university_id` → `universityId` |
| CSS/Tailwind custom classes (rare) | kebab-case | `.chat-bubble` |
| Booleans | prefixed with `is`/`has`/`can` | `isLoading`, `hasError`, `canEdit` |

**Whatever you pick for file naming, the whole team uses the same one — no mixing `authService.ts` and `chat-service.ts` in the same repo.**

---

## 2. Git Workflow

### Branch Naming
Format: `<type>/<short-description>`

| Type | Use for |
|---|---|
| `feature/` | New functionality (e.g. `feature/listings-crud`, `feature/chat-socket-server`) |
| `fix/` | Bug fixes (e.g. `fix/auth-token-refresh`) |
| `chore/` | Tooling, config, dependency updates, non-feature work (e.g. `chore/eslint-setup`) |
| `docs/` | Documentation-only changes (e.g. `docs/api-contract`) |

- All lowercase, words separated by hyphens, no spaces or underscores.
- Keep it short but specific — `fix/bug` is not acceptable, `fix/listing-image-upload-crash` is.

### When a Task Needs Its Own Branch
**Every trunk task and every parallel side-task gets its own dedicated branch.** No one commits directly to `main`, and no two unrelated tasks share a branch.

Concretely, per the task breakdown in `plan.md`:
- Each **Main Trunk step** (Task A, B, C on each side) is its own branch, opened only once the previous trunk step is merged.
- Each **Parallel Side-Task** (Admin/Moderation, Payments, Profile page, etc.) gets its own branch, independent of the trunk branch.
- Anything touching **shared/global code** (e.g. `lib/api-client.ts`, `middleware/authenticate.ts`, design tokens) should be its own small branch/PR, reviewed carefully since it affects everyone.
- A branch should map to **one PR, one reviewable unit of work.** If a task is large (e.g. Trunk Task A), it's fine to break it into smaller branches (`feature/auth-schema`, `feature/auth-jwt-middleware`) rather than one giant branch sitting unreviewed for a week.

### Commit Messages
Use [Conventional Commits](https://www.conventionalcommits.org/) style:
```
<type>: <short summary>

feat: add JWT refresh token endpoint
fix: correct university scoping on listings query
chore: configure eslint and prettier
docs: add API contract to docs/
refactor: extract auth middleware into separate module
```
Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`. Keep the summary under ~60 characters, imperative mood ("add" not "added").

### Pull Requests
- Every PR requires **at least one review from another member** before merging — no self-merging, even for small changes.
- PR description must state: what changed, which task/branch it corresponds to, and how to test it manually.
- PRs should be small enough to review in one sitting. If a diff exceeds ~400 lines, consider splitting it.
- Squash-merge into `main` to keep history clean — one commit per completed feature/fix in the main branch log.
- Delete the branch after merging.

---

## 3. Project Structure Discipline

- Follow the folder structure defined in `plan.md` (Section 6) exactly — don't invent new top-level folders without team agreement.
- Each module's backend logic stays inside its own `modules/<name>/` folder; don't reach into another module's internals directly — go through its exported service functions.
- Frontend feature code stays inside its own `features/<name>/` folder; shared UI goes in `components/common/`, never duplicated per feature.

---

## 4. Environment & Secrets

- Never commit `.env` files. Every environment variable used must have a corresponding entry in `.env.example` (with a placeholder, not a real value).
- API keys (Cloudinary, Chapa, DB connection strings) are shared privately (e.g. via a password manager or private channel) — never pasted into commit messages, PR descriptions, or chat logs that get committed anywhere.

---

## 5. API Contract (Frontend/Backend Independence)

Since Frontend and Backend build independently until the Integration Phase (see `plan.md` Section 7.3):
- The API contract (routes, request/response JSON shapes, status codes) is agreed upon and written down **before** either trunk starts — in `docs/api-contract.md` or a shared Postman collection.
- Any change to the contract during development must be communicated to both tracks immediately — a silent backend change breaks frontend's mocked assumptions.
- Frontend builds against this contract using mock/stub data until Integration Phase, not against a partially-built live backend.

---

## 6. Testing & Quality Bar (minimum, MVP-appropriate)

- Every module owner manually tests their own feature's happy path and at least one error path (e.g. invalid input, unauthorized access) before opening a PR.
- No PR merges with a broken build — CI must pass lint + build before merge is allowed.
- Postman collection is kept up to date as backend endpoints are added — this doubles as manual regression testing.

---

## 7. Communication

- Any task that blocks another member's work (e.g. Trunk Task A not yet merged, blocking Task B) is flagged in the team channel the moment it's known, not discovered later.
- If you deviate from an agreed pattern (naming, folder structure, API shape), say so in the PR description and explain why — don't let a reviewer discover it silently.
