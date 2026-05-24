import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Star, Filter, MessageCircle, Building } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { getReviews, Review } from "../apiService";

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>(" ");
  const [loading, setLoading] = useState<boolean>(true);
  const [activeRestaurant, setActiveRestaurant] = useState<string>("all");

  // 1. Escuchar en tiempo real el restaurante seleccionado en la sesión activa
  useEffect(() => {
    const checkActiveSession = () => {
      const saved = localStorage.getItem("selected_yelp_restaurant") || "all";
      setActiveRestaurant(saved);
    };

    checkActiveSession();
    // Nos suscribimos al evento storage por si el usuario cambia el selector sin recargar
    window.addEventListener("storage", checkActiveSession);
    return () => window.removeEventListener("storage", checkActiveSession);
  }, []);

  // 2. Traer los registros de Railway cada vez que cambie el filtro de sentimiento
  useEffect(() => {
    setLoading(true);
    getReviews({ sentiment: sentimentFilter, limit: 150 }).then((data) => {
      setReviews(data);
      setLoading(false);
    });
  }, [sentimentFilter]);

  // 3. Cruzar filtros: Sesión activa de la App + Búsqueda por texto local
  const filteredReviews = reviews.filter((r) => {
    // Si la sesión está en un restaurante específico, aislamos rigurosamente sus reviews
    if (activeRestaurant !== "all") {
      const matchesBrand = r.business_name?.toLowerCase() === activeRestaurant.toLowerCase();
      if (!matchesBrand) return false;
    }

    // Aplicamos el input del buscador (sobre el contenido de la reseña)
    const matchesSearch = r.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.business_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      {/* BANNER INFORMATIVO DE LA SESIÓN DE CLIENTE */}
      <div className="mb-4 flex items-center justify-between bg-white/40 border border-foreground/[0.04] p-4 rounded-2xl backdrop-blur-sm shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Building className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Workspace Active Datastream</span>
            <h3 className="text-sm font-semibold text-foreground">
              {activeRestaurant === "all" 
                ? "Global Network Feed (Displaying all Yelp entities)" 
                : `Isolated Feed Account: ${activeRestaurant}`}
            </h3>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-xs font-data font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
            {filteredReviews.length} Available Feed Rows
          </span>
        </div>
      </div>

      <PageHeader
        eyebrow="Data Extraction"
        title="Customer Reviews Log"
        subtitle="Browse through real historical customer feedback matching your corporate client parameters."
      />

      {/* FILTERS BAR */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-white/40 p-4 rounded-2xl backdrop-blur-md border border-white/60">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={activeRestaurant === "all" ? "Search by restaurant name or text..." : "Search keywords within this restaurant's reviews..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/60 pl-10 pr-4 py-2 text-sm rounded-xl border border-foreground/[0.06] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="bg-white/60 text-sm rounded-xl border border-foreground/[0.06] px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="all">All Sentiment Profiles</option>
            <option value="positive">Positive Only (Classifier Match)</option>
            <option value="negative">Negative Only (Classifier Match)</option>
          </select>
        </div>
      </div>
