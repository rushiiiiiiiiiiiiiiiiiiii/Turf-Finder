import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Star, ArrowRight } from "lucide-react";
import {
  FaFootballBall,
  FaBaseballBall,
  FaTableTennis,
  FaVolleyballBall,
  FaBasketballBall,
} from "react-icons/fa";

const popularSports = [
  { name: "Football", Icon: FaFootballBall },
  { name: "Basketball", Icon: FaBasketballBall },
  { name: "Table Tennis", Icon: FaTableTennis },
  { name: "Volleyball", Icon: FaVolleyballBall },
  { name: "Baseball", Icon: FaBaseballBall },
];

const Home = () => {
  const [location, setLocation] = useState("");
  const [sport, setSport] = useState("");
  const [featuredTurfs, setTurfs] = useState([]);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  useEffect(() => {
    axios
      .get(`${backendUrl}/turf/getallturf`)
      .then((res) => {
        setTurfs((res.data.turfs || []).slice(0, 3)); // Only keep 3 turfs
      })
      .catch((err) => console.error("Error fetching turfs:", err));
  }, []);

  const handleSearch = () => {
    navigate(`/turfs?location=${location}&sport=${sport}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-gray-900">
            Find Your Perfect
            <span className="block text-primary">Sports Turf</span>
          </h1>
          <p className="text-xl md:text-2xl mt-4 mb-12 text-gray-600">
            Book premium sports facilities near you with instant confirmation
          </p>
          <Card className="max-w-2xl mx-auto shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Enter location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10 h-12 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Select sport"
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    className="pl-10 h-12 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  // disabled={!location || !sport}
                  className="btn-primary h-12 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Turfs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Popular Sports */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Popular Sports
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose your favorite sport and discover the best turfs in your area
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {popularSports.map(({ name, Icon }) => (
              <Card
                key={name}
                onClick={() => setSport(name)}
                className="group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 rounded-2xl overflow-hidden"
              >
                <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                  <Icon className="text-primary w-16 h-16" />
                  <h3 className="font-bold text-lg text-center">{name}</h3>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="w-6 h-6 text-primary mx-auto" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Turfs - Showing Only 3 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Featured Turfs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Top-rated sports facilities trusted by thousands of players
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTurfs.map((turf) => (
              <Card key={turf.id} className="group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <img
                      src={`${backendUrl}/${turf.images?.[0]?.replace(/\\/g, "/")}`}

                      alt={turf.name}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center space-x-1 shadow-lg">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-bold">{turf.rating}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{turf.name}</h3>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="w-4 h-4 mr-2 text-primary" />
                      <span className="text-sm">{turf.address}, {turf.city}, {turf.state}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-primary">₹{turf.pricePerHour}/hour</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {turf.amenities.map((amenity) => (
                        <span key={amenity} className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                          {amenity}
                        </span>
                      ))}
                    </div>
                    <Button
                      className="w-full btn-primary rounded-xl"
                      onClick={() => navigate(`/turf/${turf.id}`)}
                    >
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
