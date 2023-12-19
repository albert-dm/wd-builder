import React from 'react';
import { ExtendedComponent } from '../../types/component';
import style from './container.module.css';

export const Container: ExtendedComponent = ({ children }) => {
  return <main className={style.contentGrid} >{children}</main>;
};
