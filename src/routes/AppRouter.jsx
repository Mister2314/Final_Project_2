import React from 'react';
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import { ProtectedRoute, AuthRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";
import LoadingScreen from "../components/Loading/LoadingScreen";
import ScrollRestoration from '../components/ScrollRestoration';
// import OrderCompletedRoute from './OrderCompletedRoute';

import Home from "../pages/Home/Home";
import Shop from "../components/Shop/Shop";
import Login from "../layout/Login/Login";
import AdminLogin from "../components/AdminLogin/AdminLogin";
import Signup from "../layout/Signup/Signup";
import FaqPage from "../pages/Faq/FaqPage";
import ContactPage from "../pages/Contact/ContactPage";
import AboutUs from "../components/AboutUs/AboutUs";
import ProfileSettings from "../components/ProfileSettings/ProfileSettings";
import ForgotPassword from "../components/ForgotPassword/ForgotPassword";
import ResetPassword from "../components/resetpassword/ResetPassword";
import AdminPage from "../pages/AdminPage/AdminPage";
import NotFound from "../pages/404/Page404";

import BlogsPage from "../pages/BlogsPage/BlogsPage";
import BlogDetails from "../components/BlogDetails/BlogDetails";

import Cats from "../components/Cats/Cats";
import CatsAllProducts from "../components/Cats/CatsAllProducts/CatsAllProducts";
import CatLitter from '../components/Cats/CatLitter/CatLitter';
import CatFoods from "../components/Cats/CatFoods/CatFoods";
import CatLeashes from "../components/Cats/CatLeashes/CatLeashes";
import CatCarriers from "../components/Cats/CatCarriers/CatCarriers";
import CatBedsAndHomes from "../components/Cats/CatBedsandHomes/CatBedsandHomes";

import Dogs from '../components/Dogs/Dogs';
import DogsAllProducts from "../components/Dogs/DogsAllProducts/DogsAllProducts";
import DogFoods from "../components/Dogs/DogFoods/DogFoods";
import DogToys from "../components/Dogs/DogToys/DogToys";
import DogBedsAndHomes from "../components/Dogs/DogBedsAndHomes/DogBedsAndHomes";
import DogCarriers from "../components/Dogs/DogCarriers/DogCarriers";
import DogLeashes from "../components/Dogs/DogLeashes/DogLeashes";

import WishlistPage from "../pages/WishlistPage/WishlistPage";
import Cart from "../components/Cart/Cart";
import ProductDetails from "../components/ProductDetails/ProductDetails";
import Checkout from "../components/Checkout/Checkout";
import OrdersPage from "../pages/OrdersPage/OrdersPage";
import AllProducts from "../components/AllProducts/AllProducts";
import OrderCompleted from '../components/OrderCompleted/OrderCompleted'

const AppRouter = () => {
  return (
    <Provider store={store}>
      <ScrollRestoration />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/contact" element={<ContactPage />} />

        <Route path="/blog" element={<BlogsPage />} />
        <Route path="/blog/:id" element={<BlogDetails />} />

        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/all-products" element={<AllProducts />} />
        
        <Route path="/shop/cats" element={<Cats />} />
        <Route path="shop/cats/all-products" element={<CatsAllProducts />} />
        <Route path="/shop/cats/litter" element={<CatLitter />} />
        <Route path="/shop/cats/foods" element={<CatFoods />} />
        <Route path="/shop/cats/beds-and-home" element={<CatBedsAndHomes />} />
        <Route path="/shop/cats/carriers" element={<CatCarriers />} />
        <Route path="/shop/cats/leashes" element={<CatLeashes />} />
        <Route path="/shop/cats/:categoryId" element={<CatsAllProducts />} />

        <Route path="/shop/dogs" element={<Dogs />} />
        <Route path="/shop/dogs/all-products" element={<DogsAllProducts />} />
        <Route path="/shop/dogs/foods" element={<DogFoods />} />
        <Route path="/shop/dogs/toys" element={<DogToys />} />
        <Route path="/shop/dogs/beds-and-home" element={<DogBedsAndHomes />} />
        <Route path="/shop/dogs/carriers" element={<DogCarriers />} />
        <Route path="/shop/dogs/leashes" element={<DogLeashes />} />
        <Route path="/shop/dogs/:categoryId" element={<DogsAllProducts />} />

        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/loading" element={<LoadingScreen />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<AuthRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfileSettings />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Route>

        <Route element={<OrderCompleted />}>
          <Route path="/order-completed" element={<OrderCompleted />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="bottom-right" />
      <LoadingScreen />
    </Provider>
  );
};

export default AppRouter;