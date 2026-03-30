export function parseFlags(
  args: string[],
  expectedFlags: string[],
): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg?.startsWith("--")) continue;
    const flagName = arg.slice(2);
    if (!expectedFlags.includes(flagName)) continue;
    const value = args[i + 1];
    if (value !== undefined && !value.startsWith("--")) {
      result[flagName] = value;
      i++;
    }
  }
  return result;
}
