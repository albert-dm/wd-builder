import { z } from "zod";
import type { ExtendedComponent } from "../../types/component";

const PageZodSchema = z.object({
  children: z.any(),
  className: z.string().optional(),
});

export type PageProps = z.infer<typeof PageZodSchema>;

export const Page: ExtendedComponent = ({ children, className }: PageProps) => {
  return <main className={className}>{children}</main>;
};

Page.defaultProps = {
  className: "",
};

Page.zodSchema = PageZodSchema;
