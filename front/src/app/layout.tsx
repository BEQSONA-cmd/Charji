import "./globals.css";
import { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import Navbar from "@/components/Navbar";

export const metadata = {
    title: "ჩარჯი",
    description: "ხელოვნური ინტელექტის ჩატბოტი",
};

interface AppProps {
    children: ReactNode;
}

export default function App({ children }: AppProps) {
    return (
        <html lang={"en"}>
            <body>
                {/* Navbar */}
                <Navbar />

                {/* Main Content */}
                <main>{children}</main>

                <ToastContainer />
            </body>
        </html>
    );
}
