const fs = require("fs");

const colorTokensPath = "./color-tokens.json";
const fontTokensPath = "./design-tokens.tokens.json";
const outputCssPath = "./tokens.css";

// Read files
const colorTokensRaw = fs.readFileSync(colorTokensPath, "utf8");
const fontTokensRaw = fs.readFileSync(fontTokensPath, "utf8");

const colorTokens = JSON.parse(colorTokensRaw);
const fontTokens = JSON.parse(fontTokensRaw);

// Helper to resolve color references
function resolveColorReference(value, fullTokens) {
  if (typeof value === "string" && value.startsWith("{") && value.endsWith("}")) {
    const path = value.slice(1, -1).split(".");
    let current = fullTokens;
    for (const key of path) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        console.warn(`Warning: Could not resolve reference ${value}`);
        // If reference not found, return the original string
        return value;
      }
    }
    // Recursively resolve if the target is also a reference
    return resolveColorReference(current, fullTokens);
  }
  return value;
}

// Convert camelCase or spaces to kebab-case
function toKebabCase(str) {
  return (
    str
      .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2")
      .replace(/\s+/g, "-")
      .toLowerCase()
      // clean up multiple dashes just in case
      .replace(/-+/g, "-")
      .replace(/^-/, "")
  );
}

let cssContent = "/* Auto-generated Design Tokens */\n\n";
cssContent += ":root {\n";
cssContent += "  /* Typography Tokens */\n";

function processFontTokens(obj, prefix = "") {
  for (const [key, item] of Object.entries(obj)) {
    if (item && item.value) {
      const tokenName = prefix ? `${prefix}-${toKebabCase(key)}` : toKebabCase(key);
      const val = item.value;
      for (const [prop, propValue] of Object.entries(val)) {
        const cssPropName = toKebabCase(prop);
        let cssValue = propValue;
        // Add px to numeric values that typically need it
        if (
          [
            "fontSize",
            "lineHeight",
            "letterSpacing",
            "paragraphIndent",
            "paragraphSpacing",
          ].includes(prop) &&
          typeof cssValue === "number"
        ) {
          if (cssValue !== 0) {
            cssValue += "px";
          }
        }
        cssContent += `  --font-${tokenName}-${cssPropName}: ${cssValue};\n`;
      }
    } else if (item && typeof item === "object") {
      const newPrefix = prefix ? `${prefix}-${toKebabCase(key)}` : toKebabCase(key);
      processFontTokens(item, newPrefix);
    }
  }
}

if (fontTokens.font) {
  processFontTokens(fontTokens.font);
}

cssContent += "\n  /* Color Tokens (Light Theme) */\n";

if (colorTokens.color && colorTokens.color.role && colorTokens.color.role.light) {
  const lightRoles = colorTokens.color.role.light;
  for (const [role, value] of Object.entries(lightRoles)) {
    const resolvedValue = resolveColorReference(value, colorTokens);
    const cssVarName = toKebabCase(role);
    cssContent += `  --color-${cssVarName}: ${resolvedValue};\n`;
  }
}

cssContent += "}\n\n";

cssContent += '[data-theme="dark"] {\n';
cssContent += "  /* Color Tokens (Dark Theme) */\n";

if (colorTokens.color && colorTokens.color.role && colorTokens.color.role.dark) {
  const darkRoles = colorTokens.color.role.dark;
  for (const [role, value] of Object.entries(darkRoles)) {
    const resolvedValue = resolveColorReference(value, colorTokens);
    const cssVarName = toKebabCase(role);
    cssContent += `  --color-${cssVarName}: ${resolvedValue};\n`;
  }
}

cssContent += "}\n";

fs.writeFileSync(outputCssPath, cssContent);
console.log(`Successfully generated CSS tokens in ${outputCssPath}`);
