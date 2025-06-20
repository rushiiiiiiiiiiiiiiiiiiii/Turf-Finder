
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { QrCode, CheckCircle, XCircle, Camera, User, MapPin, Clock, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QRScanner = () => {
  const [scannedCode, setScannedCode] = useState("");
  const [bookingInfo, setBookingInfo] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  // Mock booking data for demonstration
  const mockBookingData = {
    "TF1640995200": {
      id: "TF1640995200",
      turfName: "Green Valley Sports Complex",
      location: "Andheri West, Mumbai",
      customerName: "Rahul Sharma",
      date: "2024-01-15",
      time: "6:00 PM - 8:00 PM",
      sport: "Football",
      status: "confirmed",
      checkInTime: null
    }
  };

  const handleScan = () => {
    if (!scannedCode) return;
    
    setIsScanning(true);
    
    // Simulate scanning delay
    setTimeout(() => {
      const bookingId = scannedCode.replace("TurfFinder-", "");
      const booking = mockBookingData[bookingId as keyof typeof mockBookingData];
      
      if (booking) {
        setBookingInfo(booking);
      } else {
        setBookingInfo({ error: "Invalid QR Code" });
      }
      setIsScanning(false);
    }, 1500);
  };

  const handleCheckIn = () => {
    if (bookingInfo && !bookingInfo.error) {
      setBookingInfo({
        ...bookingInfo,
        checkInTime: new Date().toLocaleTimeString()
      });
    }
  };

  const reset = () => {
    setScannedCode("");
    setBookingInfo(null);
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            QR Code Scanner
          </h1>
          <p className="text-lg text-gray-600">
            Scan customer QR codes to validate bookings and check-in
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="w-5 h-5 mr-2" />
                Scan QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  {isScanning ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  ) : (
                    <Camera className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Position the QR code within the frame or enter manually below
                </p>
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="Enter QR code manually (e.g., TurfFinder-TF1640995200)"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                />
                <Button 
                  onClick={handleScan}
                  disabled={!scannedCode || isScanning}
                  className="w-full btn-primary"
                >
                  {isScanning ? "Scanning..." : "Validate Booking"}
                </Button>
                {bookingInfo && (
                  <Button onClick={reset} variant="outline" className="w-full">
                    Scan Another Code
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent>
              {!bookingInfo ? (
                <div className="text-center py-8">
                  <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No QR code scanned yet</p>
                </div>
              ) : bookingInfo.error ? (
                <div className="text-center py-8">
                  <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-600 mb-2">Invalid QR Code</h3>
                  <p className="text-gray-600">This QR code is not valid or the booking doesn't exist.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{bookingInfo.turfName}</h3>
                    <Badge className={`${bookingInfo.checkInTime ? 'bg-green-500' : 'bg-blue-500'}`}>
                      {bookingInfo.checkInTime ? 'Checked In' : 'Valid Booking'}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-primary" />
                      <span className="font-medium">Customer:</span>
                      <span className="ml-2">{bookingInfo.customerName}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-primary" />
                      <span className="font-medium">Location:</span>
                      <span className="ml-2">{bookingInfo.location}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-primary" />
                      <span className="font-medium">Date:</span>
                      <span className="ml-2">{bookingInfo.date}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-primary" />
                      <span className="font-medium">Time:</span>
                      <span className="ml-2">{bookingInfo.time}</span>
                    </div>

                    {bookingInfo.checkInTime && (
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        <span className="font-medium">Checked in at:</span>
                        <span className="ml-2">{bookingInfo.checkInTime}</span>
                      </div>
                    )}
                  </div>

                  {!bookingInfo.checkInTime && (
                    <Button onClick={handleCheckIn} className="w-full btn-primary">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Check In Customer
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Test */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              For testing, try scanning this code: <code className="bg-gray-100 px-2 py-1 rounded">TurfFinder-TF1640995200</code>
            </p>
            <Button 
              onClick={() => setScannedCode("TurfFinder-TF1640995200")}
              variant="outline"
              size="sm"
            >
              Load Test Code
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRScanner;
