import type React from "react";
import { z } from "zod";
import type { WdComponent } from "../../types";
import style from "./container.module.css";

const ContainerZodSchema = z.object({
  children: z.custom<React.ReactNode>(),
});

export const Container: WdComponent = ({ children }) => {
  return <main className={style.contentGrid}>{children}</main>;
};

Container.zodSchema = ContainerZodSchema;
Container.defaults = {};
