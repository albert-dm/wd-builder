import { MenuIconSVG } from './menu-icon';
import style from './icon.module.css';

type IconProps = {
  className?: string;
};

export const Icon = ({ className }: IconProps) => {
  return <i className={`${className} ${style.icon}`}>
    <MenuIconSVG />
  </i>
};