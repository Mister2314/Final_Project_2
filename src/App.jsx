import React from "react";
import AppRouter from "./routes/AppRouter";
import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";
import "./index.css";

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <AppRouter />
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;