---
title: "Neovim with IntelliJ IDEA Keymaps: Complete Setup Guide"
description: "Transform Neovim into an IntelliJ-like IDE with familiar keymaps, smart navigation, refactoring tools, and debugging. Complete configuration for Java/Kotlin developers."
publishDate: 2025-01-05
author: "codersbox"
tags: ["Neovim", "IntelliJ IDEA", "IDE", "Vim", "Development", "Java", "Kotlin", "LSP", "Keymaps"]
readTime: "30 min read"
difficulty: "intermediate"
estimatedTime: "90 minutes"
featured: true
---

# Neovim with IntelliJ IDEA Keymaps: Complete Setup Guide

If you're a Java/Kotlin developer comfortable with IntelliJ IDEA but want the speed and efficiency of Neovim, this guide is for you. We'll transform Neovim into an IntelliJ-like IDE with familiar keymaps, intelligent code navigation, refactoring capabilities, and debugging support.

## Why Neovim with IntelliJ Keymaps?

**Benefits:**
- Lightning-fast startup and performance
- Muscle memory from IntelliJ IDEA
- Terminal-based workflow
- Highly customizable
- Lower resource usage
- Remote development friendly

**What You'll Get:**
- IntelliJ-style keybindings (`Ctrl+N`, `Ctrl+Shift+N`, `Alt+Enter`, etc.)
- Smart code navigation (Go to Definition, Find Usages, File Structure)
- Refactoring tools (Rename, Extract Method, Optimize Imports)
- Code completion and LSP integration
- Integrated debugging
- Git integration similar to IntelliJ
- Project explorer and fuzzy finding

## Prerequisites

- Neovim 0.9+ installed (`nvim --version`)
- Basic Vim/Neovim knowledge
- Node.js 16+ (for LSP servers)
- Git
- A terminal with true color support

## Table of Contents

1. [Neovim Setup and Configuration Structure](#1-neovim-setup-and-configuration-structure)
2. [Plugin Manager - lazy.nvim](#2-plugin-manager-lazynvim)
3. [Core IntelliJ-like Plugins](#3-core-intellij-like-plugins)
4. [LSP Configuration for Java/Kotlin](#4-lsp-configuration-for-javakotlin)
5. [IntelliJ Keymap Configuration](#5-intellij-keymap-configuration)
6. [File Navigation and Search](#6-file-navigation-and-search)
7. [Code Actions and Refactoring](#7-code-actions-and-refactoring)
8. [Debugging Setup](#8-debugging-setup)
9. [Git Integration](#9-git-integration)
10. [Additional IDE Features](#10-additional-ide-features)
11. [Complete Configuration](#11-complete-configuration)

---

## 1. Neovim Setup and Configuration Structure

First, create the Neovim configuration directory:

```bash
# Linux/macOS
mkdir -p ~/.config/nvim/{lua/config,lua/plugins}

# Windows (PowerShell)
New-Item -ItemType Directory -Force -Path "$env:LOCALAPPDATA\nvim\lua\config"
New-Item -ItemType Directory -Force -Path "$env:LOCALAPPDATA\nvim\lua\plugins"
```

**Recommended structure:**

```
~/.config/nvim/
├── init.lua                 # Entry point
├── lua/
│   ├── config/
│   │   ├── options.lua      # Vim options
│   │   ├── keymaps.lua      # Global keymaps
│   │   └── autocmds.lua     # Autocommands
│   └── plugins/
│       ├── lsp.lua          # LSP configuration
│       ├── completion.lua   # Completion setup
│       ├── telescope.lua    # Fuzzy finder
│       ├── treesitter.lua   # Syntax highlighting
│       └── dap.lua          # Debugging
```

Create `~/.config/nvim/init.lua`:

```lua
-- Bootstrap lazy.nvim plugin manager
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable",
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

-- Load configuration
require("config.options")
require("config.keymaps")
require("config.autocmds")

-- Load plugins
require("lazy").setup("plugins", {
  change_detection = {
    enabled = true,
    notify = false,
  },
})
```

---

## 2. Plugin Manager - lazy.nvim

Create `~/.config/nvim/lua/config/options.lua`:

```lua
-- General settings similar to IntelliJ
local opt = vim.opt

-- Line numbers
opt.number = true
opt.relativenumber = true

-- Tabs and indentation (similar to IntelliJ defaults)
opt.tabstop = 4
opt.shiftwidth = 4
opt.expandtab = true
opt.autoindent = true
opt.smartindent = true

-- Search settings
opt.ignorecase = true
opt.smartcase = true
opt.hlsearch = true
opt.incsearch = true

-- Appearance
opt.termguicolors = true
opt.background = "dark"
opt.signcolumn = "yes"
opt.cursorline = true

-- Clipboard (system clipboard like IntelliJ)
opt.clipboard = "unnamedplus"

-- Backspace behavior
opt.backspace = "indent,eol,start"

-- Split windows
opt.splitright = true
opt.splitbelow = true

-- Undo and backup
opt.undofile = true
opt.undodir = vim.fn.stdpath("data") .. "/undo"
opt.backup = false
opt.writebackup = false
opt.swapfile = false

-- Performance
opt.updatetime = 300
opt.timeoutlen = 500

-- Mouse support
opt.mouse = "a"

-- Completion menu height
opt.pumheight = 10

-- Show matching brackets
opt.showmatch = true
```

---

## 3. Core IntelliJ-like Plugins

Create `~/.config/nvim/lua/plugins/init.lua`:

```lua
return {
  -- Color scheme (IntelliJ Darcula-like)
  {
    "folke/tokyonight.nvim",
    lazy = false,
    priority = 1000,
    config = function()
      require("tokyonight").setup({
        style = "night",
        transparent = false,
        styles = {
          sidebars = "dark",
          floats = "dark",
        },
      })
      vim.cmd([[colorscheme tokyonight-night]])
    end,
  },

  -- File explorer (like IntelliJ Project view)
  {
    "nvim-neo-tree/neo-tree.nvim",
    branch = "v3.x",
    dependencies = {
      "nvim-lua/plenary.nvim",
      "nvim-tree/nvim-web-devicons",
      "MunifTanjim/nui.nvim",
    },
    config = function()
      require("neo-tree").setup({
        close_if_last_window = true,
        window = {
          position = "left",
          width = 30,
        },
        filesystem = {
          follow_current_file = {
            enabled = true,
          },
          use_libuv_file_watcher = true,
        },
      })
    end,
  },

  -- Status line
  {
    "nvim-lualine/lualine.nvim",
    dependencies = { "nvim-tree/nvim-web-devicons" },
    config = function()
      require("lualine").setup({
        options = {
          theme = "tokyonight",
          component_separators = { left = "|", right = "|" },
          section_separators = { left = "", right = "" },
        },
      })
    end,
  },

  -- Buffer line (like IntelliJ tabs)
  {
    "akinsho/bufferline.nvim",
    version = "*",
    dependencies = "nvim-tree/nvim-web-devicons",
    config = function()
      require("bufferline").setup({
        options = {
          mode = "buffers",
          close_command = "bdelete! %d",
          right_mouse_command = "bdelete! %d",
          offsets = {
            {
              filetype = "neo-tree",
              text = "File Explorer",
              highlight = "Directory",
              text_align = "left",
            },
          },
          diagnostics = "nvim_lsp",
          separator_style = "thin",
          show_buffer_close_icons = true,
          show_close_icon = true,
        },
      })
    end,
  },

  -- Treesitter for syntax highlighting
  {
    "nvim-treesitter/nvim-treesitter",
    build = ":TSUpdate",
    event = { "BufReadPost", "BufNewFile" },
    dependencies = {
      "nvim-treesitter/nvim-treesitter-textobjects",
    },
    config = function()
      require("plugins.treesitter")
    end,
  },

  -- Which-key for keymap hints (like IntelliJ's help)
  {
    "folke/which-key.nvim",
    event = "VeryLazy",
    config = function()
      vim.o.timeout = true
      vim.o.timeoutlen = 500
      require("which-key").setup({})
    end,
  },

  -- Auto pairs
  {
    "windwp/nvim-autopairs",
    event = "InsertEnter",
    config = true,
  },

  -- Comment plugin
  {
    "numToStr/Comment.nvim",
    event = { "BufReadPost", "BufNewFile" },
    config = true,
  },

  -- Indent guides
  {
    "lukas-reineke/indent-blankline.nvim",
    main = "ibl",
    event = { "BufReadPost", "BufNewFile" },
    config = function()
      require("ibl").setup({
        indent = { char = "│" },
        scope = { enabled = false },
      })
    end,
  },

  -- Git signs (like IntelliJ's gutter)
  {
    "lewis6991/gitsigns.nvim",
    event = { "BufReadPost", "BufNewFile" },
    config = function()
      require("gitsigns").setup({
        signs = {
          add = { text = "│" },
          change = { text = "│" },
          delete = { text = "_" },
          topdelete = { text = "‾" },
          changedelete = { text = "~" },
          untracked = { text = "┆" },
        },
      })
    end,
  },
}
```

---

## 4. LSP Configuration for Java/Kotlin

Create `~/.config/nvim/lua/plugins/lsp.lua`:

```lua
return {
  -- LSP Configuration
  {
    "neovim/nvim-lspconfig",
    event = { "BufReadPost", "BufNewFile" },
    dependencies = {
      "williamboman/mason.nvim",
      "williamboman/mason-lspconfig.nvim",
      "hrsh7th/cmp-nvim-lsp",
    },
    config = function()
      local lspconfig = require("lspconfig")
      local cmp_nvim_lsp = require("cmp_nvim_lsp")

      -- Mason setup for automatic LSP installation
      require("mason").setup()
      require("mason-lspconfig").setup({
        ensure_installed = {
          "jdtls",        -- Java
          "kotlin_language_server", -- Kotlin
          "lua_ls",       -- Lua
          "pyright",      -- Python
          "tsserver",     -- TypeScript
        },
        automatic_installation = true,
      })

      -- Capabilities for completion
      local capabilities = cmp_nvim_lsp.default_capabilities()

      -- Keymaps for LSP (IntelliJ-style)
      local on_attach = function(client, bufnr)
        local opts = { buffer = bufnr, silent = true }

        -- Navigation (IntelliJ Ctrl+B, Ctrl+Alt+B)
        vim.keymap.set("n", "gd", vim.lsp.buf.definition, opts) -- Ctrl+B equivalent
        vim.keymap.set("n", "gD", vim.lsp.buf.declaration, opts)
        vim.keymap.set("n", "gi", vim.lsp.buf.implementation, opts) -- Ctrl+Alt+B
        vim.keymap.set("n", "gr", vim.lsp.buf.references, opts) -- Alt+F7
        vim.keymap.set("n", "K", vim.lsp.buf.hover, opts) -- Ctrl+Q

        -- Code actions (IntelliJ Alt+Enter)
        vim.keymap.set({ "n", "v" }, "<leader>ca", vim.lsp.buf.code_action, opts)

        -- Rename (IntelliJ Shift+F6)
        vim.keymap.set("n", "<leader>rn", vim.lsp.buf.rename, opts)

        -- Format (IntelliJ Ctrl+Alt+L)
        vim.keymap.set("n", "<leader>f", function()
          vim.lsp.buf.format({ async = true })
        end, opts)

        -- Diagnostics (IntelliJ F2, Shift+F2)
        vim.keymap.set("n", "[d", vim.diagnostic.goto_prev, opts)
        vim.keymap.set("n", "]d", vim.diagnostic.goto_next, opts)
        vim.keymap.set("n", "<leader>e", vim.diagnostic.open_float, opts)
        vim.keymap.set("n", "<leader>q", vim.diagnostic.setloclist, opts)
      end

      -- Java LSP (jdtls) - Basic config
      -- For advanced Java, use nvim-jdtls plugin
      lspconfig.jdtls.setup({
        capabilities = capabilities,
        on_attach = on_attach,
      })

      -- Kotlin LSP
      lspconfig.kotlin_language_server.setup({
        capabilities = capabilities,
        on_attach = on_attach,
      })

      -- Lua LSP (for Neovim config)
      lspconfig.lua_ls.setup({
        capabilities = capabilities,
        on_attach = on_attach,
        settings = {
          Lua = {
            diagnostics = {
              globals = { "vim" },
            },
            workspace = {
              library = vim.api.nvim_get_runtime_file("", true),
            },
          },
        },
      })

      -- Configure diagnostic display
      vim.diagnostic.config({
        virtual_text = {
          prefix = "●",
        },
        signs = true,
        underline = true,
        update_in_insert = false,
        severity_sort = true,
      })

      -- Diagnostic signs (like IntelliJ)
      local signs = { Error = " ", Warn = " ", Hint = " ", Info = " " }
      for type, icon in pairs(signs) do
        local hl = "DiagnosticSign" .. type
        vim.fn.sign_define(hl, { text = icon, texthl = hl, numhl = hl })
      end
    end,
  },

  -- Advanced Java support
  {
    "mfussenegger/nvim-jdtls",
    ft = "java",
    config = function()
      -- Will be configured per-project
      -- See dedicated Java config section below
    end,
  },

  -- Mason (LSP installer)
  {
    "williamboman/mason.nvim",
    build = ":MasonUpdate",
  },

  {
    "williamboman/mason-lspconfig.nvim",
  },
}
```

---

## 5. IntelliJ Keymap Configuration

Create `~/.config/nvim/lua/config/keymaps.lua`:

```lua
-- Set leader key (like IntelliJ's Ctrl/Cmd)
vim.g.mapleader = " "
vim.g.maplocalleader = " "

local keymap = vim.keymap.set
local opts = { silent = true }

-- ============================================
-- INTELLIJ IDEA KEYMAP EQUIVALENTS
-- ============================================

-- Project Explorer (Alt+1)
keymap("n", "<A-1>", ":Neotree toggle<CR>", opts)
keymap("n", "<leader>e", ":Neotree toggle<CR>", opts)

-- Navigate to Class (Ctrl+N)
keymap("n", "<C-n>", ":Telescope find_files<CR>", opts)

-- Navigate to File (Ctrl+Shift+N)
keymap("n", "<C-S-n>", ":Telescope find_files<CR>", opts)

-- Find in Files (Ctrl+Shift+F)
keymap("n", "<C-S-f>", ":Telescope live_grep<CR>", opts)

-- Recent Files (Ctrl+E)
keymap("n", "<C-e>", ":Telescope oldfiles<CR>", opts)

-- Go to Declaration (Ctrl+B) - handled by LSP 'gd'
-- Find Usages (Alt+F7) - handled by LSP 'gr'

-- File Structure (Ctrl+F12)
keymap("n", "<C-F12>", ":Telescope lsp_document_symbols<CR>", opts)
keymap("n", "<leader>o", ":Telescope lsp_document_symbols<CR>", opts)

-- Go to Implementation (Ctrl+Alt+B) - handled by LSP 'gi'

-- Navigate Back/Forward (Ctrl+Alt+Left/Right)
keymap("n", "<C-A-Left>", "<C-o>", opts)
keymap("n", "<C-A-Right>", "<C-i>", opts)

-- Quick Fix / Show Intentions (Alt+Enter)
keymap("n", "<A-CR>", vim.lsp.buf.code_action, opts)
keymap("n", "<leader>ca", vim.lsp.buf.code_action, opts)

-- Rename (Shift+F6)
keymap("n", "<S-F6>", vim.lsp.buf.rename, opts)
keymap("n", "<leader>rn", vim.lsp.buf.rename, opts)

-- Reformat Code (Ctrl+Alt+L)
keymap("n", "<C-A-l>", function()
  vim.lsp.buf.format({ async = true })
end, opts)
keymap("n", "<leader>f", function()
  vim.lsp.buf.format({ async = true })
end, opts)

-- Optimize Imports (Ctrl+Alt+O)
keymap("n", "<C-A-o>", ":OrganizeImports<CR>", opts)
keymap("n", "<leader>oi", ":OrganizeImports<CR>", opts)

-- Duplicate Line (Ctrl+D)
keymap("n", "<C-d>", "yyp", opts)

-- Delete Line (Ctrl+Y in IntelliJ, but dd in Vim)
keymap("n", "<C-y>", "dd", opts)

-- Comment Line (Ctrl+/)
keymap("n", "<C-/>", "gcc", { remap = true })
keymap("v", "<C-/>", "gc", { remap = true })
keymap("n", "<leader>/", "gcc", { remap = true })
keymap("v", "<leader>/", "gc", { remap = true })

-- Move Lines Up/Down (Alt+Shift+Up/Down)
keymap("n", "<A-S-Up>", ":m .-2<CR>==", opts)
keymap("n", "<A-S-Down>", ":m .+1<CR>==", opts)
keymap("v", "<A-S-Up>", ":m '<-2<CR>gv=gv", opts)
keymap("v", "<A-S-Down>", ":m '>+1<CR>gv=gv", opts)

-- Select All (Ctrl+A)
keymap("n", "<C-a>", "ggVG", opts)

-- Run (Shift+F10) - will be configured with DAP
keymap("n", "<S-F10>", ":DapContinue<CR>", opts)

-- Debug (Shift+F9)
keymap("n", "<S-F9>", ":DapToggleBreakpoint<CR>", opts)

-- Toggle Breakpoint (Ctrl+F8)
keymap("n", "<C-F8>", ":DapToggleBreakpoint<CR>", opts)

-- Step Over (F8)
keymap("n", "<F8>", ":DapStepOver<CR>", opts)

-- Step Into (F7)
keymap("n", "<F7>", ":DapStepInto<CR>", opts)

-- Step Out (Shift+F8)
keymap("n", "<S-F8>", ":DapStepOut<CR>", opts)

-- Resume Program (F9)
keymap("n", "<F9>", ":DapContinue<CR>", opts)

-- Show Errors (Ctrl+F1)
keymap("n", "<C-F1>", vim.diagnostic.open_float, opts)

-- Next Error (F2)
keymap("n", "<F2>", vim.diagnostic.goto_next, opts)

-- Previous Error (Shift+F2)
keymap("n", "<S-F2>", vim.diagnostic.goto_prev, opts)

-- Terminal (Alt+F12)
keymap("n", "<A-F12>", ":ToggleTerm<CR>", opts)
keymap("n", "<leader>t", ":ToggleTerm<CR>", opts)

-- Close Tab (Ctrl+F4)
keymap("n", "<C-F4>", ":bd<CR>", opts)

-- ============================================
-- BUFFER NAVIGATION (like IntelliJ tabs)
-- ============================================

-- Next/Previous Buffer (Alt+Right/Left)
keymap("n", "<A-Right>", ":BufferLineCycleNext<CR>", opts)
keymap("n", "<A-Left>", ":BufferLineCyclePrev<CR>", opts)

-- Close buffer
keymap("n", "<leader>bd", ":bd<CR>", opts)
keymap("n", "<leader>bD", ":bd!<CR>", opts)

-- ============================================
-- WINDOW NAVIGATION
-- ============================================

-- Navigate windows (Ctrl+h/j/k/l)
keymap("n", "<C-h>", "<C-w>h", opts)
keymap("n", "<C-j>", "<C-w>j", opts)
keymap("n", "<C-k>", "<C-w>k", opts)
keymap("n", "<C-l>", "<C-w>l", opts)

-- Resize windows
keymap("n", "<C-Up>", ":resize +2<CR>", opts)
keymap("n", "<C-Down>", ":resize -2<CR>", opts)
keymap("n", "<C-Left>", ":vertical resize -2<CR>", opts)
keymap("n", "<C-Right>", ":vertical resize +2<CR>", opts)

-- ============================================
-- VISUAL MODE
-- ============================================

-- Stay in indent mode
keymap("v", "<", "<gv", opts)
keymap("v", ">", ">gv", opts)

-- Move text up and down
keymap("v", "J", ":m '>+1<CR>gv=gv", opts)
keymap("v", "K", ":m '<-2<CR>gv=gv", opts)

-- ============================================
-- SEARCH AND REPLACE (like IntelliJ)
-- ============================================

-- Clear search highlight (Escape)
keymap("n", "<Esc>", ":noh<CR>", opts)

-- Find (Ctrl+F) - use / in Vim, or:
keymap("n", "<C-f>", "/", { silent = false })

-- Replace in File (Ctrl+R)
keymap("n", "<C-r>", ":%s/", { silent = false })

-- ============================================
-- GIT (like IntelliJ VCS)
-- ============================================

-- Git status (similar to Alt+9)
keymap("n", "<leader>gs", ":Git<CR>", opts)

-- Git blame
keymap("n", "<leader>gb", ":Git blame<CR>", opts)

-- Git diff
keymap("n", "<leader>gd", ":Gitsigns diffthis<CR>", opts)

-- Stage hunk
keymap("n", "<leader>hs", ":Gitsigns stage_hunk<CR>", opts)

-- Undo stage hunk
keymap("n", "<leader>hu", ":Gitsigns undo_stage_hunk<CR>", opts)

-- Reset hunk
keymap("n", "<leader>hr", ":Gitsigns reset_hunk<CR>", opts)

-- Preview hunk
keymap("n", "<leader>hp", ":Gitsigns preview_hunk<CR>", opts)

-- ============================================
-- UTILITY
-- ============================================

-- Save (Ctrl+S)
keymap("n", "<C-s>", ":w<CR>", opts)
keymap("i", "<C-s>", "<Esc>:w<CR>a", opts)

-- Quit
keymap("n", "<leader>q", ":q<CR>", opts)
keymap("n", "<leader>Q", ":qa!<CR>", opts)

-- Save and quit
keymap("n", "<leader>wq", ":wq<CR>", opts)
```

---

## 6. File Navigation and Search

Create `~/.config/nvim/lua/plugins/telescope.lua`:

```lua
return {
  -- Fuzzy finder (like IntelliJ's search everywhere)
  {
    "nvim-telescope/telescope.nvim",
    tag = "0.1.5",
    dependencies = {
      "nvim-lua/plenary.nvim",
      {
        "nvim-telescope/telescope-fzf-native.nvim",
        build = "make",
      },
    },
    config = function()
      local telescope = require("telescope")
      local actions = require("telescope.actions")

      telescope.setup({
        defaults = {
          prompt_prefix = " ",
          selection_caret = " ",
          path_display = { "truncate" },
          file_ignore_patterns = {
            "node_modules",
            ".git/",
            "target/",
            "build/",
            "*.class",
            "*.jar",
          },
          mappings = {
            i = {
              ["<C-k>"] = actions.move_selection_previous,
              ["<C-j>"] = actions.move_selection_next,
              ["<C-q>"] = actions.send_selected_to_qflist + actions.open_qflist,
            },
          },
        },
        pickers = {
          find_files = {
            theme = "dropdown",
            previewer = false,
            hidden = false,
          },
          live_grep = {
            theme = "ivy",
          },
          buffers = {
            theme = "dropdown",
            previewer = false,
            initial_mode = "normal",
          },
        },
        extensions = {
          fzf = {
            fuzzy = true,
            override_generic_sorter = true,
            override_file_sorter = true,
            case_mode = "smart_case",
          },
        },
      })

      telescope.load_extension("fzf")

      -- Keymaps
      local keymap = vim.keymap.set
      local opts = { silent = true }

      -- Find files (Ctrl+N, Ctrl+Shift+N)
      keymap("n", "<leader>ff", ":Telescope find_files<CR>", opts)
      keymap("n", "<C-p>", ":Telescope find_files<CR>", opts)

      -- Find text (Ctrl+Shift+F)
      keymap("n", "<leader>fg", ":Telescope live_grep<CR>", opts)

      -- Find buffers (Ctrl+E)
      keymap("n", "<leader>fb", ":Telescope buffers<CR>", opts)

      -- Recent files
      keymap("n", "<leader>fo", ":Telescope oldfiles<CR>", opts)

      -- Find help tags
      keymap("n", "<leader>fh", ":Telescope help_tags<CR>", opts)

      -- LSP symbols (Ctrl+F12)
      keymap("n", "<leader>fs", ":Telescope lsp_document_symbols<CR>", opts)

      -- LSP references (Alt+F7)
      keymap("n", "<leader>fr", ":Telescope lsp_references<CR>", opts)

      -- Git files
      keymap("n", "<leader>gf", ":Telescope git_files<CR>", opts)

      -- Git commits
      keymap("n", "<leader>gc", ":Telescope git_commits<CR>", opts)

      -- Git branches
      keymap("n", "<leader>gB", ":Telescope git_branches<CR>", opts)

      -- Commands
      keymap("n", "<leader>fc", ":Telescope commands<CR>", opts)

      -- Keymaps
      keymap("n", "<leader>fk", ":Telescope keymaps<CR>", opts)
    end,
  },
}
```

---

## 7. Code Actions and Refactoring

Create `~/.config/nvim/lua/plugins/completion.lua`:

```lua
return {
  -- Completion (like IntelliJ's code completion)
  {
    "hrsh7th/nvim-cmp",
    event = "InsertEnter",
    dependencies = {
      "hrsh7th/cmp-nvim-lsp",
      "hrsh7th/cmp-buffer",
      "hrsh7th/cmp-path",
      "hrsh7th/cmp-cmdline",
      "saadparwaiz1/cmp_luasnip",
      {
        "L3MON4D3/LuaSnip",
        version = "v2.*",
        build = "make install_jsregexp",
      },
      "rafamadriz/friendly-snippets",
    },
    config = function()
      local cmp = require("cmp")
      local luasnip = require("luasnip")
      require("luasnip.loaders.from_vscode").lazy_load()

      cmp.setup({
        snippet = {
          expand = function(args)
            luasnip.lsp_expand(args.body)
          end,
        },
        window = {
          completion = cmp.config.window.bordered(),
          documentation = cmp.config.window.bordered(),
        },
        mapping = cmp.mapping.preset.insert({
          -- IntelliJ-like completion keybindings
          ["<C-Space>"] = cmp.mapping.complete(), -- Ctrl+Space
          ["<CR>"] = cmp.mapping.confirm({ select = true }), -- Enter
          ["<Tab>"] = cmp.mapping(function(fallback)
            if cmp.visible() then
              cmp.select_next_item()
            elseif luasnip.expand_or_jumpable() then
              luasnip.expand_or_jump()
            else
              fallback()
            end
          end, { "i", "s" }),
          ["<S-Tab>"] = cmp.mapping(function(fallback)
            if cmp.visible() then
              cmp.select_prev_item()
            elseif luasnip.jumpable(-1) then
              luasnip.jump(-1)
            else
              fallback()
            end
          end, { "i", "s" }),
          ["<C-k>"] = cmp.mapping.select_prev_item(),
          ["<C-j>"] = cmp.mapping.select_next_item(),
          ["<C-b>"] = cmp.mapping.scroll_docs(-4),
          ["<C-f>"] = cmp.mapping.scroll_docs(4),
          ["<C-e>"] = cmp.mapping.abort(),
        }),
        sources = cmp.config.sources({
          { name = "nvim_lsp", priority = 1000 },
          { name = "luasnip", priority = 750 },
          { name = "buffer", priority = 500 },
          { name = "path", priority = 250 },
        }),
        formatting = {
          format = function(entry, vim_item)
            -- Add icons like IntelliJ
            local icons = {
              Text = "",
              Method = "",
              Function = "",
              Constructor = "",
              Field = "",
              Variable = "",
              Class = "",
              Interface = "",
              Module = "",
              Property = "",
              Unit = "",
              Value = "",
              Enum = "",
              Keyword = "",
              Snippet = "",
              Color = "",
              File = "",
              Reference = "",
              Folder = "",
              EnumMember = "",
              Constant = "",
              Struct = "",
              Event = "",
              Operator = "",
              TypeParameter = "",
            }
            vim_item.kind = string.format("%s %s", icons[vim_item.kind], vim_item.kind)
            vim_item.menu = ({
              nvim_lsp = "[LSP]",
              luasnip = "[Snippet]",
              buffer = "[Buffer]",
              path = "[Path]",
            })[entry.source.name]
            return vim_item
          end,
        },
      })

      -- Command-line completion
      cmp.setup.cmdline(":", {
        mapping = cmp.mapping.preset.cmdline(),
        sources = cmp.config.sources({
          { name = "path" },
          { name = "cmdline" },
        }),
      })

      -- Search completion
      cmp.setup.cmdline("/", {
        mapping = cmp.mapping.preset.cmdline(),
        sources = {
          { name = "buffer" },
        },
      })
    end,
  },

  -- Code action menu (like IntelliJ's Alt+Enter)
  {
    "weilbith/nvim-code-action-menu",
    cmd = "CodeActionMenu",
  },

  -- Refactoring tools
  {
    "ThePrimeagen/refactoring.nvim",
    dependencies = {
      "nvim-lua/plenary.nvim",
      "nvim-treesitter/nvim-treesitter",
    },
    config = function()
      require("refactoring").setup()

      -- Keymaps
      vim.keymap.set("x", "<leader>re", ":Refactor extract ", { silent = false })
      vim.keymap.set("x", "<leader>rf", ":Refactor extract_to_file ", { silent = false })
      vim.keymap.set("x", "<leader>rv", ":Refactor extract_var ", { silent = false })
      vim.keymap.set({ "n", "x" }, "<leader>ri", ":Refactor inline_var<CR>", { silent = true })
      vim.keymap.set("n", "<leader>rI", ":Refactor inline_func<CR>", { silent = true })
      vim.keymap.set("n", "<leader>rb", ":Refactor extract_block<CR>", { silent = true })
      vim.keymap.set("n", "<leader>rbf", ":Refactor extract_block_to_file<CR>", { silent = true })
    end,
  },
}
```

Create command for organizing imports:

```lua
-- Add to lua/config/autocmds.lua
vim.api.nvim_create_user_command("OrganizeImports", function()
  vim.lsp.buf.code_action({
    context = {
      only = { "source.organizeImports" },
    },
    apply = true,
  })
end, { desc = "Organize imports" })
```

---

## 8. Debugging Setup

Create `~/.config/nvim/lua/plugins/dap.lua`:

```lua
return {
  -- Debug Adapter Protocol (like IntelliJ debugger)
  {
    "mfussenegger/nvim-dap",
    dependencies = {
      "rcarriga/nvim-dap-ui",
      "theHamsta/nvim-dap-virtual-text",
      "nvim-neotest/nvim-nio",
    },
    config = function()
      local dap = require("dap")
      local dapui = require("dapui")

      -- Setup DAP UI
      dapui.setup({
        icons = { expanded = "▾", collapsed = "▸", current_frame = "▸" },
        layouts = {
          {
            elements = {
              { id = "scopes", size = 0.25 },
              { id = "breakpoints", size = 0.25 },
              { id = "stacks", size = 0.25 },
              { id = "watches", size = 0.25 },
            },
            size = 40,
            position = "left",
          },
          {
            elements = {
              { id = "repl", size = 0.5 },
              { id = "console", size = 0.5 },
            },
            size = 10,
            position = "bottom",
          },
        },
      })

      -- Virtual text (show variable values inline)
      require("nvim-dap-virtual-text").setup()

      -- Auto open/close DAP UI
      dap.listeners.after.event_initialized["dapui_config"] = function()
        dapui.open()
      end
      dap.listeners.before.event_terminated["dapui_config"] = function()
        dapui.close()
      end
      dap.listeners.before.event_exited["dapui_config"] = function()
        dapui.close()
      end

      -- Debugger signs (like IntelliJ)
      vim.fn.sign_define("DapBreakpoint", { text = "🔴", texthl = "", linehl = "", numhl = "" })
      vim.fn.sign_define("DapBreakpointCondition", { text = "🟡", texthl = "", linehl = "", numhl = "" })
      vim.fn.sign_define("DapLogPoint", { text = "📝", texthl = "", linehl = "", numhl = "" })
      vim.fn.sign_define("DapStopped", { text = "▶️", texthl = "", linehl = "", numhl = "" })
      vim.fn.sign_define("DapBreakpointRejected", { text = "❌", texthl = "", linehl = "", numhl = "" })

      -- Java debugger configuration
      dap.adapters.java = function(callback)
        callback({
          type = "server",
          host = "127.0.0.1",
          port = 5005,
        })
      end

      dap.configurations.java = {
        {
          type = "java",
          request = "attach",
          name = "Debug (Attach) - Remote",
          hostName = "127.0.0.1",
          port = 5005,
        },
      }

      -- Keymaps (IntelliJ-style)
      local keymap = vim.keymap.set
      local opts = { silent = true }

      -- Toggle breakpoint (Ctrl+F8)
      keymap("n", "<leader>db", dap.toggle_breakpoint, opts)
      keymap("n", "<C-F8>", dap.toggle_breakpoint, opts)

      -- Conditional breakpoint
      keymap("n", "<leader>dB", function()
        dap.set_breakpoint(vim.fn.input("Breakpoint condition: "))
      end, opts)

      -- Continue/Start (F9, Shift+F9)
      keymap("n", "<leader>dc", dap.continue, opts)
      keymap("n", "<F9>", dap.continue, opts)
      keymap("n", "<S-F9>", dap.continue, opts)

      -- Step over (F8)
      keymap("n", "<leader>do", dap.step_over, opts)
      keymap("n", "<F8>", dap.step_over, opts)

      -- Step into (F7)
      keymap("n", "<leader>di", dap.step_into, opts)
      keymap("n", "<F7>", dap.step_into, opts)

      -- Step out (Shift+F8)
      keymap("n", "<leader>dO", dap.step_out, opts)
      keymap("n", "<S-F8>", dap.step_out, opts)

      -- Toggle UI
      keymap("n", "<leader>du", dapui.toggle, opts)

      -- Evaluate expression
      keymap("n", "<leader>de", dapui.eval, opts)
      keymap("v", "<leader>de", dapui.eval, opts)

      -- Terminate
      keymap("n", "<leader>dt", dap.terminate, opts)
    end,
  },

  -- Java debug extension
  {
    "mfussenegger/nvim-jdtls",
    ft = "java",
    dependencies = {
      "mfussenegger/nvim-dap",
    },
  },
}
```

---

## 9. Git Integration

Create `~/.config/nvim/lua/plugins/git.lua`:

```lua
return {
  -- Git integration (like IntelliJ VCS)
  {
    "tpope/vim-fugitive",
    cmd = { "Git", "Gdiffsplit", "Gread", "Gwrite", "Ggrep", "GMove", "GDelete", "GBrowse" },
  },

  -- Git signs (already configured in init.lua)
  -- Shows git changes in gutter

  -- Git diff view
  {
    "sindrets/diffview.nvim",
    dependencies = "nvim-lua/plenary.nvim",
    cmd = { "DiffviewOpen", "DiffviewClose", "DiffviewToggleFiles", "DiffviewFocusFiles" },
    config = function()
      require("diffview").setup()

      -- Keymaps
      vim.keymap.set("n", "<leader>gdo", ":DiffviewOpen<CR>", { silent = true })
      vim.keymap.set("n", "<leader>gdc", ":DiffviewClose<CR>", { silent = true })
      vim.keymap.set("n", "<leader>gdh", ":DiffviewFileHistory<CR>", { silent = true })
      vim.keymap.set("n", "<leader>gdf", ":DiffviewFileHistory %<CR>", { silent = true })
    end,
  },

  -- LazyGit integration (like IntelliJ's Commit window)
  {
    "kdheepak/lazygit.nvim",
    dependencies = {
      "nvim-lua/plenary.nvim",
    },
    cmd = {
      "LazyGit",
      "LazyGitConfig",
      "LazyGitCurrentFile",
      "LazyGitFilter",
      "LazyGitFilterCurrentFile",
    },
    keys = {
      { "<leader>gg", "<cmd>LazyGit<cr>", desc = "LazyGit" },
    },
  },
}
```

---

## 10. Additional IDE Features

Create `~/.config/nvim/lua/plugins/extras.lua`:

```lua
return {
  -- Terminal (like IntelliJ's terminal)
  {
    "akinsho/toggleterm.nvim",
    version = "*",
    config = function()
      require("toggleterm").setup({
        size = 20,
        open_mapping = [[<A-F12>]],
        hide_numbers = true,
        shade_terminals = true,
        shading_factor = 2,
        start_in_insert = true,
        insert_mappings = true,
        terminal_mappings = true,
        persist_size = true,
        direction = "horizontal",
        close_on_exit = true,
        shell = vim.o.shell,
      })

      -- Keymaps
      vim.keymap.set("n", "<leader>th", ":ToggleTerm direction=horizontal<CR>", { silent = true })
      vim.keymap.set("n", "<leader>tv", ":ToggleTerm direction=vertical<CR>", { silent = true })
      vim.keymap.set("n", "<leader>tf", ":ToggleTerm direction=float<CR>", { silent = true })
    end,
  },

  -- TODO comments (like IntelliJ's TODO view)
  {
    "folke/todo-comments.nvim",
    dependencies = { "nvim-lua/plenary.nvim" },
    config = function()
      require("todo-comments").setup()

      -- Keymaps
      vim.keymap.set("n", "<leader>ft", ":TodoTelescope<CR>", { silent = true })
      vim.keymap.set("n", "]t", function()
        require("todo-comments").jump_next()
      end, { silent = true, desc = "Next todo comment" })
      vim.keymap.set("n", "[t", function()
        require("todo-comments").jump_prev()
      end, { silent = true, desc = "Previous todo comment" })
    end,
  },

  -- Trouble (like IntelliJ's Problems view)
  {
    "folke/trouble.nvim",
    dependencies = { "nvim-tree/nvim-web-devicons" },
    config = function()
      require("trouble").setup()

      -- Keymaps
      vim.keymap.set("n", "<leader>xx", ":Trouble diagnostics toggle<CR>", { silent = true })
      vim.keymap.set("n", "<leader>xw", ":Trouble diagnostics toggle filter.buf=0<CR>", { silent = true })
      vim.keymap.set("n", "<leader>xq", ":Trouble qflist toggle<CR>", { silent = true })
      vim.keymap.set("n", "<leader>xl", ":Trouble loclist toggle<CR>", { silent = true })
    end,
  },

  -- Symbols outline (like IntelliJ's Structure view)
  {
    "simrat39/symbols-outline.nvim",
    cmd = "SymbolsOutline",
    config = function()
      require("symbols-outline").setup({
        highlight_hovered_item = true,
        show_guides = true,
        auto_preview = false,
        position = "right",
        relative_width = true,
        width = 25,
      })

      vim.keymap.set("n", "<leader>s", ":SymbolsOutline<CR>", { silent = true })
    end,
  },

  -- Session management (like IntelliJ's workspace)
  {
    "folke/persistence.nvim",
    event = "BufReadPre",
    config = function()
      require("persistence").setup()

      -- Keymaps
      vim.keymap.set("n", "<leader>qs", function()
        require("persistence").load()
      end, { desc = "Restore Session" })
      vim.keymap.set("n", "<leader>ql", function()
        require("persistence").load({ last = true })
      end, { desc = "Restore Last Session" })
      vim.keymap.set("n", "<leader>qd", function()
        require("persistence").stop()
      end, { desc = "Don't Save Current Session" })
    end,
  },

  -- Better UI for LSP (like IntelliJ's popups)
  {
    "nvimdev/lspsaga.nvim",
    event = "LspAttach",
    config = function()
      require("lspsaga").setup({
        lightbulb = {
          enable = true,
          sign = true,
          virtual_text = false,
        },
        symbol_in_winbar = {
          enable = true,
        },
      })

      -- Keymaps
      vim.keymap.set("n", "gh", ":Lspsaga finder<CR>", { silent = true })
      vim.keymap.set("n", "<leader>ca", ":Lspsaga code_action<CR>", { silent = true })
      vim.keymap.set("n", "K", ":Lspsaga hover_doc<CR>", { silent = true })
      vim.keymap.set("n", "<leader>rn", ":Lspsaga rename<CR>", { silent = true })
      vim.keymap.set("n", "gd", ":Lspsaga goto_definition<CR>", { silent = true })
      vim.keymap.set("n", "gp", ":Lspsaga peek_definition<CR>", { silent = true })
      vim.keymap.set("n", "[d", ":Lspsaga diagnostic_jump_prev<CR>", { silent = true })
      vim.keymap.set("n", "]d", ":Lspsaga diagnostic_jump_next<CR>", { silent = true })
    end,
    dependencies = {
      "nvim-treesitter/nvim-treesitter",
      "nvim-tree/nvim-web-devicons",
    },
  },
}
```

Create `~/.config/nvim/lua/plugins/treesitter.lua`:

```lua
require("nvim-treesitter.configs").setup({
  ensure_installed = {
    "java",
    "kotlin",
    "lua",
    "vim",
    "vimdoc",
    "python",
    "javascript",
    "typescript",
    "json",
    "yaml",
    "xml",
    "markdown",
    "markdown_inline",
    "bash",
    "regex",
  },
  auto_install = true,
  highlight = {
    enable = true,
    additional_vim_regex_highlighting = false,
  },
  indent = {
    enable = true,
  },
  incremental_selection = {
    enable = true,
    keymaps = {
      init_selection = "<C-space>",
      node_incremental = "<C-space>",
      scope_incremental = false,
      node_decremental = "<bs>",
    },
  },
  textobjects = {
    select = {
      enable = true,
      lookahead = true,
      keymaps = {
        ["af"] = "@function.outer",
        ["if"] = "@function.inner",
        ["ac"] = "@class.outer",
        ["ic"] = "@class.inner",
      },
    },
    move = {
      enable = true,
      set_jumps = true,
      goto_next_start = {
        ["]m"] = "@function.outer",
        ["]]"] = "@class.outer",
      },
      goto_next_end = {
        ["]M"] = "@function.outer",
        ["]["] = "@class.outer",
      },
      goto_previous_start = {
        ["[m"] = "@function.outer",
        ["[["] = "@class.outer",
      },
      goto_previous_end = {
        ["[M"] = "@function.outer",
        ["[]"] = "@class.outer",
      },
    },
  },
})
```

---

## 11. Complete Configuration

Create `~/.config/nvim/lua/config/autocmds.lua`:

```lua
-- Autocommands (like IntelliJ's file watchers)

local autocmd = vim.api.nvim_create_autocmd
local augroup = vim.api.nvim_create_augroup

-- Highlight on yank (visual feedback)
autocmd("TextYankPost", {
  group = augroup("highlight_yank", { clear = true }),
  callback = function()
    vim.highlight.on_yank({ higroup = "IncSearch", timeout = 200 })
  end,
})

-- Auto format on save (like IntelliJ's auto-format)
autocmd("BufWritePre", {
  group = augroup("auto_format", { clear = true }),
  pattern = { "*.java", "*.kt", "*.lua", "*.py", "*.js", "*.ts" },
  callback = function()
    vim.lsp.buf.format({ async = false })
  end,
})

-- Close certain filetypes with 'q'
autocmd("FileType", {
  group = augroup("close_with_q", { clear = true }),
  pattern = {
    "qf",
    "help",
    "man",
    "notify",
    "lspinfo",
    "startuptime",
  },
  callback = function(event)
    vim.bo[event.buf].buflisted = false
    vim.keymap.set("n", "q", "<cmd>close<cr>", { buffer = event.buf, silent = true })
  end,
})

-- Auto create directories when saving file
autocmd("BufWritePre", {
  group = augroup("auto_create_dir", { clear = true }),
  callback = function(event)
    if event.match:match("^%w%w+://") then
      return
    end
    local file = vim.loop.fs_realpath(event.match) or event.match
    vim.fn.mkdir(vim.fn.fnamemodify(file, ":p:h"), "p")
  end,
})

-- Organize imports command
vim.api.nvim_create_user_command("OrganizeImports", function()
  vim.lsp.buf.code_action({
    context = {
      only = { "source.organizeImports" },
    },
    apply = true,
  })
end, { desc = "Organize imports" })

-- Restore cursor position
autocmd("BufReadPost", {
  group = augroup("restore_cursor", { clear = true }),
  callback = function()
    local mark = vim.api.nvim_buf_get_mark(0, '"')
    local lcount = vim.api.nvim_buf_line_count(0)
    if mark[1] > 0 and mark[1] <= lcount then
      pcall(vim.api.nvim_win_set_cursor, 0, mark)
    end
  end,
})

-- Check if file changed outside of Neovim
autocmd({ "FocusGained", "TermClose", "TermLeave" }, {
  group = augroup("checktime", { clear = true }),
  command = "checktime",
})
```

---

## Quick Start Guide

1. **Install Neovim 0.9+**
   ```bash
   # Ubuntu/Debian
   sudo apt install neovim

   # macOS
   brew install neovim

   # From source (latest)
   git clone https://github.com/neovim/neovim
   cd neovim && make CMAKE_BUILD_TYPE=Release
   sudo make install
   ```

2. **Backup existing config**
   ```bash
   mv ~/.config/nvim ~/.config/nvim.backup
   ```

3. **Clone the configuration** (or create files manually as shown above)

4. **First launch**
   ```bash
   nvim
   ```
   - Lazy.nvim will auto-install
   - All plugins will be downloaded
   - LSP servers will be installed via Mason

5. **Install LSP servers manually (if needed)**
   ```
   :Mason
   ```
   - Search and install: `jdtls`, `kotlin_language_server`, `lua_ls`

6. **Verify installation**
   ```
   :checkhealth
   ```

---

## IntelliJ IDEA Keymap Reference

| IntelliJ Action | IntelliJ Key | Neovim Key | Command |
|-----------------|--------------|------------|---------|
| **Navigation** |
| Go to Class | `Ctrl+N` | `Ctrl+N` | `:Telescope find_files` |
| Go to File | `Ctrl+Shift+N` | `Ctrl+Shift+N` | `:Telescope find_files` |
| Find in Files | `Ctrl+Shift+F` | `Ctrl+Shift+F` | `:Telescope live_grep` |
| Recent Files | `Ctrl+E` | `Ctrl+E` | `:Telescope oldfiles` |
| File Structure | `Ctrl+F12` | `Ctrl+F12` | `:Telescope lsp_document_symbols` |
| Go to Declaration | `Ctrl+B` | `gd` | `vim.lsp.buf.definition` |
| Go to Implementation | `Ctrl+Alt+B` | `gi` | `vim.lsp.buf.implementation` |
| Find Usages | `Alt+F7` | `gr` | `vim.lsp.buf.references` |
| Navigate Back | `Ctrl+Alt+Left` | `Ctrl+Alt+Left` | `<C-o>` |
| Navigate Forward | `Ctrl+Alt+Right` | `Ctrl+Alt+Right` | `<C-i>` |
| **Editing** |
| Code Completion | `Ctrl+Space` | `Ctrl+Space` | Auto-trigger |
| Quick Fix | `Alt+Enter` | `Alt+Enter` | `vim.lsp.buf.code_action` |
| Rename | `Shift+F6` | `Shift+F6` | `vim.lsp.buf.rename` |
| Format Code | `Ctrl+Alt+L` | `Ctrl+Alt+L` | `vim.lsp.buf.format` |
| Optimize Imports | `Ctrl+Alt+O` | `Ctrl+Alt+O` | `:OrganizeImports` |
| Duplicate Line | `Ctrl+D` | `Ctrl+D` | `yyp` |
| Delete Line | `Ctrl+Y` | `Ctrl+Y` | `dd` |
| Comment Line | `Ctrl+/` | `Ctrl+/` | `gcc` |
| Move Line Up | `Alt+Shift+Up` | `Alt+Shift+Up` | `:m .-2` |
| Move Line Down | `Alt+Shift+Down` | `Alt+Shift+Down` | `:m .+1` |
| **Debugging** |
| Toggle Breakpoint | `Ctrl+F8` | `Ctrl+F8` | `:DapToggleBreakpoint` |
| Debug | `Shift+F9` | `Shift+F9` | `:DapContinue` |
| Run | `Shift+F10` | `Shift+F10` | `:DapContinue` |
| Step Over | `F8` | `F8` | `:DapStepOver` |
| Step Into | `F7` | `F7` | `:DapStepInto` |
| Step Out | `Shift+F8` | `Shift+F8` | `:DapStepOut` |
| Resume | `F9` | `F9` | `:DapContinue` |
| **Windows** |
| Project View | `Alt+1` | `Alt+1` | `:Neotree toggle` |
| Terminal | `Alt+F12` | `Alt+F12` | `:ToggleTerm` |
| Problems View | - | `<leader>xx` | `:Trouble` |
| Next Tab | `Alt+Right` | `Alt+Right` | `:BufferLineCycleNext` |
| Previous Tab | `Alt+Left` | `Alt+Left` | `:BufferLineCyclePrev` |
| Close Tab | `Ctrl+F4` | `Ctrl+F4` | `:bd` |
| **VCS** |
| VCS Popup | `Alt+\`` | `<leader>gg` | `:LazyGit` |
| Commit | `Ctrl+K` | `<leader>gc` | Git commit |
| Diff | - | `<leader>gd` | `:Gitsigns diffthis` |

---

## Customization Tips

### Change Leader Key

In `lua/config/keymaps.lua`:
```lua
vim.g.mapleader = ","  -- Change space to comma
```

### Add Custom Color Scheme

```lua
-- In lua/plugins/init.lua
{
  "navarasu/onedark.nvim",
  config = function()
    require("onedark").setup({
      style = "darker"
    })
    vim.cmd([[colorscheme onedark]])
  end,
}
```

### Java-specific Configuration

Create `~/.config/nvim/ftplugin/java.lua`:
```lua
local jdtls = require('jdtls')

local config = {
  cmd = {
    'java',
    '-Declipse.application=org.eclipse.jdt.ls.core.id1',
    '-Dosgi.bundles.defaultStartLevel=4',
    '-Declipse.product=org.eclipse.jdt.ls.core.product',
    '-Dlog.protocol=true',
    '-Dlog.level=ALL',
    '-jar', vim.fn.glob('~/.local/share/nvim/mason/packages/jdtls/plugins/org.eclipse.equinox.launcher_*.jar'),
    '-configuration', vim.fn.expand('~/.local/share/nvim/mason/packages/jdtls/config_linux'),
    '-data', vim.fn.expand('~/.cache/jdtls-workspace') .. vim.fn.getcwd(),
  },
  root_dir = jdtls.setup.find_root({'.git', 'mvnw', 'gradlew', 'pom.xml', 'build.gradle'}),
  settings = {
    java = {
      signatureHelp = { enabled = true },
      contentProvider = { preferred = 'fernflower' },
    }
  },
  init_options = {
    bundles = {}
  },
}

jdtls.start_or_attach(config)
```

---

## Troubleshooting

### LSP not working

1. Check LSP status: `:LspInfo`
2. Check Mason: `:Mason`
3. Check logs: `:lua vim.cmd('e'..vim.lsp.get_log_path())`
4. Reinstall server: `:MasonUninstall jdtls` then `:MasonInstall jdtls`

### Keymaps not working

1. Check keymap: `:map <key>`
2. Check which-key: `<leader>` then wait
3. Check for conflicts: `:verbose map <key>`

### Performance issues

1. Disable unused plugins in `lazy.nvim`
2. Use `:Lazy profile` to check slow plugins
3. Reduce `updatetime`: `vim.opt.updatetime = 500`

### Clipboard not working

```bash
# Install clipboard tool
# Ubuntu
sudo apt install xclip

# macOS (built-in)
# Windows - use WSL with win32yank
```

---

## Conclusion

You now have a fully configured Neovim setup that mimics IntelliJ IDEA's keymaps and functionality. This configuration provides:

✅ **IntelliJ-like keybindings** for familiar muscle memory
✅ **LSP integration** for Java/Kotlin with intelligent code completion
✅ **Fuzzy finding** for navigation (files, symbols, grep)
✅ **Debugging support** with DAP
✅ **Git integration** similar to IntelliJ VCS
✅ **Refactoring tools** (rename, extract, inline)
✅ **Terminal integration**
✅ **Code actions** and quick fixes

### Next Steps

- Customize colors and theme to your preference
- Add project-specific configurations
- Explore additional plugins for your workflow
- Learn more Vim motions to boost productivity
- Consider using [IdeaVim](https://github.com/JetBrains/ideavim) in IntelliJ with same keymaps for consistency

Happy coding! 🚀
