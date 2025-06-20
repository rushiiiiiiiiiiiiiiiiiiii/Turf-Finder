import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, Clock, CreditCard, MapPin } from "lucide-react";
import { toast } from "sonner";
const PaymentScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // const userid = localStorage.getItem('userid')

  const {
    turf,
    turfId,
    userid,
    ownerid,
    selectedDate,
    selectedSlotId,
    selectedSlotTime,
    totalAmount,
    advanceAmount,
    remainingAmount,
  } = location.state || {};
  console.log(ownerid)
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [upiRef, setUpiRef] = useState("");
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScreenshot(e.target.files?.[0] || null);
  };

  const handleConfirmBooking = async () => {
  if (!screenshot) return alert("Please upload payment screenshot");
  setLoading(true);

  try {
    const formData = new FormData();
    formData.append("userId", userid);
    formData.append("ownerId", ownerid);
    formData.append("turfId", turfId);
    formData.append("date", selectedDate);
    formData.append("slotId", selectedSlotId);
    formData.append("slotTime", selectedSlotTime);
    formData.append("totalAmount", totalAmount.toString());
    formData.append("advanceAmount", advanceAmount.toString());
    formData.append("remainingAmount", remainingAmount.toString());
    formData.append("upiRef", upiRef);
    formData.append("screenshot", screenshot);

    // 1. Create booking
    await axios.post(`${backendUrl}/turf/createbooking`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // 2. Mark the slot as unavailable

    await axios.patch(`${backendUrl}/turf/slotbooked/${selectedSlotId}`,{
      available: false,
    });

    toast.success("Booking confirmed!");
    navigate("/dashboard");
  } catch (err) {
    console.error(err);
    toast.error("Booking failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 flex flex-col items-center gap-8">
      {/* Smaller summary */}
      <Card className="w-full shadow-md p-4">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-base">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-0">
          {turf && (
            <div className="flex gap-3 items-center">
              <img
                src={`${backendUrl}/${turf.images?.[0]?.replace(/\\/g, "/")}`}
                alt="Turf"
                className="w-16 h-16 object-cover rounded-md"
              />
              <div>
                <div className="font-medium text-sm">{turf.name}</div>
                <div className="text-xs text-gray-600 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {turf.address}, {turf.city}
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs border-t pt-2">
            <div className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3 text-gray-600" />
              <span>{new Date(selectedDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-600" />
              <span>{selectedDate}</span>
            </div>
            <div className="flex items-center gap-1 col-span-2">
              <CreditCard className="w-3 h-3 text-gray-600" />
              <span>Total: ₹{totalAmount}</span>
            </div>
            <div className="flex justify-between text-primary font-semibold col-span-2">
              <span>Advance:</span>
              <span>₹{advanceAmount}</span>
            </div>
            <div className="flex justify-between text-orange-600 col-span-2">
              <span>Remaining:</span>
              <span>₹{remainingAmount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment section */}
      <Card className="w-full shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Pay & Confirm Booking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-700 mb-2">
              Please scan the QR code or use the UPI ID to pay ₹{advanceAmount}.
            </p>
            {/* Dummy scanner */}
            <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <span className="text-gray-500">Scanner</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              UPI ID: <strong>turfowner@upi</strong>
            </p>
          </div>

          <div>
            <Label>Upload Payment Screenshot</Label>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          <div>
            <Label>UPI Reference Number (optional)</Label>
            <Input
              value={upiRef}
              onChange={(e) => setUpiRef(e.target.value)}
              placeholder="Ex: 1234567890"
            />
          </div>

          <Button
            disabled={loading || !screenshot}
            className="w-full"
            onClick={handleConfirmBooking}
          >
            {loading ? "Confirming..." : "Confirm Booking"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentScreen;
