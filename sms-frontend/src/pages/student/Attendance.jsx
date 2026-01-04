import { useEffect, useState, useRef } from "react";
import studentService from "../../services/studentService";
import { Html5Qrcode } from "html5-qrcode";

export default function Attendance() {
  const [history, setHistory] = useState([]);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("camera"); // camera | upload | manual
  const [manualCode, setManualCode] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);
  const scannerRef = useRef(null);

  /* =========================
     FETCH ATTENDANCE HISTORY
     ========================= */
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await studentService.getAttendanceHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    }
  };

  /* =========================
     GROUP HISTORY BY DATE
     ========================= */
  const groupedRecords = history.reduce((groups, record) => {
    const dateObj = new Date(record.created_at);
    const dateKey = dateObj.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(record);
    return groups;
  }, {});

  /* =========================
     SCANNER CONTROL HELPERS
     ========================= */
  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
      await scannerRef.current.clear();
    }
  };

  /* =========================
     SUBMIT ATTENDANCE
     ========================= */
  const handleSubmission = async (code) => {
    if (!code || isLoading) return;

    await stopScanner();

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await studentService.markAttendance(code);

      setSuccessMsg(response.message || "Attendance marked successfully!");
      setManualCode("");
      await fetchHistory();

      setTimeout(() => {
        setIsActionOpen(false);
        setSuccessMsg("");
      }, 2000);
    } catch (err) {
      const message =
        err.response?.data?.message || "Attendance failed.";

      setErrorMsg(message);

      // ❌ DO NOT restart scanner for expired / cancelled / inactive
      if (
        activeTab === "camera" &&
        !message.toLowerCase().includes("expired") &&
        !message.toLowerCase().includes("inactive") &&
        !message.toLowerCase().includes("no class") &&
        !message.toLowerCase().includes("ended")
      ) {
        startCamera();
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================
     CAMERA SCANNING
     ========================= */
  const startCamera = () => {
    setTimeout(() => {
      const reader = document.getElementById("reader");
      if (!reader || scannerRef.current?.isScanning) return;

      scannerRef.current = new Html5Qrcode("reader");
      scannerRef.current
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => handleSubmission(decodedText),
          () => { }
        )
        .catch(() => setErrorMsg("Camera access denied."));
    }, 100);
  };

  useEffect(() => {
    if (isActionOpen && activeTab === "camera") startCamera();
    else stopScanner();

    return () => stopScanner();
  }, [isActionOpen, activeTab]);

  /* =========================
     FILE UPLOAD SCAN
     ========================= */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const html5QrCode = new Html5Qrcode("reader-hidden");

    try {
      const decodedText = await html5QrCode.scanFile(file, false);
      handleSubmission(decodedText);
    } catch {
      setErrorMsg("No QR code found. Try a clearer image.");
    }
  };

  /* =========================
     UI
     ========================= */
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Attendance
          </h1>
          <p className="text-gray-500 text-sm">
            {history.length} sessions recorded
          </p>
        </div>

        {!isActionOpen && (
          <button
            onClick={() => {
              setIsActionOpen(true);
              setActiveTab("camera");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            📸 Mark Attendance
          </button>
        )}
      </div>

      {/* SCAN PANEL */}
      {isActionOpen && (
        <div className="bg-white rounded-xl shadow border">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="font-bold">Check-in Session</h2>
            <button onClick={() => setIsActionOpen(false)}>✕</button>
          </div>

          <div className="p-6">
            {/* TABS */}
            <div className="flex justify-center mb-6">
              {["camera", "upload", "manual"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setErrorMsg("");
                  }}
                  className={`px-4 py-2 font-bold ${activeTab === tab
                      ? "text-indigo-600"
                      : "text-gray-400"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-center">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-green-50 text-green-600 rounded text-center">
                {successMsg}
              </div>
            )}

            <div className="flex justify-center">
              {activeTab === "camera" && (
                <div className="bg-black rounded">
                  <div id="reader" className="w-[300px] h-[300px]" />
                </div>
              )}

              {activeTab === "upload" && (
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="border-dashed border-2 p-6 rounded cursor-pointer"
                >
                  Click to upload QR
                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <div id="reader-hidden" className="hidden" />
                </div>
              )}

              {activeTab === "manual" && (
                <div className="w-full max-w-md mx-auto">
                  <div className="space-y-6">
                    <div className="relative">
                      <input
                        value={manualCode}
                        onChange={(e) =>
                          setManualCode(e.target.value.toUpperCase())
                        }
                        className="w-full px-6 py-4 text-center text-2xl font-semibold tracking-widest bg-white border-2 border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-200 placeholder:text-gray-400"
                        maxLength={6}
                        placeholder="XZUGW1"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </div>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <span className={`text-sm font-medium ${manualCode.length === 6 ? 'text-green-500' : 'text-gray-400'}`}>
                          {manualCode.length}/6
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSubmission(manualCode)}
                      disabled={isLoading || manualCode.length !== 6}
                      className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.99] transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        'Submit Code'
                      )}
                    </button>

                    <div className="text-center">
                      <p className="text-sm text-gray-500">
                        Enter your 6-character access code
                      </p>
                      {manualCode.length === 6 ? (
                        <p className="text-sm text-green-600 font-medium mt-2 flex items-center justify-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Code is ready to submit
                        </p>
                      ) : (
                        <p className="text-sm text-amber-600 font-medium mt-2">
                          {6 - manualCode.length} character{6 - manualCode.length !== 1 ? 's' : ''} remaining
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HISTORY */}
      <div className="space-y-6">
        {Object.keys(groupedRecords).map((date) => (
          <div key={date}>
            <div className="font-bold text-gray-600 mb-2">
              {date}
            </div>

            {groupedRecords[date].map((record) => (
              <div
                key={record.id}
                className="bg-white p-4 rounded border flex justify-between"
              >
                <div>
                  <div className="font-bold">
                    {record.session?.school_class?.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(record.created_at).toLocaleTimeString()}
                  </div>
                </div>

                <span className="uppercase font-bold text-sm">
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
