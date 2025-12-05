"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { isAuthenticated, getUser } from "@/lib/auth";
import { getCurrentUser } from "@/lib/data-store";
import { createReport as createReportAPI } from "@/lib/api-data-store";
import { ReportCategory } from "@/types";
import { Upload, MapPin, AlertCircle, CheckCircle2, X, FileText, Image as ImageIcon, Globe, Phone } from "lucide-react";
import { showToastMessage } from "@/components/toast-provider";
import { HotlineModal } from "@/components/hotline-modal";
import { BackgroundOverlay } from "@/components/background-overlay";

// Dynamically import map component to avoid SSR issues
const MapPicker = dynamic(() => import("@/components/map-picker"), { ssr: false });

export default function ReportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "roads" as ReportCategory,
    subcategory: "",
    description: "",
    area: "",
    otherArea: "",
    urgent: false,
  });
  const [showHotline, setShowHotline] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Calculate progress based on form completion
  useEffect(() => {
    let step = 1;
    if (formData.title && formData.description) step = 2;
    if (formData.category && formData.subcategory) step = 3;
    if (location && formData.area) step = 4;
    setCurrentStep(step);
  }, [formData.title, formData.description, formData.category, formData.subcategory, formData.area, location]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Reset success state when component mounts (in case user navigates back)
    setSuccess(false);

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to a sample location if geolocation fails
          setLocation({ lat: 40.7128, lng: -74.006 });
        }
      );
    } else {
      setLocation({ lat: 40.7128, lng: -74.006 });
    }
  }, [router]);

  const categories: Record<ReportCategory, { subcategories?: string[] }> = {
    roads: { subcategories: ["Potholes", "Road Cracks", "Missing Signs", "Others"] },
    safety: { subcategories: ["Streetlight", "Traffic Hazard", "Broken Sidewalk", "Traffic Lights"] },
    environment: { subcategories: ["Water Issue", "Tree Damage", "Pollution", "Others"] },
    garbage: { subcategories: ["Illegal Dumping", "Delayed Pickup", "Overflowing Bins", "Others"] },
  };

  const hubliAreas = [
    "Keshwapur",
    "Vidyanagar",
    "Deshpande Nagar",
    "Unkal",
    "Gokul Road",
    "Old Hubli",
    "Navanagar",
    "Bengeri",
    "Ashok Nagar",
    "Hosur",
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Handle image upload - store as data URL for frontend-only mode
      let imageUrl = "";
      if (imageFile) {
        // Convert image to base64 data URL for local storage
        const reader = new FileReader();
        imageUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      }

      // Get current user - use default if not logged in
      const currentUser = getCurrentUser() || getUser() || { id: "guest_user", username: "Guest", email: "guest@example.com" };
      const username = currentUser.username || "Guest";
      
      // Ensure demo user always uses "demo_user" as userId
      let userId = currentUser.id;
      if (username === "demo" || username === "demo_user") {
        userId = "demo_user";
      }

      // Ensure location is set
      if (!location) {
        alert("Please select a location on the map");
        setLoading(false);
        return;
      }

      // Ensure area is set
      if (!formData.area) {
        alert("Please select an area");
        setLoading(false);
        return;
      }

      // Get the area value
      const areaValue = formData.area === "Other" ? formData.otherArea : formData.area;

      // Create the report with proper address in location
      const newReport = await createReportAPI({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        area: areaValue,
        status: "reported",
        location: {
          ...location,
          address: areaValue, // Set address from area
        },
        userId: userId,
        imageUrl: imageUrl || undefined,
        urgent: formData.urgent,
      });

      console.log("Report created:", newReport);
      console.log("Report userId:", userId, "Username:", username);
      showToastMessage("Report submitted successfully! 🎉", "success");

      // Reset form state
      setFormData({
        title: "",
        category: "roads",
        subcategory: "",
        description: "",
        area: "",
        otherArea: "",
        urgent: false,
      });
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        // Force reload the dashboard page to show new report
        router.refresh();
      }, 2000);
    } catch (error: any) {
      console.error("Report submission error:", error);
      const errorMessage = error?.message || "Failed to submit report. Please try again.";
      alert(errorMessage);
      showToastMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass rounded-2xl p-12 text-center shadow-2xl"
        >
          <CheckCircle2 className="mx-auto text-green-500 mb-4" size={64} />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
          <p className="text-gray-600">Your issue has been reported successfully.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <BackgroundOverlay>
      <Navbar />
      <div className="pt-28 pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 text-center"
            >
              <h1 className="text-5xl font-bold text-gray-900 mb-3">
                Report an <span className="text-gradient">Issue</span>
              </h1>
              <p className="text-gray-600 text-lg">Help us make your community safer and better</p>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="glass-strong rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Step {currentStep} of 4</span>
                  <span className="text-sm font-medium text-gray-700">{Math.round((currentStep / 4) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${(currentStep / 4) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full gradient-primary rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="card-gradient rounded-2xl p-8 md:p-12 shadow-2xl"
            >
            <div className="space-y-8">
              {/* Issue Info Section */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="border-b border-gray-200 pb-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center"
                  >
                    <FileText className="text-teal-600" size={20} />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900">Issue Information</h2>
                  {formData.title && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <CheckCircle2 className="text-green-500" size={20} />
                    </motion.div>
                  )}
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Issue Title *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-3 glass-strong rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none border-0 transition-all"
                    placeholder="e.g., Pothole on Main Street"
                  />
                </div>
              </motion.div>

              {/* Category Section */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="border-b border-gray-200 pb-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center"
                  >
                    <Globe className="text-purple-600" size={20} />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900">Category & Details</h2>
                  {formData.category && formData.description && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <CheckCircle2 className="text-green-500" size={20} />
                    </motion.div>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        category: e.target.value as ReportCategory,
                        subcategory: "",
                      });
                    }}
                    required
                    className="w-full px-4 py-3 glass-strong rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none border-0"
                  >
                    <option value="roads">🛣️ Roads</option>
                    <option value="safety">🚨 Safety</option>
                    <option value="environment">🌳 Environment</option>
                    <option value="garbage">🗑️ Garbage</option>
                  </select>
                </div>

              {/* Subcategory */}
              {categories[formData.category].subcategories && (
                <div>
                  <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <select
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F5D62] focus:border-transparent"
                  >
                    <option value="">Select subcategory</option>
                    {categories[formData.category].subcategories!.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={5}
                    className="w-full px-4 py-3 glass-strong rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none border-0 resize-none"
                    placeholder="Describe the issue in detail..."
                  />
                </div>
              </motion.div>

              {/* Upload Photo Section */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="border-b border-gray-200 pb-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center"
                  >
                    <ImageIcon className="text-blue-600" size={20} />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900">Upload Photo</h2>
                  {imagePreview && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <CheckCircle2 className="text-green-500" size={20} />
                    </motion.div>
                  )}
                </div>

                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50/50 transition-all group"
                  >
                    <Upload className="mx-auto text-gray-400 mb-3 group-hover:text-teal-500 transition-colors" size={40} />
                    <p className="text-gray-700 font-medium mb-1">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-4 right-4 p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg hover:scale-110 transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </motion.div>

              {/* Location Section */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="border-b border-gray-200 pb-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center"
                  >
                    <MapPin className="text-green-600" size={20} />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900">Location & Area</h2>
                  {location && formData.area && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <CheckCircle2 className="text-green-500" size={20} />
                    </motion.div>
                  )}
                </div>
                
                {/* Area Selection */}
                <div className="mb-6">
                  <label htmlFor="area" className="block text-sm font-semibold text-gray-700 mb-2">
                    Area * (Hubli)
                  </label>
                  <select
                    id="area"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value, otherArea: "" })}
                    required
                    className="w-full px-4 py-3 glass-strong rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none border-0"
                  >
                    <option value="">Select an area</option>
                    {hubliAreas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                  
                  {formData.area === "Other" && (
                    <motion.input
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      type="text"
                      value={formData.otherArea}
                      onChange={(e) => setFormData({ ...formData, otherArea: e.target.value })}
                      placeholder="Enter area name"
                      className="w-full mt-3 px-4 py-3 glass-strong rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none border-0"
                      required
                    />
                  )}
                </div>

                {location && (
                  <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-gray-200">
                    <MapPicker
                      location={location}
                      onLocationChange={setLocation}
                      height="400px"
                    />
                  </div>
                )}
              </motion.div>

              {/* Urgent Checkbox */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="urgent"
                    type="checkbox"
                    checked={formData.urgent}
                    onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
                    className="w-4 h-4 text-[#2F5D62] border-gray-300 rounded focus:ring-[#2F5D62]"
                  />
                  <label htmlFor="urgent" className="ml-2 flex items-center text-sm text-gray-700">
                    <AlertCircle size={16} className="mr-1 text-red-500" />
                    Mark as urgent (safety/health hazard)
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHotline(true)}
                  className="flex items-center gap-2 px-4 py-2 glass rounded-xl hover:bg-white/70 transition-all text-sm font-medium text-gray-700"
                >
                  <Phone size={16} />
                  Emergency Hotlines
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !location || !formData.area || !formData.title || !formData.description}
                className="w-full py-4 gradient-primary text-white font-bold rounded-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      ⏳
                    </motion.div>
                    Submitting...
                  </span>
                ) : (
                  "Submit Report"
                )}
              </button>
            </div>
          </motion.form>
        </div>
        </div>
      <Footer />
      <HotlineModal isOpen={showHotline} onClose={() => setShowHotline(false)} />
    </BackgroundOverlay>
  );
}

