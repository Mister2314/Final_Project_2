import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Header/Navbar/Navbar';
import Footer from './Footer/Footer';

const AuthLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default AuthLayout; 