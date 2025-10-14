# 🧩 ST-Handlers

> Centralized handler repository for **[ST-BOT](https://github.com/sheikhtamimlover/ST-BOT)** —  
> a modular storage system for all **commands**, **events**, and **API handlers** used by the bot.

---

## 📦 Overview

**ST-Handlers** is the official companion repository for **ST-BOT**, created and maintained by **Sheikh Tamim**.  
It serves as a **modular storage hub**, containing all the building blocks that power the bot’s runtime behavior — such as:

- 🔹 Commands (`cmds`)
- 🔹 Events (`events`)
- 🔹 API Handlers (`api`)
- 🔹 Utilities or middleware (optional)

This modular separation helps keep **ST-BOT** lightweight and allows hot updates or remote fetch of modules without redeploying the bot core.

---

## 🗂 Folder Structure

```bash
ST-Handlers/
│
├── cmds/          # All bot commands (.js files)
│   ├── fun/
│   ├── tools/
│   ├── ai/
│   └── system/
│
├── events/        # Messenger event handlers (e.g., message, react, join)
│   ├── onMessage.js
│   ├── onReact.js
│   └── onJoin.js
│
├── api/           # Web or internal API endpoints for dashboard or modules
│   ├── dashboard.js
│   └── stats.js
│
└── README.md
