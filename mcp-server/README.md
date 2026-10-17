# MobiCure MCP Server

Build the server:

```bash
cd /workspaces/mobicure/mcp-server
npm install
npm run build
```

Add the server to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mobicure": {
      "command": "node",
      "args": ["/workspaces/mobicure/mcp-server/dist/index.js"]
    }
  }
}
```

The server provides APK, URL, email, image metadata, network, and Gemma threat explanation tools. Run `ollama run gemma2:2b` to enable local Gemma explanations.
