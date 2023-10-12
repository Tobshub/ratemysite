import z from "zod";

export const alphaNumericString = (name: string) =>
  z.string().regex(/^[a-zA-Z0-9_]+$/, {
    message: `${name} must contain only letters, numbers or underscores`,
  });
