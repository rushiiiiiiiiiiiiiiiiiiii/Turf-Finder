import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  Download,
  CreditCard,
  QrCode,
  Star,
} from "lucide-react";
import QRCode from "qrcode.react";

type Booking = {
  _id: string;
  turf: string;
  turfName?: string;
  location?: string;
  sport?: string;
  date: string;
  slotTime?: string;
  status?: string;
  totalAmount?: number;
  advanceAmount?: number;
  remainingAmount?: number;
  rating?: number;
};

type Turf = {
  _id: string;
  name: string;
  location: string;
  owner: string;
  image?: string;
  type?: string;
};

const UserDashboard = () => {
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [turfList, setTurfList] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchTurf = async () => {
      try {
        const res = await axios.get<{ turfs: Turf[] }>(
          `${backendUrl}/turf/getallturf`
        );
        setTurfList(res.data.turfs);
      } catch (error) {
        console.error("Failed to fetch turf:", error);
      }
    };

    fetchTurf();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get<Booking[]>(
          `${backendUrl}/turf/bookingofuser/${userId}`
        );
        const bookings = res.data;
        const turfMap = turfList.reduce((map, turf) => {
          map[turf._id] = turf;
          return map;
        }, {} as Record<string, Turf>);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const enriched = bookings.map((b) => ({
          ...b,
          turfInfo: turfMap[b.turf],
        }));

        const active = enriched.filter(
          (b) =>
            new Date(b.date).setHours(0, 0, 0, 0) >= today.getTime() &&
            b.status !== "completed"
        );

        const past = enriched.filter(
          (b) =>
            new Date(b.date).setHours(0, 0, 0, 0) < today.getTime() ||
            b.status === "completed"
        );

        setActiveBookings(active);
        setPastBookings(past);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId && turfList.length) fetchBookings();
  }, [userId, turfList]);

  const handlePayRemaining = (bookingId: string, amount: number) => {
    console.log(`Processing payment for booking ${bookingId}: ₹${amount}`);
    alert(`Payment of ₹${amount} processed successfully!`);
  };

  const downloadQR = (bookingId: string) => {
    const canvas = document.getElementById(`qr-${bookingId}`) as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL();
      const a = document.createElement("a");
      a.download = `booking-${bookingId}.png`;
      a.href = url;
      a.click();
    }
  };

  if (loading) return <div className="text-center py-10">Loading bookings...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-lg text-gray-600">Manage your bookings and payments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 font-bold">Active Bookings</p>
                  <p className="text-2xl font-bold text-primary">{activeBookings.length}</p>
                </div>
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-gray-500">Total Spent</p>
                  <p className="text-2xl font-bold text-primary">
                    ₹{[...activeBookings, ...pastBookings].reduce((acc, b) => acc + (b.totalAmount || 0), 0)}
                  </p>
                </div>
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-gray-500">Pending Payment</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ₹
                    {[...activeBookings, ...pastBookings].reduce(
                      (acc, b) => acc + (b.remainingAmount || 0),
                      0
                    )}
                  </p>
                </div>
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-gray-500">Games Played</p>
                  <p className="text-2xl font-bold text-primary">{pastBookings.length}</p>
                </div>
                <Star className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active Bookings ({activeBookings.length})</TabsTrigger>
            <TabsTrigger value="past">Past Bookings ({pastBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeBookings.length === 0 ? (
              <p className="text-center text-gray-500">No active bookings found.</p>
            ) : (
              <div className="space-y-6">
                {activeBookings.map((booking) => (
                  <Card key={booking._id}>
                    <CardContent className="p-6">
                      <div className="grid lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-2">
                          <div className="flex justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-semibold">
                                {booking.turfInfo?.name || "Turf Name"}
                              </h3>
                              <div className="flex text-gray-600 mt-1 items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {booking.turfInfo?.address}, {booking.turfInfo?.city}, {booking.turfInfo?.state}

                              </div>
                              {booking.turfInfo?.type && (
                                <div className="text-sm text-gray-500">
                                  Type: {booking.turfInfo.type}
                                </div>
                              )}
                            </div>

                            {/* <Badge variant="secondary">{booking.turfInfo?.sports[0] || "Sport"}</Badge> */}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-primary" />
                              {new Date(booking.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-primary" />
                              {booking.slotTime}
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1 text-center">Booking QR</p>
                          <div className="flex justify-center">
                            <QRCode id={`qr-${booking._id}`} value={`TurfFinder-${booking._id}`} size={100} level="H" />
                          </div>
                          <Button variant="outline" size="sm" className="mt-2 text-center mx-auto block" onClick={() => downloadQR(booking._id)}>
                            <Download className="w-3 h-3 ml-6 text-center" />Download
                          </Button>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 text-center mb-2">Booking ID</div>
                          <p className="font-mono text-center text-sm mb-3">{booking._id}</p>
                          <div className="bg-green-50 p-3 rounded-lg text-sm space-y-1">
                            <div className="flex justify-between"><span>Total:</span><span>₹{booking.totalAmount || 0}</span></div>
                            <div className="flex justify-between"><span>Advance:</span><span className="text-green-600">₹{booking.advanceAmount || 0}</span></div>
                            {booking.remainingAmount && booking.remainingAmount > 0 && (
                              <div className="flex justify-between font-semibold">
                                <span>Remaining:</span>
                                <span className="text-orange-600">₹{booking.remainingAmount}</span>
                              </div>
                            )}
                          </div>
                          {booking.remainingAmount && booking.remainingAmount > 0 ? (
                            <Button size="sm" className="w-full mt-3" onClick={() => handlePayRemaining(booking._id, booking.remainingAmount!)}>
                              Pay Remaining ₹{booking.remainingAmount}
                            </Button>
                          ) : (
                            <Badge className="w-full mt-3 justify-center bg-green-500">Fully Paid</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {pastBookings.length === 0 ? (
              <p className="text-center text-gray-500">No past bookings found.</p>
            ) : (
              <div className="space-y-6">
                {pastBookings.map((booking) => (
                  <Card key={booking._id}>
                    <CardContent className="p-6">
                      <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                          <div className="flex justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-semibold">{booking.turfInfo?.name || "Turf Name"}</h3>
                              <div className="flex text-gray-600 mt-1 items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {booking.turfInfo?.city || "Location"}
                              </div>
                              {/* {booking.turfInfo?.type && ( */}
                              <div className="text-sm text-gray-500">Type: {booking.turfInfo.sports}</div>
                              {/* )} */}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{booking.sport}</Badge>
                              <Badge className="bg-green-500">Completed</Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-primary" />{new Date(booking.date).toLocaleDateString()}</div>
                            <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-primary" />{booking.slotTime}</div>
                            <div className="flex items-center"><CreditCard className="w-4 h-4 mr-2 text-primary" />₹{booking.totalAmount} (Fully Paid)</div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="text-sm text-gray-600 text-center">Booking ID</div>
                          <p className="font-mono text-center text-sm mb-2">{booking._id}</p>
                          {booking.rating && (
                            <div className="text-center">
                              <p className="text-sm text-gray-600 mb-1">Your Rating</p>
                              <div className="flex justify-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < booking.rating! ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                                ))}
                              </div>
                            </div>
                          )}
                          <Button variant="outline" size="sm" className="w-full">Book Again</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
