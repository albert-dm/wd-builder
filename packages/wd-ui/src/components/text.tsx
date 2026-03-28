import { z } from "zod";
import type { WdComponent } from "../types";

const TextZodSchema = z.object({
  value: z.string(),
  type: z.enum(["h1", "h2", "h3", "h4", "p", "span"]),
});

type TextProps = z.infer<typeof TextZodSchema>;

export const Text: WdComponent = ({ value, type }: TextProps) => {
  const Component = type;
  return <Component>{value}</Component>;
};

Text.defaults = {
  value: "Text",
  type: "p",
};

Text.zodSchema = TextZodSchema;
