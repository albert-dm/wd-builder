import type React from "react";
import { z } from "zod";
import type { ExtendedComponent } from "../../types/component";
import style from "./nav-item.module.css";

const NavItemZodSchema = z.object({
  href: z.string(),
  children: z.custom<React.ReactNode>(),
  active: z.boolean().optional(),
});

type NavItemProps = z.infer<typeof NavItemZodSchema>;

export const NavItem: ExtendedComponent = ({
  href,
  children,
  active = false,
}: NavItemProps) => {
  const className = active ? `${style.navItem} ${style.active}` : style.navItem;

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
};

NavItem.defaultProps = {
  href: "#",
  active: false,
};

NavItem.zodSchema = NavItemZodSchema;
