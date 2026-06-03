import "./globals.css";
import { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  title: "ჩარჯი",
  description: "ხელოვნური ინტელექტის ჩატბოტი",
};

interface AppProps {
  children: ReactNode;
}

export default function App({ children }: AppProps) {
  return (
    <html lang="en">
      <body className="m-0 p-0 overflow-hidden bg-[#0a0a1a]">
        <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2e] to-[#1a0a2e]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent" />
          {children}
        </div>
        <ToastContainer />
      </body>
    </html>
  );
}
