---
title: "Bash Aliases for Developers"
description: "A collection of bash aliases for faster terminal navigation, Docker/Git commands, and development workflows."
publishDate: 2025-01-06
author: "codersbox"
tags: ["Bash", "Linux", "Productivity", "Terminal", "DevOps", "Workflow", "Aliases", "Shell"]
readTime: "10 min read"
difficulty: "beginner"
estimatedTime: "20 minutes"
featured: true
---

# Bash Aliases for Developers

Bash aliases replace long commands with short ones. Instead of typing `docker-compose up -d` repeatedly, type `dcu`. Create shortcuts for repetitive tasks and speed up your workflow

## Setup

Store aliases in `~/.bash_aliases`. Add this to `~/.bashrc` if not already present:

```bash
if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi
```

Reload after editing: `source ~/.bashrc`

## Navigation

```bash
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'
alias -- -='cd -'

alias ws='cd ~/workspace'
alias dl='cd ~/Downloads'
alias proj='cd ~/projects'
```

Create aliases for directories you visit frequently.

## File Operations

```bash
alias ll='ls -alF'
alias la='ls -A'
alias lt='ls -lht'
alias lS='ls -lhS'

alias mkdir='mkdir -p'
alias rm='rm -i'
alias cp='cp -i'
alias mv='mv -i'

alias n='nvim'
alias sn='sudo nvim'
alias ex='chmod +x'

alias du='du -h'
alias df='df -h'
alias ducks='du -cks * | sort -rn | head -n 10'
```

## Package Management

```bash
# Ubuntu/Debian
alias i='sudo apt install -y'
alias update='sudo apt update'
alias upgrade='sudo apt upgrade -y'
alias upall='sudo apt update && sudo apt upgrade -y'
alias cleanup='sudo apt autoremove -y && sudo apt autoclean'

# Homebrew (macOS)
alias brewup='brew update && brew upgrade && brew cleanup'
alias brewi='brew install'

# Arch
alias pacin='sudo pacman -S'
alias pacup='sudo pacman -Syu'
```

## Development

```bash
alias c='code'
alias c.='code .'

alias bashrc='nvim ~/.bashrc'
alias aliases='nvim ~/.bash_aliases'
alias reload='source ~/.bashrc'

alias t='tmux'
alias ta='tmux attach'
alias tl='tmux ls'
```

## Docker

```bash
alias d='docker'
alias dc='docker-compose'
alias dps='docker ps'
alias dpsa='docker ps -a'

alias dcu='docker-compose up'
alias dcud='docker-compose up -d'
alias dcd='docker-compose down'
alias dcr='docker-compose down && docker-compose up -d'
alias dcl='docker-compose logs -f'
alias dcb='docker-compose build'

alias dprune='docker system prune -af'
alias dexec='docker exec -it'
alias dbash='f(){ docker exec -it "$1" /bin/bash; }; f'
alias dlogs='f(){ docker logs -f "$1"; }; f'
```

## Build Tools

```bash
# Maven
alias m='mvn'
alias mci='mvn clean install'
alias mcixt='mvn clean install -DskipTests'
alias mt='mvn test'
alias mrun='mvn spring-boot:run'

# Gradle
alias g='./gradlew'
alias gb='./gradlew build'
alias gbxt='./gradlew build -x test'
alias gt='./gradlew test'
alias gcb='./gradlew clean build'

# NPM
alias ni='npm install'
alias nr='npm run'
alias ns='npm start'
alias nt='npm test'
alias nb='npm run build'

# Yarn
alias ya='yarn add'
alias ys='yarn start'
alias yb='yarn build'
```

## Git

```bash
alias g='git'
alias gs='git status'
alias ga='git add'
alias gaa='git add .'
alias gc='git commit -m'
alias gac='git add . && git commit -m'

alias gp='git push'
alias gpo='git push origin'
alias gpl='git pull'

alias gb='git branch'
alias gco='git checkout'
alias gcob='git checkout -b'

alias gl='git log --oneline'
alias glog='git log --oneline --decorate --graph'
alias gd='git diff'

alias gst='git stash'
alias gstp='git stash pop'

alias gwip='git add . && git commit -m "WIP"'
alias gundo='git reset HEAD~1'
```

## System

```bash
alias kp='f(){ for port in "$@"; do lsof -ti:"$port" | xargs -r kill -9; done; }; f'
alias psg='ps aux | grep'
alias top='htop'

alias ports='netstat -tulanp'
alias listening='lsof -i -P -n | grep LISTEN'
alias myip='curl ifconfig.me'

alias sctl='sudo systemctl'
alias sstart='sudo systemctl start'
alias sstop='sudo systemctl stop'
alias srestart='sudo systemctl restart'
alias sstatus='sudo systemctl status'

alias free='free -h'
```

## Useful Functions

Functions handle complex logic that aliases can't:

```bash
# Extract any archive
extract() {
    case "$1" in
        *.tar.gz)    tar xzf "$1"    ;;
        *.tar.bz2)   tar xjf "$1"    ;;
        *.zip)       unzip "$1"      ;;
        *.7z)        7z x "$1"       ;;
        *)           echo "Cannot extract '$1'" ;;
    esac
}

# Create and enter directory
mkcd() {
    mkdir -p "$1" && cd "$1"
}

# Backup file with timestamp
backup() {
    cp "$1" "$1.backup.$(date +%Y%m%d_%H%M%S)"
}

# Quick HTTP server
serve() {
    python3 -m http.server "${1:-8000}"
}
```

## Best Practices

**Organize with comments** to group related aliases:

```bash
# DOCKER
alias d='docker'
alias dc='docker-compose'

# GIT
alias g='git'
alias gs='git status'
```

**Use descriptive names.** Good: `dcup`, `mcixt`. Bad: `x`, `y`.

**Don't override critical commands.** Use `rmd` for `rm -rf`, not `rm`.

**Add safety.** Use `-i` flag for `rm`, `cp`, `mv` to confirm before overwriting.

**Back up aliases** in a git repository (dotfiles).

## Complete Configuration

```bash
#!/bin/bash
# ~/.bash_aliases
# Personal bash aliases for improved productivity

# ============================================
# NAVIGATION
# ============================================
alias ~='cd ~'
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'
alias .....='cd ../../../..'
alias -- -='cd -'

# Common directories
alias dl='cd ~/Downloads'
alias doc='cd ~/Documents'
alias ws='cd ~/workspace'
alias proj='cd ~/projects'

# ============================================
# FILE SYSTEM OPERATIONS
# ============================================
# List
alias ls='ls --color=auto'
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias lt='ls -lht'
alias lS='ls -lhS'

# Create/Remove
alias mkdir='mkdir -p'
alias mkd='mkdir -p'
alias rm='rm -i'
alias rmd='rm -rf'
alias cp='cp -i'
alias mv='mv -i'

# Permissions
alias ex='chmod +x'
alias 644='chmod 644'
alias 755='chmod 755'

# Disk usage
alias du='du -h'
alias df='df -h'
alias ducks='du -cks * | sort -rn | head -n 10'

# ============================================
# PACKAGE MANAGEMENT (Ubuntu/Debian)
# ============================================
alias i='sudo apt install -y'
alias icy='sudo apt install'
alias update='sudo apt update'
alias upgrade='sudo apt upgrade -y'
alias upall='sudo apt update && sudo apt upgrade -y'
alias cleanup='sudo apt autoremove -y && sudo apt autoclean'

# ============================================
# DEVELOPMENT TOOLS
# ============================================
# Editors
alias n='nvim'
alias v='vim'
alias c='code'
alias c.='code .'
alias sn='sudo nvim'

# Config files
alias bashrc='nvim ~/.bashrc'
alias aliases='nvim ~/.bash_aliases'
alias reload='source ~/.bashrc'
alias r='reload'

# Better utilities
alias cat='batcat'
alias bat='batcat'

# Tmux
alias t='tmux'
alias ta='tmux attach'
alias tl='tmux ls'

# ============================================
# DOCKER
# ============================================
alias d='docker'
alias dc='docker-compose'
alias dps='docker ps'
alias dpsa='docker ps -a'
alias di='docker images'

# Docker Compose
alias dcu='docker-compose up'
alias dcud='docker-compose up -d'
alias dcd='docker-compose down'
alias dcr='docker-compose down && docker-compose up -d'
alias dcl='docker-compose logs -f'
alias dcb='docker-compose build'

# Docker cleanup
alias dprune='docker system prune -af'
alias dclean='docker rm $(docker ps -aq) 2>/dev/null || true'

# Docker exec
alias dexec='docker exec -it'
alias dbash='f(){ docker exec -it "$1" /bin/bash; }; f'

# ============================================
# BUILD TOOLS
# ============================================
# Maven
alias m='mvn'
alias mci='mvn clean install'
alias mcixt='mvn clean install -DskipTests'
alias mcp='mvn clean package'
alias mt='mvn test'
alias mdeps='mvn dependency:resolve'

# Gradle
alias g='./gradlew'
alias gb='./gradlew build'
alias gbxt='./gradlew build -x test'
alias gt='./gradlew test'
alias gcb='./gradlew clean build'

# NPM
alias ni='npm install'
alias nig='npm install -g'
alias nr='npm run'
alias ns='npm start'
alias nt='npm test'
alias nb='npm run build'

# ============================================
# GIT
# ============================================
alias g='git'
alias gs='git status'
alias ga='git add'
alias gaa='git add .'
alias gc='git commit -m'
alias gac='git add . && git commit -m'
alias gp='git push'
alias gpo='git push origin'
alias gpl='git pull'
alias gb='git branch'
alias gco='git checkout'
alias gcob='git checkout -b'
alias gl='git log --oneline'
alias glog='git log --oneline --decorate --graph'
alias gd='git diff'
alias gst='git stash'
alias gsta='git stash apply'
alias gwip='git add . && git commit -m "WIP"'

# ============================================
# SYSTEM & PROCESSES
# ============================================
# Kill process by port
alias kp='f(){ for port in "$@"; do lsof -ti:"$port" | xargs -r kill -9; done; }; f'

# Process monitoring
alias psg='ps aux | grep'
alias top='htop'

# Network
alias ports='netstat -tulanp'
alias listening='lsof -i -P -n | grep LISTEN'
alias myip='curl ifconfig.me'

# Services
alias sctl='sudo systemctl'
alias sstart='sudo systemctl start'
alias sstop='sudo systemctl stop'
alias srestart='sudo systemctl restart'
alias sstatus='sudo systemctl status'

# ============================================
# UTILITIES
# ============================================
alias e='exit'
alias s='sudo'
alias grep='grep --color=auto'
alias h='history'
alias j='jobs'

# Quick shortcuts
alias c='clear'
alias q='exit'
alias :q='exit'
alias :wq='exit'

# ============================================
# FUNCTIONS
# ============================================
# Extract any archive
extract() {
    if [ -f "$1" ]; then
        case "$1" in
            *.tar.bz2)   tar xjf "$1"    ;;
            *.tar.gz)    tar xzf "$1"    ;;
            *.bz2)       bunzip2 "$1"    ;;
            *.rar)       unrar x "$1"    ;;
            *.gz)        gunzip "$1"     ;;
            *.tar)       tar xf "$1"     ;;
            *.zip)       unzip "$1"      ;;
            *.7z)        7z x "$1"       ;;
            *)           echo "'$1' cannot be extracted" ;;
        esac
    fi
}
alias x='extract'

# Create and enter directory
mkcd() {
    mkdir -p "$1" && cd "$1"
}

# Backup file
backup() {
    cp "$1" "$1.backup.$(date +%Y%m%d_%H%M%S)"
}

# Quick HTTP server
serve() {
    local port="${1:-8000}"
    python3 -m http.server "$port"
}
```
