import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import "./styles/index.css";
import { Toaster } from "react-hot-toast";
import { pdfjs } from "react-pdf"
import { ThemeProvider as MUIThemeProvider } from "@mui/material";

import { ThemeProvider as AppThemeProvider, useTheme } from "./context/ThemeContext.jsx";
import getTheme from "./styles/theme/theme.js";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"

function MuiThemeBridge({ children }) {
  const { isDark } = useTheme();
  const muiTheme = getTheme(isDark ? "dark" : "light");

  return (
    <MUIThemeProvider theme={muiTheme}>
      {/* <CssBaseline /> */}
      {children}
    </MUIThemeProvider>
  );
}


const queryClient = new QueryClient();

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

createRoot(document.getElementById("root")).render(


  <QueryClientProvider client={queryClient} >

    <AppThemeProvider>

      <MuiThemeBridge>

        <App />
        <Toaster
          gutter={10}
          toastOptions={{
            duration: 3000,
          }}
        />

      </MuiThemeBridge>

    </AppThemeProvider>

  </QueryClientProvider>

);