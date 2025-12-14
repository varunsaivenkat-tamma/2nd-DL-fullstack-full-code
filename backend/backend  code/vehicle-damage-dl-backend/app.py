# from flask import Flask, request, jsonify, send_from_directory
# from flask_cors import CORS
# import cv2
# import numpy as np
# import joblib
# import pandas as pd
# from ultralytics import YOLO
# import os
# import uuid
# from werkzeug.utils import secure_filename
# import logging
# import traceback
# import psutil

# # ============================
# # Configuration & Setup
# # ============================
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# app = Flask(__name__)

# # FIXED CORS configuration - allow all origins for development
# CORS(app, resources={r"/*": {"origins": "*"}})

# # App configuration
# app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
# ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
# UPLOAD_FOLDER = 'static/uploads'
# RESULTS_FOLDER = 'static/results'

# # Create required directories
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)
# os.makedirs(RESULTS_FOLDER, exist_ok=True)

# # Global variables for models
# damage_model = None
# severity_model = None
# cost_model = None
# encoders = None
# feature_cols = None

# # ============================
# # Model Loading
# # ============================
# def load_models():
#     """Load all AI models"""
#     global damage_model, severity_model, cost_model, encoders, feature_cols
    
#     try:
#         logger.info("Loading AI models...")
        
#         # Check if model files exist
#         model_paths = {
#             "damage": "Final_Damage/DamageTypebest.pt",
#             "severity": "Final_Damage/Severitybest.pt",
#             "cost_model": "Final_Damage/cost_model.pkl.gz",
#             "encoders": "Final_Damage/label_encoders.pkl",
#             "feature_cols": "Final_Damage/feature_columns.pkl"
#         }
        
#         # Verify all files exist
#         for name, path in model_paths.items():
#             if not os.path.exists(path):
#                 logger.error(f"❌ Model file not found: {path}")
#                 return False
        
#         # Load YOLO models
#         logger.info("Loading YOLO models...")
#         damage_model = YOLO(model_paths["damage"])
#         severity_model = YOLO(model_paths["severity"])
        
#         # Load cost estimation models
#         logger.info("Loading cost estimation models...")
#         cost_model = joblib.load(model_paths["cost_model"])
#         encoders = joblib.load(model_paths["encoders"])
#         feature_cols = joblib.load(model_paths["feature_cols"])
        
#         logger.info("✅ All AI models loaded successfully!")
#         return True
        
#     except Exception as e:
#         logger.error(f"❌ Error loading models: {e}")
#         logger.error(traceback.format_exc())
#         return False

# # Load models on startup
# models_loaded = load_models()

# # ============================
# # Safe Label Encoder Class
# # ============================
# class SafeLabelEncoder:
#     """Enhanced LabelEncoder that handles unknown values safely"""
#     def __init__(self, le):
#         self.le = le
#         self.classes = set(le.classes_)

#     def transform(self, values):
#         transformed = []
#         for v in values:
#             if v in self.classes:
#                 transformed.append(v)
#             else:
#                 transformed.append("__UNKNOWN__")
#         return self.le.transform(transformed)

# # Update all encoders to handle unknown values
# if encoders:
#     for col in encoders:
#         le = encoders[col]
#         le.classes_ = np.append(le.classes_, "__UNKNOWN__")
#         encoders[col] = SafeLabelEncoder(le)

# # ============================
# # Helper Functions
# # ============================
# def allowed_file(filename):
#     """Check if uploaded file has allowed extension"""
#     return '.' in filename and \
#            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# def save_image(file):
#     """Save uploaded file securely and return file path"""
#     if file and allowed_file(file.filename):
#         filename = secure_filename(file.filename)
#         unique_filename = f"{uuid.uuid4()}_{filename}"
#         filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
#         file.save(filepath)
#         return filepath
#     return None

# def analyze_damage(img_path):
#     """
#     Analyze car damage using YOLO models
#     Returns: List of damage detections with type, severity, and location
#     """
#     try:
#         # Read and validate image
#         img = cv2.imread(img_path)
#         if img is None:
#             raise ValueError("Could not read image file")
            
#         h, w, _ = img.shape
#         total_area = h * w

#         # Run AI models for damage detection and severity assessment
#         d_pred = damage_model(img)  # Damage type detection
#         s_pred = severity_model(img)  # Severity assessment

#         # Check if any damage detected
#         if len(d_pred[0].boxes) == 0:
#             logger.info("No damage detected in the image")
#             return []

#         results = []
#         # Process each detected damage
#         for box in d_pred[0].boxes:
#             # Extract bounding box coordinates
#             x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
#             cls_id = int(box.cls[0])
#             damage_name = damage_model.names[cls_id]
#             confidence = float(box.conf[0])

#             # Calculate damage area ratio
#             area_ratio = ((x2 - x1) * (y2 - y1)) / total_area

#             # Determine severity level
#             severity_label = "minor"  # Default severity
#             if len(s_pred[0].boxes) > 0:
#                 s_box = max(s_pred[0].boxes, key=lambda x: float(x.conf[0]))
#                 severity_label = severity_model.names[int(s_box.cls[0])]

#             # Compile damage information
#             results.append({
#                 "damage_type": damage_name,
#                 "severity": severity_label,
#                 "damage_area_ratio": area_ratio,
#                 "confidence": confidence,
#                 "box": [int(x1), int(y1), int(x2), int(y2)]
#             })

#         logger.info(f"Detected {len(results)} damage areas")
#         return results

#     except Exception as e:
#         logger.error(f"Error in damage analysis: {e}")
#         logger.error(traceback.format_exc())
#         return []

# def estimate_cost(damage_info, user_vehicle):
#     """
#     Estimate repair cost using machine learning model
#     Returns: Estimated cost in rupees
#     """
#     try:
#         # Prepare feature data for cost prediction
#         df = pd.DataFrame([{
#             "damage_type": damage_info["damage_type"],
#             "severity": damage_info["severity"],
#             "damage_area_ratio": damage_info["damage_area_ratio"],
#             "primary_damage": damage_info["damage_type"],
#             "brand": user_vehicle["brand"],
#             "model": user_vehicle["model"],
#             "year": user_vehicle["year"],
#             "fuel": user_vehicle["fuel"],
#             "type": user_vehicle["type"],
#             "color": user_vehicle["color"],
#         }])

#         # Handle missing or unknown values
#         df = df.replace("", "__UNKNOWN__")
#         df = df.fillna("__UNKNOWN__")

#         # Encode categorical features using saved encoders
#         for col, encoder in encoders.items():
#             if col in df.columns:
#                 df[col] = encoder.transform(df[col].astype(str))

#         # Ensure all required feature columns are present
#         df = df.reindex(columns=feature_cols, fill_value=0)

#         # Predict cost and convert to rupees (assuming model predicts in rupees)
#         cost = float(cost_model.predict(df)[0])
#         return max(1000, cost)  # Minimum cost of ₹1000

#     except Exception as e:
#         logger.error(f"Error in cost estimation: {e}")
#         logger.error(traceback.format_exc())
#         return 5000.0  # Default cost if prediction fails

# # ============================
# # API Routes
# # ============================
# @app.route('/')
# def home():
#     """Root endpoint - API information"""
#     return jsonify({
#         "message": "Car Damage Detection API",
#         "status": "running",
#         "version": "1.0",
#         "models_loaded": models_loaded,
#         "endpoints": {
#             "health": "/health (GET)",
#             "predict": "/predict (POST)",
#             "vehicle_brands": "/vehicle-brands (GET)"
#         }
#     })

# @app.route('/health')
# def health():
#     """Health check endpoint"""
#     try:
#         # Get memory info
#         memory_info = psutil.virtual_memory()
#         available_memory = memory_info.available / 1024 / 1024  # Convert to MB
        
#         process = psutil.Process(os.getpid())
#         memory_usage = process.memory_info().rss / 1024 / 1024  # Convert to MB
        
#         return jsonify({
#             "status": "healthy" if models_loaded else "degraded",
#             "models_loaded": models_loaded,
#             "service": "Car Damage Detection API",
#             "memory_usage": f"{memory_usage:.1f} MB",
#             "available_memory": f"{available_memory:.1f} MB",
#             "timestamp": pd.Timestamp.now().isoformat()
#         })
#     except Exception as e:
#         return jsonify({
#             "status": "error",
#             "models_loaded": models_loaded,
#             "error": str(e)
#         }), 500

# @app.route('/vehicle-brands', methods=['GET', 'OPTIONS'])
# def get_vehicle_brands():
#     """Endpoint to get available vehicle brands and models"""
#     if request.method == 'OPTIONS':
#         return jsonify({'status': 'ok'}), 200
    
#     brands_models = {
#         "Toyota": ["Fortuner", "Innova", "Glanza", "Camry", "Corolla"],
#         "Hyundai": ["Creta", "Venue", "i20", "i10", "Verna"],
#         "Tata": ["Harrier", "Nexon", "Punch", "Safari", "Tiago"],
#         "Honda": ["City", "Civic", "Amaze", "Accord", "CR-V"],
#         "Kia": ["Seltos", "Sonet", "Carens", "Carnival"],
#         "Mahindra": ["XUV500", "Scorpio", "Bolero", "Thar"],
#         "Ford": ["Ecosport", "Endeavour", "Figo", "Aspire"],
#         "MarutiSuzuki": ["Swift", "Baleno", "Dzire", "WagonR"],
#     }
#     return jsonify(brands_models)

# @app.route('/predict', methods=['POST', 'OPTIONS'])
# def predict():
#     """
#     Main prediction endpoint
#     Accepts: Image file + vehicle details
#     Returns: Damage analysis with cost estimation
#     """
#     if request.method == 'OPTIONS':
#         return jsonify({'status': 'ok'}), 200
    
#     try:
#         # Check if models are loaded
#         if not models_loaded:
#             return jsonify({
#                 "success": False,
#                 "error": "AI models not loaded. Please check server logs."
#             }), 500

#         # Validate image file presence
#         if 'image' not in request.files:
#             return jsonify({"error": "No image file provided"}), 400
        
#         file = request.files['image']
#         if file.filename == '':
#             return jsonify({"error": "No file selected"}), 400

#         # Save uploaded image
#         img_path = save_image(file)
#         if not img_path:
#             return jsonify({"error": "Invalid file type. Allowed: png, jpg, jpeg, gif"}), 400

#         logger.info(f"Processing image: {img_path}")

#         # Extract vehicle details from form data with defaults
#         try:
#             user_vehicle = {
#                 "brand": request.form.get("brand", "Toyota"),
#                 "model": request.form.get("model", "Fortuner"),
#                 "year": int(request.form.get("year", 2020)),
#                 "fuel": request.form.get("fuel", "Petrol"),
#                 "type": request.form.get("type", "SUV"),
#                 "color": request.form.get("color", "White")
#             }
#         except ValueError as e:
#             return jsonify({"error": f"Invalid vehicle details: {str(e)}"}), 400

#         logger.info(f"Vehicle details received: {user_vehicle}")

#         # Analyze damage using AI models
#         damage_results = analyze_damage(img_path)

#         # Handle case when no damage detected
#         if not damage_results:
#             return jsonify({
#                 "success": True,
#                 "message": "No damage detected in the image",
#                 "damage_count": 0,
#                 "total_cost": 0,
#                 "cost_results": [],
#                 "crops": [],
#                 "annotated_image": None,
#                 "vehicle_info": user_vehicle
#             })

#         # Prepare images for visualization
#         annotated_image = cv2.imread(img_path)
#         annotated_rgb = cv2.cvtColor(annotated_image, cv2.COLOR_BGR2RGB)
        
#         cropped_images = []
#         cost_results = []
#         total_cost = 0

#         # Process each detected damage
#         for i, damage in enumerate(damage_results, 1):
#             x1, y1, x2, y2 = damage["box"]
            
#             # Draw bounding box and label on annotated image
#             label = f"{damage['damage_type']} | {damage['severity']}"
#             cv2.rectangle(annotated_rgb, (x1, y1), (x2, y2), (255, 0, 0), 3)
#             cv2.putText(annotated_rgb, label, (x1, y1 - 10),
#                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

#             # Save cropped image of damage area
#             crop = annotated_image[y1:y2, x1:x2]
#             if crop.size > 0:  # Ensure valid crop
#                 crop_filename = f"{uuid.uuid4()}_crop.jpg"
#                 crop_path = os.path.join(RESULTS_FOLDER, crop_filename)
#                 cv2.imwrite(crop_path, crop)
#                 cropped_images.append(f"static/results/{crop_filename}")

#             # Estimate repair cost for this damage
#             cost = estimate_cost(damage, user_vehicle)
#             total_cost += cost
            
#             # Compile cost results
#             cost_results.append({
#                 "damage_type": damage["damage_type"],
#                 "severity": damage["severity"],
#                 "confidence": round(damage["confidence"], 2),
#                 "cost": round(cost, 2)  # Round to 2 decimal places
#             })

#         # Save annotated image with bounding boxes
#         annotated_filename = f"{uuid.uuid4()}_annotated.jpg"
#         annotated_path = os.path.join(RESULTS_FOLDER, annotated_filename)
#         cv2.imwrite(annotated_path, cv2.cvtColor(annotated_rgb, cv2.COLOR_RGB2BGR))

#         # Prepare success response
#         response = {
#             "success": True,
#             "damage_count": len(damage_results),
#             "total_cost": round(total_cost, 2),  # Total cost rounded to 2 decimal places
#             "cost_results": cost_results,
#             "crops": cropped_images,
#             "annotated_image": f"static/results/{annotated_filename}",
#             "vehicle_info": user_vehicle,
#             "currency": "INR"  # Indian Rupees
#         }

#         logger.info(f"✅ Prediction completed: {len(damage_results)} damages found, total cost: ₹{total_cost:,.2f}")

#         return jsonify(response)

#     except Exception as e:
#         logger.error(f"❌ Prediction error: {e}")
#         logger.error(traceback.format_exc())
#         return jsonify({
#             "success": False,
#             "error": str(e),
#             "message": "Internal server error during prediction"
#         }), 500

# # ============================
# # Static File Serving
# # ============================
# @app.route('/static/<path:path>')
# def serve_static(path):
#     """Serve static files (images, CSS, JS)"""
#     return send_from_directory('static', path)

# @app.route('/static/uploads/<filename>')
# def serve_upload(filename):
#     """Serve uploaded images"""
#     return send_from_directory(UPLOAD_FOLDER, filename)

# @app.route('/static/results/<filename>')
# def serve_result(filename):
#     """Serve result images (annotated and cropped)"""
#     return send_from_directory(RESULTS_FOLDER, filename)

# # ============================
# # Error Handlers
# # ============================
# @app.errorhandler(413)
# def too_large(e):
#     return jsonify({"error": "File too large. Maximum size is 16MB"}), 413

# @app.errorhandler(500)
# def internal_error(e):
#     return jsonify({"error": "Internal server error"}), 500

# @app.errorhandler(404)
# def not_found(e):
#     return jsonify({"error": "Endpoint not found"}), 404

# @app.errorhandler(405)
# def method_not_allowed(e):
#     return jsonify({"error": "Method not allowed"}), 405

# # ============================
# # Application Entry Point
# # ============================
# if __name__ == '__main__':
#     logger.info("🚀 Starting Car Damage Detection API Server...")
#     logger.info(f"Models loaded: {models_loaded}")
#     logger.info(f"Server running on: http://127.0.0.1:5000")
#     logger.info(f"Health check: http://127.0.0.1:5000/health")
#     logger.info(f"Vehicle brands: http://127.0.0.1:5000/vehicle-brands")
    
#     app.run(
#         host='0.0.0.0',  # Allow connections from any IP
#         port=5000,        # Run on port 5000
#         debug=True,       # Enable debug mode for development
#         threaded=True     # Handle multiple requests concurrently
#     )


# from flask import Flask, request, jsonify, send_from_directory
# from flask_cors import CORS
# import cv2
# import numpy as np
# import joblib
# import pandas as pd
# from ultralytics import YOLO
# import os
# import uuid
# from werkzeug.utils import secure_filename
# import logging
# import gzip
# import time
# import psutil
# from threading import Thread
# import gc

# # ============================
# # Configuration & Setup
# # ============================
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# app = Flask(__name__)

# # CORS configuration
# CORS(
#     app,
#     origins=["https://vd-dlproject.vercel.app/", "*"],
#     supports_credentials=True,
#     allow_headers=["Content-Type", "Authorization"],
#     methods=["GET", "POST", "OPTIONS"]
# )

# # Optimized configuration for Render free tier
# app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024  # Reduced to 8MB
# ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}
# UPLOAD_FOLDER = "static/uploads"
# RESULTS_FOLDER = "static/results"

# os.makedirs(UPLOAD_FOLDER, exist_ok=True)
# os.makedirs(RESULTS_FOLDER, exist_ok=True)

# # ============================
# # Global Variables for Model Management
# # ============================
# damage_model = None
# severity_model = None
# cost_model = None
# encoders = None
# feature_cols = None
# models_loaded = False

# # ============================
# # Memory and Performance Monitoring
# # ============================
# def get_memory_usage():
#     """Get current memory usage in MB"""
#     process = psutil.Process(os.getpid())
#     return process.memory_info().rss / 1024 / 1024

# def cleanup_old_files():
#     """Clean up old uploaded and result files to save space"""
#     try:
#         current_time = time.time()
#         for folder in [UPLOAD_FOLDER, RESULTS_FOLDER]:
#             if os.path.exists(folder):
#                 for filename in os.listdir(folder):
#                     filepath = os.path.join(folder, filename)
#                     if os.path.isfile(filepath):
#                         # Remove files older than 1 hour
#                         if current_time - os.path.getmtime(filepath) > 3600:
#                             os.remove(filepath)
#                             logger.info(f"Cleaned up old file: {filename}")
#     except Exception as e:
#         logger.error(f"Error cleaning up files: {e}")

# # ============================
# # Optimized Model Loading
# # ============================
# def load_models():
#     """Load models with memory optimization"""
#     global damage_model, severity_model, cost_model, encoders, feature_cols, models_loaded

#     if models_loaded:
#         return True

#     try:
#         logger.info("Loading AI models with memory optimization...")

#         # Force garbage collection before loading
#         gc.collect()

#         # Check available memory before loading
#         available_memory = psutil.virtual_memory().available / 1024 / 1024
#         logger.info(f"Available memory: {available_memory:.1f} MB")

#         if available_memory < 300:  # Less than 300MB available
#             logger.warning("Low memory detected, attempting cleanup...")
#             cleanup_old_files()
#             gc.collect()

#         # Load YOLO models with optimization
#         damage_model = YOLO("Final_Damage/DamageTypebest.pt")
#         severity_model = YOLO("Final_Damage/Severitybest.pt")

#         # Load cost model
#         with gzip.open("Final_Damage/cost_model.pkl.gz", "rb") as f:
#             cost_model = joblib.load(f)

#         encoders = joblib.load("Final_Damage/label_encoders.pkl")
#         feature_cols = joblib.load("Final_Damage/feature_columns.pkl")

#         models_loaded = True
#         logger.info("All models loaded successfully.")
#         logger.info(f"Memory usage after loading: {get_memory_usage():.1f} MB")
#         return True

#     except Exception as e:
#         logger.error(f"Error loading models: {e}")
#         return False

# # ============================
# # Safe Label Encoder
# # ============================
# class SafeLabelEncoder:
#     def __init__(self, le):
#         self.le = le
#         self.classes = set(le.classes_)

#     def transform(self, values):
#         return self.le.transform(
#             [v if v in self.classes else "__UNKNOWN__" for v in values]
#         )

# # ============================
# # Optimized Helpers
# # ============================
# def allowed_file(filename):
#     return (
#         "." in filename
#         and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
#     )

# def save_image(file):
#     """Save image with size validation"""
#     if file and allowed_file(file.filename):
#         # Check file size
#         file.seek(0, os.SEEK_END)
#         size = file.tell()
#         file.seek(0)

#         if size > 8 * 1024 * 1024:  # 8MB limit
#             return None

#         filename = secure_filename(file.filename)
#         unique_filename = f"{uuid.uuid4()}_{filename}"
#         filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
#         file.save(filepath)
#         return filepath
#     return None

# def optimize_image(img_path, max_size=(640, 640)):
#     """Optimize image for faster processing"""
#     try:
#         img = cv2.imread(img_path)
#         if img is None:
#             return None

#         h, w = img.shape[:2]

#         # Resize if too large
#         if w > max_size[0] or h > max_size[1]:
#             ratio = min(max_size[0] / w, max_size[1] / h)
#             new_w, new_h = int(w * ratio), int(h * ratio)
#             img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_LINEAR)

#         # Save optimized image
#         cv2.imwrite(img_path, img, [cv2.IMWRITE_JPEG_QUALITY, 85])
#         return img_path

#     except Exception as e:
#         logger.error(f"Error optimizing image: {e}")
#         return img_path

# def analyze_damage_optimized(img_path):
#     """Optimized damage analysis with timeout and memory management"""
#     start_time = time.time()

#     try:
#         # Optimize image first
#         img_path = optimize_image(img_path)
#         if not img_path:
#             return []

#         img = cv2.imread(img_path)
#         if img is None:
#             raise ValueError("Could not read image file")

#         h, w, _ = img.shape
#         total_area = h * w

#         # Run damage detection with confidence threshold
#         d_pred = damage_model(img, conf=0.3, verbose=False)

#         if len(d_pred[0].boxes) == 0:
#             logger.info("No damage detected in the image")
#             return []

#         # Process only top 3 damage detections to save time
#         boxes = d_pred[0].boxes[:3]  # Limit to top 3

#         results = []
#         for box in boxes:
#             x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
#             cls_id = int(box.cls[0])
#             damage_name = damage_model.names[cls_id]
#             confidence = float(box.conf[0])

#             area_ratio = ((x2 - x1) * (y2 - y1)) / total_area

#             # Simplified severity detection - use confidence as proxy
#             severity_label = "minor"
#             if confidence > 0.7:
#                 severity_label = "moderate"
#             elif confidence > 0.8:
#                 severity_label = "high"

#             results.append({
#                 "damage_type": damage_name,
#                 "severity": severity_label,
#                 "damage_area_ratio": float(area_ratio),
#                 "confidence": confidence,
#                 "box": [int(x1), int(y1), int(x2), int(y2)],
#             })

#         processing_time = time.time() - start_time
#         logger.info(f"Damage analysis completed in {processing_time:.2f}s: {len(results)} areas detected")
#         return results

#     except Exception as e:
#         logger.error(f"Error in damage analysis: {e}")
#         return []

# def estimate_cost_optimized(damage_info_list, user_vehicle):
#     """Optimized cost estimation"""
#     try:
#         if not damage_info_list:
#             return 0.0

#         # Use simplified cost calculation for speed
#         base_costs = {
#             "minor": 2000,
#             "moderate": 5000,
#             "high": 15000
#         }

#         total_cost = 0
#         for damage in damage_info_list:
#             severity = damage.get("severity", "minor")
#             area_ratio = damage.get("damage_area_ratio", 0.1)
#             base_cost = base_costs.get(severity, 2000)
#             cost = base_cost * (1 + area_ratio * 2)  # Simple multiplier
#             total_cost += cost

#         return round(total_cost, 2)

#     except Exception as e:
#         logger.error(f"Error in cost estimation: {e}")
#         return 5000.0

# # ============================
# # Routes
# # ============================
# @app.route("/")
# def home():
#     return jsonify({
#         "message": "Optimized Car Damage Detection API",
#         "status": "running",
#         "version": "2.0",
#         "endpoints": ["/health", "/predict", "/vehicle-brands"],
#         "memory_usage": f"{get_memory_usage():.1f} MB"
#     })

# @app.route("/health")
# def health():
#     """Enhanced health check with model status"""
#     health_status = {
#         "status": "healthy" if models_loaded else "degraded",
#         "models_loaded": models_loaded,
#         "service": "Car Damage Detection API",
#         "memory_usage": f"{get_memory_usage():.1f} MB",
#         "available_memory": f"{psutil.virtual_memory().available / 1024 / 1024:.1f} MB"
#     }

#     status_code = 200 if models_loaded else 503
#     return jsonify(health_status), status_code

# @app.route("/vehicle-brands")
# def get_vehicle_brands():
#     brands_models = {
#         "Toyota": ["Fortuner", "Innova", "Glanza", "Camry", "Corolla"],
#         "Hyundai": ["Creta", "Venue", "i20", "i10", "Verna"],
#         "Tata": ["Harrier", "Nexon", "Punch", "Safari", "Tiago"],
#         "Honda": ["City", "Civic", "Amaze", "Accord", "CR-V"],
#         "Kia": ["Seltos", "Sonet", "Carens", "Carnival"],
#         "Mahindra": ["XUV500", "Scorpio", "Bolero", "Thar"],
#         "Ford": ["Ecosport", "Endeavour", "Figo", "Aspire"],
#         "MarutiSuzuki": ["Swift", "Baleno", "Dzire", "WagonR"],
#     }
#     return jsonify(brands_models)

# @app.route("/predict", methods=["POST"])
# def predict():
#     """Optimized prediction endpoint with timeout and error handling"""
#     request_start = time.time()

#     try:
#         # Check if models are loaded
#         if not models_loaded:
#             if not load_models():
#                 return jsonify({
#                     "success": False,
#                     "error": "AI models not available",
#                     "message": "Service temporarily unavailable"
#                 }), 503

#         # Validate request
#         if "image" not in request.files:
#             return jsonify({"error": "No image file provided"}), 400

#         file = request.files["image"]
#         if file.filename == "":
#             return jsonify({"error": "No file selected"}), 400

#         # Save and validate image
#         img_path = save_image(file)
#         if not img_path:
#             return jsonify({"error": "Invalid file type or size. Allowed: png, jpg, jpeg (max 8MB)"}), 400

#         logger.info(f"Processing image: {img_path}, Memory: {get_memory_usage():.1f} MB")

#         # Extract vehicle details
#         user_vehicle = {
#             "brand": request.form.get("brand", "Toyota"),
#             "model": request.form.get("model", "Fortuner"),
#             "year": int(request.form.get("year", 2020)),
#             "fuel": request.form.get("fuel", "Petrol"),
#             "type": request.form.get("type", "SUV"),
#             "color": request.form.get("color", "White"),
#         }

#         # Run damage analysis with timeout
#         analysis_start = time.time()
#         damage_results = analyze_damage_optimized(img_path)

#         if not damage_results:
#             # Clean up and return no damage response
#             os.remove(img_path)
#             return jsonify({
#                 "success": True,
#                 "message": "No damage detected in the image",
#                 "damage_count": 0,
#                 "total_cost": 0,
#                 "cost_results": [],
#                 "crops": [],
#                 "annotated_image": None,
#                 "vehicle_info": user_vehicle,
#                 "currency": "INR",
#                 "processing_time": f"{time.time() - request_start:.2f}s"
#             })

#         # Create simplified annotated image
#         annotated_image = cv2.imread(img_path)
#         if annotated_image is not None:
#             annotated_rgb = cv2.cvtColor(annotated_image, cv2.COLOR_BGR2RGB)

#             # Draw bounding boxes
#             for damage in damage_results:
#                 x1, y1, x2, y2 = damage["box"]
#                 label = f"{damage['damage_type']} ({damage['severity']})"
#                 cv2.rectangle(annotated_rgb, (x1, y1), (x2, y2), (255, 0, 0), 2)
#                 cv2.putText(annotated_rgb, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

#             # Save annotated image
#             annotated_filename = f"{uuid.uuid4()}_annotated.jpg"
#             annotated_path = os.path.join(RESULTS_FOLDER, annotated_filename)
#             cv2.imwrite(annotated_path, cv2.cvtColor(annotated_rgb, cv2.COLOR_RGB2BGR))
#             annotated_image_url = f"static/results/{annotated_filename}"
#         else:
#             annotated_image_url = None

#         # Calculate costs
#         total_cost = estimate_cost_optimized(damage_results, user_vehicle)

#         # Prepare cost results
#         cost_results = []
#         for damage in damage_results:
#             cost_results.append({
#                 "damage_type": damage["damage_type"],
#                 "severity": damage["severity"],
#                 "confidence": round(damage["confidence"], 2),
#                 "cost": round(total_cost / len(damage_results), 2),
#             })

#         # Clean up uploaded image
#         os.remove(img_path)

#         # Force garbage collection
#         gc.collect()

#         processing_time = time.time() - request_start
#         logger.info(f"Prediction completed in {processing_time:.2f}s: {len(damage_results)} damages, total cost {total_cost:.2f}")

#         response = {
#             "success": True,
#             "damage_count": len(damage_results),
#             "total_cost": round(total_cost, 2),
#             "cost_results": cost_results,
#             "crops": [],  # Simplified - no crop images to save time
#             "annotated_image": annotated_image_url,
#             "vehicle_info": user_vehicle,
#             "currency": "INR",
#             "processing_time": f"{processing_time:.2f}s",
#             "memory_usage": f"{get_memory_usage():.1f} MB"
#         }

#         return jsonify(response)

#     except Exception as e:
#         logger.error(f"Prediction error: {e}")

#         # Clean up any uploaded files on error
#         try:
#             if 'img_path' in locals() and os.path.exists(img_path):
#                 os.remove(img_path)
#         except:
#             pass

#         # Force garbage collection on error
#         gc.collect()

#         return jsonify({
#             "success": False,
#             "error": "Processing failed",
#             "message": "Unable to process the image. Please try again.",
#             "processing_time": f"{time.time() - request_start:.2f}s"
#         }), 500

# # ============================
# # Static file routes
# # ============================
# @app.route("/static/<path:path>")
# def serve_static(path):
#     return send_from_directory("static", path)

# @app.route("/static/uploads/<path:filename>")
# def serve_upload(filename):
#     return send_from_directory(UPLOAD_FOLDER, filename)

# @app.route("/static/results/<path:filename>")
# def serve_result(filename):
#     return send_from_directory(RESULTS_FOLDER, filename)

# # ============================
# # Error handlers
# # ============================
# @app.errorhandler(413)
# def too_large(e):
#     return jsonify({"error": "File too large. Maximum size is 8MB"}), 413

# @app.errorhandler(500)
# def internal_error(e):
#     return jsonify({"error": "Internal server error"}), 500

# @app.errorhandler(404)
# def not_found(e):
#     return jsonify({"error": "Endpoint not found"}), 404

# @app.errorhandler(405)
# def method_not_allowed(e):
#     return jsonify({"error": "Method not allowed"}), 405

# # ============================
# # Background cleanup
# # ============================
# def background_cleanup():
#     """Run cleanup tasks in background"""
#     while True:
#         time.sleep(1800)  # Run every 30 minutes
#         cleanup_old_files()
#         gc.collect()

# # Start background cleanup thread
# cleanup_thread = Thread(target=background_cleanup, daemon=True)
# cleanup_thread.start()

# # ============================
# # Entry point
# # ============================
# if __name__ == "__main__":
#     # Load models on startup
#     if load_models():
#         logger.info("Models loaded successfully on startup")
#     else:
#         logger.warning("Failed to load models on startup - will attempt on first request")

#     port = int(os.environ.get("PORT", 5000))
#     logger.info(f"Starting Optimized Car Damage Detection API Server on port {port}...")
#     app.run(host="0.0.0.0", port=port, debug=False, threaded=True)

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import cv2
import numpy as np
import joblib
import pandas as pd
from ultralytics import YOLO
import os
import uuid
from werkzeug.utils import secure_filename
import logging
import gzip
import time
import psutil
from threading import Thread
import gc
from flask import Flask, render_template, request, jsonify
import razorpay
import hmac
import hashlib

app = Flask(__name__)

# ---------------------- RAZORPAY CONFIG ----------------------
RAZORPAY_KEY_ID = "rzp_live_RqNhekie7F2TVe"
RAZORPAY_KEY_SECRET = " Jg387kmsCMW2NvJq4XGDiC50"

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
# ============================
# Configuration & Setup
# ============================
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# CORS configuration
CORS(
    app,
    origins=["https://vd-dlproject.vercel.app/", "*"],
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "OPTIONS"]
)

# Optimized configuration for Render free tier
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024  # Reduced to 8MB
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}
UPLOAD_FOLDER = "static/uploads"
RESULTS_FOLDER = "static/results"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

# ============================
# Global Variables for Model Management
# ============================
damage_model = None
severity_model = None
cost_model = None
encoders = None
feature_cols = None
models_loaded = False

# ============================
# Memory and Performance Monitoring
# ============================
def get_memory_usage():
    """Get current memory usage in MB"""
    process = psutil.Process(os.getpid())
    return process.memory_info().rss / 1024 / 1024

def cleanup_old_files():
    """Clean up old uploaded and result files to save space"""
    try:
        current_time = time.time()
        for folder in [UPLOAD_FOLDER, RESULTS_FOLDER]:
            if os.path.exists(folder):
                for filename in os.listdir(folder):
                    filepath = os.path.join(folder, filename)
                    if os.path.isfile(filepath):
                        # Remove files older than 1 hour
                        if current_time - os.path.getmtime(filepath) > 3600:
                            os.remove(filepath)
                            logger.info(f"Cleaned up old file: {filename}")
    except Exception as e:
        logger.error(f"Error cleaning up files: {e}")

# ============================
# Optimized Model Loading
# ============================
def load_models():
    """Load models with memory optimization"""
    global damage_model, severity_model, cost_model, encoders, feature_cols, models_loaded

    if models_loaded:
        return True

    try:
        logger.info("Loading AI models with memory optimization...")

        # Force garbage collection before loading
        gc.collect()

        # Check available memory before loading
        available_memory = psutil.virtual_memory().available / 1024 / 1024
        logger.info(f"Available memory: {available_memory:.1f} MB")

        if available_memory < 300:  # Less than 300MB available
            logger.warning("Low memory detected, attempting cleanup...")
            cleanup_old_files()
            gc.collect()

        # Load YOLO models with optimization
        damage_model = YOLO("Final_Damage/DamageTypebest.pt")
        severity_model = YOLO("Final_Damage/Severitybest.pt")

        # Load cost model
        with gzip.open("Final_Damage/cost_model.pkl.gz", "rb") as f:
            cost_model = joblib.load(f)

        encoders = joblib.load("Final_Damage/label_encoders.pkl")
        feature_cols = joblib.load("Final_Damage/feature_columns.pkl")

        models_loaded = True
        logger.info("All models loaded successfully.")
        logger.info(f"Memory usage after loading: {get_memory_usage():.1f} MB")
        return True

    except Exception as e:
        logger.error(f"Error loading models: {e}")
        return False

# ============================
# Safe Label Encoder
# ============================
class SafeLabelEncoder:
    def __init__(self, le):
        self.le = le
        self.classes = set(le.classes_)

    def transform(self, values):
        return self.le.transform(
            [v if v in self.classes else "__UNKNOWN__" for v in values]
        )

# ============================
# Optimized Helpers
# ============================
def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )

def save_image(file):
    """Save image with size validation"""
    if file and allowed_file(file.filename):
        # Check file size
        file.seek(0, os.SEEK_END)
        size = file.tell()
        file.seek(0)

        if size > 8 * 1024 * 1024:  # 8MB limit
            return None

        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(filepath)
        return filepath
    return None

def optimize_image(img_path, max_size=(640, 640)):
    """Optimize image for faster processing"""
    try:
        img = cv2.imread(img_path)
        if img is None:
            return None

        h, w = img.shape[:2]

        # Resize if too large
        if w > max_size[0] or h > max_size[1]:
            ratio = min(max_size[0] / w, max_size[1] / h)
            new_w, new_h = int(w * ratio), int(h * ratio)
            img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_LINEAR)

        # Save optimized image
        cv2.imwrite(img_path, img, [cv2.IMWRITE_JPEG_QUALITY, 85])
        return img_path

    except Exception as e:
        logger.error(f"Error optimizing image: {e}")
        return img_path

def analyze_damage_optimized(img_path):
    """Optimized damage analysis with timeout and memory management"""
    start_time = time.time()

    try:
        # Optimize image first
        img_path = optimize_image(img_path)
        if not img_path:
            return []

        img = cv2.imread(img_path)
        if img is None:
            raise ValueError("Could not read image file")

        h, w, _ = img.shape
        total_area = h * w

        # Run damage detection with confidence threshold
        d_pred = damage_model(img, conf=0.3, verbose=False)

        if len(d_pred[0].boxes) == 0:
            logger.info("No damage detected in the image")
            return []

        # Process only top 5 damage detections to save time
        boxes = d_pred[0].boxes[:5]  # Limit to top 5

        results = []
        for box in boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            cls_id = int(box.cls[0])
            damage_name = damage_model.names[cls_id]
            confidence = float(box.conf[0])

            area_ratio = ((x2 - x1) * (y2 - y1)) / total_area

            # Run severity model for each damage
            severity_label = "minor"
            try:
                # Crop the damage area for severity analysis
                crop = img[int(y1):int(y2), int(x1):int(x2)]
                if crop.size > 0:
                    s_pred = severity_model(crop, conf=0.3, verbose=False)
                    if len(s_pred[0].boxes) > 0:
                        s_box = s_pred[0].boxes[0]
                        severity_label = severity_model.names[int(s_box.cls[0])]
            except Exception as e:
                logger.warning(f"Severity analysis failed: {e}")
                # Fallback to confidence-based severity
                if confidence > 0.7:
                    severity_label = "moderate"
                elif confidence > 0.8:
                    severity_label = "high"

            results.append({
                "damage_type": damage_name,
                "severity": severity_label,
                "damage_area_ratio": float(area_ratio),
                "confidence": confidence,
                "box": [int(x1), int(y1), int(x2), int(y2)],
            })

        processing_time = time.time() - start_time
        logger.info(f"Damage analysis completed in {processing_time:.2f}s: {len(results)} areas detected")
        return results

    except Exception as e:
        logger.error(f"Error in damage analysis: {e}")
        return []

def estimate_cost_optimized(damage_info_list, user_vehicle):
    """Optimized cost estimation using the actual model"""
    try:
        if not damage_info_list:
            return 0.0

        total_cost = 0
        cost_results = []

        for damage in damage_info_list:
            # Prepare feature data for cost prediction
            df = pd.DataFrame([{
                "damage_type": damage["damage_type"],
                "severity": damage["severity"],
                "damage_area_ratio": damage["damage_area_ratio"],
                "primary_damage": damage["damage_type"],
                "brand": user_vehicle["brand"],
                "model": user_vehicle["model"],
                "year": user_vehicle["year"],
                "fuel": user_vehicle["fuel"],
                "type": user_vehicle["type"],
                "color": user_vehicle["color"],
            }])

            # Handle missing or unknown values
            df = df.replace("", "__UNKNOWN__")
            df = df.fillna("__UNKNOWN__")

            # Encode categorical features using saved encoders
            for col, encoder in encoders.items():
                if col in df.columns:
                    df[col] = encoder.transform(df[col].astype(str))

            # Ensure all required feature columns are present
            df = df.reindex(columns=feature_cols, fill_value=0)

            # Predict cost
            cost = float(cost_model.predict(df)[0])
            cost = max(1000, cost)  # Minimum cost of ₹1000
            
            total_cost += cost
            cost_results.append({
                "damage_type": damage["damage_type"],
                "severity": damage["severity"],
                "confidence": damage["confidence"],
                "cost": round(cost, 2)
            })

        return total_cost, cost_results

    except Exception as e:
        logger.error(f"Error in cost estimation: {e}")
        # Fallback to simple calculation
        base_costs = {
            "minor": 2000,
            "moderate": 5000,
            "high": 15000
        }
        
        total_cost = 0
        cost_results = []
        for damage in damage_info_list:
            severity = damage.get("severity", "minor")
            area_ratio = damage.get("damage_area_ratio", 0.1)
            base_cost = base_costs.get(severity, 2000)
            cost = base_cost * (1 + area_ratio * 2)
            total_cost += cost
            cost_results.append({
                "damage_type": damage["damage_type"],
                "severity": damage["severity"],
                "confidence": damage["confidence"],
                "cost": round(cost, 2)
            })
        
        return total_cost, cost_results

# ============================
# Routes
# ============================
@app.route("/")
def home():
    return jsonify({
        "message": "Optimized Car Damage Detection API",
        "status": "running",
        "version": "2.0",
        "endpoints": ["/health", "/predict", "/vehicle-brands"],
        "memory_usage": f"{get_memory_usage():.1f} MB"
    })

@app.route("/health")
def health():
    """Enhanced health check with model status"""
    health_status = {
        "status": "healthy" if models_loaded else "degraded",
        "models_loaded": models_loaded,
        "service": "Car Damage Detection API",
        "memory_usage": f"{get_memory_usage():.1f} MB",
        "available_memory": f"{psutil.virtual_memory().available / 1024 / 1024:.1f} MB"
    }

    status_code = 200 if models_loaded else 503
    return jsonify(health_status), status_code

@app.route("/vehicle-brands")
def get_vehicle_brands():
    brands_models = {
        "Toyota": ["Fortuner", "Innova", "Glanza", "Camry", "Corolla"],
        "Hyundai": ["Creta", "Venue", "i20", "i10", "Verna"],
        "Tata": ["Harrier", "Nexon", "Punch", "Safari", "Tiago"],
        "Honda": ["City", "Civic", "Amaze", "Accord", "CR-V"],
        "Kia": ["Seltos", "Sonet", "Carens", "Carnival"],
        "Mahindra": ["XUV500", "Scorpio", "Bolero", "Thar"],
        "Ford": ["Ecosport", "Endeavour", "Figo", "Aspire"],
        "MarutiSuzuki": ["Swift", "Baleno", "Dzire", "WagonR"],
    }
    return jsonify(brands_models)

@app.route("/predict", methods=["POST"])
def predict():
    """Optimized prediction endpoint with crop images"""
    request_start = time.time()

    try:
        # Check if models are loaded
        if not models_loaded:
            if not load_models():
                return jsonify({
                    "success": False,
                    "error": "AI models not available",
                    "message": "Service temporarily unavailable"
                }), 503

        # Validate request
        if "image" not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        file = request.files["image"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        # Save and validate image
        img_path = save_image(file)
        if not img_path:
            return jsonify({"error": "Invalid file type or size. Allowed: png, jpg, jpeg (max 8MB)"}), 400

        logger.info(f"Processing image: {img_path}, Memory: {get_memory_usage():.1f} MB")

        # Extract vehicle details
        user_vehicle = {
            "brand": request.form.get("brand", "Toyota"),
            "model": request.form.get("model", "Fortuner"),
            "year": int(request.form.get("year", 2020)),
            "fuel": request.form.get("fuel", "Petrol"),
            "type": request.form.get("type", "SUV"),
            "color": request.form.get("color", "White"),
        }

        # Run damage analysis
        analysis_start = time.time()
        damage_results = analyze_damage_optimized(img_path)

        if not damage_results:
            # Clean up and return no damage response
            os.remove(img_path)
            return jsonify({
                "success": True,
                "message": "No damage detected in the image",
                "damage_count": 0,
                "total_cost": 0,
                "cost_results": [],
                "crops": [],
                "annotated_image": None,
                "vehicle_info": user_vehicle,
                "currency": "INR",
                "processing_time": f"{time.time() - request_start:.2f}s"
            })

        # Read the original image for cropping
        original_img = cv2.imread(img_path)
        
        # Create lists for results
        cropped_images = []
        crop_urls = []
        
        # Create annotated image
        annotated_image = original_img.copy()
        annotated_rgb = cv2.cvtColor(annotated_image, cv2.COLOR_BGR2RGB)

        # Process each damage to create crops and annotated image
        for i, damage in enumerate(damage_results):
            x1, y1, x2, y2 = damage["box"]
            
            # Draw bounding box and label on annotated image
            label = f"{damage['damage_type']} | {damage['severity']}"
            cv2.rectangle(annotated_rgb, (x1, y1), (x2, y2), (255, 0, 0), 3)
            cv2.putText(annotated_rgb, label, (x1, y1 - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

            # Create crop of damage area
            crop = original_img[y1:y2, x1:x2]
            if crop.size > 0:  # Ensure valid crop
                # Add padding to crop
                padding = 10
                h, w = crop.shape[:2]
                padded_crop = cv2.copyMakeBorder(crop, padding, padding, padding, padding, 
                                                cv2.BORDER_CONSTANT, value=[255, 255, 255])
                
                # Save crop image
                crop_filename = f"{uuid.uuid4()}_crop_{i}.jpg"
                crop_path = os.path.join(RESULTS_FOLDER, crop_filename)
                cv2.imwrite(crop_path, padded_crop, [cv2.IMWRITE_JPEG_QUALITY, 90])
                
                # Add to crops list
                crop_url = f"static/results/{crop_filename}"
                crop_urls.append(crop_url)
                cropped_images.append(crop_url)

        # Save annotated image
        annotated_filename = f"{uuid.uuid4()}_annotated.jpg"
        annotated_path = os.path.join(RESULTS_FOLDER, annotated_filename)
        cv2.imwrite(annotated_path, cv2.cvtColor(annotated_rgb, cv2.COLOR_RGB2BGR))
        annotated_image_url = f"static/results/{annotated_filename}"

        # Calculate costs using the actual model
        total_cost, cost_results = estimate_cost_optimized(damage_results, user_vehicle)

        # Clean up uploaded image
        os.remove(img_path)

        # Force garbage collection
        gc.collect()

        processing_time = time.time() - request_start
        logger.info(f"Prediction completed in {processing_time:.2f}s: {len(damage_results)} damages, total cost {total_cost:.2f}")

        response = {
            "success": True,
            "damage_count": len(damage_results),
            "total_cost": round(total_cost, 2),
            "cost_results": cost_results,
            "crops": crop_urls,  # NOW THIS HAS ACTUAL CROP IMAGES
            "annotated_image": annotated_image_url,
            "vehicle_info": user_vehicle,
            "currency": "INR",
            "processing_time": f"{processing_time:.2f}s",
            "memory_usage": f"{get_memory_usage():.1f} MB"
        }

        return jsonify(response)

    except Exception as e:
        logger.error(f"Prediction error: {e}")

        # Clean up any uploaded files on error
        try:
            if 'img_path' in locals() and os.path.exists(img_path):
                os.remove(img_path)
        except:
            pass

        # Force garbage collection on error
        gc.collect()

        return jsonify({
            "success": False,
            "error": "Processing failed",
            "message": "Unable to process the image. Please try again.",
            "processing_time": f"{time.time() - request_start:.2f}s"
        }), 500

# ---------------------- CREATE ORDER API ----------------------
@app.route("/create-order", methods=["POST"])
def create_order():
    amount = int(request.form.get("amount"))  # ₹ amount

    order = client.order.create({
        "amount": amount * 100,   # Convert to paise
        "currency": "INR",
        "payment_capture": 1
    })

    return jsonify(order)
# --------------------------------------------------------------


# ---------------------- PAYMENT VERIFY ------------------------
@app.route("/verify", methods=["POST"])
def verify_payment():
    order_id = request.form.get("razorpay_order_id")
    payment_id = request.form.get("razorpay_payment_id")
    signature = request.form.get("razorpay_signature")

    generated_signature = hmac.new(
        bytes(RAZORPAY_KEY_SECRET, 'utf-8'),
        bytes(order_id + "|" + payment_id, 'utf-8'),
        hashlib.sha256
    ).hexdigest()

    if generated_signature == signature:
        return render_template("result.html", message="Payment Successful!")
    else:
        return render_template("result.html", message="Payment Failed!")
# --------------------------------------------------------------


# ---------------------- PAYMENT PAGE --------------------------
@app.route("/pay")
def pay():
    return render_template("pay.html", key_id=RAZORPAY_KEY_ID)
# ============================
# Static file routes
# ============================
@app.route("/static/<path:path>")
def serve_static(path):
    return send_from_directory("static", path)

@app.route("/static/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route("/static/results/<path:filename>")
def serve_result(filename):
    return send_from_directory(RESULTS_FOLDER, filename)

# ============================
# Error handlers
# ============================
@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": "File too large. Maximum size is 8MB"}), 413

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error"}), 500

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": "Method not allowed"}), 405

# ============================
# Background cleanup
# ============================
def background_cleanup():
    """Run cleanup tasks in background"""
    while True:
        time.sleep(1800)  # Run every 30 minutes
        cleanup_old_files()
        gc.collect()

# Start background cleanup thread
cleanup_thread = Thread(target=background_cleanup, daemon=True)
cleanup_thread.start()

# ============================
# Entry point
# ============================
# --- ADMIN endpoints (paste near other route definitions) ---
import os
import datetime
from flask import jsonify, request, abort, send_from_directory, current_app

# helper: check admin key
ADMIN_KEY = os.environ.get("ADMIN_KEY", "admin123")  # change in production

print("===========>",ADMIN_KEY)

def verify_admin(req):
    key = req.headers.get("X-ADMIN-KEY")
    return key is not None and key == ADMIN_KEY

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads")
RESULT_FOLDER = os.path.join(BASE_DIR, "static", "results")

@app.route("/admin/stats", methods=["GET"])
def admin_stats():
    if not verify_admin(request):
        return jsonify({"error":"unauthorized"}), 401
    uploads = os.listdir(UPLOAD_FOLDER) if os.path.exists(UPLOAD_FOLDER) else []
    results = os.listdir(RESULT_FOLDER) if os.path.exists(RESULT_FOLDER) else []
    stats = {
        "uploads_count": len(uploads),
        "results_count": len(results),
        "uploads": len(uploads),
        "results": len(results),
        "server_time": datetime.datetime.utcnow().isoformat() + "Z"
    }
    return jsonify(stats), 200

@app.route("/admin/uploads", methods=["GET"])
def admin_list_uploads():
    if not verify_admin(request):
        return jsonify({"error":"unauthorized"}), 401
    items = []
    if os.path.exists(UPLOAD_FOLDER):
        for fname in sorted(os.listdir(UPLOAD_FOLDER), reverse=True):
            fpath = os.path.join(UPLOAD_FOLDER, fname)
            try:
                mtime = os.path.getmtime(fpath)
                items.append({
                    "filename": fname,
                    "size": os.path.getsize(fpath),
                    "modified_at": datetime.datetime.utcfromtimestamp(mtime).isoformat() + "Z",
                    "url": f"/static/uploads/{fname}"
                })
            except Exception:
                continue
    return jsonify({"uploads": items}), 200

@app.route("/admin/results", methods=["GET"])
def admin_list_results():
    if not verify_admin(request):
        return jsonify({"error":"unauthorized"}), 401
    items = []
    if os.path.exists(RESULT_FOLDER):
        for fname in sorted(os.listdir(RESULT_FOLDER), reverse=True):
            fpath = os.path.join(RESULT_FOLDER, fname)
            try:
                mtime = os.path.getmtime(fpath)
                items.append({
                    "filename": fname,
                    "size": os.path.getsize(fpath),
                    "modified_at": datetime.datetime.utcfromtimestamp(mtime).isoformat() + "Z",
                    "url": f"/static/results/{fname}"
                })
            except Exception:
                continue
    return jsonify({"results": items}), 200

@app.route("/admin/delete", methods=["POST"])
def admin_delete_file():
    """
    JSON body: { "folder": "uploads" | "results", "filename": "file.jpg" }
    Header: X-ADMIN-KEY: <key>
    """
    if not verify_admin(request):
        return jsonify({"error":"unauthorized"}), 401
    data = request.get_json() or {}
    folder = data.get("folder")
    filename = data.get("filename")
    if not folder or not filename:
        return jsonify({"error":"missing folder or filename"}), 400
    if folder not in ("uploads", "results"):
        return jsonify({"error":"invalid folder"}), 400

    target_dir = UPLOAD_FOLDER if folder == "uploads" else RESULT_FOLDER
    target_path = os.path.join(target_dir, filename)
    if not os.path.exists(target_path):
        return jsonify({"error":"file not found"}), 404
    try:
        os.remove(target_path)
        return jsonify({"ok": True, "deleted": filename}), 200
    except Exception as e:
        return jsonify({"error":"delete failed", "msg": str(e)}), 500

# optional: serve files (Flask static already does, but keep for direct download)
@app.route("/admin/download/<folder>/<filename>", methods=["GET"])
def admin_download(folder, filename):
    if not verify_admin(request):
        return jsonify({"error":"unauthorized"}), 401
    if folder not in ("uploads","results"):
        return jsonify({"error":"invalid folder"}), 400
    directory = UPLOAD_FOLDER if folder == "uploads" else RESULT_FOLDER
    return send_from_directory(directory, filename, as_attachment=True)
# --- end admin endpoints ---

if __name__ == "__main__":
    # Load models on startup
    if load_models():
        logger.info("Models loaded successfully on startup")
    else:
        logger.warning("Failed to load models on startup - will attempt on first request")

    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting Optimized Car Damage Detection API Server on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True)