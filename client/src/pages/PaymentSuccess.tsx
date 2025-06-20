
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Download, Calendar, Clock, MapPin, QrCode } from "lucide-react";
import QRCode from "qrcode.react";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingId] = useState(`TF${Date.now()}`);
  
  const bookingDetails = location.state?.bookingDetails || {};
  const paymentId = location.state?.paymentId || "";

  useEffect(() => {
    // In real app, save booking to database
    console.log("Booking created:", { bookingId, paymentId, ...bookingDetails });
  }, []);

  const downloadQR = () => {
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL();
      const a = document.createElement("a");
      a.download = `booking-${bookingId}.png`;
      a.href = url;
      a.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="text-center">
          <CardContent className="p-8">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h1>
              <p className="text-lg text-gray-600">
                Your booking has been confirmed. You'll receive a confirmation email shortly.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-semibold">{bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-semibold">{paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Turf:</span>
                  <span className="font-semibold">{bookingDetails.turf}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold">
                    {bookingDetails.date?.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-semibold">{bookingDetails.slot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-semibold text-green-600">₹{bookingDetails.amount}</span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center justify-center">
                <QrCode className="w-5 h-5 mr-2" />
                Your Booking QR Code
              </h3>
              <div className="flex justify-center mb-4">
                <QRCode 
                  id="qr-code"
                  value={`TurfFinder-${bookingId}`}
                  size={150}
                  level="H"
                />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Show this QR code at the venue for quick check-in
              </p>
              <Button variant="outline" onClick={downloadQR}>
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-orange-800 mb-2">Important Reminder</h3>
              <p className="text-sm text-orange-700">
                Please pay the remaining 50% amount after your game session. 
                You'll receive a payment link via SMS/WhatsApp.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="flex-1"
                onClick={() => navigate("/dashboard")}
              >
                View My Bookings
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate("/")}
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;
