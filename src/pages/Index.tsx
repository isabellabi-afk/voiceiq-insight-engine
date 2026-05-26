import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecciona de inmediato al usuario al centro analítico principal del SaaS
    navigate("/sentiment", { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
          Routing to Brand Intelligence Center...
        </p>
      </div>
    </div>
  );
}
