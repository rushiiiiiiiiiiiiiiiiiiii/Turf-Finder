import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, QrCode, MapPin, Users, Calendar, Clock, TrendingUp } from "lucide-react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const OwnerDashboard = () => {
  const [turf, setTurf] = useState([]);
  const [turfBooking, setTurfBooking] = useState([]);
  const ownerid = localStorage.getItem("userId");
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchTurf = async () => {
      try {
        const res = await axios.get(`${backendUrl}/turf/getturfdetails/${ownerid}`);
        const turfData = res.data?.turfs || [];
        setTurf(turfData);
      } catch (error) {
        console.error("Failed to fetch turf: ", error);
      }
    };
    fetchTurf();
  }, [ownerid]);

  useEffect(() => {
    const fetchTurfBookings = async () => {
      try {
        const res = await axios.get(`${backendUrl}/turf/getBookingsByOwner/${ownerid}`);
        const bookingData = res.data.Bookings || [];
        setTurfBooking(bookingData);
      } catch (error) {
        console.error("Failed to fetch turf bookings: ", error);
      }
    };
    fetchTurfBookings();
  }, [ownerid]);

  const bookingsPerTurf = turfBooking.reduce((acc, booking) => {
    acc[booking.turf] = (acc[booking.turf] || 0) + 1;
    return acc;
  }, {});

  const revenuePerTurf = turfBooking.reduce((acc, booking) => {
    acc[booking.turf] = (acc[booking.turf] || 0) + booking.totalAmount;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Owner Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Manage your turfs and bookings
            </p>
          </div>
          <Link to="/turf-registration">
            <Button className="btn-primary mt-4 sm:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Add New Turf
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">My Turfs</p>
                  <p className="text-2xl font-bold text-primary">{turf?.length}</p>
                </div>
                <MapPin className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-primary">{turfBooking.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-primary">
                    ₹{turfBooking.reduce((sum, b) => sum + b.totalAmount, 0)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-primary">24</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="turfs" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="turfs">My Turfs ({turf.length})</TabsTrigger>
            <TabsTrigger value="bookings">All Bookings ({turfBooking.length})</TabsTrigger>
          </TabsList>

          {/* Turf Tab */}
          <TabsContent value="turfs" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {turf?.map((item) => (
                <Card key={item._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{item.name}</CardTitle>
                        <div className="flex items-center text-gray-600 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{item.address}, {item.city}</span>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {item.sports?.[0] || "N/A"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center bg-green-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Total Bookings</p>
                        <p className="text-xl font-bold text-primary">
                          {bookingsPerTurf[item._id] || 0}
                        </p>
                      </div>
                      <div className="text-center bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-xl font-bold text-blue-600">
                          ₹{revenuePerTurf[item._id] || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/turf/${item._id}`)}>
                        View Details
                      </Button>
                      <Button onClick={() => navigate(`/edit-turf/${item._id}`)}>
                        Edit Turf
                      </Button>
                      <Button variant="default" size="sm" className="flex-1" onClick={() => navigate(`/addslot/${item._id}`)}>
                        Add Slot
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Booking Tab */}
          <TabsContent value="bookings" className="mt-6">
            <div className="space-y-4">
              {turfBooking.map((booking) => (
                <Card key={booking._id}>
                  <CardContent className="p-6">
                    <div className="grid lg:grid-cols-5 gap-4 items-start">
                      {/* User Info */}
                      <div>
                        <h3 className="font-semibold">{booking.user?.name || "User"}</h3>
                        <p className="text-sm text-gray-600">{booking.user?.phone || "Phone N/A"}</p>
                        <p className="text-sm text-gray-600">Booking ID: {booking._id}</p>
                      </div>

                      {/* Turf & Time Info */}
                      <div>
                        <p className="font-medium">{booking.turf?.name || "Turf"}</p>
                        <div className="flex items-center text-gray-600 mt-1">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{booking.slotTime}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Date: {new Date(booking.date).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="text-center">
                        {/* {booking.checkedIn ? (
                          <Badge className="bg-green-500">Checked In</Badge>
                        ) : (
                          <Badge variant="outline">Pending Check-in</Badge>
                        )} */}
                        <p className="text-sm mt-1 text-gray-500">Status: {booking.status}</p>
                      </div>

                      {/* Screenshot */}
                      <div className="w-full max-w-[150px]">
                        {booking.screenshot && (
                          <img
                            src={`${backendUrl}/${booking.screenshot.replace(/\\/g, "/")}`}
                            alt="Payment Screenshot"
                            className="rounded border shadow"
                          />
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2">
                        {/* {!booking.checkedIn && (
                          <Button size="sm" className="btn-primary">
                            <QrCode className="w-4 h-4 mr-2" />
                            Scan QR
                          </Button>
                        )} */}
                        <Button variant="outline" size="sm">
                          Contact
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OwnerDashboard;
