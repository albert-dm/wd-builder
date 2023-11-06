import React, { useEffect } from "react";
import style from "./toolbar.module.css";

type HandleProps = {
  setPosition: (left: number, top: number) => void;
};

export const Handle = ({ setPosition }: HandleProps) => {
  const handleRef = React.useRef<HTMLButtonElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleMouseDown = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setIsDragging(true);
  };

  const handleMouseUp = (
    e: MouseEvent
  ) => {
    setIsDragging(false);
  };

  const handleMouseMove = (
    e: MouseEvent
  ) => {
    if (isDragging) {
      setPosition(e.clientX -70, e.clientY - 10);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    }
  }, [isDragging]);

  return (
    <button
      className={style.handle}
      aria-label="handle"
      ref={handleRef}
      onMouseDown={handleMouseDown}
    />
  );
};
