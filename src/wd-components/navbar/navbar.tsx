import type React from "react";
import { z } from "zod";
import type { ExtendedComponent } from "../../types/component";
import style from "./navbar.module.css";

const NavbarZodSchema = z.object({
  children: z.custom<React.ReactNode>(),
});

type NavbarProps = z.infer<typeof NavbarZodSchema>;

export const Navbar: ExtendedComponent = ({ children }: NavbarProps) => {
  return <nav className={style.navbar}>{children}</nav>;
};

Navbar.defaultProps = {};

Navbar.zodSchema = NavbarZodSchema;
