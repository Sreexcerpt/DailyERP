

// import React, { useEffect, useRef, useState } from "react";
// import * as faceapi from "face-api.js";
// import axios from "axios";

// const AttendanceTaking = () => {
//   const videoRef = useRef();
//   const [employees, setEmployees] = useState([]);
//   const [faceMatcher, setFaceMatcher] = useState(null);
//   const [modelsLoaded, setModelsLoaded] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     loadModels().then(() => {
//       startCamera();
//       loadEmployees();
//     });
//   }, []);

//   const loadModels = async () => {
//     try {
//       console.log("Loading face recognition models...");
      
//       // Load models from correct paths
//       await Promise.all([
//         faceapi.nets.tinyFaceDetector.loadFromUri("/models/tiny_face_detector"),
//         faceapi.nets.faceLandmark68Net.loadFromUri("/models/face_landmark_68"),
//         faceapi.nets.faceRecognitionNet.loadFromUri("/models/face_recognition")
//       ]);
      
//       console.log("Models loaded successfully");
//       setModelsLoaded(true);
//     } catch (error) {
//       console.error("Error loading models:", error);
//       alert("Error loading face recognition models. Check console for details.");
//     }
//   };

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       videoRef.current.srcObject = stream;
//     } catch (error) {
//       console.error("Camera access error:", error);
//       alert("Camera access denied or not available");
//     }
//   };

//   const loadEmployees = async () => {
//     try {
//       setIsLoading(true);
//       console.log("Loading registered employees...");
      
//       const res = await axios.get("/api/attendance/employees");
//       console.log(`Found ${res.data.length} registered employees`);
      
//       if (res.data.length === 0) {
//         alert("No employees registered yet. Please register employees first.");
//         setIsLoading(false);
//         return;
//       }

//       // Create labeled face descriptors for face matching
//       const labeledDescriptors = res.data.map(emp => {
//         console.log(`Loading employee: ${emp.name}, descriptor length: ${emp.descriptor.length}`);
        
//         // Convert stored descriptor array to Float32Array
//         const descriptorArray = emp.descriptor.map(num => parseFloat(num));
//         const descriptor = new Float32Array(descriptorArray);
        
//         return new faceapi.LabeledFaceDescriptors(emp._id, [descriptor]);
//       });

//       console.log("Created labeled descriptors for", labeledDescriptors.length, "employees");

//       // Create face matcher with threshold of 0.6 (lower = more strict)
//       setFaceMatcher(new faceapi.FaceMatcher(labeledDescriptors, 0.6));
//       setEmployees(res.data);
      
//       console.log("Face matcher initialized successfully");
//       setIsLoading(false);
//     } catch (error) {
//       console.error("Error loading employees:", error);
//       alert("Error loading registered employees");
//       setIsLoading(false);
//     }
//   };

//   const recognize = async () => {
//     if (!modelsLoaded) {
//       alert("Models are still loading, please wait...");
//       return;
//     }

//     if (!faceMatcher) {
//       alert("No registered employees found. Please register employees first.");
//       return;
//     }

//     if (isLoading) {
//       alert("Still loading employee data, please wait...");
//       return;
//     }

//     try {
//       console.log("Detecting face for recognition...");
      
//       const detection = await faceapi
//         .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
//         .withFaceLandmarks()
//         .withFaceDescriptor();

//       if (!detection) {
//         alert("No face detected. Please make sure your face is clearly visible.");
//         return;
//       }

//       console.log("Face detected, matching with registered employees...");
      
//       // Find best match
//       const result = faceMatcher.findBestMatch(detection.descriptor);
//       console.log("Match result:", result.label, "Distance:", result.distance);

//       if (result.label !== "unknown") {
//         // Found a match
//         const employeeId = result.label;
//         const employee = employees.find((e) => e._id === employeeId);
        
//         if (employee) {
//           try {
//             // Try to mark attendance
//             const response = await axios.post("/api/attendance/attendance", { employeeId });
//             alert(`✅ Attendance marked successfully for ${employee.name}\nConfidence: ${(100 - result.distance * 100).toFixed(1)}%`);
//           } catch (attendanceError) {
//             // Handle attendance marking errors
//             if (attendanceError.response && attendanceError.response.status === 400) {
//               const errorData = attendanceError.response.data;
//               if (errorData.error === "Attendance already marked for today") {
//                 alert(`👋 Hello ${employee.name}!\n\n⚠️ Your attendance has already been marked for today.\n\nRecognition Confidence: ${(100 - result.distance * 100).toFixed(1)}%`);
//               } else {
//                 alert(`⚠️ ${employee.name} recognized but attendance not marked:\n${errorData.error}`);
//               }
//             } else {
//               console.error("Attendance API error:", attendanceError);
//               alert(`❌ ${employee.name} recognized but failed to mark attendance.\nPlease try again or contact admin.`);
//             }
//           }
//         } else {
//           alert("Employee data not found");
//         }
//       } else {
//         alert(`❌ Face not recognized. Please register first.\nClosest match confidence: ${(100 - result.distance * 100).toFixed(1)}%`);
//       }
//     } catch (error) {
//       console.error("Recognition error:", error);
//       alert(`Error during face recognition: ${error.message}\nPlease try again.`);
//     }
//   };

//   return (
//     <div style={{ padding: '20px', textAlign: 'center' }}>
//       <h2>Face Recognition - Mark Attendance</h2>
      
//       <div style={{ margin: '20px 0' }}>
//         <video 
//           ref={videoRef} 
//           autoPlay 
//           muted 
//           width="400" 
//           height="300" 
//           style={{ border: '2px solid #ccc', borderRadius: '8px' }}
//         />
//       </div>
      
//       <div style={{ margin: '20px 0' }}>
//         <button 
//           onClick={recognize}
//           disabled={!modelsLoaded || !faceMatcher || isLoading}
//           style={{ 
//             padding: '15px 30px', 
//             fontSize: '18px',
//             backgroundColor: (modelsLoaded && faceMatcher && !isLoading) ? '#28a745' : '#ccc',
//             color: 'white',
//             border: 'none',
//             borderRadius: '6px',
//             cursor: (modelsLoaded && faceMatcher && !isLoading) ? 'pointer' : 'not-allowed'
//           }}
//         >
//           {!modelsLoaded ? 'Loading Models...' : 
//            isLoading ? 'Loading Employees...' : 
//            !faceMatcher ? 'No Employees Registered' : 
//            'Recognize Face & Mark Attendance'}
//         </button>
//       </div>
      
//       <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
//         {!modelsLoaded && <p>Loading face recognition models...</p>}
//         {modelsLoaded && isLoading && <p>Loading registered employees...</p>}
//         {modelsLoaded && !isLoading && employees.length === 0 && (
//           <p style={{ color: 'orange' }}>No employees registered. Please register employees first.</p>
//         )}
//         {modelsLoaded && !isLoading && employees.length > 0 && (
//           <p style={{ color: 'green' }}>
//             ✓ Ready for recognition ({employees.length} employees registered)
//           </p>
//         )}
//       </div>
      
//       <div style={{ marginTop: '20px' }}>
//         <button 
//           onClick={loadEmployees}
//           style={{ 
//             padding: '8px 16px', 
//             fontSize: '14px',
//             backgroundColor: '#007bff',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer'
//           }}
//         >
//           Refresh Employee List
//         </button>
//       </div>

//       {/* Instructions */}
//       <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
//         <h4 style={{ marginTop: 0, color: '#495057' }}>Instructions:</h4>
//         <ul style={{ textAlign: 'left', color: '#6c757d', fontSize: '14px' }}>
//           <li>Position your face clearly in front of the camera</li>
//           <li>Ensure good lighting for better recognition</li>
//           <li>Click "Recognize Face" to mark attendance</li>
//           <li>Each person can only mark attendance once per day</li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default AttendanceTaking;


//correct wokring 
// import React, { useEffect, useRef, useState } from "react";
// import * as faceapi from "face-api.js";
// import axios from "axios";

// const AttendanceTaking = () => {
//   const videoRef = useRef();
//   const canvasRef = useRef();
//   const [employees, setEmployees] = useState([]);
//   const [faceMatcher, setFaceMatcher] = useState(null);
//   const [modelsLoaded, setModelsLoaded] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [cameraReady, setCameraReady] = useState(false);
//   const [attendanceMarked, setAttendanceMarked] = useState(false);
//   const detectionIntervalRef = useRef();
//   const streamRef = useRef();

//   useEffect(() => {
//     loadModels().then(() => {
//       startCamera();
//       loadEmployees();
//     });
    
//     return () => {
//       // Cleanup
//       if (detectionIntervalRef.current) {
//         clearInterval(detectionIntervalRef.current);
//       }
//     };
//   }, []);

//   // Start real-time detection automatically when camera and models are ready, but not if attendance is marked
//   useEffect(() => {
//     if (cameraReady && modelsLoaded && faceMatcher && !attendanceMarked) {
//       startRealTimeDetection();
//     }
    
//     return () => {
//       if (detectionIntervalRef.current) {
//         clearInterval(detectionIntervalRef.current);
//       }
//     };
//   }, [cameraReady, modelsLoaded, faceMatcher, attendanceMarked]);

//   const loadModels = async () => {
//     try {
//       console.log("Loading face recognition models...");
      
//       await Promise.all([
//         faceapi.nets.tinyFaceDetector.loadFromUri("/models/tiny_face_detector"),
//         faceapi.nets.faceLandmark68Net.loadFromUri("/models/face_landmark_68"),
//         faceapi.nets.faceRecognitionNet.loadFromUri("/models/face_recognition")
//       ]);
      
//       console.log("Models loaded successfully");
//       setModelsLoaded(true);
//     } catch (error) {
//       console.error("Error loading models:", error);
//       alert("Error loading face recognition models. Check console for details.");
//     }
//   };

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       streamRef.current = stream; // Store stream reference
//       videoRef.current.srcObject = stream;
      
//       // Wait for video to load and set canvas dimensions
//       videoRef.current.addEventListener('loadedmetadata', () => {
//         if (canvasRef.current) {
//           canvasRef.current.width = videoRef.current.videoWidth;
//           canvasRef.current.height = videoRef.current.videoHeight;
//           setCameraReady(true);
//           console.log("Camera ready, starting face detection...");
//         }
//       });
//     } catch (error) {
//       console.error("Camera access error:", error);
//       alert("Camera access denied or not available");
//     }
//   };

//   const stopCamera = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => track.stop());
//       streamRef.current = null;
//     }
//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }
//     if (detectionIntervalRef.current) {
//       clearInterval(detectionIntervalRef.current);
//     }
//     setCameraReady(false);
//     console.log("Camera stopped");
//   };

//   const loadEmployees = async () => {
//     try {
//       setIsLoading(true);
//       console.log("Loading registered employees...");
      
//       const res = await axios.get("http://localhost:8080/api/attendance/employees");
//       console.log(`Found ${res.data.length} registered employees`);
      
//       if (res.data.length === 0) {
//         setIsLoading(false);
//         return;
//       }

//       const labeledDescriptors = res.data.map(emp => {
//         console.log(`Loading employee: ${emp.name}, descriptor length: ${emp.descriptor.length}`);
        
//         const descriptorArray = emp.descriptor.map(num => parseFloat(num));
//         const descriptor = new Float32Array(descriptorArray);
        
//         return new faceapi.LabeledFaceDescriptors(emp._id, [descriptor]);
//       });

//       console.log("Created labeled descriptors for", labeledDescriptors.length, "employees");
//       setFaceMatcher(new faceapi.FaceMatcher(labeledDescriptors, 0.6));
//       setEmployees(res.data);
      
//       console.log("Face matcher initialized successfully");
//       setIsLoading(false);
//     } catch (error) {
//       console.error("Error loading employees:", error);
//       alert("Error loading registered employees");
//       setIsLoading(false);
//     }
//   };

//   const drawDetections = (detections, canvas) => {
//     const ctx = canvas.getContext('2d');
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
    
//     if (detections && detections.length > 0) {
//       detections.forEach(detection => {
//         const { box, label, distance } = detection;
        
//         // Make the box even smaller - 40% reduction instead of 20%
//         const reduction = 0.4; // 40% reduction for a much smaller box
//         const newWidth = box.width * (1 - reduction);
//         const newHeight = box.height * (1 - reduction);
//         const newX = box.x + (box.width - newWidth) / 2;
//         const newY = box.y + (box.height - newHeight) / 2;
        
//         // Draw smaller bounding box
//         ctx.strokeStyle = label === 'unknown' ? '#ff0000' : '#00ff00';
//         ctx.lineWidth = 2;
//         ctx.strokeRect(newX, newY, newWidth, newHeight);
        
//         // Draw label background (use original position for better visibility)
//         const labelText = label === 'unknown' ? 'Unknown' : label;
//         const confidence = `${(100 - distance * 100).toFixed(1)}%`;
//         const fullLabel = label === 'unknown' ? `${labelText} (${confidence})` : `${labelText} (${confidence})`;
        
//         ctx.font = '14px Arial';
//         ctx.fillStyle = label === 'unknown' ? '#ff0000' : '#00ff00';
//         const textWidth = ctx.measureText(fullLabel).width + 10;
//         ctx.fillRect(newX, newY - 25, textWidth, 25);
        
//         // Draw label text
//         ctx.fillStyle = '#ffffff';
//         ctx.fillText(fullLabel, newX + 5, newY - 8);
//       });
//     }
//   };

//   const realTimeDetection = async () => {
//     if (!videoRef.current || !canvasRef.current || !modelsLoaded || !faceMatcher) {
//       return;
//     }

//     try {
//       const detections = await faceapi
//         .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
//         .withFaceLandmarks()
//         .withFaceDescriptors();

//       const displayDetections = detections.map(detection => {
//         const result = faceMatcher.findBestMatch(detection.descriptor);
//         const employee = result.label !== 'unknown' 
//           ? employees.find(emp => emp._id === result.label) 
//           : null;
        
//         return {
//           box: detection.detection.box,
//           label: employee ? employee.name : 'unknown',
//           distance: result.distance
//         };
//       });

//       drawDetections(displayDetections, canvasRef.current);
//     } catch (error) {
//       console.error("Real-time detection error:", error);
//     }
//   };

//   const startRealTimeDetection = () => {
//     if (detectionIntervalRef.current) {
//       clearInterval(detectionIntervalRef.current);
//     }
//     detectionIntervalRef.current = setInterval(realTimeDetection, 500); // Every 500ms
//     console.log("Real-time detection started automatically");
//   };

//   const recognize = async () => {
//     if (!modelsLoaded) {
//       alert("Models are still loading, please wait...");
//       return;
//     }

//     if (!faceMatcher) {
//       alert("No registered employees found. Please register employees first.");
//       return;
//     }

//     if (isLoading) {
//       alert("Still loading employee data, please wait...");
//       return;
//     }

//     try {
//       console.log("Detecting face for recognition...");
      
//       const detection = await faceapi
//         .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
//         .withFaceLandmarks()
//         .withFaceDescriptor();

//       if (!detection) {
//         alert("No face detected. Please make sure your face is clearly visible.");
//         return;
//       }

//       console.log("Face detected, matching with registered employees...");
      
//       const result = faceMatcher.findBestMatch(detection.descriptor);
//       console.log("Match result:", result.label, "Distance:", result.distance);

//       if (result.label !== "unknown") {
//         const employeeId = result.label;
//         const employee = employees.find((e) => e._id === employeeId);
        
//         if (employee) {
//           try {
//             const response = await axios.post("http://localhost:8080/api/attendance/attendance", { employeeId });
//             alert(`✅ Attendance marked successfully for ${employee.name}\nConfidence: ${(100 - result.distance * 100).toFixed(1)}%`);
            
//             // Stop camera after successful attendance marking
//             setAttendanceMarked(true);
//             stopCamera();
            
//           } catch (attendanceError) {
//             if (attendanceError.response && attendanceError.response.status === 400) {
//               const errorData = attendanceError.response.data;
//               if (errorData.error === "Attendance already marked for today") {
//                 alert(`👋 Hello ${employee.name}!\n\n⚠️ Your attendance has already been marked for today.\n\nRecognition Confidence: ${(100 - result.distance * 100).toFixed(1)}%`);
                
//                 // Stop camera for already marked attendance as well
//                 setAttendanceMarked(true);
//                 stopCamera();
                
//               } else {
//                 alert(`⚠️ ${employee.name} recognized but attendance not marked:\n${errorData.error}`);
//               }
//             } else {
//               console.error("Attendance API error:", attendanceError);
//               alert(`❌ ${employee.name} recognized but failed to mark attendance.\nPlease try again or contact admin.`);
//             }
//           }
//         } else {
//           alert("Employee data not found");
//         }
//       } else {
//         alert(`❌ Face not recognized. Please register first.\nClosest match confidence: ${(100 - result.distance * 100).toFixed(1)}%`);
//       }
//     } catch (error) {
//       console.error("Recognition error:", error);
//       alert(`Error during face recognition: ${error.message}\nPlease try again.`);
//     }
//   };

//   return (
//     <div style={{ padding: '20px', textAlign: 'center' }}>
//       <h2>Face Recognition - Mark Attendance</h2>
      
//       <div style={{ margin: '20px 0', position: 'relative', display: 'inline-block' }}>
//         {!attendanceMarked ? (
//           <>
//             <video 
//               ref={videoRef} 
//               autoPlay 
//               muted 
//               width="400" 
//               height="300" 
//               style={{ border: '2px solid #ccc', borderRadius: '8px' }}
//             />
//             <canvas
//               ref={canvasRef}
//               width="400"
//               height="300"
//               style={{
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 pointerEvents: 'none',
//                 borderRadius: '8px'
//               }}
//             />
//           </>
//         ) : (
//           <div 
//             style={{
//               width: '400px',
//               height: '300px',
//               border: '2px solid #ffddfaff',
//               borderRadius: '8px',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               backgroundColor: '#d4edda',
//               color: '#155724',
//               fontSize: '16px',
//               fontWeight: 'bold',
//               textAlign: 'center',
//               padding: '20px',
//               boxSizing: 'border-box'
//             }}
//           >
//             ✅ Attendance Process Complete!<br/>
//             {/* <span style={{ fontSize: '14px', fontWeight: 'normal', marginTop: '10px', display: 'block' }}>
//               Camera Stopped for Privacy
//             </span> */}
//           </div>
//         )}
//       </div>
      
//       <div style={{ margin: '20px 0' }}>
//         {!attendanceMarked ? (
//           <button 
//             onClick={recognize}
//             disabled={!modelsLoaded || !faceMatcher || isLoading || !cameraReady}
//             style={{ 
//               padding: '15px 30px', 
//               fontSize: '18px',
//               backgroundColor: (modelsLoaded && faceMatcher && !isLoading && cameraReady) ? '#28a745' : '#ccc',
//               color: 'white',
//               border: 'none',
//               borderRadius: '6px',
//               cursor: (modelsLoaded && faceMatcher && !isLoading && cameraReady) ? 'pointer' : 'not-allowed'
//             }}
//           >
//             {!modelsLoaded ? 'Loading Models...' : 
//              isLoading ? 'Loading Employees...' : 
//              !cameraReady ? 'Starting Camera...' :
//              !faceMatcher ? 'No Employees Registered' : 
//              'Mark Attendance'}
//           </button>
//         ) : (
//           <button 
//             onClick={() => window.location.reload()}
//             style={{ 
//               padding: '15px 30px', 
//               fontSize: '18px',
//               backgroundColor: '#007bff',
//               color: 'white',
//               border: 'none',
//               borderRadius: '6px',
//               cursor: 'pointer'
//             }}
//           >
//             Start New Session
//           </button>
//         )}
//       </div>
      
//       <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
//         {attendanceMarked ? (
//           <p style={{ color: '#28a745', fontSize: '16px', fontWeight: 'bold' }}>
//             🎉 Attendance process completed! Camera has been turned off for privacy.
//           </p>
//         ) : (
//           <>
//             {!modelsLoaded && <p>Loading face recognition models...</p>}
//             {modelsLoaded && isLoading && <p>Loading registered employees...</p>}
//             {modelsLoaded && !cameraReady && <p>Starting camera...</p>}
//             {modelsLoaded && !isLoading && employees.length === 0 && (
//               <p style={{ color: 'orange' }}>No employees registered. Please register employees first.</p>
//             )}
//             {modelsLoaded && !isLoading && employees.length > 0 && cameraReady && (
//               <p style={{ color: 'green' }}>
//                 ✓ Ready for recognition ({employees.length} employees registered)
//               </p>
//             )}
//             {cameraReady && modelsLoaded && faceMatcher && (
//               <p style={{ color: '#17a2b8' }}>
//                 🔴 Auto-detection active - Names appear above faces automatically
//               </p>
//             )}
//           </>
//         )}
//       </div>
      
//       <div style={{ marginTop: '20px' }}>
//         {!attendanceMarked && (
//           <button 
//             onClick={loadEmployees}
//             style={{ 
//               padding: '8px 16px', 
//               fontSize: '14px',
//               backgroundColor: '#007bff',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer'
//             }}
//           >
//             Refresh Employee List
//           </button>
//         )}
//       </div>

//       <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
//         <h4 style={{ marginTop: 0, color: '#495057' }}>Instructions:</h4>
//         <ul style={{ textAlign: 'left', color: '#6c757d', fontSize: '14px' }}>
//           <li>Face detection starts automatically when camera loads</li>
//           <li>Position your face clearly in front of the camera with good lighting</li>
//           <li>Green box = Recognized employee, Red box = Unknown person</li>
//           <li>Click "Mark Attendance" to officially record attendance</li>
//           <li>Each person can only mark attendance once per day</li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default AttendanceTaking;




// import React, { useEffect, useRef, useState } from "react";
// import * as faceapi from "face-api.js";
// import axios from "axios";

// const AttendanceTaking = () => {
//   const videoRef = useRef();
//   const canvasRef = useRef();
//   const [employees, setEmployees] = useState([]);
//   const [faceMatcher, setFaceMatcher] = useState(null);
//   const [modelsLoaded, setModelsLoaded] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [cameraReady, setCameraReady] = useState(false);
//   const [attendanceMarked, setAttendanceMarked] = useState(false);
//   const detectionIntervalRef = useRef();
//   const streamRef = useRef();

//   useEffect(() => {
//     loadModels().then(() => {
//       startCamera();
//       loadEmployees();
//     });
    
//     return () => {
//       // Cleanup
//       if (detectionIntervalRef.current) {
//         clearInterval(detectionIntervalRef.current);
//       }
//     };
//   }, []);

//   // Start real-time detection automatically when camera and models are ready, but not if attendance is marked
//   useEffect(() => {
//     if (cameraReady && modelsLoaded && faceMatcher && !attendanceMarked) {
//       startRealTimeDetection();
//     }
    
//     return () => {
//       if (detectionIntervalRef.current) {
//         clearInterval(detectionIntervalRef.current);
//       }
//     };
//   }, [cameraReady, modelsLoaded, faceMatcher, attendanceMarked]);

//   const loadModels = async () => {
//     try {
//       console.log("Loading face recognition models...");
      
//       await Promise.all([
//         faceapi.nets.tinyFaceDetector.loadFromUri("/models/tiny_face_detector"),
//         faceapi.nets.faceLandmark68Net.loadFromUri("/models/face_landmark_68"),
//         faceapi.nets.faceRecognitionNet.loadFromUri("/models/face_recognition")
//       ]);
      
//       console.log("Models loaded successfully");
//       setModelsLoaded(true);
//     } catch (error) {
//       console.error("Error loading models:", error);
//       alert("Error loading face recognition models. Check console for details.");
//     }
//   };

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       streamRef.current = stream; // Store stream reference
//       videoRef.current.srcObject = stream;
      
//       // Wait for video to load and set canvas dimensions
//       videoRef.current.addEventListener('loadedmetadata', () => {
//         if (canvasRef.current) {
//           canvasRef.current.width = videoRef.current.videoWidth;
//           canvasRef.current.height = videoRef.current.videoHeight;
//           setCameraReady(true);
//           console.log("Camera ready, starting face detection...");
//         }
//       });
//     } catch (error) {
//       console.error("Camera access error:", error);
//       alert("Camera access denied or not available");
//     }
//   };

//   const stopCamera = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => track.stop());
//       streamRef.current = null;
//     }
//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }
//     if (detectionIntervalRef.current) {
//       clearInterval(detectionIntervalRef.current);
//     }
//     setCameraReady(false);
//     console.log("Camera stopped");
//   };

//   const loadEmployees = async () => {
//     try {
//       setIsLoading(true);
//       console.log("Loading registered employees...");
      
//       const res = await axios.get("http://localhost:8080/api/attendance/employees");
//       console.log(`Found ${res.data.length} registered employees`);
      
//       if (res.data.length === 0) {
//         setIsLoading(false);
//         return;
//       }

//       const labeledDescriptors = res.data.map(emp => {
//         console.log(`Loading employee: ${emp.name}, descriptor length: ${emp.descriptor.length}`);
        
//         const descriptorArray = emp.descriptor.map(num => parseFloat(num));
//         const descriptor = new Float32Array(descriptorArray);
        
//         return new faceapi.LabeledFaceDescriptors(emp._id, [descriptor]);
//       });

//       console.log("Created labeled descriptors for", labeledDescriptors.length, "employees");
//       setFaceMatcher(new faceapi.FaceMatcher(labeledDescriptors, 0.6));
//       setEmployees(res.data);
      
//       console.log("Face matcher initialized successfully");
//       setIsLoading(false);
//     } catch (error) {
//       console.error("Error loading employees:", error);
//       alert("Error loading registered employees");
//       setIsLoading(false);
//     }
//   };

//   const drawDetections = (detections, canvas) => {
//     const ctx = canvas.getContext('2d');
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
    
//     if (detections && detections.length > 0) {
//       detections.forEach(detection => {
//         const { box, label, distance } = detection;
        
//         // Make the box even smaller - 40% reduction instead of 20%
//         const reduction = 0.4; // 40% reduction for a much smaller box
//         const newWidth = box.width * (1 - reduction);
//         const newHeight = box.height * (1 - reduction);
//         const newX = box.x + (box.width - newWidth) / 2;
//         const newY = box.y + (box.height - newHeight) / 2;
        
//         // Draw smaller bounding box
//         ctx.strokeStyle = label === 'unknown' ? '#ff0000' : '#00ff00';
//         ctx.lineWidth = 2;
//         ctx.strokeRect(newX, newY, newWidth, newHeight);
        
//         // Draw label background (use original position for better visibility)
//         const labelText = label === 'unknown' ? 'Unknown' : label;
//         const confidence = `${(100 - distance * 100).toFixed(1)}%`;
//         const fullLabel = label === 'unknown' ? `${labelText} (${confidence})` : `${labelText} (${confidence})`;
        
//         ctx.font = '14px Arial';
//         ctx.fillStyle = label === 'unknown' ? '#ff0000' : '#00ff00';
//         const textWidth = ctx.measureText(fullLabel).width + 10;
//         ctx.fillRect(newX, newY - 25, textWidth, 25);
        
//         // Draw label text
//         ctx.fillStyle = '#ffffff';
//         ctx.fillText(fullLabel, newX + 5, newY - 8);
//       });
//     }
//   };

//   const realTimeDetection = async () => {
//     if (!videoRef.current || !canvasRef.current || !modelsLoaded || !faceMatcher) {
//       return;
//     }

//     try {
//       const detections = await faceapi
//         .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
//         .withFaceLandmarks()
//         .withFaceDescriptors();

//       const displayDetections = detections.map(detection => {
//         const result = faceMatcher.findBestMatch(detection.descriptor);
//         const employee = result.label !== 'unknown' 
//           ? employees.find(emp => emp._id === result.label) 
//           : null;
        
//         return {
//           box: detection.detection.box,
//           label: employee ? employee.name : 'unknown',
//           distance: result.distance
//         };
//       });

//       drawDetections(displayDetections, canvasRef.current);
//     } catch (error) {
//       console.error("Real-time detection error:", error);
//     }
//   };

//   const startRealTimeDetection = () => {
//     if (detectionIntervalRef.current) {
//       clearInterval(detectionIntervalRef.current);
//     }
//     detectionIntervalRef.current = setInterval(realTimeDetection, 500); // Every 500ms
//     console.log("Real-time detection started automatically");
//   };

//   const recognize = async () => {
//     if (!modelsLoaded) {
//       alert("Models are still loading, please wait...");
//       return;
//     }

//     if (!faceMatcher) {
//       alert("No registered employees found. Please register employees first.");
//       return;
//     }

//     if (isLoading) {
//       alert("Still loading employee data, please wait...");
//       return;
//     }

//     try {
//       console.log("Detecting face for recognition...");
      
//       const detection = await faceapi
//         .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
//         .withFaceLandmarks()
//         .withFaceDescriptor();

//       if (!detection) {
//         alert("No face detected. Please make sure your face is clearly visible.");
//         return;
//       }

//       console.log("Face detected, matching with registered employees...");
      
//       const result = faceMatcher.findBestMatch(detection.descriptor);
//       console.log("Match result:", result.label, "Distance:", result.distance);

//       if (result.label !== "unknown") {
//         const employeeId = result.label;
//         const employee = employees.find((e) => e._id === employeeId);
        
//         if (employee) {
//           try {
//             const response = await axios.post("http://localhost:8080/api/attendance/attendance", { employeeId });
//             alert(`✅ Attendance marked successfully for ${employee.name}\nConfidence: ${(100 - result.distance * 100).toFixed(1)}%`);
            
//             // Stop camera after successful attendance marking
//             setAttendanceMarked(true);
//             stopCamera();
            
//           } catch (attendanceError) {
//             if (attendanceError.response && attendanceError.response.status === 400) {
//               const errorData = attendanceError.response.data;
//               if (errorData.error === "Attendance already marked for today") {
//                 alert(`👋 Hello ${employee.name}!\n\n⚠️ Your attendance has already been marked for today.\n\nRecognition Confidence: ${(100 - result.distance * 100).toFixed(1)}%`);
                
//                 // Stop camera for already marked attendance as well
//                 setAttendanceMarked(true);
//                 stopCamera();
                
//               } else {
//                 alert(`⚠️ ${employee.name} recognized but attendance not marked:\n${errorData.error}`);
//               }
//             } else {
//               console.error("Attendance API error:", attendanceError);
//               alert(`❌ ${employee.name} recognized but failed to mark attendance.\nPlease try again or contact admin.`);
//             }
//           }
//         } else {
//           alert("Employee data not found");
//         }
//       } else {
//         alert(`❌ Face not recognized. Please register first.\nClosest match confidence: ${(100 - result.distance * 100).toFixed(1)}%`);
//       }
//     } catch (error) {
//       console.error("Recognition error:", error);
//       alert(`Error during face recognition: ${error.message}\nPlease try again.`);
//     }
//   };

//   return (
//     <div style={{ padding: '20px', textAlign: 'center' }}>
//       <h2>Face Recognition - Mark Attendance</h2>
      
//       <div style={{ margin: '20px 0', position: 'relative', display: 'inline-block' }}>
//         {!attendanceMarked ? (
//           <>
//             <video 
//               ref={videoRef} 
//               autoPlay 
//               muted 
//               width="400" 
//               height="300" 
//               style={{ border: '2px solid #ccc', borderRadius: '8px' }}
//             />
//             <canvas
//               ref={canvasRef}
//               width="400"
//               height="300"
//               style={{
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 pointerEvents: 'none',
//                 borderRadius: '8px'
//               }}
//             />
//           </>
//         ) : (
//           <div 
//             style={{
//               width: '400px',
//               height: '300px',
//               border: '2px solid #ffddfaff',
//               borderRadius: '8px',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               backgroundColor: '#d4edda',
//               color: '#155724',
//               fontSize: '16px',
//               fontWeight: 'bold',
//               textAlign: 'center',
//               padding: '20px',
//               boxSizing: 'border-box'
//             }}
//           >
//             ✅ Attendance Process Complete!<br/>
//             {/* <span style={{ fontSize: '14px', fontWeight: 'normal', marginTop: '10px', display: 'block' }}>
//               Camera Stopped for Privacy
//             </span> */}
//           </div>
//         )}
//       </div>
      
//       <div style={{ margin: '20px 0' }}>
//         {!attendanceMarked ? (
//           <button 
//             onClick={recognize}
//             disabled={!modelsLoaded || !faceMatcher || isLoading || !cameraReady}
//             style={{ 
//               padding: '15px 30px', 
//               fontSize: '18px',
//               backgroundColor: (modelsLoaded && faceMatcher && !isLoading && cameraReady) ? '#28a745' : '#ccc',
//               color: 'white',
//               border: 'none',
//               borderRadius: '6px',
//               cursor: (modelsLoaded && faceMatcher && !isLoading && cameraReady) ? 'pointer' : 'not-allowed'
//             }}
//           >
//             {!modelsLoaded ? 'Loading Models...' : 
//              isLoading ? 'Loading Employees...' : 
//              !cameraReady ? 'Starting Camera...' :
//              !faceMatcher ? 'No Employees Registered' : 
//              'Mark Attendance'}
//           </button>
//         ) : (
//           <button 
//             onClick={() => window.location.reload()}
//             style={{ 
//               padding: '15px 30px', 
//               fontSize: '18px',
//               backgroundColor: '#007bff',
//               color: 'white',
//               border: 'none',
//               borderRadius: '6px',
//               cursor: 'pointer'
//             }}
//           >
//             Start New Session
//           </button>
//         )}
//       </div>
      
//       <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
//         {attendanceMarked ? (
//           <p style={{ color: '#28a745', fontSize: '16px', fontWeight: 'bold' }}>
//             🎉 Attendance process completed! Camera has been turned off for privacy.
//           </p>
//         ) : (
//           <>
//             {!modelsLoaded && <p>Loading face recognition models...</p>}
//             {modelsLoaded && isLoading && <p>Loading registered employees...</p>}
//             {modelsLoaded && !cameraReady && <p>Starting camera...</p>}
//             {modelsLoaded && !isLoading && employees.length === 0 && (
//               <p style={{ color: 'orange' }}>No employees registered. Please register employees first.</p>
//             )}
//             {modelsLoaded && !isLoading && employees.length > 0 && cameraReady && (
//               <p style={{ color: 'green' }}>
//                 ✓ Ready for recognition ({employees.length} employees registered)
//               </p>
//             )}
//             {cameraReady && modelsLoaded && faceMatcher && (
//               <p style={{ color: '#17a2b8' }}>
//                 🔴 Auto-detection active - Names appear above faces automatically
//               </p>
//             )}
//           </>
//         )}
//       </div>
      
//       <div style={{ marginTop: '20px' }}>
//         {!attendanceMarked && (
//           <button 
//             onClick={loadEmployees}
//             style={{ 
//               padding: '8px 16px', 
//               fontSize: '14px',
//               backgroundColor: '#007bff',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer'
//             }}
//           >
//             Refresh Employee List
//           </button>
//         )}
//       </div>

//       <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
//         <h4 style={{ marginTop: 0, color: '#495057' }}>Instructions:</h4>
//         <ul style={{ textAlign: 'left', color: '#6c757d', fontSize: '14px' }}>
//           <li>Face detection starts automatically when camera loads</li>
//           <li>Position your face clearly in front of the camera with good lighting</li>
//           <li>Green box = Recognized employee, Red box = Unknown person</li>
//           <li>Click "Mark Attendance" to officially record attendance</li>
//           <li>Each person can only mark attendance once per day</li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default AttendanceTaking;


// import React, { useEffect, useRef, useState } from "react";
// import * as faceapi from "face-api.js";
// import axios from "axios";

// const AttendanceTaking = () => {
//   const videoRef = useRef();
//   const canvasRef = useRef();
//   const [employees, setEmployees] = useState([]);
//   const [faceMatcher, setFaceMatcher] = useState(null);
//   const [modelsLoaded, setModelsLoaded] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [cameraReady, setCameraReady] = useState(false);
//   const [attendanceStatus, setAttendanceStatus] = useState(null); // null, 'processing', 'completed'
//   const [lastAttendance, setLastAttendance] = useState(null);
//   const [autoCapturing, setAutoCapturing] = useState(false);
//   const detectionIntervalRef = useRef();
//   const streamRef = useRef();
//   const recognitionCooldownRef = useRef(false);

//   useEffect(() => {
//     loadModels().then(() => {
//       startCamera();
//       loadEmployees();
//     });
    
//     return () => {
//       // Cleanup
//       if (detectionIntervalRef.current) {
//         clearInterval(detectionIntervalRef.current);
//       }
//     };
//   }, []);

//   // Start real-time detection automatically when camera and models are ready
//   useEffect(() => {
//     if (cameraReady && modelsLoaded && faceMatcher && attendanceStatus !== 'completed') {
//       startRealTimeDetection();
//     }
    
//     return () => {
//       if (detectionIntervalRef.current) {
//         clearInterval(detectionIntervalRef.current);
//       }
//     };
//   }, [cameraReady, modelsLoaded, faceMatcher, attendanceStatus]);

//   const loadModels = async () => {
//     try {
//       console.log("Loading face recognition models...");
      
//       await Promise.all([
//         faceapi.nets.tinyFaceDetector.loadFromUri("/models/tiny_face_detector"),
//         faceapi.nets.faceLandmark68Net.loadFromUri("/models/face_landmark_68"),
//         faceapi.nets.faceRecognitionNet.loadFromUri("/models/face_recognition")
//       ]);
      
//       console.log("Models loaded successfully");
//       setModelsLoaded(true);
//     } catch (error) {
//       console.error("Error loading models:", error);
//       alert("Error loading face recognition models. Check console for details.");
//     }
//   };

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       streamRef.current = stream;
//       videoRef.current.srcObject = stream;
      
//       videoRef.current.addEventListener('loadedmetadata', () => {
//         if (canvasRef.current) {
//           canvasRef.current.width = videoRef.current.videoWidth;
//           canvasRef.current.height = videoRef.current.videoHeight;
//           setCameraReady(true);
//           console.log("Camera ready, starting automatic face recognition...");
//         }
//       });
//     } catch (error) {
//       console.error("Camera access error:", error);
//       alert("Camera access denied or not available");
//     }
//   };

//   const stopCamera = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => track.stop());
//       streamRef.current = null;
//     }
//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }
//     if (detectionIntervalRef.current) {
//       clearInterval(detectionIntervalRef.current);
//     }
//     setCameraReady(false);
//     console.log("Camera stopped");
//   };

//   const loadEmployees = async () => {
//     try {
//       setIsLoading(true);
//       console.log("Loading registered employees...");
      
//       const res = await axios.get("http://localhost:8080/api/attendance/employees");
//       console.log(`Found ${res.data.length} registered employees`);
      
//       if (res.data.length === 0) {
//         setIsLoading(false);
//         return;
//       }

//       const labeledDescriptors = res.data.map(emp => {
//         console.log(`Loading employee: ${emp.name}, descriptor length: ${emp.descriptor.length}`);
        
//         const descriptorArray = emp.descriptor.map(num => parseFloat(num));
//         const descriptor = new Float32Array(descriptorArray);
        
//         return new faceapi.LabeledFaceDescriptors(emp._id, [descriptor]);
//       });

//       console.log("Created labeled descriptors for", labeledDescriptors.length, "employees");
//       setFaceMatcher(new faceapi.FaceMatcher(labeledDescriptors, 0.6));
//       setEmployees(res.data);
      
//       console.log("Face matcher initialized successfully");
//       setIsLoading(false);
//     } catch (error) {
//       console.error("Error loading employees:", error);
//       alert("Error loading registered employees");
//       setIsLoading(false);
//     }
//   };

//   const autoMarkAttendance = async (employeeId, employeeName, confidence) => {
//     if (recognitionCooldownRef.current) {
//       return; // Prevent multiple rapid captures
//     }

//     try {
//       setAutoCapturing(true);
//       recognitionCooldownRef.current = true;

//       console.log(`Auto-capturing attendance for ${employeeName}...`);
      
//       const response = await axios.post("http://localhost:8080/api/attendance/attendance/auto", { employeeId });
      
//       setLastAttendance({
//         ...response.data.attendance,
//         confidence: confidence,
//         type: response.data.type,
//         workingSummary: response.data.workingSummary
//       });

//       if (response.data.type === 'IN') {
//         alert(`🟢 Welcome ${employeeName}!\nIN time recorded: ${new Date(response.data.attendance.inTime).toLocaleTimeString()}\nConfidence: ${confidence}%`);
//         setAttendanceStatus('in');
//       } else if (response.data.type === 'OUT') {
//         alert(`🔴 Goodbye ${employeeName}!\nOUT time recorded: ${new Date(response.data.attendance.outTime).toLocaleTimeString()}\n${response.data.workingSummary}\nConfidence: ${confidence}%`);
//         setAttendanceStatus('completed');
//         // Stop camera after OUT time is marked
//         setTimeout(() => stopCamera(), 2000);
//       } else if (response.data.type === 'COMPLETED') {
//         alert(`👋 Hello ${employeeName}!\nYour attendance is already complete for today.\n${response.data.workingSummary}`);
//         setAttendanceStatus('completed');
//         setTimeout(() => stopCamera(), 2000);
//       }

//       // Set cooldown for 10 seconds to prevent multiple captures
//       setTimeout(() => {
//         recognitionCooldownRef.current = false;
//         setAutoCapturing(false);
//       }, 10000);

//     } catch (error) {
//       console.error("Auto attendance error:", error);
      
//       if (error.response && error.response.data) {
//         alert(`❌ Error: ${error.response.data.error}`);
//       } else {
//         alert(`❌ Failed to mark attendance for ${employeeName}. Please try again.`);
//       }
      
//       setTimeout(() => {
//         recognitionCooldownRef.current = false;
//         setAutoCapturing = false;
//       }, 8080);
//     }
//   };

//   const drawDetections = (detections, canvas) => {
//     const ctx = canvas.getContext('2d');
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
    
//     if (detections && detections.length > 0) {
//       detections.forEach(detection => {
//         const { box, label, distance, employeeId } = detection;
        
//         // Auto-capture attendance if employee is recognized and not in cooldown
//         if (label !== 'unknown' && !recognitionCooldownRef.current && !autoCapturing && attendanceStatus !== 'completed') {
//           const confidence = (100 - distance * 100).toFixed(1);
//           if (confidence > 60) { // Only auto-capture if confidence is high
//             autoMarkAttendance(employeeId, label, confidence);
//           }
//         }
        
//         // Draw bounding box (smaller size)
//         const reduction = 0.4;
//         const newWidth = box.width * (1 - reduction);
//         const newHeight = box.height * (1 - reduction);
//         const newX = box.x + (box.width - newWidth) / 2;
//         const newY = box.y + (box.height - newHeight) / 2;
        
//         ctx.strokeStyle = label === 'unknown' ? '#ff0000' : '#00ff00';
//         ctx.lineWidth = 2;
//         ctx.strokeRect(newX, newY, newWidth, newHeight);
        
//         // Draw label
//         const labelText = label === 'unknown' ? 'Unknown' : label;
//         const confidence = `${(100 - distance * 100).toFixed(1)}%`;
//         const status = autoCapturing ? ' (Capturing...)' : '';
//         const fullLabel = `${labelText} (${confidence})${status}`;
        
//         ctx.font = '14px Arial';
//         ctx.fillStyle = label === 'unknown' ? '#ff0000' : autoCapturing ? '#ff8c00' : '#00ff00';
//         const textWidth = ctx.measureText(fullLabel).width + 10;
//         ctx.fillRect(newX, newY - 25, textWidth, 25);
        
//         ctx.fillStyle = '#ffffff';
//         ctx.fillText(fullLabel, newX + 5, newY - 8);
//       });
//     }
//   };

//   const realTimeDetection = async () => {
//     if (!videoRef.current || !canvasRef.current || !modelsLoaded || !faceMatcher) {
//       return;
//     }

//     try {
//       const detections = await faceapi
//         .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
//         .withFaceLandmarks()
//         .withFaceDescriptors();

//       const displayDetections = detections.map(detection => {
//         const result = faceMatcher.findBestMatch(detection.descriptor);
//         const employee = result.label !== 'unknown' 
//           ? employees.find(emp => emp._id === result.label) 
//           : null;
        
//         return {
//           box: detection.detection.box,
//           label: employee ? employee.name : 'unknown',
//           employeeId: result.label !== 'unknown' ? result.label : null,
//           distance: result.distance
//         };
//       });

//       drawDetections(displayDetections, canvasRef.current);
//     } catch (error) {
//       console.error("Real-time detection error:", error);
//     }
//   };

//   const startRealTimeDetection = () => {
//     if (detectionIntervalRef.current) {
//       clearInterval(detectionIntervalRef.current);
//     }
//     detectionIntervalRef.current = setInterval(realTimeDetection, 1000); // Every 1 second for auto-capture
//     console.log("Real-time detection with auto-capture started");
//   };

//   const getStatusMessage = () => {
//     if (attendanceStatus === 'completed') {
//       return "✅ Attendance Complete for Today";
//     }
//     if (attendanceStatus === 'in') {
//       return "🟢 Checked IN - Show your face again to mark OUT time";
//     }
//     if (autoCapturing) {
//       return "📸 Capturing attendance...";
//     }
//     return "🔍 Ready for automatic attendance capture";
//   };

//   const getStatusColor = () => {
//     if (attendanceStatus === 'completed') return '#28a745';
//     if (attendanceStatus === 'in') return '#007bff';
//     if (autoCapturing) return '#ff8c00';
//     return '#17a2b8';
//   };

//   return (
//     <div style={{ padding: '20px', textAlign: 'center' }}>
//       <h2>🤖 Smart Attendance System</h2>
      
//       <div style={{ margin: '20px 0', position: 'relative', display: 'inline-block' }}>
//         {attendanceStatus !== 'completed' ? (
//           <>
//             <video 
//               ref={videoRef} 
//               autoPlay 
//               muted 
//               width="400" 
//               height="300" 
//               style={{ border: '2px solid #ccc', borderRadius: '8px' }}
//             />
//             <canvas
//               ref={canvasRef}
//               width="400"
//               height="300"
//               style={{
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 pointerEvents: 'none',
//                 borderRadius: '8px'
//               }}
//             />
//             {autoCapturing && (
//               <div style={{
//                 position: 'absolute',
//                 top: '10px',
//                 left: '10px',
//                 background: 'rgba(255, 140, 0, 0.9)',
//                 color: 'white',
//                 padding: '5px 10px',
//                 borderRadius: '15px',
//                 fontSize: '12px',
//                 fontWeight: 'bold'
//               }}>
//                 📸 Capturing...
//               </div>
//             )}
//           </>
//         ) : (
//           <div 
//             style={{
//               width: '400px',
//               height: '300px',
//               border: '2px solid #28a745',
//               borderRadius: '8px',
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               justifyContent: 'center',
//               backgroundColor: '#d4edda',
//               color: '#155724',
//               fontSize: '16px',
//               fontWeight: 'bold',
//               textAlign: 'center',
//               padding: '20px',
//               boxSizing: 'border-box'
//             }}
//           >
//             <div>✅ Attendance Complete!</div>
//             {lastAttendance && lastAttendance.workingSummary && (
//               <div style={{ 
//                 fontSize: '14px', 
//                 fontWeight: 'normal', 
//                 marginTop: '10px',
//                 lineHeight: '1.4'
//               }}>
//                 👤 {lastAttendance.employeeName}<br/>
//                 ⏰ {lastAttendance.workingSummary}
//               </div>
//             )}
//           </div>
//         )}
//       </div>
      
//       {/* Status Display */}
//       <div style={{ 
//         margin: '20px 0', 
//         padding: '10px', 
//         backgroundColor: getStatusColor(), 
//         color: 'white',
//         borderRadius: '6px',
//         fontSize: '16px',
//         fontWeight: 'bold'
//       }}>
//         {getStatusMessage()}
//       </div>

//       {/* Attendance Details */}
//       {lastAttendance && (
//         <div style={{
//           margin: '20px 0',
//           padding: '15px',
//           backgroundColor: '#f8f9fa',
//           borderRadius: '6px',
//           border: '1px solid #dee2e6'
//         }}>
//           <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>Last Attendance Record</h4>
//           <div style={{ textAlign: 'left', fontSize: '14px', color: '#6c757d' }}>
//             <strong>Employee:</strong> {lastAttendance.employeeName}<br/>
//             <strong>Type:</strong> {lastAttendance.type === 'IN' ? '🟢 Check IN' : lastAttendance.type === 'OUT' ? '🔴 Check OUT' : '✅ Already Complete'}<br/>
//             {lastAttendance.inTime && (
//               <><strong>IN Time:</strong> {new Date(lastAttendance.inTime).toLocaleString()}<br/></>
//             )}
//             {lastAttendance.outTime && (
//               <><strong>OUT Time:</strong> {new Date(lastAttendance.outTime).toLocaleString()}<br/></>
//             )}
//             {lastAttendance.workingSummary && (
//               <><strong>Working Hours:</strong> {lastAttendance.workingSummary}<br/></>
//             )}
//             <strong>Confidence:</strong> {lastAttendance.confidence}%
//           </div>
//         </div>
//       )}
      
//       {/* Control Buttons */}
//       <div style={{ margin: '20px 0' }}>
//         {attendanceStatus === 'completed' ? (
//           <button 
//             onClick={() => window.location.reload()}
//             style={{ 
//               padding: '15px 30px', 
//               fontSize: '18px',
//               backgroundColor: '#007bff',
//               color: 'white',
//               border: 'none',
//               borderRadius: '6px',
//               cursor: 'pointer',
//               marginRight: '10px'
//             }}
//           >
//             🔄 Start New Session
//           </button>
//         ) : (
//           <>
//             <button 
//               onClick={loadEmployees}
//               disabled={isLoading}
//               style={{ 
//                 padding: '10px 20px', 
//                 fontSize: '14px',
//                 backgroundColor: '#007bff',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '4px',
//                 cursor: isLoading ? 'not-allowed' : 'pointer',
//                 marginRight: '10px'
//               }}
//             >
//               {isLoading ? 'Loading...' : '🔄 Refresh Employee List'}
//             </button>
            
//             <button 
//               onClick={stopCamera}
//               style={{ 
//                 padding: '10px 20px', 
//                 fontSize: '14px',
//                 backgroundColor: '#dc3545',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '4px',
//                 cursor: 'pointer'
//               }}
//             >
//               🔴 Stop Camera
//             </button>
//           </>
//         )}
//       </div>
      
//       {/* System Status */}
//       <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
//         {attendanceStatus === 'completed' ? (
//           <p style={{ color: '#28a745', fontSize: '16px', fontWeight: 'bold' }}>
//             🎉 Daily attendance completed! Camera stopped for privacy.
//           </p>
//         ) : (
//           <>
//             {!modelsLoaded && <p>🔄 Loading face recognition models...</p>}
//             {modelsLoaded && isLoading && <p>🔄 Loading registered employees...</p>}
//             {modelsLoaded && !cameraReady && <p>📹 Starting camera...</p>}
//             {modelsLoaded && !isLoading && employees.length === 0 && (
//               <p style={{ color: 'orange' }}>⚠️ No employees registered. Please register employees first.</p>
//             )}
//             {modelsLoaded && !isLoading && employees.length > 0 && cameraReady && (
//               <p style={{ color: 'green' }}>
//                 ✅ Auto-capture ready ({employees.length} employees registered)
//               </p>
//             )}
//             {cameraReady && modelsLoaded && faceMatcher && (
//               <p style={{ color: '#17a2b8' }}>
//                 🤖 Auto-attendance active - Just show your face to the camera!
//               </p>
//             )}
//           </>
//         )}
//       </div>

//       {/* Instructions */}
//       <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
//         <h4 style={{ marginTop: 0, color: '#495057' }}>📋 How It Works:</h4>
//         <ul style={{ textAlign: 'left', color: '#6c757d', fontSize: '14px' }}>
//           <li><strong>First time today:</strong> Show your face → Automatic IN time capture</li>
//           <li><strong>Second time today:</strong> Show your face → Automatic OUT time capture + working hours calculation</li>
//           <li><strong>Green box:</strong> Recognized employee ready for auto-capture</li>
//           <li><strong>Orange box:</strong> Currently capturing attendance</li>
//           <li><strong>Red box:</strong> Unknown person</li>
//           <li>System prevents duplicate captures with 10-second cooldown</li>
//           <li>Good lighting and clear face positioning improve accuracy</li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default AttendanceTaking;
// import React, { useEffect, useRef, useState } from "react";
// import * as faceapi from "face-api.js";
// import axios from "axios";

// const AttendanceTaking = () => {
//   const videoRef = useRef();
//   const canvasRef = useRef();
//   const [employees, setEmployees] = useState([]);
//   const [faceMatcher, setFaceMatcher] = useState(null);
//   const [modelsLoaded, setModelsLoaded] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [cameraReady, setCameraReady] = useState(false);
//   const [attendanceStatus, setAttendanceStatus] = useState(null); // null, 'processing', 'completed'
//   const [lastAttendance, setLastAttendance] = useState(null);
//   const [autoCapturing, setAutoCapturing] = useState(false);
//   const [isCameraStopped, setIsCameraStopped] = useState(false);
//   const detectionIntervalRef = useRef();
//   const streamRef = useRef();
//   const recognitionCooldownRef = useRef(false);

//   useEffect(() => {
//     loadModels().then(() => {
//       startCamera();
//       loadEmployees();
//     });
    
//     return () => {
//       // Cleanup
//       cleanup();
//     };
//   }, []);

//   // Start real-time detection automatically when camera and models are ready
//   useEffect(() => {
//     if (cameraReady && modelsLoaded && faceMatcher && attendanceStatus !== 'completed' && !isCameraStopped) {
//       startRealTimeDetection();
//     }
    
//     return () => {
//       if (detectionIntervalRef.current) {
//         clearInterval(detectionIntervalRef.current);
//       }
//     };
//   }, [cameraReady, modelsLoaded, faceMatcher, attendanceStatus, isCameraStopped]);

//   const cleanup = () => {
//     if (detectionIntervalRef.current) {
//       clearInterval(detectionIntervalRef.current);
//       detectionIntervalRef.current = null;
//     }
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => track.stop());
//       streamRef.current = null;
//     }
//   };

//   const loadModels = async () => {
//     try {
//       console.log("Loading face recognition models...");
      
//       await Promise.all([
//         faceapi.nets.tinyFaceDetector.loadFromUri("/models/tiny_face_detector"),
//         faceapi.nets.faceLandmark68Net.loadFromUri("/models/face_landmark_68"),
//         faceapi.nets.faceRecognitionNet.loadFromUri("/models/face_recognition")
//       ]);
      
//       console.log("Models loaded successfully");
//       setModelsLoaded(true);
//     } catch (error) {
//       console.error("Error loading models:", error);
//       alert("Error loading face recognition models. Check console for details.");
//     }
//   };

//   const startCamera = async () => {
//     try {
//       console.log("Starting camera...");
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         video: { 
//           width: { ideal: 640 }, 
//           height: { ideal: 480 } 
//         } 
//       });
//       streamRef.current = stream;
      
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
        
//         videoRef.current.addEventListener('loadedmetadata', () => {
//           if (canvasRef.current) {
//             canvasRef.current.width = videoRef.current.videoWidth;
//             canvasRef.current.height = videoRef.current.videoHeight;
//             setCameraReady(true);
//             setIsCameraStopped(false);
//             console.log("Camera ready, starting automatic face recognition...");
//           }
//         });
//       }
//     } catch (error) {
//       console.error("Camera access error:", error);
//       alert("Camera access denied or not available");
//     }
//   };

//   const stopCamera = () => {
//     console.log("Stopping camera...");
    
//     // Clear detection interval
//     if (detectionIntervalRef.current) {
//       clearInterval(detectionIntervalRef.current);
//       detectionIntervalRef.current = null;
//     }
    
//     // Stop all video tracks
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => {
//         track.stop();
//         console.log("Video track stopped");
//       });
//       streamRef.current = null;
//     }
    
//     // Clear video element
//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }
    
//     // Clear canvas
//     if (canvasRef.current) {
//       const ctx = canvasRef.current.getContext('2d');
//       ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//     }
    
//     setCameraReady(false);
//     setIsCameraStopped(true);
//     setAutoCapturing(false);
//     recognitionCooldownRef.current = false;
    
//     console.log("Camera stopped successfully");
//   };

//   const restartCamera = async () => {
//     console.log("Restarting camera...");
    
//     // First stop any existing camera
//     stopCamera();
    
//     // Reset states
//     setAttendanceStatus(null);
//     setLastAttendance(null);
//     setAutoCapturing(false);
//     recognitionCooldownRef.current = false;
    
//     // Wait a bit then restart
//     setTimeout(() => {
//       startCamera();
//     }, 1000);
//   };

//   const loadEmployees = async () => {
//     try {
//       setIsLoading(true);
//       console.log("Loading registered employees...");
      
//       const res = await axios.get("http://localhost:8080/api/attendance/employees");
//       console.log(`Found ${res.data.length} registered employees`);
      
//       if (res.data.length === 0) {
//         setIsLoading(false);
//         return;
//       }

//       const labeledDescriptors = res.data.map(emp => {
//         console.log(`Loading employee: ${emp.name}, descriptor length: ${emp.descriptor.length}`);
        
//         const descriptorArray = emp.descriptor.map(num => parseFloat(num));
//         const descriptor = new Float32Array(descriptorArray);
        
//         return new faceapi.LabeledFaceDescriptors(emp._id, [descriptor]);
//       });

//       console.log("Created labeled descriptors for", labeledDescriptors.length, "employees");
//       setFaceMatcher(new faceapi.FaceMatcher(labeledDescriptors, 0.6));
//       setEmployees(res.data);
      
//       console.log("Face matcher initialized successfully");
//       setIsLoading(false);
//     } catch (error) {
//       console.error("Error loading employees:", error);
//       alert("Error loading registered employees");
//       setIsLoading(false);
//     }
//   };

//   const autoMarkAttendance = async (employeeId, employeeName, confidence) => {
//     if (recognitionCooldownRef.current || autoCapturing) {
//       return; // Prevent multiple rapid captures
//     }

//     try {
//       setAutoCapturing(true);
//       recognitionCooldownRef.current = true;

//       console.log(`Auto-capturing attendance for ${employeeName}...`);
      
//       const response = await axios.post("http://localhost:8080/api/attendance/auto", { employeeId });
      
//       setLastAttendance({
//         ...response.data.attendance,
//         confidence: confidence,
//         type: response.data.type,
//         workingSummary: response.data.workingSummary,
//         employeeName: employeeName
//       });

//       if (response.data.type === 'IN') {
//         alert(`🟢 Welcome ${employeeName}!\nIN time recorded: ${new Date(response.data.attendance.inTime).toLocaleTimeString()}\nConfidence: ${confidence}%`);
//         setAttendanceStatus('in');
        
//         // Set cooldown for 10 seconds
//         setTimeout(() => {
//           recognitionCooldownRef.current = false;
//           setAutoCapturing(false);
//         }, 10000);
        
//       } else if (response.data.type === 'OUT') {
//         alert(`🔴 Goodbye ${employeeName}!\nOUT time recorded: ${new Date(response.data.attendance.outTime).toLocaleTimeString()}\n${response.data.workingSummary}\nConfidence: ${confidence}%`);
//         setAttendanceStatus('completed');
        
//         // Stop camera after OUT time is marked (with delay for user to see the message)
//         setTimeout(() => {
//           stopCamera();
//           console.log("Attendance completed - Camera stopped automatically");
//         }, 3000);
        
//       } else if (response.data.type === 'COMPLETED') {
//         alert(`👋 Hello ${employeeName}!\nYour attendance is already complete for today.\n${response.data.workingSummary}`);
//         setAttendanceStatus('completed');
        
//         // Stop camera as attendance is already complete
//         setTimeout(() => {
//           stopCamera();
//           console.log("Attendance already completed - Camera stopped automatically");
//         }, 3000);
//       }

//     } catch (error) {
//       console.error("Auto attendance error:", error);
      
//       if (error.response && error.response.data) {
//         alert(`❌ Error: ${error.response.data.error}`);
//       } else {
//         alert(`❌ Failed to mark attendance for ${employeeName}. Please try again.`);
//       }
      
//       setTimeout(() => {
//         recognitionCooldownRef.current = false;
//         setAutoCapturing(false);
//       }, 8080);
//     }
//   };

//   const drawDetections = (detections, canvas) => {
//     const ctx = canvas.getContext('2d');
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
    
//     if (detections && detections.length > 0) {
//       detections.forEach(detection => {
//         const { box, label, distance, employeeId } = detection;
        
//         // Auto-capture attendance if employee is recognized and not in cooldown
//         if (label !== 'unknown' && !recognitionCooldownRef.current && !autoCapturing && attendanceStatus !== 'completed') {
//           const confidence = (100 - distance * 100).toFixed(1);
//           if (confidence > 60) { // Only auto-capture if confidence is high
//             autoMarkAttendance(employeeId, label, confidence);
//           }
//         }
        
//         // Draw bounding box (smaller size)
//         const reduction = 0.4;
//         const newWidth = box.width * (1 - reduction);
//         const newHeight = box.height * (1 - reduction);
//         const newX = box.x + (box.width - newWidth) / 2;
//         const newY = box.y + (box.height - newHeight) / 2;
        
//         ctx.strokeStyle = label === 'unknown' ? '#ff0000' : '#00ff00';
//         ctx.lineWidth = 2;
//         ctx.strokeRect(newX, newY, newWidth, newHeight);
        
//         // Draw label
//         const labelText = label === 'unknown' ? 'Unknown' : label;
//         const confidence = `${(100 - distance * 100).toFixed(1)}%`;
//         const status = autoCapturing ? ' (Capturing...)' : '';
//         const fullLabel = `${labelText} (${confidence})${status}`;
        
//         ctx.font = '14px Arial';
//         ctx.fillStyle = label === 'unknown' ? '#ff0000' : autoCapturing ? '#ff8c00' : '#00ff00';
//         const textWidth = ctx.measureText(fullLabel).width + 10;
//         ctx.fillRect(newX, newY - 25, textWidth, 25);
        
//         ctx.fillStyle = '#ffffff';
//         ctx.fillText(fullLabel, newX + 5, newY - 8);
//       });
//     }
//   };

//   const realTimeDetection = async () => {
//     if (!videoRef.current || !canvasRef.current || !modelsLoaded || !faceMatcher || isCameraStopped) {
//       return;
//     }

//     try {
//       const detections = await faceapi
//         .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
//         .withFaceLandmarks()
//         .withFaceDescriptors();

//       const displayDetections = detections.map(detection => {
//         const result = faceMatcher.findBestMatch(detection.descriptor);
//         const employee = result.label !== 'unknown' 
//           ? employees.find(emp => emp._id === result.label) 
//           : null;
        
//         return {
//           box: detection.detection.box,
//           label: employee ? employee.name : 'unknown',
//           employeeId: result.label !== 'unknown' ? result.label : null,
//           distance: result.distance
//         };
//       });

//       drawDetections(displayDetections, canvasRef.current);
//     } catch (error) {
//       console.error("Real-time detection error:", error);
//     }
//   };

//   const startRealTimeDetection = () => {
//     if (detectionIntervalRef.current) {
//       clearInterval(detectionIntervalRef.current);
//     }
//     detectionIntervalRef.current = setInterval(realTimeDetection, 1000); // Every 1 second for auto-capture
//     console.log("Real-time detection with auto-capture started");
//   };

//   const getStatusMessage = () => {
//     if (isCameraStopped && attendanceStatus === 'completed') {
//       return "✅ Attendance Complete - Camera Stopped";
//     }
//     if (isCameraStopped) {
//       return "📹 Camera Stopped";
//     }
//     if (attendanceStatus === 'completed') {
//       return "✅ Attendance Complete for Today";
//     }
//     if (attendanceStatus === 'in') {
//       return "🟢 Checked IN - Show your face again to mark OUT time";
//     }
//     if (autoCapturing) {
//       return "📸 Capturing attendance...";
//     }
//     return "🔍 Ready for automatic attendance capture";
//   };

//   const getStatusColor = () => {
//     if (isCameraStopped) return '#6c757d';
//     if (attendanceStatus === 'completed') return '#28a745';
//     if (attendanceStatus === 'in') return '#007bff';
//     if (autoCapturing) return '#ff8c00';
//     return '#17a2b8';
//   };

//   return (
//     <div style={{ padding: '20px', textAlign: 'center' }}>
//       <h2>🤖 Smart Attendance System</h2>
      
//       <div style={{ margin: '20px 0', position: 'relative', display: 'inline-block' }}>
//         {!isCameraStopped ? (
//           <>
//             <video 
//               ref={videoRef} 
//               autoPlay 
//               muted 
//               width="400" 
//               height="300" 
//               style={{ border: '2px solid #ccc', borderRadius: '8px' }}
//             />
//             <canvas
//               ref={canvasRef}
//               width="400"
//               height="300"
//               style={{
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 pointerEvents: 'none',
//                 borderRadius: '8px'
//               }}
//             />
//             {autoCapturing && (
//               <div style={{
//                 position: 'absolute',
//                 top: '10px',
//                 left: '10px',
//                 background: 'rgba(255, 140, 0, 0.9)',
//                 color: 'white',
//                 padding: '5px 10px',
//                 borderRadius: '15px',
//                 fontSize: '12px',
//                 fontWeight: 'bold'
//               }}>
//                 📸 Capturing...
//               </div>
//             )}
//           </>
//         ) : (
//           <div 
//             style={{
//               width: '400px',
//               height: '300px',
//               border: '2px solid #6c757d',
//               borderRadius: '8px',
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               justifyContent: 'center',
//               backgroundColor: attendanceStatus === 'completed' ? '#d4edda' : '#f8f9fa',
//               color: attendanceStatus === 'completed' ? '#155724' : '#495057',
//               fontSize: '16px',
//               fontWeight: 'bold',
//               textAlign: 'center',
//               padding: '20px',
//               boxSizing: 'border-box'
//             }}
//           >
//             {attendanceStatus === 'completed' ? (
//               <>
//                 <div>✅ Attendance Completed!</div>
//                 <div style={{ fontSize: '14px', marginTop: '10px' }}>📹 Camera Stopped</div>
//                 {lastAttendance && lastAttendance.workingSummary && (
//                   <div style={{ 
//                     fontSize: '14px', 
//                     fontWeight: 'normal', 
//                     marginTop: '10px',
//                     lineHeight: '1.4'
//                   }}>
//                     👤 {lastAttendance.employeeName}<br/>
//                     ⏰ {lastAttendance.workingSummary}
//                   </div>
//                 )}
//               </>
//             ) : (
//               <>
//                 <div>📹 Camera Stopped</div>
//                 <div style={{ fontSize: '14px', marginTop: '10px', fontWeight: 'normal' }}>
//                   Click "Start Camera" to resume
//                 </div>
//               </>
//             )}
//           </div>
//         )}
//       </div>
      
//       {/* Status Display */}
//       <div style={{ 
//         margin: '20px 0', 
//         padding: '10px', 
//         backgroundColor: getStatusColor(), 
//         color: 'white',
//         borderRadius: '6px',
//         fontSize: '16px',
//         fontWeight: 'bold'
//       }}>
//         {getStatusMessage()}
//       </div>

//       {/* Attendance Details */}
//       {lastAttendance && (
//         <div style={{
//           margin: '20px 0',
//           padding: '15px',
//           backgroundColor: '#f8f9fa',
//           borderRadius: '6px',
//           border: '1px solid #dee2e6'
//         }}>
//           <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>Last Attendance Record</h4>
//           <div style={{ textAlign: 'left', fontSize: '14px', color: '#6c757d' }}>
//             <strong>Employee:</strong> {lastAttendance.employeeName}<br/>
//             <strong>Type:</strong> {lastAttendance.type === 'IN' ? '🟢 Check IN' : lastAttendance.type === 'OUT' ? '🔴 Check OUT' : '✅ Already Complete'}<br/>
//             {lastAttendance.inTime && (
//               <><strong>IN Time:</strong> {new Date(lastAttendance.inTime).toLocaleString()}<br/></>
//             )}
//             {lastAttendance.outTime && (
//               <><strong>OUT Time:</strong> {new Date(lastAttendance.outTime).toLocaleString()}<br/></>
//             )}
//             {lastAttendance.workingSummary && (
//               <><strong>Working Hours:</strong> {lastAttendance.workingSummary}<br/></>
//             )}
//             <strong>Confidence:</strong> {lastAttendance.confidence}%
//           </div>
//         </div>
//       )}
      
//       {/* Control Buttons */}
//       <div style={{ margin: '20px 0' }}>
//         {isCameraStopped ? (
//           <div>
//             <button 
//               onClick={restartCamera}
//               style={{ 
//                 padding: '15px 30px', 
//                 fontSize: '18px',
//                 backgroundColor: '#28a745',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '6px',
//                 cursor: 'pointer',
//                 marginRight: '10px'
//               }}
//             >
//               📹 Start Camera
//             </button>
//             <button 
//               onClick={() => window.location.reload()}
//               style={{ 
//                 padding: '15px 30px', 
//                 fontSize: '18px',
//                 backgroundColor: '#007bff',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '6px',
//                 cursor: 'pointer'
//               }}
//             >
//               🔄 New Session
//             </button>
//           </div>
//         ) : (
//           <>
//             <button 
//               onClick={loadEmployees}
//               disabled={isLoading}
//               style={{ 
//                 padding: '10px 20px', 
//                 fontSize: '14px',
//                 backgroundColor: '#007bff',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '4px',
//                 cursor: isLoading ? 'not-allowed' : 'pointer',
//                 marginRight: '10px'
//               }}
//             >
//               {isLoading ? 'Loading...' : '🔄 Refresh Employee List'}
//             </button>
            
//             <button 
//               onClick={stopCamera}
//               style={{ 
//                 padding: '10px 20px', 
//                 fontSize: '14px',
//                 backgroundColor: '#dc3545',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '4px',
//                 cursor: 'pointer'
//               }}
//             >
//               🔴 Stop Camera
//             </button>
//           </>
//         )}
//       </div>
      
//       {/* System Status */}
//       <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
//         {isCameraStopped ? (
//           <div>
//             {attendanceStatus === 'completed' ? (
//               <p style={{ color: '#28a745', fontSize: '16px', fontWeight: 'bold' }}>
//                 🎉 Daily attendance completed successfully! Camera stopped for privacy.
//               </p>
//             ) : (
//               <p style={{ color: '#6c757d', fontSize: '16px' }}>
//                 📹 Camera is stopped. Click "Start Camera" to resume attendance monitoring.
//               </p>
//             )}
//           </div>
//         ) : (
//           <>
//             {!modelsLoaded && <p>🔄 Loading face recognition models...</p>}
//             {modelsLoaded && isLoading && <p>🔄 Loading registered employees...</p>}
//             {modelsLoaded && !cameraReady && <p>📹 Starting camera...</p>}
//             {modelsLoaded && !isLoading && employees.length === 0 && (
//               <p style={{ color: 'orange' }}>⚠️ No employees registered. Please register employees first.</p>
//             )}
//             {modelsLoaded && !isLoading && employees.length > 0 && cameraReady && (
//               <p style={{ color: 'green' }}>
//                 ✅ Auto-capture ready ({employees.length} employees registered)
//               </p>
//             )}
//             {cameraReady && modelsLoaded && faceMatcher && (
//               <p style={{ color: '#17a2b8' }}>
//                 🤖 Auto-attendance active - Just show your face to the camera!
//               </p>
//             )}
//           </>
//         )}
//       </div>

//       {/* Instructions */}
//       <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
//         <h4 style={{ marginTop: 0, color: '#495057' }}>📋 How It Works:</h4>
//         <ul style={{ textAlign: 'left', color: '#6c757d', fontSize: '14px' }}>
//           <li><strong>First time today:</strong> Show your face → Automatic IN time capture</li>
//           <li><strong>Second time today:</strong> Show your face → Automatic OUT time capture + working hours calculation</li>
//           <li><strong>Auto Camera Stop:</strong> Camera automatically stops after successful OUT time or when attendance is already complete</li>
//           <li><strong>Camera Control:</strong> Use "Stop Camera" button to manually stop, "Start Camera" to resume</li>
//           <li><strong>Green box:</strong> Recognized employee ready for auto-capture</li>
//           <li><strong>Orange box:</strong> Currently capturing attendance</li>
//           <li><strong>Red box:</strong> Unknown person</li>
//           <li>System prevents duplicate captures with 10-second cooldown</li>
//           <li>Good lighting and clear face positioning improve accuracy</li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default AttendanceTaking;


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

  const loadModels = async () => {
    try {
      console.log("Loading face recognition models...");
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models/tiny_face_detector"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models/face_landmark_68"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models/face_recognition")
      ]);
      
      console.log("Models loaded successfully");
      setModelsLoaded(true);
    } catch (error) {
      console.error("Error loading models:", error);
      alert("Error loading face recognition models. Check console for details.");
    }
  };

  const startCamera = async () => {
    try {
      console.log("Starting camera...");
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
            console.log("Camera ready, starting automatic face recognition...");
          }
        });
      }
    } catch (error) {
      console.error("Camera access error:", error);
      alert("Camera access denied or not available");
    }
  };

  const stopCamera = () => {
    console.log("Stopping camera...");
    
    // Clear detection interval
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    // Stop all video tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log("Video track stopped");
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
    
    console.log("Camera stopped successfully");
  };

  const restartCamera = async () => {
    console.log("Restarting camera...");
    
    // First stop any existing camera
    stopCamera();
    
    // Reset states
    setAttendanceStatus(null);
    setLastAttendance(null);
    setAutoCapturing(false);
    recognitionCooldownRef.current = false;
    
    // Wait a bit then restart
    setTimeout(() => {
      startCamera();
    }, 1000);
  };

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      console.log("Loading registered employees...");
      
      const res = await axios.get("http://localhost:8080/api/attendance/employees");
      console.log(`Found ${res.data.length} registered employees`);
      
      if (res.data.length === 0) {
        setIsLoading(false);
        return;
      }

      const labeledDescriptors = res.data.map(emp => {
        console.log(`Loading employee: ${emp.name}, descriptor length: ${emp.descriptor.length}`);
        
        const descriptorArray = emp.descriptor.map(num => parseFloat(num));
        const descriptor = new Float32Array(descriptorArray);
        
        return new faceapi.LabeledFaceDescriptors(emp._id, [descriptor]);
      });

      console.log("Created labeled descriptors for", labeledDescriptors.length, "employees");
      setFaceMatcher(new faceapi.FaceMatcher(labeledDescriptors, 0.6));
      setEmployees(res.data);
      
      console.log("Face matcher initialized successfully");
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

      console.log(`Auto-capturing attendance for ${employeeName}...`);
      
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
          console.log("Attendance completed - Camera stopped automatically");
        }, 3000);
        
      } else if (response.data.type === 'COMPLETED') {
        alert(`👋 Hello ${employeeName}!\nYour attendance is already complete for today.\n${response.data.workingSummary}`);
        setAttendanceStatus('completed');
        
        // Stop camera as attendance is already complete
        setTimeout(() => {
          stopCamera();
          console.log("Attendance already completed - Camera stopped automatically");
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
    detectionIntervalRef.current = setInterval(realTimeDetection, 1000); // Every 1 second for auto-capture
    console.log("Real-time detection with auto-capture started");
  };

  const getStatusMessage = () => {
    if (isCameraStopped && attendanceStatus === 'completed') {
      return "✅ Attendance Complete - Camera Stopped";
    }
    if (isCameraStopped) {
      return "📹 Camera Stopped";
    }
    if (attendanceStatus === 'completed') {
      return "✅ Attendance Complete for Today";
    }
    if (attendanceStatus === 'in') {
      return "🟢 Checked IN - Show your face again to mark OUT time";
    }
    if (autoCapturing) {
      return "📸 Capturing attendance...";
    }
    return "🔍 Ready for automatic attendance capture";
  };

  const getStatusColor = () => {
    if (isCameraStopped) return '#6c757d';
    if (attendanceStatus === 'completed') return '#28a745';
    if (attendanceStatus === 'in') return '#007bff';
    if (autoCapturing) return '#ff8c00';
    return '#17a2b8';
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>🤖 Smart Attendance System</h2>
      
      <div style={{ margin: '20px 0', position: 'relative', display: 'inline-block' }}>
        {!isCameraStopped ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              width="400" 
              height="300" 
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
            {autoCapturing && (
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(255, 140, 0, 0.9)',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '15px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                📸 Capturing...
              </div>
            )}
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
            {attendanceStatus === 'completed' ? (
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
                    👤 {lastAttendance.employeeName}<br/>
                    ⏰ {lastAttendance.workingSummary}
                  </div>
                )}
              </>
            ) : (
              <>
                <div>📹 Camera Stopped</div>
                <div style={{ fontSize: '14px', marginTop: '10px', fontWeight: 'normal' }}>
                  Click "Start Camera" to resume
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Status Display */}
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
      </div>

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
            <strong>Employee:</strong> {lastAttendance.employeeName}<br/>
            <strong>Type:</strong> {lastAttendance.type === 'IN' ? '🟢 Check IN' : lastAttendance.type === 'OUT' ? '🔴 Check OUT' : '✅ Already Complete'}<br/>
            {lastAttendance.inTime && (
              <><strong>IN Time:</strong> {new Date(lastAttendance.inTime).toLocaleString()}<br/></>
            )}
            {lastAttendance.outTime && (
              <><strong>OUT Time:</strong> {new Date(lastAttendance.outTime).toLocaleString()}<br/></>
            )}
            {lastAttendance.workingSummary && (
              <><strong>Working Hours:</strong> {lastAttendance.workingSummary}<br/></>
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
              onClick={restartCamera}
              style={{ 
                padding: '15px 30px', 
                fontSize: '18px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              📹 Start Camera
            </button>
            <button 
              onClick={() => window.location.reload()}
              style={{ 
                padding: '15px 30px', 
                fontSize: '18px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🔄 New Session
            </button>
          </div>
        ) : (
          <>
            <button 
              onClick={loadEmployees}
              disabled={isLoading}
              style={{ 
                padding: '10px 20px', 
                fontSize: '14px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginRight: '10px'
              }}
            >
              {isLoading ? 'Loading...' : '🔄 Refresh Employee List'}
            </button>
            
            <button 
              onClick={stopCamera}
              style={{ 
                padding: '10px 20px', 
                fontSize: '14px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔴 Stop Camera
            </button>
          </>
        )}
      </div>
      
      {/* System Status */}
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        {isCameraStopped ? (
          <div>
            {attendanceStatus === 'completed' ? (
              <p style={{ color: '#28a745', fontSize: '16px', fontWeight: 'bold' }}>
                🎉 Daily attendance completed successfully! Camera stopped for privacy.
              </p>
            ) : (
              <p style={{ color: '#6c757d', fontSize: '16px' }}>
                📹 Camera is stopped. Click "Start Camera" to resume attendance monitoring.
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
            {modelsLoaded && !isLoading && employees.length > 0 && cameraReady && (
              <p style={{ color: 'green' }}>
                ✅ Auto-capture ready ({employees.length} employees registered)
              </p>
            )}
            {cameraReady && modelsLoaded && faceMatcher && (
              <p style={{ color: '#17a2b8' }}>
                🤖 Auto-attendance active - Just show your face to the camera!
              </p>
            )}
          </>
        )}
      </div>

      {/* Instructions */}
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
        <h4 style={{ marginTop: 0, color: '#495057' }}>📋 How It Works:</h4>
        <ul style={{ textAlign: 'left', color: '#6c757d', fontSize: '14px' }}>
          <li><strong>First time today:</strong> Show your face → Automatic IN time capture</li>
          <li><strong>Second time today:</strong> Show your face → Automatic OUT time capture + working hours calculation</li>
          <li><strong>Auto Camera Stop:</strong> Camera automatically stops after successful OUT time or when attendance is already complete</li>
          <li><strong>Camera Control:</strong> Use "Stop Camera" button to manually stop, "Start Camera" to resume</li>
          <li><strong>Green box:</strong> Recognized employee ready for auto-capture</li>
          <li><strong>Orange box:</strong> Currently capturing attendance</li>
          <li><strong>Red box:</strong> Unknown person</li>
          <li>System prevents duplicate captures with 10-second cooldown</li>
          <li>Good lighting and clear face positioning improve accuracy</li>
        </ul>
      </div>
    </div>
  );
};

export default AttendanceTaking;