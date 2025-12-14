import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function Subscription() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Razorpay live credentials
  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_RqNhekie7F2TVe"; // Your live key

  const plans = [
    {
      id: "monthly",
      name: "1 Month Plan",
      price: 299, // ₹299
      duration: 1,
      durationUnit: "month",
      features: [
        "Unlimited AI damage analysis",
        "Detailed repair cost estimates",
        "High-resolution damage detection",
        "24/7 support",
        "Save unlimited reports"
      ]
    },
    {
      id: "quarterly",
      name: "3 Months Plan",
      price: 699, // ₹699
      duration: 3,
      durationUnit: "month",
      features: [
        "All Monthly features",
        "Priority processing",
        "Advanced analytics",
        "Bulk report generation",
        "Email notifications"
      ],
      popular: true
    },
    {
      id: "yearly",
      name: "1 Year Plan",
      price: 2499, // ₹2499
      duration: 12,
      durationUnit: "month",
      features: [
        "All Quarterly features",
        "API access for integrations",
        "Custom reporting",
        "Dedicated account manager",
        "Early access to new features"
      ]
    }
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        checkCurrentSubscription(currentUser.uid);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      toast.error('Payment system unavailable. Please try again later.');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const checkCurrentSubscription = async (uid) => {
    try {
      const q = query(collection(db, "subscriptions"), where("userId", "==", uid), where("status", "==", "active"));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const sub = snap.docs[0].data();
        const endDate = new Date(sub.endDate);
        if (endDate > new Date()) {
          setCurrentSubscription({ ...sub, id: snap.docs[0].id });
        } else {
          // Subscription expired, update status
          await updateDoc(doc(db, "subscriptions", snap.docs[0].id), { status: "expired" });
        }
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const handlePayment = async (plan) => {
    if (!user) {
      toast.error("Please login to subscribe");
      navigate("/login");
      return;
    }

    if (currentSubscription) {
      toast.error("You already have an active subscription");
      return;
    }

    setLoading(true);

    try {
      // Create order on your backend
      const orderData = {
        amount: plan.price * 100, // Razorpay expects amount in paisa
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
          planId: plan.id,
          userId: user.uid,
          duration: plan.duration,
          durationUnit: plan.durationUnit
        }
      };

      // Call Firebase Function to create Razorpay order
      // Use emulator URL for local testing
      const functionUrl =
        'https://us-central1-vehicledamagedetection.cloudfunctions.net/createRazorpayOrder';

        console.log("Calling function URL:", functionUrl);



      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const orderResponse = await response.json();
      const orderId = orderResponse.id;

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Vehicle Damage Detection AI",
        description: `${plan.name} Subscription`,
        order_id: orderId,
        handler: async (response) => {
          // Payment successful
          await handlePaymentSuccess(response, plan);
        },
        prefill: {
          name: user.displayName || "",
          email: user.email || "",
          contact: "" // You might want to collect phone number
        },
        theme: {
          color: "#7c3aed"
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error("Payment cancelled");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (response, plan) => {
    try {
      // Calculate subscription end date
      const startDate = new Date();
      const endDate = new Date(startDate);
      if (plan.durationUnit === "month") {
        endDate.setMonth(endDate.getMonth() + plan.duration);
      } else if (plan.durationUnit === "year") {
        endDate.setFullYear(endDate.getFullYear() + plan.duration);
      }

      // Save subscription to Firestore
      const subscriptionData = {
        userId: user.uid,
        planId: plan.id,
        planName: plan.name,
        amount: plan.price,
        currency: "INR",
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: "active",
        createdAt: new Date()
      };

      await addDoc(collection(db, "subscriptions"), subscriptionData);

      setCurrentSubscription(subscriptionData);
      setLoading(false);
      toast.success("Subscription activated successfully!");

      // Redirect to AI Dashboard
      setTimeout(() => {
        navigate("/ai-dashboard");
      }, 2000);

    } catch (error) {
      console.error("Error saving subscription:", error);
      toast.error("Payment successful but subscription activation failed. Please contact support.");
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">
            Choose Your <span className="text-purple-400">Subscription</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Unlock unlimited access to our AI-powered vehicle damage detection system.
            Get detailed analysis and repair cost estimates instantly.
          </p>
        </motion.div>

        {/* Current Subscription Status */}
        {currentSubscription && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-500/20 border border-green-500 rounded-2xl p-6 mb-8 text-center"
          >
            <h3 className="text-2xl font-bold text-green-400 mb-2">Active Subscription</h3>
            <p className="text-gray-300">
              {currentSubscription.planName} - Valid until {new Date(currentSubscription.endDate).toLocaleDateString()}
            </p>
            <button
              onClick={() => navigate("/ai-dashboard")}
              className="mt-4 px-6 py-3 bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
            >
              Go to AI Dashboard
            </button>
          </motion.div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-gray-800 rounded-2xl p-8 border-2 transition-all hover:scale-105 ${plan.popular ? "border-purple-500 bg-purple-500/10" : "border-gray-600"
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-purple-400 mb-2">
                  ₹{plan.price}
                  <span className="text-lg text-gray-400">/{plan.duration} {plan.durationUnit}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePayment(plan)}
                disabled={loading || !!currentSubscription}
                className={`w-full py-4 rounded-xl font-semibold transition-all ${plan.popular
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-gray-700 hover:bg-gray-600"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </div>
                ) : currentSubscription ? (
                  "Already Subscribed"
                ) : (
                  `Subscribe Now`
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-2xl p-8 text-center"
        >
          <h2 className="text-3xl font-bold mb-6">Why Choose Our AI System?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🤖", title: "Advanced AI", desc: "State-of-the-art computer vision technology" },
              { icon: "⚡", title: "Instant Results", desc: "Get analysis in seconds, not hours" },
              { icon: "💰", title: "Accurate Estimates", desc: "Precise repair cost calculations" },
              { icon: "🔒", title: "Secure & Private", desc: "Your data is protected and never stored" }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/ai-dashboard")}
            className="px-6 py-3 border border-gray-600 rounded-xl hover:bg-gray-800 transition-colors"
          >
            ← Back to AI Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
