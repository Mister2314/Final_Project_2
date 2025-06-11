import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from './redux/store';
import { checkAuth } from './redux/slices/userSlice';
import AppRouter from './routes/AppRouter';
import { ThemeProvider } from './context/ThemeContext';
import { WishlistProvider } from 'react-use-wishlist';
import { CartProvider } from 'react-use-cart';
import { BrowserRouter } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <AuthInitializer>
          <ThemeProvider>
            <CartProvider>
              <WishlistProvider>
                <ScrollToTop />
                <AppRouter />
              </WishlistProvider>
            </CartProvider>
          </ThemeProvider>
        </AuthInitializer>
      </Provider>
    </BrowserRouter>
  );
}

export default App;