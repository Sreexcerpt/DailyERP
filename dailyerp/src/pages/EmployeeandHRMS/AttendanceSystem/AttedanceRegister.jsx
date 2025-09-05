import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const AttedanceRegister = () => {
  const videoRef = useRef();
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [fetchedName, setFetchedName] = useState("");
  const [descriptor, setDescriptor] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isFetchingEmployee, setIsFetchingEmployee] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Load Bootstrap CSS and Icons
  useEffect(() => {
    loadModels();
  }, []);

  const startCamera = async () => {
    try {
      console.log("Starting camera...");
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
          console.log("Camera ready");
        };
      }
    } catch (error) {
      console.error("Camera access error:", error);
      alert("Camera access denied or not available");
    }
  };

  // FIXED: Using actual face-api.js model loading
  // const loadModels = async () => {
  //   try {
  //     console.log("Loading face-api models...");
  //     setLoadingProgress(10);

  //     await Promise.all([
  //       faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector'),
  //       faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68'),
  //       faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition')
  //     ]);

  //     setLoadingProgress(100);
  //     console.log("Models loaded successfully");
  //     setModelsLoaded(true);
  //     startCamera();
  //   } catch (error) {
  //     console.error("Error loading models:", error);
  //     alert("Error loading face recognition models. Check console for details.");
  //   }
  // };




  const MODEL_CONFIG = {
    // Your local weights folder
    local: '/weights',
    // CDN fallback
    cdn: {
      primary: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights',
      backup: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model'
    }
  };

  const loadModelWithFallback = async (modelNet, modelName, progressCallback) => {
    const sources = [
      { name: 'Local Weights', url: MODEL_CONFIG.local },
      { name: 'Primary CDN', url: MODEL_CONFIG.cdn.primary },
      { name: 'Backup CDN', url: MODEL_CONFIG.cdn.backup }
    ];

    for (const source of sources) {
      try {
        console.log(`🔄 Loading ${modelName} from ${source.name}...`);
        await modelNet.loadFromUri(source.url);
        console.log(`✅ ${modelName} loaded successfully from ${source.name}`);
        if (progressCallback) progressCallback();
        return { success: true, source: source.name };
      } catch (error) {
        console.warn(`❌ Failed to load ${modelName} from ${source.name}:`, error.message);

        if (source.name === 'Local Weights') {
          console.log(`🌐 Falling back to CDN for ${modelName}...`);
        }
      }
    }

    throw new Error(`Failed to load ${modelName} from all sources (local weights + CDN)`);
  };

  const loadModelsHybrid = async () => {
    try {
      console.log("🚀 Loading face-api models (Local Weights + CDN fallback)...");
      setLoadingProgress(5);

      const models = [
        {
          net: faceapi.nets.tinyFaceDetector,
          name: 'Tiny Face Detector',
          progress: 30
        },
        {
          net: faceapi.nets.faceLandmark68Net,
          name: 'Face Landmark 68',
          progress: 65
        },
        {
          net: faceapi.nets.faceRecognitionNet,
          name: 'Face Recognition',
          progress: 95
        }
      ];

      for (const model of models) {
        await loadModelWithFallback(
          model.net,
          model.name,
          () => setLoadingProgress(model.progress)
        );

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setLoadingProgress(100);
      console.log("🎉 All models loaded successfully!");
      setModelsLoaded(true);
      startCamera();

    } catch (error) {
      console.error("💥 Critical: All model loading attempts failed:", error);
      setLoadingProgress(0);

      // Show user-friendly error with options
      showLoadingError(error);
    }
  };

  const showLoadingError = (error) => {
    const errorMessage = `
Face recognition models failed to load:
${error.message}

This might be due to:
- Corrupted local weight files
- Network connectivity issues
- Missing model files

Would you like to:
1. Try again (Recommended)
2. Continue without face recognition
3. Use CDN only
  `;

    const choice = confirm(errorMessage + "\n\nClick OK to try again, Cancel to continue without face recognition");

    if (choice) {
      // Retry loading
      setTimeout(() => loadModelsHybrid(), 1000);
    } else {
      // Continue without face recognition
      console.log("📱 Continuing without face recognition...");
      setModelsLoaded(false);
      startBasicCamera();
    }
  };

  // Alternative: CDN-only fallback function
  const loadModelsFromCDNOnly = async () => {
    try {
      console.log("🌐 Loading models from CDN only...");
      setLoadingProgress(10);

      const CDN_URL = MODEL_CONFIG.cdn.primary;

      await faceapi.nets.tinyFaceDetector.loadFromUri(CDN_URL);
      setLoadingProgress(40);

      await faceapi.nets.faceLandmark68Net.loadFromUri(CDN_URL);
      setLoadingProgress(70);

      await faceapi.nets.faceRecognitionNet.loadFromUri(CDN_URL);
      setLoadingProgress(100);

      console.log("✅ All models loaded from CDN");
      setModelsLoaded(true);
      startCamera();

    } catch (error) {
      console.error("CDN loading also failed:", error);
      alert("Unable to load face recognition models. Please check your internet connection.");
    }
  };

  // Enhanced version with file validation
  const loadModelsWithValidation = async () => {
    try {
      console.log("🔍 Validating local weight files...");

      // Check if local weights directory is accessible
      const testResponse = await fetch('/weights/tiny_face_detector_model-weights_manifest.json');

      if (testResponse.ok) {
        console.log("✅ Local weights accessible, proceeding with hybrid loading");
        await loadModelsHybrid();
      } else {
        console.log("⚠️ Local weights not accessible, using CDN only");
        await loadModelsFromCDNOnly();
      }

    } catch (error) {
      console.warn("⚠️ Validation failed, falling back to CDN:", error);
      await loadModelsFromCDNOnly();
    }
  };

  // Utility function to check local weight files integrity
  const validateWeightFiles = async () => {
    const requiredFiles = [
      '/weights/tiny_face_detector_model-weights_manifest.json',
      '/weights/tiny_face_detector_model-shard1',
      '/weights/face_landmark_68_model-weights_manifest.json',
      '/weights/face_landmark_68_model-shard1',
      '/weights/face_recognition_model-weights_manifest.json',
      '/weights/face_recognition_model-shard1',
      '/weights/face_recognition_model-shard2'
    ];

    console.log("🔍 Checking weight file integrity...");

    for (const file of requiredFiles) {
      try {
        const response = await fetch(file, { method: 'HEAD' });
        const fileSize = response.headers.get('content-length');

        console.log(`${response.ok ? '✅' : '❌'} ${file}: ${fileSize ? fileSize + ' bytes' : 'Size unknown'}`);

        if (!response.ok) {
          console.warn(`⚠️ Missing or inaccessible: ${file}`);
          return false;
        }
      } catch (error) {
        console.error(`❌ Error checking ${file}:`, error);
        return false;
      }
    }

    console.log("✅ All weight files validated successfully");
    return true;
  };

  // Your main loading function - choose one of these approaches:

  // Option 1: Simple hybrid with fallback (Recommended)
  // const loadModels = loadModelsHybrid;

  // Option 2: With validation first
  // const loadModels = loadModelsWithValidation;

  // Option 3: Validation + hybrid for maximum reliability
  const loadModels = async () => {
    console.log("🎯 Starting comprehensive model loading...");

    const isLocalValid = await validateWeightFiles();

    if (isLocalValid) {
      console.log("✅ Local weights validated, using hybrid approach");
      await loadModelsHybrid();
    } else {
      console.log("⚠️ Local weights invalid, using CDN only");
      await loadModelsFromCDNOnly();
    }
  };








  const fetchEmployeeById = async () => {
    if (!employeeId.trim()) {
      alert("Please enter Employee ID");
      return;
    }

    try {
      setIsFetchingEmployee(true);
      console.log("Fetching employee by ID...");

      const response = await fetch(`http://localhost:8080/api/attendance/employee/${employeeId.trim()}`);

      if (!response.ok) {
        if (response.status === 404) {
          alert("Employee not found with this ID");
          setFetchedName("");
          setName("");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const employee = await response.json();
      setFetchedName(employee.name);
      setName(employee.name);

      alert(`Employee found: ${employee.name}`);
    } catch (error) {
      console.error("Error fetching employee:", error);
      alert("Error fetching employee details. Please try again.");
      setFetchedName("");
      setName("");
    } finally {
      setIsFetchingEmployee(false);
    }
  };

  // FIXED: Using actual face-api.js duplicate checking logic
  const checkForDuplicates = async (newDescriptor) => {
    try {
      setIsChecking(true);
      console.log("Checking for duplicate faces...");

      const response = await fetch("http://localhost:8080/api/attendance/employees");
      const employees = await response.json();

      if (employees.length === 0) {
        setDuplicateCheck({ isDuplicate: false, message: "No existing employees to compare with." });
        return false;
      }

      // Create face matcher with existing employees - ACTUAL FACE-API LOGIC
      const labeledDescriptors = employees.map(emp => {
        const descriptorArray = emp.descriptor.map(num => parseFloat(num));
        const descriptor = new Float32Array(descriptorArray);
        return new faceapi.LabeledFaceDescriptors(emp._id, [descriptor]);
      });

      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5); // Lower threshold for stricter matching

      // Check if the new face matches any existing employee
      const result = faceMatcher.findBestMatch(new Float32Array(newDescriptor));

      console.log("Duplicate check result:", result.label, "Distance:", result.distance);

      if (result.label !== "unknown") {
        // Found a duplicate
        const duplicateEmployee = employees.find(emp => emp._id === result.label);
        const similarity = (100 - result.distance * 100).toFixed(1);

        setDuplicateCheck({
          isDuplicate: true,
          employeeName: duplicateEmployee.name,
          similarity: similarity,
          message: `⚠️ Face matches existing employee: ${duplicateEmployee.name} (${similarity}% similarity)`
        });

        return true;
      } else {
        setDuplicateCheck({
          isDuplicate: false,
          message: `✅ No duplicate found. Face is unique (closest match: ${(100 - result.distance * 100).toFixed(1)}% similarity)`
        });

        return false;
      }
    } catch (error) {
      console.error("Error checking duplicates:", error);
      setDuplicateCheck({
        isDuplicate: false,
        message: "⚠️ Could not check for duplicates. Proceeding anyway."
      });
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  // FIXED: Using actual face-api.js face detection
  const captureFace = async () => {
    if (!modelsLoaded) {
      alert("Models are still loading, please wait...");
      return;
    }

    if (!cameraReady || !videoRef.current) {
      alert("Camera not ready");
      return;
    }

    try {
      console.log("Capturing face...");

      // ACTUAL FACE-API DETECTION
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        const newDescriptor = Array.from(detection.descriptor);
        setDescriptor(newDescriptor);

        console.log("Face captured successfully. Checking for duplicates...");

        // Check for duplicates
        const isDuplicate = await checkForDuplicates(newDescriptor);

        if (!isDuplicate) {
          alert("Face captured successfully! No duplicate found. You can now register.");
        } else {
          alert("⚠️ Warning: This face appears to match an existing employee. Please check the details below.");
        }
      } else {
        alert("No face detected. Please make sure your face is clearly visible and try again.");
        setDuplicateCheck(null);
      }
    } catch (error) {
      console.error("Face detection error:", error);
      alert("Error detecting face. Please try again.");
      setDuplicateCheck(null);
    }
  };

  const registerEmployee = async () => {
    if (!employeeId.trim()) {
      alert("Please enter Employee ID");
      return;
    }

    if (!name.trim()) {
      alert("Please fetch employee name using Employee ID");
      return;
    }

    if (!descriptor) {
      alert("Please capture face first");
      return;
    }

    if (duplicateCheck && duplicateCheck.isDuplicate) {
      const confirmRegister = window.confirm(
        `⚠️ WARNING: This face matches existing employee "${duplicateCheck.employeeName}" with ${duplicateCheck.similarity}% similarity.\n\nAre you sure you want to register this person as a new employee?\n\nClick OK to proceed anyway, or Cancel to stop.`
      );

      if (!confirmRegister) {
        return;
      }
    }

    try {
      console.log("Registering employee...");

      // Create canvas to capture image
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      const imageBase64 = canvas.toDataURL("image/png");

      const response = await fetch("http://localhost:8080/api/attendance/employee/register", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: employeeId.trim(),
          name: name.trim(),
          descriptor,
          //image: imageBase64
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const result = await response.json();
      alert(`✅ Employee "${name.trim()}" registered successfully!`);

      // Stop camera
      const stream = videoRef.current.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }

      // Reset state
      setEmployeeId("");
      setName("");
      setFetchedName("");
      setDescriptor(null);
      setDuplicateCheck(null);
      setCameraReady(false);
    } catch (error) {
      console.error("Registration error:", error);
      alert(`Registration failed: ${error.message}`);
    }
  };

  const restartCamera = async () => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }

      setDescriptor(null);
      setDuplicateCheck(null);
      setCameraReady(false);

      await startCamera();
    } catch (error) {
      console.error("Error restarting camera:", error);
      alert("Error restarting camera");
    }
  };

  return (
    <div className="content" >
      <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb">
        <div className="my-auto">
          <h2 className="mb-1">Employee Face Registration</h2>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
              </li>
              <li className="breadcrumb-item">HRMS</li>
              <li className="breadcrumb-item active" aria-current="page">Employee Face Registration</li>
            </ol>
          </nav>
        </div>

      </div>

      <div >
        {/* Header */}


        {/* Main Content Card */}
        <div className="card ">
          <div className="card-body ">
            <div className="row">

              {/* Left Side - Camera */}
              <div className="col-lg-6">
                <div className="text-center mb-4">
                  <h2 className="h3 fw-semibold text-dark">Camera Feed</h2>
                </div>

                {/* Loading Progress */}
                {!modelsLoaded && (
                  <div className="mb-4">
                    <div className="progress">
                      <div
                        className="progress-bar bg-primary progress-bar-animated progress-bar-striped"
                        style={{ width: `${loadingProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-center text-muted small mt-2">
                      Loading models... {loadingProgress}%
                    </p>
                  </div>
                )}

                {/* Camera Container */}
                <div className="position-relative mb-4">
                  <div className="card border-3 border-secondary rounded-3 overflow-hidden shadow">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-100 h-100"
                      
                    />
                    {!cameraReady && modelsLoaded && (
                      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light">
                        <div className="text-center">
                          <div className="spinner-border text-primary mb-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="text-muted mb-0">Starting camera...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Camera Controls */}
                <div className="d-flex gap-2 justify-content-center flex-wrap">
                  <button
                    onClick={captureFace}
                    disabled={!modelsLoaded || !cameraReady || isChecking}
                    className={`btn btn-lg fw-semibold px-4 ${(modelsLoaded && cameraReady && !isChecking)
                        ? 'btn-primary shadow'
                        : 'btn-secondary'
                      }`}
                  >
                    {!modelsLoaded ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Loading Models...
                      </>
                    ) : !cameraReady ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Camera Starting...
                      </>
                    ) : isChecking ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Checking...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-camera-fill me-2"></i>
                        Capture & Check
                      </>
                    )}
                  </button>

                  <button
                    onClick={restartCamera}
                    className="btn btn-outline-info btn-lg fw-semibold px-4"
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Restart Camera
                  </button>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="col-lg-6">
                <div className="text-center mb-4">
                  <h2 className="h3 fw-semibold text-dark">Employee Details</h2>
                </div>

                {/* Employee ID Input */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark">Employee ID</label>
                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Enter Employee ID"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                    />
                    <button
                      onClick={fetchEmployeeById}
                      disabled={isFetchingEmployee || !employeeId.trim()}
                      className={`btn ${(!isFetchingEmployee && employeeId.trim())
                          ? 'btn-success'
                          : 'btn-secondary'
                        } fw-semibold`}
                      type="button"
                    >
                      {isFetchingEmployee ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Fetching...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-search me-2"></i>
                          Fetch
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Employee Name Display */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark">Employee Name</label>
                  <input
                    type="text"
                    className="form-control form-control-lg bg-light"
                    value={name}
                    readOnly
                    placeholder="Name will be fetched automatically"
                  />
                </div>

                {/* Register Button */}
                <div className="mb-4">
                  <button
                    onClick={registerEmployee}
                    disabled={!employeeId.trim() || !name.trim() || !descriptor || isChecking}
                    className={`btn btn-lg w-100 fw-bold py-3 ${(employeeId.trim() && name.trim() && descriptor && !isChecking)
                        ? (duplicateCheck && duplicateCheck.isDuplicate
                          ? 'btn-danger'
                          : 'btn-success')
                        : 'btn-secondary'
                      } shadow`}
                  >
                    {duplicateCheck && duplicateCheck.isDuplicate ? (
                      <>
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Register Anyway ⚠️
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus me-2"></i>
                        Register Employee
                      </>
                    )}
                  </button>
                </div>

                {/* Status Indicators */}
                <div className="mb-4">
                  {!modelsLoaded && (
                    <div className="alert alert-info d-flex align-items-center mb-2" role="alert">
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      <span>Loading face recognition models...</span>
                    </div>
                  )}
                  {modelsLoaded && !cameraReady && (
                    <div className="alert alert-warning d-flex align-items-center mb-2" role="alert">
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      <span>Starting camera...</span>
                    </div>
                  )}
                  {/* {modelsLoaded && cameraReady && !descriptor && (
                    <div className="alert alert-primary mb-2" role="alert">
                      <i className="bi bi-check-circle me-2"></i>
                      Ready - Enter Employee ID and capture face
                    </div>
                  )} */}
                  {descriptor && !duplicateCheck && (
                    <div className="alert alert-warning mb-2" role="alert">
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Checking for duplicates...
                    </div>
                  )}
                  {descriptor && duplicateCheck && !duplicateCheck.isDuplicate && (
                    <div className="alert alert-success mb-2" role="alert">
                      <i className="bi bi-check-circle-fill me-2"></i>
                      Face verified unique, ready to register
                    </div>
                  )}
                  {descriptor && duplicateCheck && duplicateCheck.isDuplicate && (
                    <div className="alert alert-warning mb-2" role="alert">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Potential duplicate detected
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Duplicate Check Results */}
            {duplicateCheck && (
              <div className="mt-4">
                <div className={`alert ${duplicateCheck.isDuplicate
                    ? 'alert-warning border-warning'
                    : 'alert-success border-success'
                  } border-3`}>
                  <h5 className={`alert-heading fw-bold ${duplicateCheck.isDuplicate ? 'text-warning' : 'text-success'
                    }`}>
                    <i className={`bi ${duplicateCheck.isDuplicate ? 'bi-exclamation-triangle' : 'bi-check-circle'} me-2`}></i>
                    Duplicate Check Result
                  </h5>
                  <p className="mb-2 fw-semibold">
                    {duplicateCheck.message}
                  </p>
                  {duplicateCheck.isDuplicate && (
                    <p className="mb-0 small">
                      <i className="bi bi-info-circle me-1"></i>
                      Proceeding will register this person as a separate employee, which may cause recognition issues.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttedanceRegister;


