import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Clock, MapPin, CreditCard, Shield } from "lucide-react";
import axios from "axios";

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const userid = localStorage.getItem("userId");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const initialSelectedSlotTime = location.state?.selectedSlot || null;
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [turf, setTurf] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  console.log(selectedDate)

  const formatLocalDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const fetchSlots = async () => {
    const formattedDate = formatLocalDate(selectedDate);
    try {
      const res = await axios.get(`${backendUrl}/turf/getslots/${id}?date=${formattedDate}`);
      const slotData = res.data.slots;
      if (Array.isArray(slotData)) {
        setTimeSlots(slotData.map(s => ({
          id: s.id,
          time: `${s.start} - ${s.end}`,
          price: s.price,
          available: s.available
        })));
      }
    } catch (err) {
      console.error("Failed fetching slots:", err);
    }
  };

  useEffect(() => {
    const fetchTurf = async () => {
      try {
        const res = await axios.get(`${backendUrl}/turf/getoneturf/${id}`);
        setTurf(res.data.turfs);
      } catch (error) {
        console.error("Failed to fetch turf:", error);
      }
    };

    if (id) {
      fetchTurf();
    }
  }, [id]);
  useEffect(() => {
    if (id && selectedDate) {
      fetchSlots();
    }
  }, [id, selectedDate]);

  useEffect(() => {
    if (initialSelectedSlotTime && timeSlots.length > 0) {
      const foundSlot = timeSlots.find((s) => s.time === initialSelectedSlotTime);
      if (foundSlot) {
        setSelectedSlot(foundSlot);
      }
    }
  }, [initialSelectedSlotTime, timeSlots]);

  const totalAmount = selectedSlot?.price || 0;
  const minBookingPercentage = turf?.MinBookingPrice || 50;
  const advanceAmount = Math.round((minBookingPercentage / 100) * totalAmount);
  const remainingAmount = totalAmount - advanceAmount;
  const handleRazorpayPayment = () => {
    if( userid == null){
      navigate('/login')
      return;
    }

    if (!selectedSlot || !turf) return;

    navigate(`/paymentscreen/${turf._id}`, {
      state: {
        userid,
        ownerid: turf.ownerId,
        turf,
        turfId: turf._id,
        selectedDate: selectedDate.toISOString(),
        selectedSlotId: selectedSlot.id,
        selectedSlotTime: selectedSlot.time,
        totalAmount,
        advanceAmount,
        remainingAmount,
      },
    });
  };
// console.log(ownerid)
// console.log(turf.ownerId)
// console.log(turf.ownerId)
  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
        <p className="text-lg text-gray-600 mb-6">Secure your slot with {minBookingPercentage}% advance payment</p>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {turf && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={`${backendUrl}/${turf.images?.[0]?.replace(/\\/g, "/")}`}
                      className="w-20 h-20 object-cover rounded-lg"
                      alt="Turf"
                    />
                    <div>
                      <h3 className="text-xl font-semibold">{turf.name}</h3>
                      <div className="flex items-center text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{turf.address}, {turf.city}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">{turf.sports?.[0]}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarDays className="w-5 h-5 mr-2" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Select Time Slot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedSlot?.id === slot.id;
                    const isAvailable = slot.available;

                    return (
                      <div
                        key={slot.id}
                        onClick={() => {
                          if (isAvailable) setSelectedSlot(slot);
                        }}
                        className={`p-4 rounded-lg border cursor-pointer transition-all
                          ${!isAvailable ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}
                          ${isAvailable && isSelected ? 'border-primary bg-primary/10' : ''}
                          ${isAvailable && !isSelected ? 'border-gray-200 hover:border-primary/50' : ''}`}
                      >
                        <div className="flex justify-between mb-2">
                          <div className="font-semibold">{slot.time}</div>
                          <div className="font-bold text-primary">₹{slot.price}</div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full
                          ${slot.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {slot.available ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold">{selectedDate.toLocaleDateString()}</span>
                  </div>
                )}

                {selectedSlot && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-semibold">{selectedSlot.time}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-semibold">₹{totalAmount}</span>
                    </div>

                    <div className="flex justify-between text-primary">
                      <span>Advance ({minBookingPercentage}%):</span>
                      <span className="font-bold">₹{advanceAmount}</span>
                    </div>

                    <div className="flex justify-between text-orange-600">
                      <span>Remaining:</span>
                      <span className="font-semibold">₹{remainingAmount}</span>
                    </div>

                    <Separator />

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-start">
                        <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-semibold text-blue-800">Secure Payment</div>
                          <div className="text-blue-600">Pay remaining after your game session</div>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full btn-primary h-12" onClick={handleRazorpayPayment}>
                      Pay ₹{advanceAmount} Now
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
