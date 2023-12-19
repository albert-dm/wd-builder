import React, { useMemo } from "react";
import style from "./row.module.css";
import { z } from "zod";
import clsx from "clsx";

const RowZodSchema = z.object({
  children: z.any(),
  verticalAlignment: z.string().optional().or(z.literal('top')).or(z.literal('center')).or(z.literal('bottom')),
  horizontalAlignment: z.string().optional().or(z.literal('left')).or(z.literal('center')).or(z.literal('right')),
  gap: z.number().optional(),
  fullHeight: z.boolean().optional(),
});

type RowProps = z.infer<typeof RowZodSchema>;

export const Row = ({ children, verticalAlignment, horizontalAlignment, gap, fullHeight }: RowProps) => {
  // TODO: geração do estilo dessa forma nao tá funcionando
  const verticalAlignmentClass = style[`row-vertical-${verticalAlignment}`];
  const horizontalAlignmentClass = style[`row-horizontal-${horizontalAlignment}}`];
  return (
    <div className={clsx({
      [style['row-wrapper']]: true,
      [verticalAlignmentClass]: true,
      [horizontalAlignmentClass]: true,
      [style['row-full-height']]: fullHeight,
    })}

    style={{
      gap: `${gap}rem`,
    }}
    >
      {children}
    </div>
  );
}

Row.defaultProps = {
  verticalAlignment: 'top',
  horizontalAlignment: 'left',
  gap: 1,
  pageHeight: false,
};

Row.zodSchema = RowZodSchema;