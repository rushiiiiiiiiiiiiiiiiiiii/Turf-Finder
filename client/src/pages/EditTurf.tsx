// src/pages/EditTurf.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, X } from "lucide-react";
import axios from "axios";

const availableSports = ["Football", "Cricket", "Badminton", "Tennis", "Basketball", "Box Cricket"];
const availableAmenities = ["Parking", "Changing Room", "Floodlights", "Restroom", "Cafe", "Equipment Rental"];

const EditTurf = () => { 
    const { id } = useParams();
    const navigate = useNavigate();
    const [existingImages, setExistingImages] = useState([]);
    const [formData, setFormData] = useState({
        name: "", location: "", address: "", city: "", state: "", pincode: "",
        ownerName: "", ownerEmail: "", ownerPhone: "", ownerPassword: "",
        sports: [], amenities: [],
        pricePerHour: "", MinBookingPrice: "", description: "",
        images: []
    });
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    console.log(id)
    useEffect(() => {
        const fetchTurf = async () => {
            try {
                const res = await axios.get(`${backendUrl}/turf/getoneturf/${id}`);
                const turfs = res.data.turfs;

                if (turfs) {
                    setFormData({
                        name: turfs.name || "",
                        location: turfs.location || "",
                        address: turfs.address || "",
                        city: turfs.city || "",
                        state: turfs.state || "",
                        pincode: turfs.pincode || "",
                        ownerName: turfs.ownerName || "",
                        ownerEmail: turfs.ownerEmail || "",
                        ownerPhone: turfs.ownerPhone || "",
                        ownerPassword: "",
                        sports: Array.isArray(turfs.sports) ? turfs.sports : [],
                        amenities: Array.isArray(turfs.amenities) ? turfs.amenities : [],
                        pricePerHour: turfs.pricePerHour?.toString() || "",
                        MinBookingPrice: turfs.MinBookingPrice?.toString() || "",
                        description: turfs.description || "",
                        images: []
                    });
                    setExistingImages(turfs.images || []);
                }

            } catch (error) {
                console.error("Failed to fetch turf data", error);
            }
        };

        fetchTurf();
    }, [id]);


    const toggleArrayField = (field, value) => {
        setFormData(prev => {
            const arr = prev[field];
            const updated = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
            return { ...prev, [field]: updated };
        });
    };

   const handleSubmit = async e => {
    e.preventDefault();
    if (!id) {
        alert("Turf ID is missing. Cannot update.");
        return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
        if (["sports", "amenities"].includes(k)) {
            if (Array.isArray(v)) {
                v.forEach(item => data.append(k, item));
            }
        } else if (k !== "images") {
            data.append(k, String(v));
        }
    });

    // Append existing image paths
    existingImages.forEach(img => {
        data.append("existingImages", img);
    });

    // Append new image files
    formData.images.forEach((fileOrb64, i) => {
        if (typeof fileOrb64 === "object") {
            data.append("images", fileOrb64, `img${i}.png`);
        }
    });

    try {
        await axios.put(`${backendUrl}/turf/updateTurf/${id}`, data, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        navigate("/owner-dashboard");
    } catch (err) {
        console.error("Failed to update turf:", err);
        alert("Update failed. Check console for details.");
    }
};

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-4 max-w-3xl mx-auto">
            <Card><CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} placeholder="Name" />
                        <Input type="number" value={formData.pricePerHour} onChange={e => setFormData(f => ({ ...f, pricePerHour: e.target.value }))} placeholder="Price/hr" />
                        <Input type="number" value={formData.MinBookingPrice} onChange={e => setFormData(f => ({ ...f, MinBookingPrice: e.target.value }))} placeholder="Min Booking (%)" />
                    </div>
                    <textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} placeholder="Description" className="w-full p-2 h-28 border rounded" />
                </CardContent>
            </Card>

            <Card><CardHeader><CardTitle><MapPin className="mr-2" />Location</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Input value={formData.address} onChange={e => setFormData(f => ({ ...f, address: e.target.value }))} placeholder="Address" />
                   <div className="grid gap-4 md:grid-cols-2">
                        <Input value={formData.city} onChange={e => setFormData(f => ({ ...f, city: e.target.value }))} placeholder="City" />
                        <Input value={formData.state} onChange={e => setFormData(f => ({ ...f, state: e.target.value }))} placeholder="State" />
                        <Input value={formData.pincode} onChange={e => setFormData(f => ({ ...f, pincode: e.target.value }))} placeholder="Pincode" />
                    </div>
                </CardContent>
            </Card>

            <Card><CardHeader><CardTitle>Owner Details</CardTitle></CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <Input value={formData.ownerName} onChange={e => setFormData(f => ({ ...f, ownerName: e.target.value }))} placeholder="Owner Name" />
                    <Input type="email" value={formData.ownerEmail} onChange={e => setFormData(f => ({ ...f, ownerEmail: e.target.value }))} placeholder="Owner Email" />
                    {/* <Input value={formData.ownerPhone} onChange={e => setFormData(f => ({ ...f, ownerPhone: e.target.value }))} placeholder="Owner Phone" />
                    <Input type="password" value={formData.ownerPassword} onChange={e => setFormData(f => ({ ...f, ownerPassword: e.target.value }))} placeholder="New Password" /> */}
                </CardContent>
            </Card>

            <Card><CardHeader><CardTitle>Sports</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableSports.map(s =>
                        <Badge key={s} className="h-12" variant={formData.sports.includes(s) ? "default" : "outline"} onClick={() => toggleArrayField("sports", s)}>
                            {s}
                        </Badge>
                    )}
                </CardContent>
            </Card>

            <Card><CardHeader><CardTitle>Amenities</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2  sm:grid-cols-3 gap-2">
                    {availableAmenities.map(a =>
                        <Badge key={a} className="h-12" variant={formData.amenities.includes(a) ? "default" : "outline"} onClick={() => toggleArrayField("amenities", a)}>
                            {a}
                        </Badge>
                    )}
                </CardContent>
            </Card>

            <Card><CardHeader><CardTitle>Images</CardTitle></CardHeader>
                <CardContent>
                    <input type="file" multiple onChange={e => {
                        Array.from(e.target.files).forEach(file => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                setFormData(f => ({ ...f, images: [...f.images, file] }));
                            };
                            reader.readAsDataURL(file); // just to trigger storing the file
                        });
                    }} />
                    <div className="flex gap-2 mt-2">
                        {/* Existing images from DB */}
                        {existingImages.map((img, i) => (
                            <div key={`existing-${i}`} className="relative w-20 h-20">
                                <img
                                    src={`${backendUrl}/${img.replace(/\\/g, "/")}`}
                                    alt="Existing Turf"
                                    className="w-full h-full object-cover rounded"
                                />
                                <button
                                    type="button"
                                    onClick={() => setExistingImages(existingImages.filter((_, ii) => ii !== i))}
                                    className="absolute top-0 right-0 bg-white rounded-full"
                                >
                                    <X className="w-4 h-4 text-red-500" />
                                </button>
                            </div>
                        ))}

                        {/* New uploads */}
                        {formData.images.map((img, i) => (
                            <div key={`new-${i}`} className="relative w-20 h-20">
                                <img
                                    src={URL.createObjectURL(img)}
                                    className="w-full h-full object-cover rounded"
                                    alt="New Upload"
                                />
                                <button
                                    type="button"
                                    onClick={() => setFormData(f => ({
                                        ...f,
                                        images: f.images.filter((_, ii) => ii !== i)
                                    }))}
                                    className="absolute top-0 right-0 bg-white rounded-full"
                                >
                                    <X className="w-4 h-4 text-red-500" />
                                </button>
                            </div>
                        ))}

                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-4">
                <Button variant="outline" onClick={() => navigate("/owner-dashboard")}>Cancel</Button>
                <Button type="submit" className="btn-primary">Update Turf</Button>
            </div>
        </form>
    );
};

export default EditTurf;
