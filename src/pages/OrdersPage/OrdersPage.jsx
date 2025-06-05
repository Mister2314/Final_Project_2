import React from 'react';
import Navbar from '../../layout/Header/Navbar/Navbar';
import Footer from '../../layout/Footer/Footer';
import Orders from '../../components/Orders/Orders';

const OrdersPage = () => {
  return (
    <>
      <Navbar />
      <Orders />
      <Footer />
    </>
  );
};

export default OrdersPage; 