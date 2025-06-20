import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TurfListings from "./pages/TurfListings";
import TurfDetails from "./pages/TurfDetails";
import Booking from "./pages/Booking";
import UserDashboard from "./pages/UserDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TurfRegistration from "./pages/TurfRegistration";
import QRScanner from "./pages/QRScanner";
import Scanner from "./pages/Scanner";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import NotFound from "./pages/NotFound";
import AddSlot from './pages/AddSlot'
import PaymentScreen from './pages/PaymentScreen'
import EditTurf from './pages/EditTurf'

const queryClient = new QueryClient();

// 🔐 Role-based Protected Route
const ProtectedRoute = ({
  element,
  allowedRoles,
}: {
  element: JSX.Element;
  allowedRoles: string[];
}) => {
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  if (!userId) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role || "")) return <Navigate to="/" replace />;

  return element;
};

// 👤 Public Auth Pages (blocked if already logged in)
const PublicAuthRoute = ({ element }: { element: JSX.Element }) => {
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  if (userId) {
    if (role === "admin") return <Navigate to="/admin-dashboard" replace />;
    if (role === "owner") return <Navigate to="/owner-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

// 🌍 Owner Restriction Gate — wrap entire app
// 🌍 Owner Restriction Gate — wrap entire app
const OwnerOnlyAccessGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const role = localStorage.getItem("role");

  // ✅ Allow owners access only to selected pages
  const allowedOwnerPaths = [
    "/owner-dashboard",
    "/turf-registration",
    "/addslot",
    "/edit-turf",
    "/turf/" // <-- ✅ Allow access to Turf Details
  ];
  const isAllowed = allowedOwnerPaths.some((path) => location.pathname.startsWith(path));

  if (role === "owner" && !isAllowed) {
    return <Navigate to="/owner-dashboard" replace />;
  }

  return children;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <OwnerOnlyAccessGuard>
          <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* 🌐 Open to All (including unauthenticated users) */}
                <Route path="/" element={<Home />} />
                <Route path="/turfs" element={<TurfListings />} />
                <Route path="/turf/:id" element={<TurfDetails />} />

                {/* 👤 Auth-only public pages (blocked if logged in) */}
                <Route path="/login" element={<PublicAuthRoute element={<Login />} />} />
                <Route path="/register" element={<PublicAuthRoute element={<Register />} />} />

                {/* ⚠️ Public but should block owner */}
                <Route path="/booking/:id" element={<Booking />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/failure" element={<PaymentFailure />} />
                <Route path="/qr-scanner" element={<QRScanner />} />
                <Route path="/scanner" element={<Scanner />} />
                <Route path="/paymentscreen/:id" element={<PaymentScreen />} />

                {/* 🔐 Protected by Role */}
                <Route
                  path="/dashboard"
                  element={<ProtectedRoute element={<UserDashboard />} allowedRoles={["user"]} />}
                />
                <Route
                  path="/owner-dashboard"
                  element={<ProtectedRoute element={<OwnerDashboard />} allowedRoles={["owner"]} />}
                />
                <Route
                  path="/admin-dashboard"
                  element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={["admin"]} />}
                />
                <Route
                  path="/turf-registration"
                  element={<ProtectedRoute element={<TurfRegistration />} allowedRoles={["owner"]} />}
                />
                <Route
                  path="/edit-turf/:id"
                  element={<ProtectedRoute element={<EditTurf/>} allowedRoles={["owner"]} />}
                />
                <Route 
                  path="/addslot/:id" 
                  element={<ProtectedRoute element={<AddSlot />} allowedRoles={["owner"]}/>}
                />

                {/* ❌ Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster />
        </OwnerOnlyAccessGuard>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
