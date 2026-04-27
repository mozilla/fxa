# .vscode

This directory does not ship a workspace `extensions.json`. Extension choice is
left to each contributor — install whichever you find useful, from whichever
marketplace you trust, and verify the publisher before installing.

## Extensions you may find useful

- Prettier (`esbenp.prettier-vscode`) — code formatting; matches `.vscode/settings.json`
- Docker (`ms-azuretools.vscode-docker`)
- Live Share (`ms-vsliveshare.vsliveshare`)
- GitHub Pull Requests (`github.vscode-pull-request-github`)
- GitHub Markdown Preview (`bierner.github-markdown-preview`)
- Firefox Debugger (`firefox-devtools.vscode-firefox-debug`) — required for the "Attach to Firefox" launch config
- Playwright (`ms-playwright.playwright`) — picks up `playwright.env` from `settings.json`
- Jest (`Orta.vscode-jest`) — picks up `jest.jestCommandLine` from `settings.json`

## Debugging PM2-managed processes

The "Attach to PM2" launch config uses VS Code's built-in `node` debugger and
the `PickProcess` command — no extension required.

1. Start the service with the Node inspector enabled:
   `pm2 start app.js --node-args="--inspect"`
2. From the Run and Debug panel, pick "Attach to PM2" and select the process.
3. For process listing/monitoring, use the PM2 CLI: `pm2 list`, `pm2 logs`,
   `pm2 monit`.
