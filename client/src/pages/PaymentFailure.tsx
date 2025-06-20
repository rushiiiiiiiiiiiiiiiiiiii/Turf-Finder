
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";

const PaymentFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="text-center">
          <CardContent className="p-8">
            <div className="mb-6">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Payment Failed
              </h1>
              <p className="text-lg text-gray-600">
                We couldn't process your payment. Please try again or use a different payment method.
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-red-800 mb-2">What happened?</h2>
              <ul className="text-sm text-red-700 text-left space-y-1">
                <li>• Payment gateway timeout</li>
                <li>• Insufficient balance</li>
                <li>• Card declined by bank</li>
                <li>• Network connectivity issues</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Try these solutions:</h3>
              <ul className="text-sm text-blue-700 text-left space-y-1">
                <li>• Check your internet connection</li>
                <li>• Verify your card details</li>
                <li>• Use a different payment method</li>
                <li>• Contact your bank if the issue persists</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="flex-1 btn-primary"
                onClick={() => navigate(-1)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Need help? Contact us at{" "}
                <a href="mailto:support@turffinder.com" className="text-primary hover:underline">
                  support@turffinder.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentFailure;
