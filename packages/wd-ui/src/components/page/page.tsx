import { z } from "zod";
import type { WdComponent } from "../../types";

const PageZodSchema = z.object({
  children: z.any(),
  className: z.string().optional(),
});

export type PageProps = z.infer<typeof PageZodSchema>;

export const Page: WdComponent = ({ children, className }: PageProps) => {
  return <main className={className}>{children}</main>;
};

Page.defaults = {
  className: "",
};

Page.zodSchema = PageZodSchema;
