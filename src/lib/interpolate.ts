/**
 * Replace {{variableName}} placeholders in a template string with values from
 * the provided variables map. Unknown variables are left as-is.
 *
 * @example
 * interpolate("https://{{baseUrl}}/api", { baseUrl: "example.com" })
 * // => "https://example.com/api"
 */
export function interpolate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return key in variables ? variables[key] : match;
  });
}
