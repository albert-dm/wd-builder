import type React from "react";
import { z } from "zod";
import type { WdComponent } from "../../types";
import style from "./navbar.module.css";

const NavbarZodSchema = z.object({
  children: z.custom<React.ReactNode>(),
});

type NavbarProps = z.infer<typeof NavbarZodSchema>;

export const Navbar: WdComponent = ({ children }: NavbarProps) => {
  return <nav className={style.navbar}>{children}</nav>;
};

Navbar.defaults = {};

Navbar.zodSchema = NavbarZodSchema;
