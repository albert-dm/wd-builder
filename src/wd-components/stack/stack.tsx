import clsx from "clsx";
import React from "react";

import style from "./stack.module.css";

interface StackProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  gap?: number;
}

export const Stack = ({ children, fullWidth, gap }: StackProps) => {
  return (
    <div className={clsx({
      [style['stack-wrapper']]: true,
      [style['stack-full-width']]: fullWidth,
    })}

    style={{
      gap: `${gap}rem`,
    }}
    >
      {children}
    </div>
  );
}

Stack.defaultProps = {
  fullWidth: false,
  gap: 1,
};