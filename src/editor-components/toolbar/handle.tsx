import { useCallback, useEffect, useRef, useState } from "react";
import style from "./toolbar.module.css";

type HandleProps = {
  setPosition: (left: number, top: number) => void;
};

export const Handle = ({ setPosition }: HandleProps) => {
  const handleRef = useRef<HTMLButtonElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        setPosition(e.clientX - 70, e.clientY - 10);
      }
    },
    [isDragging, setPosition],
  );

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <button
      type="button"
      className={style.handle}
      aria-label="handle"
      ref={handleRef}
      onMouseDown={() => setIsDragging(true)}
    />
  );
};
