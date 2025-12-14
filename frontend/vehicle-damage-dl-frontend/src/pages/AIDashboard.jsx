import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

// Correct firebase.js imports
import app, { auth, db } from "../../firebase";

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp
} from "firebase/firestore";

import demoVideo from "../assets/aivideo/aivideo.mp4";

export default function AIDashboard() {
  const location = useLocation();

  // State Management
  const [step, setStep] = useState(location?.state?.startStep || 1);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [vehicleBrands, setVehicleBrands] = useState({});
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [damagedParts, setDamagedParts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("checking");
  const [carDetails, setCarDetails] = useState({ type: "", color: "", year: "", fuel: "" });
  const [user, setUser] = useState(null);
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  // Subscription & Usage Tracking
  const [usageCount, setUsageCount] = useState(0);
  const [subscription, setSubscription] = useState(null);
  const [checkingLimits, setCheckingLimits] = useState(false);

  // History
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // API Configuration
  const API_BASE_URL = "http://127.0.0.1:5000";
  const ENDPOINTS = {
    VEHICLE_BRANDS: `${API_BASE_URL}/vehicle-brands`,
    PREDICT: `${API_BASE_URL}/predict`,
    HEALTH: `${API_BASE_URL}/health`,
    STATIC: `${API_BASE_URL}/static`
  };

  // AUTO COLOR DETECTION HELPERS
  const extractAverageColor = (imageUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imageUrl;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0, g = 0, b = 0, count = 0;

        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        resolve(getColorName(r, g, b));
      };

      img.onerror = () => {
        resolve("Unknown");
      };
    });
  };

  const getColorName = (r, g, b) => {
    if (r > 200 && g > 200 && b > 200) return "White";
    if (r < 60 && g < 60 && b < 60) return "Black";
    if (r > g && r > b) return "Red";
    if (g > r && g > b) return "Green";
    if (b > r && b > g) return "Blue";
    return "Silver";
  };

  // Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchHistory(currentUser.uid);
        checkUsageAndSubscription(currentUser.uid);
      } else {
        setHistoryList([]);
        setUsageCount(0);
        setSubscription(null);
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Backend checks & initial fetch
  useEffect(() => {
    checkBackendConnection();
    fetchVehicleBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkBackendConnection = async () => {
    try {
      await axios.get(ENDPOINTS.HEALTH, { timeout: 5000 });
      setConnectionStatus("connected");
    } catch (error) {
      setConnectionStatus("failed");
    }
  };

  const fetchVehicleBrands = async () => {
    if (connectionStatus === "failed") {
      setVehicleBrands(getFallbackVehicleData());
      return;
    }

    try {
      const response = await axios.get(ENDPOINTS.VEHICLE_BRANDS, { timeout: 8000 });
      setVehicleBrands(response.data || getFallbackVehicleData());
    } catch (error) {
      setVehicleBrands(getFallbackVehicleData());
    }
  };

  const getFallbackVehicleData = () => ({
    "Toyota": ["Fortuner", "Innova", "Glanza", "Camry", "Corolla"],
    "Hyundai": ["Creta", "Venue", "i20", "i10", "Verna"],
    "Tata": ["Harrier", "Nexon", "Punch", "Safari", "Tiago"],
    "Honda": ["City", "Civic", "Amaze", "Accord", "CR-V"],
    "Kia": ["Seltos", "Sonet", "Carens", "Carnival"],
    "Mahindra": ["XUV500", "Scorpio", "Bolero", "Thar"],
    "Ford": ["Ecosport", "Endeavour", "Figo", "Aspire"],
    "MarutiSuzuki": ["Swift", "Baleno", "Dzire", "WagonR"]
  });

  // Try our AI
  const handleTryOurAI = () => {
    if (!user) {
      setShowLoginAlert(true);
      return;
    }

    // Check usage limits
    const FREE_LIMIT = 2;
    const hasActiveSubscription = subscription && new Date(subscription.endDate) > new Date();

    if (usageCount >= FREE_LIMIT && !hasActiveSubscription) {
      // Redirect to subscription page
      window.location.href = '/subscription';
      return;
    }

    setStep(2);
  };

  // Image handling
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImageFile(file);
      setImage(imageUrl);
      const autoColor = await extractAverageColor(imageUrl);
      setCarDetails(prev => ({ ...prev, color: autoColor }));
    }
  };

  const startCamera = async () => {
    try {
      setCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied or not available.");
      setCapturing(false);
    }
  };

  const stopCamera = () => {
    setCapturing(false);
    try {
      videoRef.current?.srcObject?.getTracks().forEach(track => track.stop());
    } catch (e) {
      // ignore
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    if (!video?.videoWidth) return alert("Camera not ready");
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
      if (!blob) return alert("Capture failed");
      const file = new File([blob], "captured.jpg", { type: "image/jpeg" });
      const imageUrl = URL.createObjectURL(file);
      setImageFile(file);
      setImage(imageUrl);
      const autoColor = await extractAverageColor(imageUrl);
      setCarDetails(prev => ({ ...prev, color: autoColor }));
      stopCamera();
    }, "image/jpeg", 0.95);
  };

  // Car detail change
  const handleCarDetailChange = (field, value) => {
    setCarDetails(prev => ({ ...prev, [field]: value }));
  };

  // Firestore helpers (NO image upload)
  const saveResultToFirestore = async ({ uid, payload }) => {
    try {
      const col = collection(db, "user_reports");
      const docRef = await addDoc(col, {
        userId: uid,
        // imageUrl intentionally omitted (we don't store images)
        brand: payload.brand || null,
        model: payload.model || null,
        carDetails: payload.carDetails || null,
        prediction: payload.prediction || null,
        damagedParts: payload.damagedParts || [],
        createdAt: serverTimestamp()
      });
      console.info("saveResultToFirestore - doc created:", docRef.id);
      return docRef.id;
    } catch (err) {
      console.error("Failed to save report to Firestore:", err);
      return null;
    }
  };

  const fetchHistory = async (uid) => {
    if (!uid) return;
    setLoadingHistory(true);
    try {
      const col = collection(db, "user_reports");
      const q = query(col, where("userId", "==", uid), orderBy("createdAt", "desc"), limit(50));
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setHistoryList(items);
      setUsageCount(items.length); // Update usage count based on history
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const checkUsageAndSubscription = async (uid) => {
    if (!uid) return;
    setCheckingLimits(true);
    try {
      // Check active subscription
      const subQuery = query(
        collection(db, "subscriptions"),
        where("userId", "==", uid),
        where("status", "==", "active")
      );
      const subSnap = await getDocs(subQuery);
      if (!subSnap.empty) {
        const subData = subSnap.docs[0].data();
        const endDate = new Date(subData.endDate);
        if (endDate > new Date()) {
          setSubscription({ ...subData, id: subSnap.docs[0].id });
        } else {
          // Subscription expired
          await updateDoc(doc(db, "subscriptions", subSnap.docs[0].id), { status: "expired" });
          setSubscription(null);
        }
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setSubscription(null);
    } finally {
      setCheckingLimits(false);
    }
  };

  // Prediction API call, auto-save on success (no image saving)
  const handlePredict = async () => {
    if (!imageFile) return alert("Please upload an image");
    if (!selectedBrand || !selectedModel) return alert("Please select brand and model");
    if (!carDetails.type || !carDetails.color || !carDetails.year || !carDetails.fuel) {
      return alert("Please complete vehicle details");
    }
    if (connectionStatus === "failed") return alert("Backend not connected");

    setLoading(true);
    setStep(6);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("brand", selectedBrand);
      formData.append("model", selectedModel);
      formData.append("type", carDetails.type);
      formData.append("color", carDetails.color);
      formData.append("year", carDetails.year);
      formData.append("fuel", carDetails.fuel);

      const response = await axios.post(ENDPOINTS.PREDICT, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });

      if (response.data?.success) {
        setPrediction(response.data);
        const parts = response.data.cost_results?.map((item, idx) => ({
          part: item.damage_type,
          severity_label: item.severity,
          cost: item.cost,
          image: response.data.crops?.[idx] ? response.data.crops[idx] : ""
        })) || [];
        setDamagedParts(parts);
        setStep(7);

        if (user) {
          try {
            const payload = {
              brand: selectedBrand,
              model: selectedModel,
              carDetails,
              prediction: response.data,
              damagedParts: parts
            };
            await saveResultToFirestore({
              uid: user.uid,
              payload
            });
            // Refresh history and usage count after successful save
            fetchHistory(user.uid);
            checkUsageAndSubscription(user.uid);
          } catch (err) {
            console.error("Auto-save failed (no image):", err);
          }
        }
      } else {
        alert("Analysis failed");
        setStep(4);
      }
    } catch (error) {
      console.error("Prediction failed:", error);
      alert("Analysis failed. Check backend connection.");
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  // Manual save (no image saved)
  const handleManualSave = async () => {
    if (!user) return alert("Login required to save history");
    try {
      const payload = {
        brand: selectedBrand,
        model: selectedModel,
        carDetails,
        prediction,
        damagedParts
      };
      await saveResultToFirestore({ uid: user.uid, payload });
      // Refresh history and usage count after successful save
      fetchHistory(user.uid);
      checkUsageAndSubscription(user.uid);
      alert("Saved to history");
    } catch (err) {
      console.error("Manual save failed (no image):", err);
      alert("Save failed");
    }
  };

  // Helpers
  const totalCost = damagedParts.reduce((sum, p) => sum + (p.cost || 0), 0);

  const printResults = () => {
    const printContent = document.getElementById("printable-results")?.innerHTML;
    if (!printContent) return alert("No content to print");

    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return alert("Please allow popups to print");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vehicle Damage Analysis Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 40px; 
              color: #333; 
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333; 
              padding-bottom: 20px; 
            }
            .summary-cards { 
              display: flex; 
              justify-content: space-around; 
              margin: 30px 0; 
              text-align: center; 
            }
            .summary-card { 
              padding: 20px; 
              border: 1px solid #ddd; 
              border-radius: 10px; 
              min-width: 150px; 
            }
            .damage-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
            }
            .damage-table th, .damage-table td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left; 
            }
            .damage-table th { 
              background-color: #f8f9fa; 
            }
            .total-cost { 
              text-align: right; 
              font-size: 1.5em; 
              font-weight: bold; 
              margin-top: 30px; 
              color: #059669; 
            }
            .severity-high { 
              background-color: #fee2e2; 
              color: #dc2626; 
              padding: 4px 8px; 
              border-radius: 12px; 
              display: inline-block;
            }
            .severity-medium { 
              background-color: #fef3c7; 
              color: #d97706; 
              padding: 4px 8px; 
              border-radius: 12px; 
              display: inline-block;
            }
            .severity-low { 
              background-color: #dcfce7; 
              color: #16a34a; 
              padding: 4px 8px; 
              border-radius: 12px; 
              display: inline-block;
            }
            .damage-image { 
              width: 80px; 
              height: 80px; 
              object-fit: cover; 
              border-radius: 8px; 
            }
            .print-total-section { 
              background-color: #f8f9fa; 
              padding: 20px; 
              border-radius: 10px; 
              margin-top: 30px; 
            }
            @media print { 
              body { 
                margin: 0; 
                padding: 20px;
              } 
              .no-print { display: none; } 
              .page-break { page-break-before: always; }
              @page {
                margin: 20mm;
                size: A4;
              }
            }
            button {
              display: none;
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Vehicle Damage Analysis Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p><strong>Vehicle:</strong> ${selectedBrand} ${selectedModel} | ${carDetails.type} | ${carDetails.color} | ${carDetails.year} | ${carDetails.fuel}</p>
          </div>
          ${printContent}
          
          <div class="print-total-section">
            <div class="total-cost">
              <h3>Summary</h3>
              <p>Total Damage Areas: ${damagedParts.length}</p>
              <p>Critical Damages: ${damagedParts.filter(p => p.severity_label?.toLowerCase() === 'high').length}</p>
              <p><strong>TOTAL REPAIR COST: ₹${totalCost.toLocaleString()}</strong></p>
            </div>
          </div>
          
          <div style="margin-top: 40px; text-align: center; color: #666; font-size: 0.9em;">
            <p>--- End of Report ---</p>
            <p>This report was generated by AI-Powered Vehicle Damage Detection System</p>
            <p><button onclick="window.print()" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #059669; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Report</button></p>
          </div>
          
          <script>
            setTimeout(() => {
              window.print();
            }, 1000);
            window.addEventListener('afterprint', function() {
              setTimeout(function() {
                window.close();
              }, 1000);
            });
            document.addEventListener('keydown', function(e) {
              if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                window.print();
              }
            });
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
  };

  const resetFlow = () => {
    setStep(1);
    setSelectedBrand("");
    setSelectedModel("");
    setImage(null);
    setImageFile(null);
    setPrediction(null);
    setDamagedParts([]);
    setCarDetails({ type: "", color: "", year: "", fuel: "" });
  };

  // Brand logos mapping
  const brandLogos = {
    "Toyota": "https://logos-world.net/wp-content/uploads/2020/04/Toyota-Symbol.png",
    "Hyundai": "https://www.pngall.com/wp-content/uploads/13/Hyundai-Logo-PNG-File.png",
    "Tata": "https://logolook.net/wp-content/uploads/2023/07/Tata-Emblem.png",
    "Honda": "https://logos-world.net/wp-content/uploads/2021/03/Honda-Emblem.png",
    "Kia": "https://static.wixstatic.com/media/f2bf43_8a25cd1971634bb2926fbc2c366af06e~mv2.png",
    "Mahindra": "https://car-logos.net/wp-content/uploads/2023/04/mahindra-logo-2021-present-scaled.webp",
    "Ford": "https://www.freepnglogos.com/uploads/hd-ford-car-logo-png-31.png",
    "MarutiSuzuki": "https://www.freepnglogos.com/uploads/suzuki-png-logo/latest-models-world-suzuki-png-logo-0.png",
  };

  // Login alert popup
  const LoginAlert = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={() => setShowLoginAlert(false)}
    >
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h3 className="text-2xl font-bold mb-4">Login Required</h3>
          <p className="text-gray-300 mb-6">
            Please login to access our AI-powered vehicle damage detection feature.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => setShowLoginAlert(false)}
              className="px-6 py-3 border border-gray-600 rounded-xl hover:bg-gray-700"
            >
              Cancel
            </button>
            <button 
              onClick={() => window.location.href = '/login'}
              className="px-6 py-3 bg-purple-600 rounded-xl hover:bg-purple-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  // Step layouts
  const Step1Hero = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
      {/* Subscription Status */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-gray-800 rounded-2xl p-6 border border-gray-600"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Usage Status</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-300">
                  Free Uses: {usageCount}/2
                </span>
                {subscription ? (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    new Date(subscription.endDate) > new Date()
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {new Date(subscription.endDate) > new Date()
                      ? `Active: ${subscription.planName}`
                      : 'Subscription Expired'
                    }
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                    No Active Subscription
                  </span>
                )}
              </div>
            </div>
            {usageCount >= 2 && !subscription && (
              <button
                onClick={() => window.location.href = '/subscription'}
                className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                Upgrade Now
              </button>
            )}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
          <motion.h1 initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold mb-6">
            AI-Powered <span className="text-purple-400">Vehicle Damage</span> Detection
          </motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-xl text-gray-300 mb-8">
            Car damage refers to physical harm such as dents, scratches, cracks, or broken parts that occur when a vehicle comes into contact with an object or surface. Estimated cost is the approximate amount of money needed to repair this damage. The cost varies depending on the type and depth of the damage, the car's brand and model, paint requirements, and whether any parts need to be replaced. In general, minor scratches cost less to repair, while deeper dents or broken components require higher expenses.
          </motion.p>
          <motion.button initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6 }}
            onClick={handleTryOurAI} className="bg-gradient-to-r from-purple-600 to-blue-600 px-12 py-6 rounded-2xl text-xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-2xl">
            🚀 TRY OUR AI - GET STARTED
          </motion.button>
        </motion.div>
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-2xl shadow-2xl mt-4"
        >
          <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-gray-700 m-4">
            <video
              src={demoVideo}
              controls
              autoPlay
              muted={false}
              loop
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          { icon: "🤖", title: "Advanced AI", desc: "Computer vision for precise damage detection", color: "purple" },
          { icon: "⚡", title: "Instant Results", desc: "Comprehensive analysis within seconds", color: "blue" },
          { icon: "💰", title: "Cost Estimation", desc: "Detailed repair costs in Indian Rupees", color: "green" }
        ].map((feature, idx) => (
          <motion.div key={idx} whileHover={{ scale: 1.05 }} 
            className={`bg-gray-800 rounded-2xl p-6 border-l-4 ${feature.color === 'purple' ? 'border-purple-500' : feature.color === 'blue' ? 'border-blue-500' : 'border-green-500'}`}>
            <div className="text-3xl mb-4">{feature.icon}</div>
            <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
            <p className="text-gray-300">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );

  const Step2Brands = () => (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold mb-8 text-center">Select Vehicle Brand</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {Object.keys(vehicleBrands).map(brand => (
          <motion.button key={brand} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { setSelectedBrand(brand); setSelectedModel(""); }}
            className={`p-6 rounded-2xl border-2 transition-all ${selectedBrand === brand ? "border-purple-500 bg-purple-500/20" : "border-gray-600 bg-gray-800"}`}>
            <img src={brandLogos[brand]} alt={brand} className="w-16 h-16 mx-auto mb-3 object-contain" />
            <span className="font-semibold">{brand}</span>
          </motion.button>
        ))}
      </div>
      <div className="flex justify-between mt-12">
        <button onClick={() => setStep(1)} className="px-6 py-3 border border-gray-600 rounded-xl hover:bg-gray-800">← Back</button>
        <button disabled={!selectedBrand} onClick={() => setStep(3)} 
          className="px-6 py-3 bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50">Next →</button>
      </div>
    </motion.div>
  );

  const Step3Models = () => (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold mb-2 text-center">Select {selectedBrand} Model</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {vehicleBrands[selectedBrand]?.map(model => (
          <motion.button key={model} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setSelectedModel(model); }}
            className={`p-4 rounded-xl border-2 text-left ${selectedModel === model ? "border-purple-500 bg-purple-500/20" : "border-gray-600 bg-gray-800"}`}>
            <div className="flex justify-between items-center">
              <span className="font-semibold">{model}</span>
              {selectedModel === model && <span className="text-purple-400 text-xl">✓</span>}
            </div>
          </motion.button>
        ))}
      </div>
      <div className="flex justify-between">
        <button onClick={() => setStep(2)} className="px-6 py-3 border border-gray-600 rounded-xl hover:bg-gray-800">← Back</button>
        <button disabled={!selectedModel} onClick={() => setStep(4)} 
          className="px-6 py-3 bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50">Next →</button>
      </div>
    </motion.div>
  );

  const Step4Image = () => (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold mb-2 text-center">Capture Damage Image</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-2xl">
          <h3 className="text-xl font-semibold mb-4">Choose Method</h3>
          <div className="mb-6">
            <label className="block text-lg mb-3">📁 Upload from Device</label>
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <div className="text-4xl mb-3">📸</div>
                <p className="text-gray-300 mb-2">Click to select image</p>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-lg mb-3">📷 Capture with Camera</label>
            {!capturing ? (
              <button onClick={startCamera} className="w-full py-6 border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center gap-3">
                <span className="text-3xl">📷</span>
                <span className="font-semibold">Start Camera</span>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-black rounded-xl overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-64 object-cover" />
                </div>
                <div className="flex gap-3">
                  <button onClick={capturePhoto} className="flex-1 py-3 bg-red-500 rounded-xl flex items-center justify-center gap-2">📸 Capture</button>
                  <button onClick={stopCamera} className="flex-1 py-3 border border-gray-600 rounded-xl">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-2xl">
          <h3 className="text-xl font-semibold mb-4">Image Preview</h3>
          {image ? (
            <div className="space-y-4">
              <img src={image} alt="Preview" className="w-full h-80 object-contain rounded-xl bg-black" />
              <button onClick={() => { setImage(null); setImageFile(null); }} className="w-full py-3 border border-gray-600 rounded-xl">Remove Image</button>
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl text-gray-400">
              <div className="text-5xl mb-4">🖼</div>
              <p className="text-lg">No image selected</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between mt-8">
        <button onClick={() => setStep(3)} className="px-6 py-3 border border-gray-600 rounded-xl">← Back</button>
        <button disabled={!imageFile} onClick={() => setStep(5)} 
          className="px-6 py-3 bg-purple-600 rounded-xl disabled:opacity-50">Next →</button>
      </div>
    </motion.div>
  );

  const Step5Form = () => (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold mb-2 text-center">Vehicle Details</h2>
      <div className="bg-gray-800 rounded-2xl p-8 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { field: "type", label: "Vehicle Type", options: ["Hatchback", "Sedan", "SUV", "MUV"] },
            { field: "color", label: "Color", options: ["White", "Black", "Red", "Blue", "Silver"] },
            { field: "year", label: "Year", options: Array.from({ length: 25 }, (_, i) => 2024 - i) },
            { field: "fuel", label: "Fuel Type", options: ["Petrol", "Diesel", "Electric", "Hybrid"] }
          ].map(({ field, label, options }) => (
            <div key={field}>
              <label className="block text-sm mb-3">{label} *</label>
              <select value={carDetails[field]} onChange={(e) => handleCarDetailChange(field, e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white">
                <option value="">Select {label}</option>
                {options.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <button onClick={() => setStep(4)} className="px-6 py-3 border border-gray-600 rounded-xl">← Back</button>
        <button disabled={!carDetails.type || !carDetails.color || !carDetails.year || !carDetails.fuel} onClick={handlePredict}
          className="px-6 py-3 bg-purple-600 rounded-xl disabled:opacity-50">🔍 Analyze Damage</button>
      </div>
    </motion.div>
  );

  const Step6Loading = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto text-center mt-20">
      <div className="bg-gray-800 rounded-2xl p-12">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} 
          className="w-24 h-24 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-8" />
        <h2 className="text-3xl font-bold mb-4">AI is Analyzing Damage</h2>
        <p className="text-gray-300">Processing your image with our AI models...</p>
      </div>
    </motion.div>
  );

  const Step7Results = () => {
    const metrics = [
      { value: damagedParts.length, label: "Damage Areas", color: "purple" },
      { value: damagedParts.filter(p => p.severity_label?.toLowerCase() === 'high').length, label: "Critical Damages", color: "yellow" },
      { value: `₹${totalCost.toLocaleString()}`, label: "Total Cost", color: "green" }
    ];

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-2">Damage Analysis Complete</h2>
          <p className="text-gray-400 text-xl">Detailed assessment of your vehicle damage</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {metrics.map((item, idx) => (
            <div key={idx} className="bg-gray-800 rounded-2xl p-6 text-center">
              <div className={`text-3xl font-bold ${item.color === 'purple' ? 'text-purple-400' : item.color === 'yellow' ? 'text-yellow-400' : 'text-green-400'} mb-2`}>
                {item.value}
              </div>
              <div className="text-gray-400">{item.label}</div>
            </div>
          ))}
        </div>

        <div id="printable-results" className="no-print">
          {prediction?.annotated_image && (
            <div className="mb-8 bg-gray-800 rounded-2xl p-6">
              <h3 className="text-2xl font-bold mb-4">AI Damage Detection</h3>
              <img 
                src={`${API_BASE_URL}/${prediction.annotated_image}`} 
                alt="AI Analysis" 
                className="max-w-full max-h-96 rounded-xl mx-auto object-contain" 
                onError={(e) => {
                  console.error("Failed to load annotated image");
                  e.target.onerror = null;
                }}
              />
            </div>
          )}

          <div className="bg-gray-800 rounded-2xl p-6 mb-8">
            <h3 className="text-2xl font-bold mb-6">Damage Breakdown</h3>
            {damagedParts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-600">
                      {["Damage Part", "Severity", "Repair Cost (₹)", "Damage Image"].map(header => (
                        <th key={header} className="px-6 py-4 text-lg font-semibold">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {damagedParts.map((part, idx) => (
                      <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 font-medium capitalize">{part.part?.replace(/_/g, ' ')}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            part.severity_label?.toLowerCase() === 'high' ? 'bg-red-500/20 text-red-400' : 
                            part.severity_label?.toLowerCase() === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {part.severity_label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-green-400 font-semibold">{`₹${(part.cost || 0).toLocaleString()}`}</td>
                        <td className="px-6 py-4">
                          {part.image ? (
                            <div className="flex flex-col items-center gap-2">
                              <img 
                                src={part.image.startsWith('http') ? part.image : `${API_BASE_URL}/${part.image}`} 
                                alt={`Damage - ${part.part}`} 
                                className="w-20 h-20 object-cover rounded-lg border border-gray-600"
                                onError={(e) => {
                                  console.error(`Failed to load damage image: ${part.image}`);
                                  e.target.onerror = null;
                                  e.target.src = "https://via.placeholder.com/80?text=No+Image";
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-900">
                      <td colSpan="2" className="px-6 py-4 text-right font-semibold">Total Repair Cost:</td>
                      <td className="px-6 py-4 text-green-400 font-bold text-xl">{`₹${totalCost.toLocaleString()}`}</td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">✅</div>
                <h4 className="text-xl font-semibold mb-2">No Significant Damage</h4>
                <p className="text-gray-400">Your vehicle appears to be in good condition</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 no-print">
          <button onClick={resetFlow} className="px-8 py-4 border border-gray-600 rounded-xl hover:bg-gray-800 transition-colors">
            🏠 New Assessment
          </button>
          <div className="flex gap-4">
            <button onClick={() => setStep(4)} className="px-6 py-4 border border-gray-600 rounded-xl hover:bg-gray-800 transition-colors">
              📸 Re-analyze
            </button>

            <button onClick={handleManualSave} disabled={!user} className="px-6 py-4 border border-gray-600 rounded-xl hover:bg-gray-800 transition-colors">
              💾 Save Report
            </button>

            <button onClick={printResults} className="px-6 py-4 bg-green-600 rounded-xl hover:bg-green-700 transition-colors">
              🖨 Print Report
            </button>
          </div>
        </div>

        <div className="mt-8 bg-gray-900 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">Your Saved Reports</h4>
            <div className="text-sm text-gray-400">{loadingHistory ? "Loading..." : `${historyList.length} reports`}</div>
          </div>

          {historyList.length === 0 ? (
            <div className="text-gray-400">No saved reports yet. Successful analyses will be stored here when you're logged in.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
              {historyList.map(item => (
                <div key={item.id} className="p-3 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-800/80 cursor-pointer"
                  onClick={() => {
                    setSelectedBrand(item.brand || "");
                    setSelectedModel(item.model || "");
                    setCarDetails(item.carDetails || { type: "", color: "", year: "", fuel: "" });
                    setPrediction(item.prediction || null);
                    setDamagedParts(item.damagedParts || []);
                    // imageUrl not stored; if you want to show last frontend image you may keep it in local state only
                    setImage(null);
                    setStep(7);
                  }}>
                  <div className="flex gap-3 items-center">
                    <div className="w-14 h-10 bg-gray-700 rounded overflow-hidden flex items-center justify-center">
                      <span className="text-xs text-gray-400">No Image</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{item.brand} {item.model}</div>
                      <div className="text-xs text-gray-400">{item.carDetails?.type || ""} • {item.carDetails?.color || ""}</div>
                    </div>
                    <div className="text-xs text-gray-400">{item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : "Saved"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white px-4 py-8">
      {step === 1 && <Step1Hero />}
      {step === 2 && <Step2Brands />}
      {step === 3 && <Step3Models />}
      {step === 4 && <Step4Image />}
      {step === 5 && <Step5Form />}
      {step === 6 && <Step6Loading />}
      {step === 7 && <Step7Results />}

      {showLoginAlert && <LoginAlert />}
    </div>
  );
}
