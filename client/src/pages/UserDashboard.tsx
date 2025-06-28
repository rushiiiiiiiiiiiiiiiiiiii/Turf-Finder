import { useEffect, useState } from "react";
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
  Loader,
} from "lucide-react";
import QRCode from "qrcode.react";

type Turf = {
  _id: string;
  name: string;
  location: string;
  owner: string;
  image?: string;
  type?: string;
};

type Booking = {
  _id: string;
  turf: string;
  date: string;
  slotTime?: string;
  status?: string;
  sport?: string;
  totalAmount?: number;
  advanceAmount?: number;
  remainingAmount?: number;
  rating?: number;
  turfInfo?: Turf;
};

const UserDashboard = () => {
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [turfList, setTurfList] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchTurf = async () => {
      try {
        const res = await axios.get<{ turfs: Turf[] }>(`${backendUrl}/turf/getallturf`);
        setTurfList(res.data.turfs);
      } catch (err) {
        console.error("Error fetching turf data:", err);
      }
    };

    fetchTurf();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!userId || turfList.length === 0) return;

      try {
        const res = await axios.get<Booking[]>(`${backendUrl}/turf/bookingofuser/${userId}`);
        const turfMap = Object.fromEntries(turfList.map((turf) => [turf._id, turf]));

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const enriched = res.data.map((booking) => ({
          ...booking,
          turfInfo: turfMap[booking.turf],
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
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId, turfList]);

  const handlePayRemaining = (bookingId: string, amount: number) => {
    console.log(`Payment of ₹${amount} initiated for booking ID: ${bookingId}`);
    alert(`Payment of ₹${amount} successful!`);
  };

  const downloadQR = (bookingId: string) => {
    const canvas = document.getElementById(`qr-${bookingId}`) as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL();
      const link = document.createElement("a");
      link.download = `booking-${bookingId}.png`;
      link.href = url;
      link.click();
    }
  };
  const Loader = () => (
  <div className="flex justify-center items-center py-20">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
  </div>
);

if (loading) return <Loader />;


  const totalSpent = [...activeBookings, ...pastBookings].reduce((acc, b) => acc + (b.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-lg text-gray-600">Manage your bookings and payments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard label="Active Bookings" value={activeBookings.length} icon={<Calendar />} />
          <StatCard label="Total Spent" value={`₹${totalSpent}`} icon={<CreditCard />} />
          <StatCard label="Pending Payment" value={`₹${activeBookings.reduce((acc, b) => acc + (b.remainingAmount || 0), 0)}`} icon={<Clock />} />
          <StatCard label="Games Played" value={pastBookings.length} icon={<Star />} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active Bookings ({activeBookings.length})</TabsTrigger>
            <TabsTrigger value="past">Past Bookings ({pastBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            <BookingList
              bookings={activeBookings}
              onPay={handlePayRemaining}
              onDownloadQR={downloadQR}
              type="active"
            />
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            <BookingList
              bookings={pastBookings}
              onDownloadQR={downloadQR}
              type="past"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// ========== Reusable Components ==========
const StatCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) => (
  <Card>
    <CardContent className="p-6 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-primary">{value}</p>
      </div>
      <div className="text-primary">{icon}</div>
    </CardContent>
  </Card>
);

const BookingList = ({
  bookings,
  onPay,
  onDownloadQR,
  type,
}: {
  bookings: Booking[];
  onPay?: (id: string, amount: number) => void;
  onDownloadQR: (id: string) => void;
  type: "active" | "past";
}) => {
  if (bookings.length === 0) {
    return <p className="text-center text-gray-500">No {type} bookings found.</p>;
  }

  return (
    <div className="space-y-6">
      {bookings.map((booking) => (
        <Card key={booking._id}>
          <CardContent className="p-6">
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Turf Info */}
              <div className="lg:col-span-2">
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{booking.turfInfo?.name || "Turf Name"}</h3>
                    <div className="flex text-gray-600 mt-1 items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {booking.turfInfo?.location || "Location"}
                    </div>
                    {booking.turfInfo?.type && (
                      <p className="text-sm text-gray-500">Type: {booking.turfInfo.type}</p>
                    )}
                  </div>
                  <Badge variant="secondary">{booking.sport || "Sport"}</Badge>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-primary" />{new Date(booking.date).toLocaleDateString()}</p>
                  <p className="flex items-center"><Clock className="w-4 h-4 mr-2 text-primary" />{booking.slotTime}</p>
                </div>
              </div>

              {/* QR or Rating */}
              {type === "active" ? (
                <div>
                  <p className="text-sm text-center text-gray-600 mb-1">QR Code</p>
                  <div className="flex justify-center">
                    <QRCode id={`qr-${booking._id}`} value={`TurfFinder-${booking._id}`} size={100} level="H" />
                  </div>
                  <Button variant="outline" size="sm" className="mt-2 ml-5 mx-auto block" onClick={() => onDownloadQR(booking._id)}>
                    <Download className="w-3 h-3 mr-1 ml-6" />Download
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">Booking ID</p>
                  <p className="font-mono text-sm">{booking._id}</p>
                  {booking.rating && (
                    <div className="flex justify-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < booking.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                      ))}
                    </div>
                  )}
                  <Button variant="outline" size="sm">Book Again</Button>
                </div>
              )}

              {/* Payment Info */}
              <div>
                <p className="text-sm text-center text-gray-600">Payment</p>
                <div className="bg-green-50 p-3 rounded-lg text-sm space-y-1">
                  <div className="flex justify-between"><span>Total:</span><span>₹{booking.totalAmount || 0}</span></div>
                  <div className="flex justify-between text-green-600"><span>Advance:</span><span>₹{booking.advanceAmount || 0}</span></div>
                  {booking.remainingAmount && booking.remainingAmount > 0 && (
                    <div className="flex justify-between font-semibold text-orange-600">
                      <span>Remaining:</span><span>₹{booking.remainingAmount}</span>
                    </div>
                  )}
                </div>
                {type === "active" && booking.remainingAmount && booking.remainingAmount > 0 ? (
                  <Button size="sm" className="w-full mt-3" onClick={() => onPay?.(booking._id, booking.remainingAmount!)}>
                    Pay Remaining ₹{booking.remainingAmount}
                  </Button>
                ) : type === "active" ? (
                  <Badge className="w-full mt-3 justify-center bg-green-500">Fully Paid</Badge>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserDashboard;
