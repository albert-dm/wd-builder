import React from 'react';
import * as Icons from './icons';
import style from './icon.module.css';
import { z } from 'zod';
import { ExtendedComponent } from '../../types/component';

const iconNames = [...Object.keys(Icons)] as const;

const IconZodSchema = z.object({
  className: z.string().optional(),
  icon: z.string().refine((icon) => iconNames.includes(icon)),
});

type IconProps = z.infer<typeof IconZodSchema>;

export const Icon: ExtendedComponent = ({ className, icon }: IconProps) => {
  const IconSvgComponent = Icons[icon as keyof typeof Icons];
  return <i className={`${className} ${style.icon}`}>
    <IconSvgComponent />
  </i>
};

Icon.zodSchema = IconZodSchema;

Icon.defaultProps = {
  className: '',
  icon: 'MenuIconSVG'
} as IconProps;