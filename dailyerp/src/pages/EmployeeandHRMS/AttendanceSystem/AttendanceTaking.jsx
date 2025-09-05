import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";

const AttendanceTaking = () => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [employees, setEmployees] = useState([]);
  const [faceMatcher, setFaceMatcher] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(null); // null, 'processing', 'completed'
  const [lastAttendance, setLastAttendance] = useState(null);
  const [autoCapturing, setAutoCapturing] = useState(false);
  const [isCameraStopped, setIsCameraStopped] = useState(false);
  const detectionIntervalRef = useRef();
  const streamRef = useRef();
  const recognitionCooldownRef = useRef(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  useEffect(() => {
    loadModels().then(() => {
      startCamera();
      loadEmployees();
    });

    return () => {
      // Cleanup
      cleanup();
    };
  }, []);

  // Start real-time detection automatically when camera and models are ready
  useEffect(() => {
    if (cameraReady && modelsLoaded && faceMatcher && attendanceStatus !== 'completed' && !isCameraStopped) {
      startRealTimeDetection();
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [cameraReady, modelsLoaded, faceMatcher, attendanceStatus, isCameraStopped]);

  const cleanup = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const MODEL_CONFIG = {
    // Your local facemodels folder
    local: '/facemodels',
    // CDN fallback
    cdn: {
      primary: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights',
      backup: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model'
    }
  };

  const loadModelWithFallback = async (modelNet, modelName, localPath) => {
    const sources = [
      { name: 'Local FaceModels', url: `${MODEL_CONFIG.local}/${localPath}` },
      { name: 'Primary CDN', url: MODEL_CONFIG.cdn.primary },
      { name: 'Backup CDN', url: MODEL_CONFIG.cdn.backup }
    ];

    for (const source of sources) {
      try {
        await modelNet.loadFromUri(source.url);
        return { success: true, source: source.name };
      } catch (error) {
        console.warn(`❌ Failed to load ${modelName} from ${source.name}:`, error.message);
      }
    }

    throw new Error(`Failed to load ${modelName} from all sources`);
  };

  const loadModels = async () => {
    try {
      setLoadingProgress && setLoadingProgress(10);

      const models = [
        {
          net: faceapi.nets.tinyFaceDetector,
          name: 'Tiny Face Detector',
          path: 'tiny_face_detector'
        },
        {
          net: faceapi.nets.faceLandmark68Net,
          name: 'Face Landmark 68',
          path: 'face_landmark_68'
        },
        {
          net: faceapi.nets.faceRecognitionNet,
          name: 'Face Recognition',
          path: 'face_recognition'
        }
      ];

      // Load models sequentially with fallback
      for (let i = 0; i < models.length; i++) {
        const model = models[i];
        await loadModelWithFallback(model.net, model.name, model.path);

        // Update progress if available
        if (setLoadingProgress) {
          setLoadingProgress(30 + (i * 20));
        }
      }

      setLoadingProgress && setLoadingProgress(100);
      setModelsLoaded(true);

    } catch (error) {
      console.error("❌ Error loading models:", error);

      // Enhanced error handling
      const errorMessage = `
Failed to load face recognition models: ${error.message}

This could be due to:
- Corrupted local model files
- Network connectivity issues
- Missing model files

Would you like to try CDN-only mode?
    `;

      const useCDN = confirm(errorMessage);

      if (useCDN) {
        await loadModelsFromCDNOnly();
      } else {
        alert("Face recognition will be disabled. You can still use basic camera features.");
        setModelsLoaded && setModelsLoaded(false);
      }
    }
  };

  // Fallback function for CDN-only loading
  const loadModelsFromCDNOnly = async () => {
    try {
      setLoadingProgress && setLoadingProgress(10);

      const CDN_URL = MODEL_CONFIG.cdn.primary;

      await faceapi.nets.tinyFaceDetector.loadFromUri(CDN_URL);
      setLoadingProgress && setLoadingProgress(40);

      await faceapi.nets.faceLandmark68Net.loadFromUri(CDN_URL);
      setLoadingProgress && setLoadingProgress(70);

      await faceapi.nets.faceRecognitionNet.loadFromUri(CDN_URL);
      setLoadingProgress && setLoadingProgress(100);

      setModelsLoaded(true);

    } catch (error) {
      console.error("❌ CDN loading also failed:", error);
      alert("Unable to load face recognition models. Please check your internet connection and try again.");
      setLoadingProgress && setLoadingProgress(0);
    }
  };



  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.addEventListener('loadedmetadata', () => {
          if (canvasRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            setCameraReady(true);
            setIsCameraStopped(false);
          }
        });
      }
    } catch (error) {
      console.error("Camera access error:", error);
      alert("Camera access denied or not available");
    }
  };

  const stopCamera = () => {

    // Clear detection interval
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    // Stop all video tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    setCameraReady(false);
    setIsCameraStopped(true);
    setAutoCapturing(false);
    recognitionCooldownRef.current = false;

  };



  const loadEmployees = async () => {
    try {
      setIsLoading(true);

      const res = await axios.get("http://localhost:8080/api/attendance/employees");

      if (res.data.length === 0) {
        setIsLoading(false);
        return;
      }

      const labeledDescriptors = res.data.map(emp => {
        const descriptorArray = emp.descriptor.map(num => parseFloat(num));
        const descriptor = new Float32Array(descriptorArray);

        return new faceapi.LabeledFaceDescriptors(emp._id, [descriptor]);
      });

      setFaceMatcher(new faceapi.FaceMatcher(labeledDescriptors, 0.6));
      setEmployees(res.data);

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading employees:", error);
      alert("Error loading registered employees");
      setIsLoading(false);
    }
  };

  const autoMarkAttendance = async (employeeId, employeeName, confidence) => {
    if (recognitionCooldownRef.current || autoCapturing) {
      return; // Prevent multiple rapid captures
    }

    try {
      setAutoCapturing(true);
      recognitionCooldownRef.current = true;


      const response = await axios.post("http://localhost:8080/api/attendance/auto", { employeeId });

      setLastAttendance({
        ...response.data.attendance,
        confidence: confidence,
        type: response.data.type,
        workingSummary: response.data.workingSummary,
        employeeName: employeeName
      });

      if (response.data.type === 'IN') {
        alert(`🟢 Welcome ${employeeName}!\nIN time recorded`);
        setAttendanceStatus('in');

        // Set cooldown for 10 seconds
        setTimeout(() => {
          recognitionCooldownRef.current = false;
          setAutoCapturing(false);
        }, 10000);

      } else if (response.data.type === 'OUT') {
        alert(`🔴 SEE YOU TOMM${employeeName}!\nOUT time recorded`);
        setAttendanceStatus('completed');

        // Stop camera after OUT time is marked (with delay for user to see the message)
        setTimeout(() => {
          stopCamera();
        }, 3000);

      } else if (response.data.type === 'COMPLETED') {
        alert(`👋 Hello ${employeeName}!\nYour attendance is already complete for today.\n${response.data.workingSummary}`);
        setAttendanceStatus('completed');

        // Stop camera as attendance is already complete
        setTimeout(() => {
          stopCamera();
        }, 3000);
      }

    } catch (error) {
      console.error("Auto attendance error:", error);

      if (error.response && error.response.data) {
        alert(`❌ Error: ${error.response.data.error}`);
      } else {
        alert(`❌ Failed to mark attendance for ${employeeName}. Please try again.`);
      }

      setTimeout(() => {
        recognitionCooldownRef.current = false;
        setAutoCapturing(false);
      }, 8080);
    }
  };

  const drawDetections = (detections, canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (detections && detections.length > 0) {
      detections.forEach(detection => {
        const { box, label, distance, employeeId } = detection;

        // Auto-capture attendance if employee is recognized and not in cooldown
        if (label !== 'unknown' && !recognitionCooldownRef.current && !autoCapturing && attendanceStatus !== 'completed') {
          const confidence = (100 - distance * 100).toFixed(1);
          if (confidence > 60) { // Only auto-capture if confidence is high
            autoMarkAttendance(employeeId, label, confidence);
          }
        }

        // Draw bounding box (smaller size)
        const reduction = 0.4;
        const newWidth = box.width * (1 - reduction);
        const newHeight = box.height * (1 - reduction);
        const newX = box.x + (box.width - newWidth) / 2;
        const newY = box.y + (box.height - newHeight) / 2;

        ctx.strokeStyle = label === 'unknown' ? '#ff0000' : '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(newX, newY, newWidth, newHeight);

        // Draw label
        const labelText = label === 'unknown' ? 'Unknown' : label;
        const confidence = `${(100 - distance * 100).toFixed(1)}%`;
        const status = autoCapturing ? ' (Capturing...)' : '';
        const fullLabel = `${labelText} ${status}`;

        ctx.font = '14px Arial';
        ctx.fillStyle = label === 'unknown' ? '#ff0000' : autoCapturing ? '#ff8c00' : '#00ff00';
        const textWidth = ctx.measureText(fullLabel).width + 10;
        ctx.fillRect(newX, newY - 25, textWidth, 25);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(fullLabel, newX + 5, newY - 8);
      });
    }
  };

  const realTimeDetection = async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded || !faceMatcher || isCameraStopped) {
      return;
    }

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      const displayDetections = detections.map(detection => {
        const result = faceMatcher.findBestMatch(detection.descriptor);
        const employee = result.label !== 'unknown'
          ? employees.find(emp => emp._id === result.label)
          : null;

        return {
          box: detection.detection.box,
          label: employee ? employee.name : 'unknown',
          employeeId: result.label !== 'unknown' ? result.label : null,
          distance: result.distance
        };
      });

      drawDetections(displayDetections, canvasRef.current);
    } catch (error) {
      console.error("Real-time detection error:", error);
    }
  };

  const startRealTimeDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    detectionIntervalRef.current = setInterval(realTimeDetection, 1000); 
  };


  return (
    <div className="content">
      {/* <h2>🤖 Smart Attendance System</h2> */}
      <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb">
        <div className="my-auto">
          <h2 className="mb-1">Attendance Taking</h2>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
              </li>
              <li className="breadcrumb-item">HRMS</li>
              <li className="breadcrumb-item active" aria-current="page">Attendance Taking</li>
            </ol>
          </nav>
        </div>

      </div>
      <div style={{ margin: '20px 0', position: 'relative', display: 'inline-block' }}>
        {!isCameraStopped ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-100 h-100"
              style={{ border: '2px solid #ccc', borderRadius: '8px' }}
            />
            <canvas
              ref={canvasRef}
              width="400"
              height="300"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                borderRadius: '8px'
              }}
            />

          </>
        ) : (
          <div
            style={{
              width: '400px',
              height: '300px',
              border: '2px solid #6c757d',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: attendanceStatus === 'completed' ? '#d4edda' : '#f8f9fa',
              color: attendanceStatus === 'completed' ? '#155724' : '#495057',
              fontSize: '16px',
              fontWeight: 'bold',
              textAlign: 'center',
              padding: '20px',
              boxSizing: 'border-box'
            }}
          >
            {attendanceStatus === 'completed' && (
              <>
                <div>✅ Attendance Completed!</div>
                <div style={{ fontSize: '14px', marginTop: '10px' }}>📹 Camera Stopped</div>
                {lastAttendance && lastAttendance.workingSummary && (
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'normal',
                    marginTop: '10px',
                    lineHeight: '1.4'
                  }}>
                    👤 {lastAttendance.employeeName}<br />
                    ⏰ {lastAttendance.workingSummary}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Status Display
      <div style={{
        margin: '20px 0',
        padding: '10px',
        backgroundColor: getStatusColor(),
        color: 'white',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        {getStatusMessage()}
      </div> */}

      {/* Attendance Details */}
      {lastAttendance && (
        <div style={{
          margin: '20px 0',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>Last Attendance Record</h4>
          <div style={{ textAlign: 'left', fontSize: '14px', color: '#6c757d' }}>
            <strong>Employee:</strong> {lastAttendance.employeeName}<br />
            <strong>Type:</strong> {lastAttendance.type === 'IN' ? '🟢 Check IN' : lastAttendance.type === 'OUT' ? '🔴 Check OUT' : '✅ Already Complete'}<br />
            {lastAttendance.inTime && (
              <><strong>IN Time:</strong> {new Date(lastAttendance.inTime).toLocaleString()}<br /></>
            )}
            {lastAttendance.outTime && (
              <><strong>OUT Time:</strong> {new Date(lastAttendance.outTime).toLocaleString()}<br /></>
            )}
            {lastAttendance.workingSummary && (
              <><strong>Working Hours:</strong> {lastAttendance.workingSummary}<br /></>
            )}
            {/* <strong>Confidence:</strong> {lastAttendance.confidence}% */}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div style={{ margin: '20px 0' }}>
        {isCameraStopped ? (
          <div>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-secondary"
            >
              New Session
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={loadEmployees}
              disabled={isLoading}
              className="btn btn-primary me-2"
            >
              {isLoading ? 'Loading...' : ' Refresh Employee List'}
            </button>

            <button
              onClick={stopCamera}
              className="btn btn-danger"
            >
              Stop Camera
            </button>
          </>
        )}
      </div>

      {/* System Status */}
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        {isCameraStopped ? (
          <div>
            {attendanceStatus === 'completed' && (
              <p style={{ color: '#28a745', fontSize: '16px', fontWeight: 'bold' }}>
                🎉 Daily attendance completed successfully! Camera stopped for privacy.
              </p>
            )}
          </div>
        ) : (
          <>
            {!modelsLoaded && <p>🔄 Loading face recognition models...</p>}
            {modelsLoaded && isLoading && <p>🔄 Loading registered employees...</p>}
            {modelsLoaded && !cameraReady && <p>📹 Starting camera...</p>}
            {modelsLoaded && !isLoading && employees.length === 0 && (
              <p style={{ color: 'orange' }}>⚠️ No employees registered. Please register employees first.</p>
            )}
            {/* {modelsLoaded && !isLoading && employees.length > 0 && cameraReady && (
              <p style={{ color: 'green' }}>
                ✅ Auto-capture ready ({employees.length} employees registered)
              </p>
            )} */}
            {/* {cameraReady && modelsLoaded && faceMatcher && (
              <p style={{ color: '#17a2b8' }}>
                🤖 Auto-attendance active - Just show your face to the camera!
              </p>
            )} */}
          </>
        )}
      </div>


    </div>
  );
};

export default AttendanceTaking;