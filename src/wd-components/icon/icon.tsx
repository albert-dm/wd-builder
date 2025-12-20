import type { FC } from "react";
import { z } from "zod";
import type { ExtendedComponent } from "../../types/component";
import style from "./icon.module.css";
import {
  DropIconSVG,
  FigmaIconSVG,
  GithubIconSVG,
  LinkedinIconSVG,
  MenuIconSVG,
  MoonIconSVG,
  PictureIconSVG,
  SunIconSVG,
  WdIconSVG,
} from "./icons";

const IconMap: Record<string, FC> = {
  MenuIconSVG,
  GithubIconSVG,
  LinkedinIconSVG,
  FigmaIconSVG,
  DropIconSVG,
  MoonIconSVG,
  SunIconSVG,
  WdIconSVG,
  PictureIconSVG,
};

export type IconName = keyof typeof IconMap;

const iconNames = Object.keys(IconMap);

const IconZodSchema = z.object({
  className: z.string().optional(),
  icon: z.string().refine((icon) => iconNames.includes(icon)),
});

type IconProps = z.infer<typeof IconZodSchema>;

export const Icon: ExtendedComponent = ({ className, icon }: IconProps) => {
  const IconSvgComponent = IconMap[icon];
  if (!IconSvgComponent) {
    return null;
  }
  return (
    <i className={`${className} ${style.icon}`}>
      <IconSvgComponent />
    </i>
  );
};

Icon.zodSchema = IconZodSchema;

Icon.defaultProps = {
  className: "",
  icon: "MenuIconSVG",
} as IconProps;
