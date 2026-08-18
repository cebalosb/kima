---
name: ship
description: Stage, commit, and push the current changes to GitHub in one step — for when the user wants to save progress and show people what's been built. Only runs when explicitly invoked (never automatically).
argument-hint: "[optional commit message]"
metadata:
  author: kima
  version: "1.0.0"
---

# Ship

Commit and push whatever's currently changed in the working tree, in one step.

## Steps

1. Run `git status` and `git diff` (staged + unstaged) to see what's changed. If there's nothing to commit, say so and stop.
2. Stage the relevant files by name (never `git add -A` or `git add .` blindly — check `git status` first and exclude anything that looks like a secret, credential, or file that shouldn't be tracked).
3. Write a commit message:
   - If the user passed one as an argument, use it.
   - Otherwise, write a concise 1-2 sentence message describing *why*, based on the actual diff — same standard as any other commit (see the repo's recent `git log` for style).
   - Always end the message with:
     ```
     Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
     ```
4. Commit.
5. Push to `origin` on the current branch.
6. Report back briefly: what was committed, and confirm it's pushed (include the commit hash).

## Notes

- This skill *is* the user's explicit authorization to commit and push for this one invocation — don't ask for confirmation before running the git commands, since invoking `/ship` is the request.
- Still exercise judgment on what gets staged — if `git status` shows something unexpected (files the user probably didn't mean to include, like `.env` or credentials), flag it and leave it out rather than staging blindly.
- If the push fails (e.g. auth, diverged branch), report the actual error rather than retrying with destructive flags like `--force`.
