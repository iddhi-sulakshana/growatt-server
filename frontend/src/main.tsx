import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import "./index.css";
import App from "./App.tsx";
import ThemeSync from "./components/ThemeSync.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import QueryClient from "./lib/QueryClient.tsx";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ThemeSync />
            <BrowserRouter>
                <QueryClientProvider client={QueryClient}>
                    <App />
                    <Toaster
                        visibleToasts={5}
                        richColors
                        closeButton
                        position="top-center"
                    />
                    <ReactQueryDevtools buttonPosition="bottom-left" />
                </QueryClientProvider>
            </BrowserRouter>
        </ThemeProvider>
    </StrictMode>
);
