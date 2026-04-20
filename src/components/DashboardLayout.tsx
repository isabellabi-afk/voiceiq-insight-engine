import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { motion, AnimatePresence } from "framer-motion";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [sidebarWidth, setSidebarWidth] = useState(280);

  // Observe sidebar width via ResizeObserver-free approach: rely on CSS by querying width
  useEffect(() => {
    const aside = document.querySelector("aside");
    if (!aside) return;
    const ro = new ResizeObserver(() => setSidebarWidth(aside.getBoundingClientRect().width));
    ro.observe(aside);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main
        className="flex-1 transition-[margin] duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="px-6 py-8 lg:px-10 lg:py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
