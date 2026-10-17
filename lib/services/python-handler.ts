/**
 * Python Handler Utility
 * Shared function for all Python API integrations
 * Provides fallback implementations when Python bridge is unavailable
 */

export async function callPythonHandler<T extends object, R = unknown>(
  modulePath: string,
  requestBody: T,
): Promise<R | null> {
  try {
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://127.0.0.1:3001";
    const response = await fetch(`${pythonServiceUrl}/api/python`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        module: modulePath,
        body: requestBody,
      }),
    }).catch(() => null);

    if (response) {
      return (await response.json()) as R;
    }
  } catch (err) {
    // Silently fail and return null to trigger fallback
  }

  return null;
}
