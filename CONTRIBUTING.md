# Contributing Guidelines

Thanks for contributing to this project! Follow these guidelines to keep the codebase clean and collaborative.

---

## Quick Start for New Contributors

1. Clone the repo and follow the setup instructions in [README.md](README.md#getting-started)
2. Create a feature branch off `dev`
3. Make your changes and test locally
4. Open a pull request against `dev`

---

## Branch Strategy

```
main          <- production-ready, stable releases only
  └── dev     <- integration branch, all features merge here first
        ├── feature/student-login
        ├── fix/grades-not-loading
        └── chore/update-dependencies
```

**Never push directly to `main` or `dev`.** Always use a feature branch and open a PR.

### Branch Naming

```
feature/short-description       # New features
fix/short-description           # Bug fixes
chore/short-description         # Maintenance, refactors, config
docs/short-description          # Documentation updates
```

---

## Commit Message Format

```
<type>: <short summary>
```

| Type | Use For |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Refactor, cleanup, config |
| `docs` | Documentation changes |
| `style` | Formatting, no logic change |
| `test` | Adding or updating tests |

**Examples:**
```
feat: add student grades screen
fix: resolve JWT token expiry issue
docs: update API endpoint table in README
chore: remove unused dependencies
```

---

## Pull Request Process

1. Branch off from `dev` (not `main`)
2. Complete your changes and test locally
3. Open a pull request against `dev`
4. Fill out the PR description — what changed and why
5. Request at least **one team member review** before merging
6. Squash and merge once approved

---

## Code Style

- Use `const` and `let` — never `var`
- Use `async/await` over `.then()` chains
- Keep components and functions small and single-purpose
- Use meaningful variable and function names
- Comment your code where logic is non-obvious

---

## Do Not

- Commit `.env` files or any credentials
- Merge your own pull requests without review
- Push broken code to `dev` or `main`
- Leave commented-out code in final commits

---

## Questions?

Reach out to the team lead or open a discussion in the repository before making large structural changes.
