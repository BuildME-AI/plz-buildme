import { ReactNode, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { motion } from "motion/react";
import { useAuth } from "../../lib/auth";
import { useNavigate } from "react-router";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  if (loading) return null;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Sidebar />
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="ml-[280px] min-h-screen"
      >
        {children}
      </motion.main>
    </div>
  );
}
