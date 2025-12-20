import type React from "react";
import { z } from "zod";
import type { ExtendedComponent } from "../../types/component";
import style from "./side-bar.module.css";

const SideBarZodSchema = z.object({
  children: z.custom<React.ReactNode>(),
});

type SideBarProps = z.infer<typeof SideBarZodSchema>;

export const SideBar: ExtendedComponent = ({ children }: SideBarProps) => {
  return <aside className={style.sideBar}>{children}</aside>;
};

SideBar.defaultProps = {};

SideBar.zodSchema = SideBarZodSchema;
