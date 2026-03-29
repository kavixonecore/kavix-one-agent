/**
 * Discriminates base CRUD templates from pluggable addon templates.
 */
export const TemplateType = {
  BASE: "base",
  ADDON: "addon",
} as const;

export type TemplateType = (typeof TemplateType)[keyof typeof TemplateType];
