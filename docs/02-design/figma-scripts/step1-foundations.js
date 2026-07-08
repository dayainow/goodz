// Figma MCP use_figma — Step 1: Pages + Variables + Foundations board
// fileKey: nSXrd57yOCBdQEuSxn7evI

const pageNames = ["🎨 Foundations", "🧩 Components", "📱 Screens"];
const createdPageIds = [];
const defaultPage = figma.root.children[0];
defaultPage.name = pageNames[0];
createdPageIds.push(defaultPage.id);
for (let i = 1; i < pageNames.length; i++) {
  const p = figma.createPage();
  p.name = pageNames[i];
  createdPageIds.push(p.id);
}
await figma.setCurrentPageAsync(defaultPage);

const collection = figma.variables.createVariableCollection("Goodz / Colors");
const modeId = collection.modes[0].modeId;
const vars = [
  { name: "color/primary", value: { r: 0.486, g: 0.227, b: 0.929 }, scopes: ["SHAPE_FILL", "FRAME_FILL", "STROKE_COLOR"] },
  { name: "color/primary-hover", value: { r: 0.427, g: 0.157, b: 0.851 }, scopes: ["SHAPE_FILL", "FRAME_FILL"] },
  { name: "color/surface", value: { r: 0.973, g: 0.98, b: 0.988 }, scopes: ["FRAME_FILL", "SHAPE_FILL"] },
  { name: "color/text", value: { r: 0.059, g: 0.09, b: 0.165 }, scopes: ["TEXT_FILL"] },
  { name: "color/text-muted", value: { r: 0.392, g: 0.455, b: 0.545 }, scopes: ["TEXT_FILL"] },
  { name: "color/border", value: { r: 0.886, g: 0.91, b: 0.941 }, scopes: ["STROKE_COLOR"] },
  { name: "color/danger", value: { r: 0.863, g: 0.149, b: 0.149 }, scopes: ["SHAPE_FILL", "TEXT_FILL"] },
];
const variableIds = [];
for (const v of vars) {
  const variable = figma.variables.createVariable(v.name, collection, "COLOR");
  variable.scopes = v.scopes;
  variable.setValueForMode(modeId, v.value);
  variableIds.push(variable.id);
}

const spacingCollection = figma.variables.createVariableCollection("Goodz / Spacing");
const spacingMode = spacingCollection.modes[0].modeId;
for (const s of [
  { name: "space/4", value: 4 },
  { name: "space/8", value: 8 },
  { name: "space/12", value: 12 },
  { name: "space/16", value: 16 },
  { name: "space/24", value: 24 },
  { name: "space/32", value: 32 },
]) {
  const variable = figma.variables.createVariable(s.name, spacingCollection, "FLOAT");
  variable.scopes = ["GAP", "WIDTH_HEIGHT", "CORNER_RADIUS"];
  variable.setValueForMode(spacingMode, s.value);
  variableIds.push(variable.id);
}

await figma.loadFontAsync({ family: "Inter", style: "Bold" });
const title = figma.createText();
title.characters = "Goodz Design System";
title.fontSize = 32;
title.x = 80;
title.y = 80;

await figma.loadFontAsync({ family: "Inter", style: "Regular" });
const subtitle = figma.createText();
subtitle.characters = "violet 포인트 · 375px mobile · maps to @goodz/ui";
subtitle.fontSize = 16;
subtitle.x = 80;
subtitle.y = 128;
subtitle.fills = [{ type: "SOLID", color: { r: 0.392, g: 0.455, b: 0.545 } }];

return { createdPageIds, variableIds };
