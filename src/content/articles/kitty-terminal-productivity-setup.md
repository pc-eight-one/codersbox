---
title: "Kitty Terminal Configuration for Developers"
description: "A keyboard-driven Kitty terminal configuration with splits, tabs, and smart keybindings for faster development workflows."
publishDate: 2025-01-07
author: "Prashant Chaturvedi"
tags: ["Kitty", "Terminal", "Productivity", "Linux", "DevOps", "Workflow", "Configuration", "Developer Tools"]
readTime: "8 min read"
difficulty: "beginner"
estimatedTime: "15 minutes"
featured: true
---

# Kitty Terminal Configuration for Developers

Kitty is a GPU-accelerated terminal with built-in splits, tabs, and image support. Here's a configuration that makes development work faster: smart keybindings, organized layouts, and minimal mouse dependency.


## Why Kitty?

Kitty renders with the GPU, supports font ligatures, and includes native splits—no tmux needed. It's keyboard-driven, cross-platform, and handles images in the terminal.

## The Problem

Development means running servers, watching logs, executing git commands, running tests, and monitoring resources—often simultaneously. Opening separate windows for each task wastes time and mental energy.

Kitty solves this with splits, tabs, and keybindings in a single window.

---

## Font Configuration

JetBrains Mono renders code ligatures (`=>`, `!=`, `>=`) as single glyphs and distinguishes similar characters (0 vs O, 1 vs l vs I). Size 13 works well on 1080p and 1440p displays.

```bash
font_family JetBrains Mono
font_size 13.0
```

## Window Management

Kitty remembers window size between sessions. Set dimensions that fit your workflow:

```bash
remember_window_size yes
initial_window_width 1200
initial_window_height 800
```

Width 1200 fits two 600px splits comfortably. Height 800 shows ~40 lines without scrolling.

---

## Splits and Layouts

Kitty supports four layouts: splits (manual), stack (fullscreen), tall (main + sidebar), and grid (automatic).

```bash
enabled_layouts splits,stack,tall,grid

kitty_mod ctrl+shift
map kitty_mod+backslash launch --location=vsplit
map kitty_mod+minus launch --location=hsplit
```

`Ctrl+Shift+\` creates a vertical split. `Ctrl+Shift+-` creates a horizontal split.

**Example layout for full-stack work:**

```
┌─────────────────────┬─────────────────────┐
│   Backend Server    │   Frontend Dev      │
├─────────────────────┴─────────────────────┤
│                                           │
│            Git Commands & Tests           │
│                                           │
└───────────────────────────────────────────┘
```

---

## Tabs

Organize projects in tabs. Powerline style with slanted separators makes tabs distinct.

```bash
tab_bar_edge bottom
tab_bar_style powerline
tab_powerline_style slanted

map kitty_mod+t new_tab
map kitty_mod+w close_tab
map kitty_mod+alt+left previous_tab
map kitty_mod+alt+right next_tab
```

Use one tab per service or concern: backend in tab 1, frontend in tab 2, infrastructure in tab 3.

---

## Keyboard Navigation

Navigate splits with arrow keys. Reload config without restarting.

```bash
map kitty_mod+left neighboring_window left
map kitty_mod+right neighboring_window right
map kitty_mod+up neighboring_window up
map kitty_mod+down neighboring_window down
map kitty_mod+r load_config_file
```

## Performance and Visuals

Disable cursor blinking, keep scrollback for logs, disable the bell. Add padding so text doesn't touch window edges. Use a dark theme to reduce eye strain.

```bash
cursor_blink_interval 0
scrollback_lines 10000
enable_audio_bell no
window_padding_width 4

background #1e1e1e
foreground #d4d4d4
cursor #d4d4d4
```

---

## Real-World Workflows

**Bug fixing:** Logs on top, editor and test runner on bottom. See the error, fix the code, run tests, verify—no window switching.

```
┌───────────────────────────────────────────┐
│         Application Logs (live tail)      │
├─────────────────────┬─────────────────────┤
│   Code Editor       │   Test Runner       │
│   (nvim)            │   (npm test)        │
└─────────────────────┴─────────────────────┘
```

**Microservices:** One tab per service. Each tab has splits for server, logs, and database.

**DevOps:** Build tab with pipeline and deployment splits. Monitoring tab with grid layout for pods, logs, metrics, events.

---

## Complete Configuration

```bash
# ============================================
# FONT CONFIGURATION
# ============================================
font_family JetBrains Mono
font_size 13.0

# ============================================
# WINDOW LAYOUT
# ============================================
remember_window_size yes
initial_window_width 1200
initial_window_height 800

# ============================================
# TAB CONFIGURATION
# ============================================
tab_bar_edge bottom
tab_bar_style powerline
tab_powerline_style slanted

# Available layouts
enabled_layouts splits,stack,tall,grid

# ============================================
# KEY MAPPINGS
# ============================================
kitty_mod ctrl+shift

# Window/Split Management
map kitty_mod+backslash launch --location=vsplit
map kitty_mod+minus launch --location=hsplit

# Navigation between splits
map kitty_mod+left neighboring_window left
map kitty_mod+right neighboring_window right
map kitty_mod+up neighboring_window up
map kitty_mod+down neighboring_window down

# Tab Management
map kitty_mod+t new_tab
map kitty_mod+w close_tab

# Tab Navigation
map kitty_mod+alt+left previous_tab
map kitty_mod+alt+right next_tab

# Configuration Reload
map kitty_mod+r load_config_file

# Scrolling
map kitty_mod+page_up scroll_page_up
map kitty_mod+page_down scroll_page_down

# ============================================
# PERFORMANCE AND VISUAL ENHANCEMENTS
# ============================================
cursor_blink_interval 0
scrollback_lines 10000
enable_audio_bell no
window_padding_width 4

# ============================================
# COLOR SCHEME (VS Code Dark+)
# ============================================
background #1e1e1e
foreground #d4d4d4
cursor #d4d4d4

# Optional: Full color scheme (uncomment to use)
# selection_background #264f78
# selection_foreground #d4d4d4
#
# # Black
# color0 #000000
# color8 #666666
#
# # Red
# color1 #cd3131
# color9 #f14c4c
#
# # Green
# color2  #0dbc79
# color10 #23d18b
#
# # Yellow
# color3  #e5e510
# color11 #f5f543
#
# # Blue
# color4  #2472c8
# color12 #3b8eea
#
# # Magenta
# color5  #bc3fbc
# color13 #d670d6
#
# # Cyan
# color6  #11a8cd
# color14 #29b8db
#
# # White
# color7  #e5e5e5
# color15 #e5e5e5
```

---

## Installation

```bash
# Ubuntu/Debian
sudo apt install kitty fonts-jetbrains-mono

# Arch
sudo pacman -S kitty ttf-jetbrains-mono

# macOS
brew install kitty font-jetbrains-mono

# Apply configuration
mkdir -p ~/.config/kitty
# Copy the configuration above to ~/.config/kitty/kitty.conf
# Reload with Ctrl+Shift+R
```

---

## Additional Options

**Session scripts** save layouts for reuse:

```bash
# ~/.config/kitty/sessions/dev.conf
launch zsh
launch --location=vsplit zsh
launch --location=hsplit zsh

# Load with: kitty --session ~/.config/kitty/sessions/dev.conf
```

**Resize splits** with vim-style keys:

```bash
map kitty_mod+h resize_window narrower
map kitty_mod+l resize_window wider
map kitty_mod+k resize_window taller
map kitty_mod+j resize_window shorter
```

**Zoom a split** to full-screen and back:

```bash
map kitty_mod+z toggle_layout stack
```
