import React from 'react';
import { ExtendedComponent } from '../../types/component';

import style from './section.module.css';

type ContainerType = 'default' | 'full' | 'breakout';

export interface SectionProps {
  containerType: ContainerType;
  children: React.ReactNode;
  className?: string;
}

export const Section: ExtendedComponent = ({ containerType, children, className }: SectionProps) => {
  const containerClassName = style[containerType] ?? '';

  return (
    <section className={`${className} ${containerClassName}`}>
      {children}
    </section>
  );
};

Section.defaultProps = {
  containerType: 'default',
};
