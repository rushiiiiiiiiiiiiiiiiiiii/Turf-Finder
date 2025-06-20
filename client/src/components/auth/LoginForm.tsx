import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, Lock, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const LoginForm = () => {
  const [formData, setFormData] = useState({ phone: "", password: "" });
  const navigate = useNavigate()
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await fetch(`${backendUrl}/turf/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    console.log("Login response:", data);


    if (response.ok) {
      const { _id, role } = data.user;
      localStorage.setItem("userId", _id);
      localStorage.setItem("role", role);
      toast.success("Login successful!");

      if (role === "user") {
        navigate("/");
      } else if (role === "owner") {
        navigate("/owner-dashboard");
      } else if (role === "admin") {
        navigate("/admin-dashboard");
      } else {
        toast.error("Unknown role. Please contact support.");
      }
    } else {
      toast.error(data.message || "Login failed.");
    }

  } catch (error) {
    console.error("Login error:", error);
    toast.error("An error occurred. Please try again.");
  }
};

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">Login</CardTitle>
        <p className="text-gray-600">Welcome back! Please sign in to your account</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="pl-10"
              required
            />
          </div>

          <Button type="submit" className="w-full btn-primary">
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">Don't have an account?</p>
          <Button onClick={() => navigate('/register')}
            variant="link"
            className="text-primary hover:text-primary/80 cursor-pointer"
          >
            Sign Up
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
