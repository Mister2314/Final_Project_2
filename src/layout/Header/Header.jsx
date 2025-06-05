import React from 'react';
import { Fragment } from "react";
import Navbar from "./Navbar/Navbar";
import styles from './Header.module.css';

const Header = ({}) => {
  return (
    <Fragment>
      <div className={styles.headerContainer}>
        <Navbar />
      </div>
    </Fragment>
  );
};

export default Header;