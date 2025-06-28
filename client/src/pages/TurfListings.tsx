import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star } from "lucide-react";

const TurfListings = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [filters, setFilters] = useState({
    address: searchParams.get("address") || "",
    sport: searchParams.get("sport") || "",
    priceRange: "all",
    sortBy: "rating",
  });

  const [turfs, setTurfs] = useState([]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    axios
      .get(`${backendUrl}/turf/getallturf`)
      .then((res) => {
        setTurfs(res.data.turfs || []);
      })
      .catch((err) => console.error("Error fetching turfs:", err));
  }, []);

  const filteredAndSortedTurfs = turfs
    .filter((turf) => {
      const matchesLocation =
        !filters.address ||
        turf.address?.toLowerCase().includes(filters.address.toLowerCase()) ||
        turf.city?.toLowerCase().includes(filters.address.toLowerCase());

      const matchesSport =
        !filters.sport ||
        turf.sports?.some((sport) =>
          sport.toLowerCase().includes(filters.sport.toLowerCase())
        );

      const matchesPrice =
        filters.priceRange === "all" ||
        (filters.priceRange === "low" && turf.pricePerHour < 1000) ||
        (filters.priceRange === "medium" &&
          turf.pricePerHour >= 1000 &&
          turf.pricePerHour < 1500) ||
        (filters.priceRange === "high" && turf.pricePerHour >= 1500);

      return matchesLocation && matchesSport && matchesPrice;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "price_low":
          return a.pricePerHour - b.pricePerHour;
        case "price_high":
          return b.pricePerHour - a.pricePerHour;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Find Sports Turfs
          </h1>
          <p className="text-lg text-gray-600">
            Discover and book the best sports facilities in your area
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Enter location"
                value={filters.address}
                onChange={(e) =>
                  setFilters({ ...filters, address: e.target.value })
                }
              />
              <Input
                placeholder="Enter sport"
                value={filters.sport}
                onChange={(e) =>
                  setFilters({ ...filters, sport: e.target.value })
                }
              />
              <Select
                value={filters.priceRange}
                onValueChange={(value) =>
                  setFilters({ ...filters, priceRange: value })
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="low">Under ₹1,000</SelectItem>
                  <SelectItem value="medium">₹1,000 - ₹1,500</SelectItem>
                  <SelectItem value="high">Above ₹1,500</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.sortBy}
                onValueChange={(value) =>
                  setFilters({ ...filters, sortBy: value })
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-lg text-gray-600">
            {filteredAndSortedTurfs.length} turfs found
          </div>
        </div>

        {/* Turf Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredAndSortedTurfs.map((turf, index) => (
            <Card key={index} className="hover-lift cursor-pointer">
              <CardContent className="p-0">
                <div className="relative">
                  {/* <img
                    src={`${backendUrl}/${turf.images?.[0]?.replace(/\\/g, "/")}`}
                    alt={turf.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  /> */}
                  <img
  src={
    turf.images?.length
      ? `${backendUrl}/${turf.images[0].replace(/\\/g, "/")}`
      : "https://via.placeholder.com/400x250?text=No+Image"
  }
  alt={turf.name}
  className="w-full h-48 object-cover rounded-t-lg"
/>

                  <div className="absolute top-4 left-4">
                    <Badge className="bg-green-500 text-white">Available</Badge>
                  </div>
                  <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-semibold">
                      {turf.rating ? turf.rating.toFixed(1) : "4.5"}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">
                      {turf?.sports?.[0] || "N/A"}
                    </Badge>
                    <span className="text-2xl font-bold text-primary">
                      ₹{turf.pricePerHour}/hr
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{turf.name}</h3>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {turf.address}, {turf.city}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Star className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {turf.rating ? turf.rating.toFixed(1) : "4.5"} (100 reviews)
                    </span>
                  </div>

                  {/* Amenities */}
                  {turf.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {turf.amenities.slice(0, 3).map((amenity, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-xs px-2 py-1 bg-green-100"
                        >
                          {amenity}
                        </Badge>
                      ))}
                      {turf.amenities.length > 3 && (
                        <Badge
                          variant="secondary"
                          className="text-xs px-2 py-1 bg-green-100"
                        >
                          +{turf.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate(`/turf/${turf._id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      className="flex-1 btn-primary"
                      onClick={() => navigate(`/booking/${turf._id}`)}
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredAndSortedTurfs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No turfs found
            </h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TurfListings;
