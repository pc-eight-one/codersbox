---
title: "Git Commands Cheatsheet"
description: "Quick reference for essential Git commands covering initialization, branching, commits, merges, rebases, and remote operations."
publishDate: 2024-09-15
author: "Prashant Chaturvedi"
tags: ["Git", "Version Control", "DevOps", "CLI"]
category: "Version Control"
readTime: "5 min read"
featured: true
draft: false
published: false
downloads:
  - title: "PDF - Full Reference"
    format: "PDF"
    size: "1.2 MB"
    url: "/downloads/git-commands-cheatsheet.pdf"
  - title: "Markdown Source"
    format: "Markdown"
    size: "45 KB"
    url: "/downloads/git-commands-cheatsheet.md"
  - title: "Single Page HTML"
    format: "HTML"
    size: "320 KB"
    url: "/downloads/git-commands-cheatsheet.html"
---

# Git Commands Cheatsheet

## Configuration

### Initial Setup
```bash
# Set username
git config --global user.name "Your Name"

# Set email
git config --global user.email "your.email@example.com"

# Set default editor
git config --global core.editor "vim"

# View all settings
git config --list

# View specific setting
git config user.name
```

### Aliases
```bash
# Create shortcuts
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
```

---

## Repository Initialization

```bash
# Initialize new repository
git init

# Clone existing repository
git clone <url>

# Clone to specific directory
git clone <url> <directory>

# Clone specific branch
git clone -b <branch> <url>

# Clone with depth (shallow clone)
git clone --depth 1 <url>
```

---

## Basic Operations

### Checking Status
```bash
# Show working tree status
git status

# Short status
git status -s

# Show branch and tracking info
git status -sb
```

### Staging Files
```bash
# Add file to staging
git add <file>

# Add all files
git add .

# Add all files in directory
git add <directory>

# Add with interactive mode
git add -i

# Add patches interactively
git add -p
```

### Committing
```bash
# Commit staged changes
git commit -m "Commit message"

# Commit all tracked files
git commit -am "Message"

# Amend last commit
git commit --amend

# Amend without changing message
git commit --amend --no-edit

# Empty commit
git commit --allow-empty -m "Message"
```

---

## Branching

### Creating Branches
```bash
# Create new branch
git branch <branch-name>

# Create and switch to branch
git checkout -b <branch-name>

# Create from specific commit
git branch <branch-name> <commit-hash>

# Create and switch (modern syntax)
git switch -c <branch-name>
```

### Switching Branches
```bash
# Switch to branch
git checkout <branch-name>

# Switch to branch (modern syntax)
git switch <branch-name>

# Switch to previous branch
git checkout -

# Create branch from remote
git checkout -b <branch> origin/<branch>
```

### Managing Branches
```bash
# List local branches
git branch

# List all branches (local + remote)
git branch -a

# List remote branches
git branch -r

# Delete branch
git branch -d <branch-name>

# Force delete branch
git branch -D <branch-name>

# Rename branch
git branch -m <old-name> <new-name>

# Rename current branch
git branch -m <new-name>
```

---

## Viewing Changes

### Diff Commands
```bash
# Show unstaged changes
git diff

# Show staged changes
git diff --staged

# Show changes between commits
git diff <commit1> <commit2>

# Show changes in specific file
git diff <file>

# Show diff statistics
git diff --stat

# Show word diff
git diff --word-diff
```

### Log and History
```bash
# Show commit history
git log

# One line per commit
git log --oneline

# Show graph
git log --graph --oneline --all

# Show last N commits
git log -n 5

# Show commits by author
git log --author="Name"

# Show commits with diff
git log -p

# Show commits affecting file
git log -- <file>

# Show commits in date range
git log --since="2 weeks ago"
git log --until="2024-01-01"

# Pretty format
git log --pretty=format:"%h - %an, %ar : %s"
```

---

## Undoing Changes

### Unstaging
```bash
# Unstage file
git reset HEAD <file>

# Unstage all files
git reset HEAD
```

### Discarding Changes
```bash
# Discard changes in working directory
git checkout -- <file>

# Discard all changes
git checkout -- .

# Restore file (modern syntax)
git restore <file>

# Restore all files
git restore .
```

### Reset Commands
```bash
# Soft reset (keep changes staged)
git reset --soft HEAD~1

# Mixed reset (keep changes unstaged)
git reset HEAD~1

# Hard reset (discard all changes)
git reset --hard HEAD~1

# Reset to specific commit
git reset --hard <commit-hash>
```

### Revert
```bash
# Create new commit that undoes changes
git revert <commit-hash>

# Revert without committing
git revert -n <commit-hash>

# Revert merge commit
git revert -m 1 <merge-commit>
```

---

## Stashing

```bash
# Stash current changes
git stash

# Stash with message
git stash save "message"

# List stashes
git stash list

# Apply last stash
git stash apply

# Apply specific stash
git stash apply stash@{2}

# Apply and remove stash
git stash pop

# Show stash contents
git stash show

# Show stash diff
git stash show -p

# Drop specific stash
git stash drop stash@{0}

# Clear all stashes
git stash clear

# Create branch from stash
git stash branch <branch-name>
```

---

## Merging

```bash
# Merge branch into current
git merge <branch-name>

# Merge with no fast-forward
git merge --no-ff <branch-name>

# Merge with fast-forward only
git merge --ff-only <branch-name>

# Abort merge
git merge --abort

# Continue merge after resolving
git merge --continue

# Merge and create commit
git merge --no-commit <branch-name>
```

---

## Rebasing

```bash
# Rebase current branch
git rebase <branch>

# Interactive rebase
git rebase -i HEAD~3

# Continue rebase
git rebase --continue

# Skip commit during rebase
git rebase --skip

# Abort rebase
git rebase --abort

# Rebase onto another branch
git rebase --onto <newbase> <oldbase>
```

---

## Remote Operations

### Working with Remotes
```bash
# List remotes
git remote

# Show remote details
git remote -v

# Add remote
git remote add <name> <url>

# Remove remote
git remote remove <name>

# Rename remote
git remote rename <old> <new>

# Change remote URL
git remote set-url <name> <new-url>

# Show remote info
git remote show <name>
```

### Fetching and Pulling
```bash
# Fetch from remote
git fetch

# Fetch specific remote
git fetch <remote>

# Fetch all remotes
git fetch --all

# Fetch and prune deleted branches
git fetch --prune

# Pull (fetch + merge)
git pull

# Pull with rebase
git pull --rebase

# Pull specific branch
git pull <remote> <branch>
```

### Pushing
```bash
# Push to remote
git push

# Push to specific remote and branch
git push <remote> <branch>

# Push and set upstream
git push -u origin <branch>

# Push all branches
git push --all

# Push tags
git push --tags

# Force push
git push --force

# Force push with lease (safer)
git push --force-with-lease

# Delete remote branch
git push <remote> --delete <branch>
```

---

## Tags

```bash
# List tags
git tag

# Create lightweight tag
git tag <tag-name>

# Create annotated tag
git tag -a <tag-name> -m "message"

# Tag specific commit
git tag <tag-name> <commit-hash>

# Show tag info
git show <tag-name>

# Delete local tag
git tag -d <tag-name>

# Delete remote tag
git push <remote> --delete <tag-name>

# Push tag to remote
git push <remote> <tag-name>

# Push all tags
git push --tags

# Checkout tag
git checkout <tag-name>
```

---

## Advanced Operations

### Cherry-pick
```bash
# Apply commit to current branch
git cherry-pick <commit-hash>

# Cherry-pick without committing
git cherry-pick -n <commit-hash>

# Cherry-pick range of commits
git cherry-pick <commit1>..<commit2>
```

### Bisect
```bash
# Start bisect
git bisect start

# Mark current as bad
git bisect bad

# Mark commit as good
git bisect good <commit-hash>

# Reset bisect
git bisect reset
```

### Submodules
```bash
# Add submodule
git submodule add <url> <path>

# Initialize submodules
git submodule init

# Update submodules
git submodule update

# Clone with submodules
git clone --recursive <url>

# Update all submodules
git submodule update --remote

# Remove submodule
git submodule deinit <path>
git rm <path>
```

### Clean
```bash
# Show what would be removed
git clean -n

# Remove untracked files
git clean -f

# Remove untracked files and directories
git clean -fd

# Remove ignored files too
git clean -fdx

# Interactive clean
git clean -i
```

---

## Useful Shortcuts

### Show Files
```bash
# List tracked files
git ls-files

# List ignored files
git ls-files --others --ignored --exclude-standard

# Show file at specific commit
git show <commit>:<file>
```

### Blame and History
```bash
# Show who changed each line
git blame <file>

# Show blame for lines 10-20
git blame -L 10,20 <file>

# Follow file renames
git log --follow <file>
```

### Searching
```bash
# Search for string in files
git grep "search term"

# Search in specific commit
git grep "search term" <commit>

# Show line numbers
git grep -n "search term"

# Count matches
git grep -c "search term"
```

---

## Common Workflows

### Feature Branch Workflow
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "Add new feature"

# 3. Push to remote
git push -u origin feature/new-feature

# 4. Create pull request (via GitHub/GitLab)

# 5. After PR approval, merge
git checkout main
git merge feature/new-feature

# 6. Delete feature branch
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

### Hotfix Workflow
```bash
# 1. Create hotfix branch from main
git checkout -b hotfix/critical-bug main

# 2. Fix and commit
git add .
git commit -m "Fix critical bug"

# 3. Merge to main
git checkout main
git merge hotfix/critical-bug

# 4. Tag the release
git tag -a v1.0.1 -m "Hotfix release"

# 5. Merge to develop
git checkout develop
git merge hotfix/critical-bug

# 6. Push and cleanup
git push --all
git push --tags
git branch -d hotfix/critical-bug
```

---

## Emergency Commands

```bash
# Undo last commit but keep changes
git reset --soft HEAD~1

# Discard all local changes
git reset --hard HEAD

# Recover deleted branch
git reflog
git checkout -b <branch-name> <commit-hash>

# Recover lost commits
git reflog
git cherry-pick <commit-hash>

# Fix wrong branch commit
git reset --soft HEAD~1
git stash
git checkout <correct-branch>
git stash pop

# Remove file from history
git filter-branch --tree-filter 'rm -f <file>' HEAD
```

---

## Tips and Tricks

- **Always pull before push**: `git pull --rebase origin main`
- **Use descriptive commit messages**: Follow conventional commits
- **Commit often**: Small, focused commits are better
- **Use branches**: Never work directly on main/master
- **Review before push**: `git log --oneline -5`
- **Keep commits atomic**: One logical change per commit
- **Use `.gitignore`**: Exclude build artifacts and IDE files
- **Sign commits**: `git commit -S -m "message"` (with GPG)

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `git status` | Show working tree status |
| `git add .` | Stage all changes |
| `git commit -m "msg"` | Commit with message |
| `git push` | Push to remote |
| `git pull` | Fetch and merge |
| `git branch` | List branches |
| `git checkout <branch>` | Switch branch |
| `git merge <branch>` | Merge branch |
| `git log` | Show commit history |
| `git diff` | Show changes |
