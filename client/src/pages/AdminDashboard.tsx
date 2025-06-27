import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Users, CalendarCheck2, Landmark } from "lucide-react";

// Type definitions
type User = {
  _id: string;
  name: string;
  phone: string;
  role: string;
};

type Turf = {
  _id: string;
  name: string;
  address: string;
  city: string;
  pricePerHour: string;
};

type Booking = {
  _id: string;
  user: string;
  turf: string;
  slotTime: string;
  date: string;
  status: string;
  totalAmount: number;
};
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// API Fetchers
const fetchUsers = async (): Promise<User[]> => {
  const res = await axios.get(`${backendUrl}/turf/getAllUsers`);
  return res.data.AllUsers || [];
};

const fetchBookings = async (): Promise<Booking[]> => {
  const res = await axios.get(`${backendUrl}/turf/getAllBookings`);
  return res.data.Bookings || [];
};

const fetchTurfs = async (): Promise<Turf[]> => {
  const res = await axios.get(`${backendUrl}/turf/getallturf`);
  return res.data.turfs || [];
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<"users" | "turfs" | "bookings">("users");

  const {
    data: users = [],
    isLoading: loadingUsers,
    error: usersError,
  } = useQuery<User[]>({ queryKey: ["AllUser"], queryFn: fetchUsers });

  const {
    data: bookings = [],
    isLoading: loadingBookings,
    error: bookingsError,
  } = useQuery<Booking[]>({ queryKey: ["Bookings"], queryFn: fetchBookings });

  const {
    data: turfs = [],
    isLoading: loadingTurfs,
    error: turfsError,
  } = useQuery<Turf[]>({ queryKey: ["turfs"], queryFn: fetchTurfs });

const Loader = () => (
  <div className="flex justify-center items-center py-20">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
  </div>
);

if (loadingUsers || loadingBookings || loadingTurfs) return <Loader />;

  if (usersError || bookingsError || turfsError) {
    return (
      <div className="text-center text-red-500 mt-10 text-base font-medium">
        Error loading data. Please check your network or server.
      </div>
    );
  }

  const recentUsers = [...users].slice(-5).reverse();
  const recentTurfs = [...turfs].slice(-5).reverse();

  const getUserNameById = (id: string) => users.find((u) => u._id === id)?.name || "Unknown User";
  const getTurfNameById = (id: string) => turfs.find((t) => t._id === id)?.name || "Unknown Turf";

  return (
    <div className="p-6 space-y-10 max-w-screen-xl mx-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-md rounded-2xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Total Users</h2>
              <p className="text-4xl font-bold text-blue-600">{users.length}</p>
            </div>
            <Users className="text-blue-600 w-10 h-10" />
          </CardContent>
        </Card>
        <Card className="shadow-md rounded-2xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Total Bookings</h2>
              <p className="text-4xl font-bold text-green-600">{bookings.length}</p>
            </div>
            <CalendarCheck2 className="text-green-600 w-10 h-10" />
          </CardContent>
        </Card>
        <Card className="shadow-md rounded-2xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Total Turfs</h2>
              <p className="text-4xl font-bold text-purple-600">{turfs.length}</p>
            </div>
            <Landmark className="text-purple-600 w-10 h-10" />
          </CardContent>
        </Card>
      </div>

      {/* Tab Buttons */}
      <div className="flex justify-center gap-4">
        {["users", "turfs", "bookings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "users" | "turfs" | "bookings")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <div>
        {activeTab === "users" && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Recent User Registrations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentUsers.map((user) => (
                <Card key={user._id} className="rounded-2xl shadow-sm hover:shadow-md transition">
                  <CardContent className="p-4 space-y-1">
                    <h4 className="font-bold text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-600">📞 {user.phone}</p>
                    <p className="text-sm text-gray-700">Role: {user.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "turfs" && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Recent Turf Registrations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentTurfs.map((turf) => (
                <Card key={turf._id} className="rounded-2xl shadow-sm hover:shadow-md transition">
                  <CardContent className="p-4 space-y-1">
                    <h4 className="font-bold text-gray-900">{turf.name}</h4>
                    <p className="text-sm text-gray-600">
                      📍 {turf.address}, {turf.city}
                    </p>
                    <p className="text-sm text-gray-700">₹{parseInt(turf.pricePerHour)} /hr</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">All Bookings</h3>
            <div className="overflow-x-auto rounded-2xl shadow-sm">
              <table className="min-w-full border border-gray-200 text-sm bg-white">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-3 border">User</th>
                    <th className="p-3 border">Turf</th>
                    <th className="p-3 border">Slot</th>
                    <th className="p-3 border">Date</th>
                    <th className="p-3 border">Status</th>
                    <th className="p-3 border">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="text-gray-700 hover:bg-gray-50 transition">
                      <td className="p-3 border">{getUserNameById(booking.user)}</td>
                      <td className="p-3 border">{getTurfNameById(booking.turf)}</td>
                      <td className="p-3 border">{booking.slotTime}</td>
                      <td className="p-3 border">{new Date(booking.date).toLocaleDateString()}</td>
                      <td className="p-3 border">{booking.status}</td>
                      <td className="p-3 border font-medium text-green-600">
                        ₹{booking.totalAmount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
