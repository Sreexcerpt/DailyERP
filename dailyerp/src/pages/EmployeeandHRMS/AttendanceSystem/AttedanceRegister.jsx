// import React, { useEffect, useRef, useState } from 'react';
// import * as faceapi from 'face-api.js';
// import axios from 'axios';


// const AttedanceRegister = () => {
//   const videoRef = useRef();
//   const [name, setName] = useState("");
//   const [descriptor, setDescriptor] = useState(null);
//   const [modelsLoaded, setModelsLoaded] = useState(false);

//   useEffect(() => {
//     loadModels().then(() => {
//       startCamera();
//     });
//   }, []);

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       videoRef.current.srcObject = stream;
//     } catch (error) {
//       console.error("Camera access error:", error);
//       alert("Camera access denied or not available");
//     }
//   };

//   const loadModels = async () => {
//     try {
//       console.log("Loading models...");
      
//       // Load models from the correct paths
//       await Promise.all([
//         faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector'),
//         faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68'),
//         faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition')
//       ]);
      
//       console.log("Models loaded successfully");
//       setModelsLoaded(true);
//     } catch (error) {
//       console.error("Error loading models:", error);
//       alert("Error loading face recognition models. Check console for details.");
//     }
//   };

//   const captureFace = async () => {
//     if (!modelsLoaded) {
//       alert("Models are still loading, please wait...");
//       return;
//     }

//     if (!videoRef.current) {
//       alert("Camera not ready");
//       return;
//     }

//     try {
//       const detection = await faceapi
//         .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
//         .withFaceLandmarks()
//         .withFaceDescriptor();

//       if (detection) {
//         setDescriptor(Array.from(detection.descriptor));
//         alert("Face captured successfully! Now you can register.");
//       } else {
//         alert("No face detected. Please make sure your face is clearly visible and try again.");
//       }
//     } catch (error) {
//       console.error("Face detection error:", error);
//       alert("Error detecting face. Please try again.");
//     }
//   };

// const registerEmployee = async () => {
//   if (!name.trim()) {
//     alert("Please enter employee name");
//     return;
//   }
  
//   if (!descriptor) {
//     alert("Please capture face first");
//     return;
//   }

//   try {
//     // Create canvas to capture image
//     const canvas = document.createElement('canvas');
//     canvas.width = videoRef.current.videoWidth;
//     canvas.height = videoRef.current.videoHeight;
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(videoRef.current, 0, 0);
//     const imageBase64 = canvas.toDataURL("image/png");

//     // Register employee
//     await axios.post("/api/attendance/employee/register", {
//       name: name.trim(),
//       descriptor,
//       image: imageBase64
//     });

//     alert("Employee registered successfully!");
    
//     // Close camera
//     const stream = videoRef.current.srcObject;
//     const tracks = stream.getTracks();
//     tracks.forEach(track => track.stop());
//     videoRef.current.srcObject = null;
    
//     // Reset state
//     setName("");
//     setDescriptor(null);
//   } catch (error) {
//     console.error("Registration error:", error);
//     alert("Error registering employee. Please try again.");
//   }
// };
// const restartCamera = async () => {
//   try {
//     // Stop existing camera if running
//     if (videoRef.current && videoRef.current.srcObject) {
//       const stream = videoRef.current.srcObject;
//       const tracks = stream.getTracks();
//       tracks.forEach(track => track.stop());
//     }
    
//     // Start camera again
//     await startCamera();
//   } catch (error) {
//     console.error("Error restarting camera:", error);
//     alert("Error restarting camera");
//   }
// };

//   return (
//     <div style={{ padding: '20px', textAlign: 'center' }}>
//       <h2>Register Employee Face</h2>
      
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
//         <input
//           type="text"
//           placeholder="Enter Employee Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           style={{ 
//             padding: '10px', 
//             fontSize: '16px', 
//             width: '300px',
//             marginRight: '10px'
//           }}
//         />
//       </div>
      
//       <div style={{ margin: '20px 0' }}>
//         <button 
//           onClick={captureFace}
//           disabled={!modelsLoaded}
//           style={{ 
//             padding: '10px 20px', 
//             fontSize: '16px', 
//             marginRight: '10px',
//             backgroundColor: modelsLoaded ? '#007bff' : '#ccc',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: modelsLoaded ? 'pointer' : 'not-allowed'
//           }}
//         >
//           {modelsLoaded ? 'Capture Face' : 'Loading Models...'}
//         </button>
//         <button 
//   onClick={restartCamera}
//   style={{ 
//     padding: '8px 16px', 
//     fontSize: '14px',
//     backgroundColor: '#17a2b8',
//     color: 'white',
//     border: 'none',
//     borderRadius: '4px',
//     cursor: 'pointer',
//     marginLeft: '10px'
//   }}
// >
//   Restart Camera
// </button>
//         <button 
//           onClick={registerEmployee}
//           disabled={!name.trim() || !descriptor}
//           style={{ 
//             padding: '10px 20px', 
//             fontSize: '16px',
//             backgroundColor: (name.trim() && descriptor) ? '#28a745' : '#ccc',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: (name.trim() && descriptor) ? 'pointer' : 'not-allowed'
//           }}
//         >
//           Register Employee
//         </button>
//       </div>
      
//       <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
//         {!modelsLoaded && <p>Loading face recognition models...</p>}
//         {modelsLoaded && !descriptor && <p>Enter name and capture face to register</p>}
//         {descriptor && <p style={{ color: 'green' }}>✓ Face captured, ready to register</p>}
//       </div>
//     </div>
//   );
// };

// export default AttedanceRegister;
//correct working
// import React, { useEffect, useRef, useState } from 'react';
// import * as faceapi from 'face-api.js';
// import axios from 'axios';

// const AttedanceRegister = () => {
//   const videoRef = useRef();
//   const [name, setName] = useState("");
//   const [descriptor, setDescriptor] = useState(null);
//   const [modelsLoaded, setModelsLoaded] = useState(false);
//   const [isChecking, setIsChecking] = useState(false);
//   const [duplicateCheck, setDuplicateCheck] = useState(null);

//   useEffect(() => {
//     loadModels().then(() => {
//       startCamera();
//     });
//   }, []);

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       videoRef.current.srcObject = stream;
//     } catch (error) {
//       console.error("Camera access error:", error);
//       alert("Camera access denied or not available");
//     }
//   };

//   const loadModels = async () => {
//     try {
//       console.log("Loading models...");
      
//       await Promise.all([
//         faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector'),
//         faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68'),
//         faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition')
//       ]);
      
//       console.log("Models loaded successfully");
//       setModelsLoaded(true);
//     } catch (error) {
//       console.error("Error loading models:", error);
//       alert("Error loading face recognition models. Check console for details.");
//     }
//   };

//   const checkForDuplicates = async (newDescriptor) => {
//     try {
//       setIsChecking(true);
//       console.log("Checking for duplicate faces...");
      
//       // Get all existing employees
//       const res = await axios.get("http://localhost:8080/api/attendance/employees");
//       const employees = res.data;
      
//       if (employees.length === 0) {
//         setDuplicateCheck({ isDuplicate: false, message: "No existing employees to compare with." });
//         return false;
//       }

//       // Create face matcher with existing employees
//       const labeledDescriptors = employees.map(emp => {
//         const descriptorArray = emp.descriptor.map(num => parseFloat(num));
//         const descriptor = new Float32Array(descriptorArray);
//         return new faceapi.LabeledFaceDescriptors(emp._id, [descriptor]);
//       });

//       const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5); // Lower threshold for stricter matching
      
//       // Check if the new face matches any existing employee
//       const result = faceMatcher.findBestMatch(new Float32Array(newDescriptor));
      
//       console.log("Duplicate check result:", result.label, "Distance:", result.distance);
      
//       if (result.label !== "unknown") {
//         // Found a duplicate
//         const duplicateEmployee = employees.find(emp => emp._id === result.label);
//         const similarity = (100 - result.distance * 100).toFixed(1);
        
//         setDuplicateCheck({
//           isDuplicate: true,
//           employeeName: duplicateEmployee.name,
//           similarity: similarity,
//           message: `⚠️ Face matches existing employee: ${duplicateEmployee.name} (${similarity}% similarity)`
//         });
        
//         return true;
//       } else {
//         setDuplicateCheck({
//           isDuplicate: false,
//           message: `✅ No duplicate found. Face is unique (closest match: ${(100 - result.distance * 100).toFixed(1)}% similarity)`
//         });
        
//         return false;
//       }
//     } catch (error) {
//       console.error("Error checking duplicates:", error);
//       setDuplicateCheck({
//         isDuplicate: false,
//         message: "⚠️ Could not check for duplicates. Proceeding anyway."
//       });
//       return false;
//     } finally {
//       setIsChecking(false);
//     }
//   };

//   const captureFace = async () => {
//     if (!modelsLoaded) {
//       alert("Models are still loading, please wait...");
//       return;
//     }

//     if (!videoRef.current) {
//       alert("Camera not ready");
//       return;
//     }

//     try {
//       console.log("Capturing face...");
      
//       const detection = await faceapi
//         .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
//         .withFaceLandmarks()
//         .withFaceDescriptor();

//       if (detection) {
//         const newDescriptor = Array.from(detection.descriptor);
//         setDescriptor(newDescriptor);
        
//         console.log("Face captured successfully. Checking for duplicates...");
        
//         // Check for duplicates
//         const isDuplicate = await checkForDuplicates(newDescriptor);
        
//         if (!isDuplicate) {
//           alert("Face captured successfully! No duplicate found. You can now register.");
//         } else {
//           alert("⚠️ Warning: This face appears to match an existing employee. Please check the details below.");
//         }
//       } else {
//         alert("No face detected. Please make sure your face is clearly visible and try again.");
//         setDuplicateCheck(null);
//       }
//     } catch (error) {
//       console.error("Face detection error:", error);
//       alert("Error detecting face. Please try again.");
//       setDuplicateCheck(null);
//     }
//   };

//   const registerEmployee = async () => {
//     if (!name.trim()) {
//       alert("Please enter employee name");
//       return;
//     }
    
//     if (!descriptor) {
//       alert("Please capture face first");
//       return;
//     }

//     // Check for duplicate one more time before registering
//     if (duplicateCheck && duplicateCheck.isDuplicate) {
//       const confirmRegister = window.confirm(
//         `⚠️ WARNING: This face matches existing employee "${duplicateCheck.employeeName}" with ${duplicateCheck.similarity}% similarity.\n\nAre you sure you want to register this person as a new employee?\n\nClick OK to proceed anyway, or Cancel to stop.`
//       );
      
//       if (!confirmRegister) {
//         return;
//       }
//     }

//     try {
//       console.log("Registering employee...");
      
//       // Create canvas to capture image
//       const canvas = document.createElement('canvas');
//       canvas.width = videoRef.current.videoWidth;
//       canvas.height = videoRef.current.videoHeight;
//       const ctx = canvas.getContext('2d');
//       ctx.drawImage(videoRef.current, 0, 0);
//       const imageBase64 = canvas.toDataURL("image/png");

//       // Register employee
//       await axios.post("http://localhost:8080/api/attendance/employee/register", {
//         name: name.trim(),
//         descriptor,
//         image: imageBase64
//       });

//       alert(`✅ Employee "${name.trim()}" registered successfully!`);
      
//       // Close camera
//       const stream = videoRef.current.srcObject;
//       const tracks = stream.getTracks();
//       tracks.forEach(track => track.stop());
//       videoRef.current.srcObject = null;
      
//       // Reset state
//       setName("");
//       setDescriptor(null);
//       setDuplicateCheck(null);
//     } catch (error) {
//       console.error("Registration error:", error);
//       if (error.response && error.response.data && error.response.data.error) {
//         alert(`Registration failed: ${error.response.data.error}`);
//       } else {
//         alert("Error registering employee. Please try again.");
//       }
//     }
//   };

//   const restartCamera = async () => {
//     try {
//       // Stop existing camera if running
//       if (videoRef.current && videoRef.current.srcObject) {
//         const stream = videoRef.current.srcObject;
//         const tracks = stream.getTracks();
//         tracks.forEach(track => track.stop());
//       }
      
//       // Reset states
//       setDescriptor(null);
//       setDuplicateCheck(null);
      
//       // Start camera again
//       await startCamera();
//     } catch (error) {
//       console.error("Error restarting camera:", error);
//       alert("Error restarting camera");
//     }
//   };

//   return (
//     <div style={{ padding: '20px', textAlign: 'center' }}>
//       <h2>Register Employee Face</h2>
      
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
//         <input
//           type="text"
//           placeholder="Enter Employee Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           style={{ 
//             padding: '10px', 
//             fontSize: '16px', 
//             width: '300px',
//             marginRight: '10px'
//           }}
//         />
//       </div>
      
//       <div style={{ margin: '20px 0' }}>
//         <button 
//           onClick={captureFace}
//           disabled={!modelsLoaded || isChecking}
//           style={{ 
//             padding: '10px 20px', 
//             fontSize: '16px', 
//             marginRight: '10px',
//             backgroundColor: (modelsLoaded && !isChecking) ? '#007bff' : '#ccc',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: (modelsLoaded && !isChecking) ? 'pointer' : 'not-allowed'
//           }}
//         >
//           {!modelsLoaded ? 'Loading Models...' : 
//            isChecking ? 'Checking Duplicates...' : 
//            'Capture Face & Check Duplicates'}
//         </button>
        
//         <button 
//           onClick={restartCamera}
//           style={{ 
//             padding: '8px 16px', 
//             fontSize: '14px',
//             backgroundColor: '#17a2b8',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer',
//             marginLeft: '10px'
//           }}
//         >
//           Restart Camera
//         </button>
        
//         <button 
//           onClick={registerEmployee}
//           disabled={!name.trim() || !descriptor || isChecking}
//           style={{ 
//             padding: '10px 20px', 
//             fontSize: '16px',
//             backgroundColor: (name.trim() && descriptor && !isChecking) ? 
//               (duplicateCheck && duplicateCheck.isDuplicate ? '#dc3545' : '#28a745') : '#ccc',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: (name.trim() && descriptor && !isChecking) ? 'pointer' : 'not-allowed',
//             marginLeft: '10px'
//           }}
//         >
//           {duplicateCheck && duplicateCheck.isDuplicate ? 'Register Anyway ⚠️' : 'Register Employee'}
//         </button>
//       </div>
      
//       {/* Duplicate Check Results */}
//       {duplicateCheck && (
//         <div style={{ 
//           margin: '20px auto', 
//           padding: '15px', 
//           backgroundColor: duplicateCheck.isDuplicate ? '#fff3cd' : '#d1edff',
//           border: `1px solid ${duplicateCheck.isDuplicate ? '#fdbf47' : '#bee5eb'}`,
//           borderRadius: '6px',
//           maxWidth: '500px'
//         }}>
//           <h4 style={{ 
//             marginTop: 0, 
//             color: duplicateCheck.isDuplicate ? '#856404' : '#0c5460' 
//           }}>
//             Duplicate Check Result
//           </h4>
//           <p style={{ 
//             margin: '10px 0', 
//             color: duplicateCheck.isDuplicate ? '#856404' : '#0c5460',
//             fontWeight: 'bold'
//           }}>
//             {duplicateCheck.message}
//           </p>
//           {duplicateCheck.isDuplicate && (
//             <p style={{ margin: '10px 0', fontSize: '14px', color: '#856404' }}>
//               If you proceed, this person will be registered as a separate employee, 
//               which may cause issues with face recognition accuracy.
//             </p>
//           )}
//         </div>
//       )}
      
//       <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
//         {!modelsLoaded && <p>Loading face recognition models...</p>}
//         {modelsLoaded && !descriptor && <p>Enter name and capture face to register</p>}
//         {descriptor && !duplicateCheck && <p style={{ color: 'orange' }}>Face captured, checking for duplicates...</p>}
//         {descriptor && duplicateCheck && !duplicateCheck.isDuplicate && (
//           <p style={{ color: 'green' }}>✓ Face captured and verified unique, ready to register</p>
//         )}
//         {descriptor && duplicateCheck && duplicateCheck.isDuplicate && (
//           <p style={{ color: 'orange' }}>⚠️ Face captured but appears to be duplicate</p>
//         )}
//       </div>

//       {/* Instructions */}
//       <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
//         <h4 style={{ marginTop: 0, color: '#495057' }}>Registration Instructions:</h4>
//         <ul style={{ textAlign: 'left', color: '#6c757d', fontSize: '14px' }}>
//           <li>Enter the employee's full name</li>
//           <li>Position face clearly in camera with good lighting</li>
//           <li>Click "Capture Face" to take photo and check for duplicates</li>
//           <li>System will warn if face matches an existing employee</li>
//           <li>Only register if you're sure this is a new employee</li>
//           <li>Each person should only be registered once</li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default AttedanceRegister;
//newocde
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
    const link = document.createElement('link');
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const iconsLink = document.createElement('link');
    iconsLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.1/font/bootstrap-icons.min.css';
    iconsLink.rel = 'stylesheet';
    document.head.appendChild(iconsLink);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/js/bootstrap.bundle.min.js';
    document.head.appendChild(script);

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
  const loadModels = async () => {
    try {
      console.log("Loading face-api models...");
      setLoadingProgress(10);
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition')
      ]);
      
      setLoadingProgress(100);
      console.log("Models loaded successfully");
      setModelsLoaded(true);
      startCamera();
    } catch (error) {
      console.error("Error loading models:", error);
      alert("Error loading face recognition models. Check console for details.");
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
    <div className="container-fluid min-vh-100" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      <div className="container py-5">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-dark mb-3">Employee Face Registration</h1>
          <p className="lead text-muted">Register employee faces for attendance tracking</p>
        </div>

        {/* Main Content Card */}
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
          <div className="card-body p-5">
            <div className="row g-5">
              
              {/* Left Side - Camera */}
              <div className="col-lg-6">
                <div className="text-center mb-4">
                  <h2 className="h3 fw-semibold text-dark">Camera Feed</h2>
                </div>
                
                {/* Loading Progress */}
                {!modelsLoaded && (
                  <div className="mb-4">
                    <div className="progress" style={{ height: '8px' }}>
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
                      className="w-100"
                      style={{ height: '320px', objectFit: 'cover', backgroundColor: '#f8f9fa' }}
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
                    className={`btn btn-lg fw-semibold px-4 ${
                      (modelsLoaded && cameraReady && !isChecking)
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
                  <div className="input-group input-group-lg">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Employee ID"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                    />
                    <button 
                      onClick={fetchEmployeeById}
                      disabled={isFetchingEmployee || !employeeId.trim()}
                      className={`btn ${
                        (!isFetchingEmployee && employeeId.trim())
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
                    className={`btn btn-lg w-100 fw-bold py-3 ${
                      (employeeId.trim() && name.trim() && descriptor && !isChecking)
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
                  {modelsLoaded && cameraReady && !descriptor && (
                    <div className="alert alert-primary mb-2" role="alert">
                      <i className="bi bi-check-circle me-2"></i>
                      Ready - Enter Employee ID and capture face
                    </div>
                  )}
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
                <div className={`alert ${
                  duplicateCheck.isDuplicate 
                    ? 'alert-warning border-warning' 
                    : 'alert-success border-success'
                } border-3`}>
                  <h5 className={`alert-heading fw-bold ${
                    duplicateCheck.isDuplicate ? 'text-warning' : 'text-success'
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

            {/* Instructions */}
            <div className="mt-5">
              <div className="card bg-light border-0">
                <div className="card-body p-4">
                  <h5 className="card-title fw-bold text-dark mb-3">
                    <i className="bi bi-info-circle me-2"></i>
                    Registration Instructions
                  </h5>
                  <div className="row">
                    <div className="col-md-6">
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <i className="bi bi-dot text-primary fs-4 me-1"></i>
                          Enter valid Employee ID
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-dot text-primary fs-4 me-1"></i>
                          Click Fetch to get employee name
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-dot text-primary fs-4 me-1"></i>
                          Position face clearly in camera
                        </li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <i className="bi bi-dot text-primary fs-4 me-1"></i>
                          Ensure good lighting
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-dot text-primary fs-4 me-1"></i>
                          Capture face and check duplicates
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-dot text-primary fs-4 me-1"></i>
                          Register only if no duplicates
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttedanceRegister;
