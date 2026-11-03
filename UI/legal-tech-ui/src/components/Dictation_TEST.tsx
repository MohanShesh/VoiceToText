// import React, { useEffect, useRef, useState } from "react";

// declare global {
//   interface Window {
//     webkitSpeechRecognition: any;
//     SpeechRecognition: any;
//   }
// }

// export default function DictationPage() {
//   const [transcript, setTranscript] = useState("");
//   const [interimTranscript, setInterimTranscript] = useState("");
//   const [status, setStatus] = useState("Idle");
//   const [isRecording, setIsRecording] = useState(false);

//   const recognitionRef = useRef<any>(null);

//   useEffect(() => {
//     const SpeechRecognition =
//       window.SpeechRecognition ||
//       window.webkitSpeechRecognition;

//     if (!SpeechRecognition) {
//       setStatus("Speech Recognition not supported");
//       return;
//     }

//     const recognition = new SpeechRecognition();

//     recognition.continuous = true;
//     recognition.interimResults = true;
//     recognition.lang = "en-US";

//     recognition.onstart = () => {
//       setStatus("Listening...");
//       setIsRecording(true);
//     };

//     recognition.onend = () => {
//       setStatus("Stopped");
//       setIsRecording(false);
//     };

//     recognition.onerror = (event: any) => {
//       setStatus(`Error: ${event.error}`);
//       setIsRecording(false);
//     };

//     recognition.onresult = (event: any) => {
//       let finalText = "";
//       let interimText = "";

//       for (
//         let i = event.resultIndex;
//         i < event.results.length;
//         i++
//       ) {
//         const result = event.results[i];
//         const text = result[0].transcript;

//         if (result.isFinal) {
//           finalText += text + " ";
//         } else {
//           interimText += text;
//         }
//       }

//       if (finalText) {
//         setTranscript((prev) => prev + finalText);
//       }

//       setInterimTranscript(interimText);
//     };

//     recognitionRef.current = recognition;

//     return () => {
//       recognition.stop();
//     };
//   }, []);

//   const startRecording = () => {
//     if (!recognitionRef.current) return;

//     setTranscript("");
//     setInterimTranscript("");

//     recognitionRef.current.start();
//   };

//   const stopRecording = () => {
//     recognitionRef.current?.stop();
//   };

//   const clearTranscript = () => {
//     setTranscript("");
//     setInterimTranscript("");
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
//       <h1 className="text-3xl font-bold text-indigo-400 mb-6">
//         Live Dictation
//       </h1>

//       <p className="mb-4 text-yellow-400">
//         Status: {status}
//       </p>

//       <div className="w-full max-w-3xl bg-gray-800 rounded-lg p-6 shadow-lg min-h-[250px]">
//         <p className="text-green-400 whitespace-pre-wrap">
//           {transcript}
//           <span className="text-gray-400">
//             {interimTranscript}
//           </span>
//         </p>

//         {!transcript && !interimTranscript && (
//           <p className="text-gray-500">
//             Click Start and begin speaking...
//           </p>
//         )}
//       </div>

//       <div className="flex gap-4 mt-6">
//         <button
//           disabled={isRecording}
//           onClick={startRecording}
//           className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
//         >
//           Start
//         </button>

//         <button
//           disabled={!isRecording}
//           onClick={stopRecording}
//           className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
//         >
//           Stop
//         </button>

//         <button
//           onClick={clearTranscript}
//           className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700"
//         >
//           Clear
//         </button>
//       </div>
//     </div>
//   );
// }


