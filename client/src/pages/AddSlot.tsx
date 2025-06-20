import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";

const AddSlot = () => {
  const { id } = useParams(); // turf ID
  const navigate = useNavigate();
  const ownerId = localStorage.getItem("userId");
  const [turfPrice, setTurfPrice] = useState(null);
  const [slots, setSlots] = useState([]);
  const [startTime, setStartTime] = useState("07:00");
  const endTimeRefs = useRef([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const pad = (n) => (n < 10 ? `0${n}` : n);

  const generateSlots = (durationMinutes = 60) => {
    if (!startTime) return alert("Please enter the start time for the day.");

    const [startHour, startMin] = startTime.split(":").map(Number);
    const totalStartMinutes = startHour * 60 + startMin;
    const endOfDay = 22 * 60;

    const newSlots = [];
    for (
      let time = totalStartMinutes;
      time + durationMinutes <= endOfDay;
      time += durationMinutes
    ) {
      const startH = Math.floor(time / 60);
      const startM = time % 60;
      const endH = Math.floor((time + durationMinutes) / 60);
      const endM = (time + durationMinutes) % 60;

      newSlots.push({
        start: `${pad(startH)}:${pad(startM)}`,
        end: `${pad(endH)}:${pad(endM)}`,
        price: turfPrice || 0,
        availability: true,
      });
    }

    setSlots(newSlots);
  };

  const addEmptySlot = () => {
    setSlots([
      ...slots,
      {
        start: "",
        end: "",
        price: turfPrice || 0,
        availability: true,
      },
    ]);
  };

  const handleSlotChange = (index, field, value) => {
    const updated = [...slots];
    updated[index][field] = field === "price" ? parseFloat(value) : value;
    setSlots(updated);

    if (field === "start" && endTimeRefs.current[index]) {
      endTimeRefs.current[index].focus();
    }
  };

  const removeSlot = (index) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const isValid = slots.every((s) => {
      if (!s.start || !s.end || s.price < 0) return false;
      return s.start < s.end;
    });

    if (!isValid) return alert("Please check all slot times and prices.");

    try {
      await axios.post(`${backendUrl}/turf/addslots`, {
        turfId: id,
        ownerId,
        slots: slots.map((s) => ({
          ...s,
          price: Number(s.price),
        })),
      });
      toast.success("Slots added successfully!");
      navigate("/owner-dashboard");
    } catch (error) {
      console.error("Error adding slots:", error);
      toast.error("Failed to add slots");
    }
  };

  useEffect(() => {
    const fetchTurf = async () => {
      try {
        const res = await axios.get(`${backendUrl}/turf/getoneturf/${id}`);
        setTurfPrice(res.data.turfs.pricePerHour);
      } catch (error) {
        console.error("Failed to fetch turf: ", error);
      }
    };

    if (id) fetchTurf();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Add Turf Time Slots</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Day Start Time Input */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Day Start Time:</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-32"
              />
            </div>

            {/* Generate Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => generateSlots(60)} variant="secondary">
                <Clock className="w-4 h-4 mr-2" />
                Generate 1hr Slots
              </Button>
              <Button onClick={() => generateSlots(120)} variant="secondary">
                <Clock className="w-4 h-4 mr-2" />
                Generate 2hr Slots
              </Button>
              <Button onClick={addEmptySlot} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Slot
              </Button>
            </div>

            {/* Labels */}
            {slots.length > 0 && (
              <div className="grid grid-cols-12 gap-2 font-medium text-sm text-gray-700 px-1">
                <span className="col-span-4">Start Time</span>
                <span className="col-span-4">End Time</span>
                <span className="col-span-2">Price</span>
                <span className="col-span-1 ml-5">Delete</span>
              </div>
            )}

            {/* Slot List */}
            <div className="space-y-2">
              {slots.map((slot, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <Input
                    type="time"
                    value={slot.start}
                    onChange={(e) => handleSlotChange(index, "start", e.target.value)}
                    className="col-span-4 bg-red-50"
                  />
                  <Input
                    type="time"
                    value={slot.end}
                    onChange={(e) => handleSlotChange(index, "end", e.target.value)}
                    className="col-span-4 bg-red-50"
                    ref={(el) => (endTimeRefs.current[index] = el)}
                  />
                  <Input
                    type="number"
                    value={slot.price}
                    min={0}
                    onChange={(e) => handleSlotChange(index, "price", e.target.value)}
                    className="col-span-3 bg-green-100"
                    placeholder="Price"
                  />
                  <Button
                    variant="ghost"
                    onClick={() => removeSlot(index)}
                    size="icon"
                    className="col-span-1"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleSubmit}>
              ✅ Save All Slots
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddSlot;
