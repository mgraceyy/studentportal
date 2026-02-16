# 🤝 Contributing Guidelines

Thank you for being part of this project! Please read and follow these guidelines to keep our codebase clean, consistent, and collaborative.

---

## 📌 General Rules

- Always work on a **feature branch** — never push directly to `main` or `dev`.
- Write **clear, descriptive commit messages**.
- Keep pull requests small and focused — one feature or fix per PR.
- Comment your code where logic is non-obvious.
- Test your changes before opening a pull request.

---

## 🌿 Branch Naming Convention

```
feature/short-description       # New features
fix/short-description           # Bug fixes
chore/short-description         # Maintenance, refactors, config changes
docs/short-description          # Documentation updates
```

**Examples:**
```
feature/student-login
fix/grades-not-loading
chore/update-dependencies
docs/update-api-endpoints
```

---

## 📝 Commit Message Format

Follow this structure for all commits:

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

## 🔁 Pull Request Process

1. Branch off from `dev` (not `main`)
2. Complete your changes and test locally
3. Open a pull request against `dev`
4. Fill out the PR description — what changed and why
5. Request at least **one team member review** before merging
6. Squash and merge once approved

---

## 🗂️ Code Style

- **JavaScript/React Native:** Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use `const` and `let` — never `var`
- Use `async/await` over `.then()` chains
- Keep components and functions small and single-purpose
- Use meaningful variable and function names

---

## 🚫 What Not to Do

- Do not commit `.env` files or any credentials
- Do not merge your own pull requests without review
- Do not push broken code to `dev` or `main`
- Do not leave commented-out code in final commits

---

## 📬 Questions?

Reach out to the team lead or open a discussion in the repository before making large structural changes.
