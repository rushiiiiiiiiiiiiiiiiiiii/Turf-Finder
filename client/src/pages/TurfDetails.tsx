import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  MapPin,
  Clock,
  Users,
  Wifi,
  Car,
  Camera,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react";
import { ShowerHead } from "lucide-react";

const TurfDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [turf, setTurf] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Add this state at the top of your component
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Modify the handleBookNow function to use selectedSlot
  const handleProceedToBook = () => {
    if (!selectedSlot) return alert("Please select a slot to proceed.");

    navigate(`/booking/${turf._id}`, {
      state: {
        selectedSlot: `${selectedSlot.time}`,
        selectedDate: new Date(), // Default or use a date picker later
      },
    });
  };

  useEffect(() => {
  const fetchTurfAndSlots = async () => {
    try {
      // Fetch turf details
      const turfRes = await axios.get(`${backendUrl}/turf/getoneturf/${id}`);
      const turfData = turfRes.data.turfs;

      // Fetch slots
      let transformedSlots = [];
      try {
        const formattedDate = selectedDate.toISOString().split("T")[0]; // "YYYY-MM-DD"
        const slotRes = await axios.get(`${backendUrl}/turf/getslots/${id}?date=${formattedDate}`);
        const slotData = slotRes.data.slots;

        transformedSlots = (slotData || []).map((s) => ({
          id: s.id, // from backend `id` field
          time: `${s.start} - ${s.end}`,
          label: `${s.start} to ${s.end}`,
          price: s.price,
          available: s.available, // ✅ Correct property
        }));

        console.log("Fetched slots:", transformedSlots); // ✅ For debugging
      } catch (slotError) {
        console.warn("No slots found or slot API failed:", slotError.response?.data?.message || slotError.message);
      }

      const completeTurf = {
        ...turfData,
        rating: turfData.rating || 4.8,
        reviews: turfData.reviews || 42,
        sport: turfData.sports,
        owner: {
          phone: turfData.ownerPhone,
          email: turfData.ownerEmail,
        },
        rules: [
          "No metal studs allowed on the turf",
          "Smoking and alcohol strictly prohibited",
          "Players must wear appropriate sports attire",
          "Maximum 22 players allowed per session",
          "Booking cancellation allowed up to 4 hours before the slot",
        ],
        timeSlots: transformedSlots,
      };

      setTurf(completeTurf);
    } catch (error) {
      console.error("Failed to fetch turf or slots: ", error);
    } finally {
      setLoading(false);
    }
  };

  if (id) fetchTurfAndSlots();
}, [id, selectedDate]); // ✅ Added selectedDate to dependency array

  if (loading) return <div className="text-center py-10">Loading turf details...</div>;
  if (!turf) return <div className="text-center py-10 text-red-600">Turf not found.</div>;

  const imageUrl = (path) => `${backendUrl}/${path.replace(/\\/g, "/")}`;


  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span><a href="/">Home</a></span>
            <span>/</span>
            <span><a href="/turfs">Turfs</a></span>
            <span>/</span>
            <span className="text-primary">{turf.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{turf.name}</h1>
              <div className="flex flex-col space-y-1 text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{turf.address}, {turf.city}, {turf.state}</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                  <span>{turf.rating} ({turf.reviews} reviews)</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {(turf.sports || []).map((sport, i) => (
                    <Badge key={i} variant="secondary">{sport}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <div className="text-3xl font-bold text-primary">₹{turf.pricePerHour}/hour</div>
              <div className="text-sm text-gray-500">Starting price</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <Card className="rounded-xl shadow-md">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={imageUrl(turf.images[selectedImageIndex])}
                    alt={turf.name}
                    className="w-full h-96 object-cover rounded-t-xl"
                  />
                </div>
                <div className="p-4">
                  <div className="flex space-x-2 overflow-x-auto">
                    {turf.images.map((image, index) => (
                      <img
                        key={index}
                        src={imageUrl(image)}
                        alt={`${turf.name} ${index + 1}`}
                        className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all ${selectedImageIndex === index ? "border-primary" : "border-transparent"
                          }`}
                        onClick={() => setSelectedImageIndex(index)}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white rounded-lg shadow-sm">
                {["description", "amenities", "rules", "reviews"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="data-[state=active]:bg-green-100 data-[state=active]:text-primary hover:bg-green-50 transition-all"
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <Card className="rounded-xl shadow-sm">
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">About this turf</h3>
                      <p className="text-gray-600 leading-relaxed">{turf.description}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Contact Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-primary" />
                          <span>{turf.owner?.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-primary" />
                          <span>{turf.owner?.email}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="amenities" className="mt-6">
                <Card className="rounded-xl shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Available Amenities</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {(turf.amenities || []).map((amenity, index) => {
                        const iconMap = {
                          Parking: Car,
                          "Changing Room": Users,
                          Floodlights: Camera,
                          Restroom: ShowerHead,
                          "Equipment Rental": Clock,
                        };
                        const AmenityIcon = iconMap[amenity] || Users;

                        return (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg"
                          >
                            <AmenityIcon className="w-5 h-5 text-primary mt-1" />
                            <div className="font-medium">{amenity}</div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rules" className="mt-6">
                <Card className="rounded-xl shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Turf Rules & Guidelines</h3>
                    <ul className="space-y-3">
                      {(turf.rules || []).map((rule, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                          <span className="text-gray-600">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card className="rounded-xl shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
                    <div className="space-y-4">
                      {[1, 2, 3].map((review) => (
                        <div key={review} className="border-b border-gray-200 pb-4 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold">User {review}</div>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="ml-1 text-sm">4.8</span>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm">
                            Great facility with excellent maintenance. The turf quality is amazing
                            and staff is very helpful.
                          </p>
                          <div className="text-xs text-gray-400 mt-2">2 days ago</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8 rounded-xl shadow-lg">
              <CardContent className="p-6 space-y-6">
                <h3 className="text-xl font-semibold">Book Your Slot</h3>
                <div className="space-y-3">
                  {turf.timeSlots && turf.timeSlots.length > 0 ? (
                    turf.timeSlots.map((slot, index) => {
                      const isSelected = selectedSlot?.id === slot.id;
                      return (
                        <div
                          key={index}
                          onClick={() => slot.available && setSelectedSlot(slot)}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-150 ${slot.available
                            ? `cursor-pointer ${isSelected
                              ? "border-primary bg-green-100 ring-2 ring-primary"
                              : "border-green-200 bg-green-50 hover:bg-green-100"}`
                            : "border-gray-200 bg-gray-100 opacity-60"
                            }`}
                        >
                          <div>
                            <div className="font-semibold text-sm">{slot.time}</div>
                            {/* <div className="text-xs text-gray-600">{slot.label}</div> */}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary">₹{slot.price}</div>
                            <div className="text-xs">
                              {slot.available ? (
                                <span className="text-green-600">Available</span>
                              ) : (
                                <span className="text-red-600">Unavailable</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-gray-500 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                      No slots available for this turf.
                    </div>
                  )}
                </div>

                {localStorage.getItem('role') == 'user' ? <Button
                  className="w-full btn-primary h-12"
                  onClick={handleProceedToBook}
                  disabled={!selectedSlot}
                >
                  {selectedSlot ? "Proceed to Book" : "Select a Slot"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button> : ""}

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurfDetails;
