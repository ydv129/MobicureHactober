export const config = {
  imageScannerUrl: process.env.IMAGE_SCANNER_URL || "http://127.0.0.1:8004",
  ollamaUrl: process.env.OLLAMA_URL || "http://127.0.0.1:11434",
  ollamaModel: process.env.OLLAMA_MODEL || "gemma3:1b",
}
