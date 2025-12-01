import React, { useState, useRef, useEffect } from 'react';
import { Message, AgentVoice } from './types';
import ChatBubble from './components/ChatBubble';
import { speakText, analyzeAndFormatForSpeech, detectMessageFromScreen } from './services/geminiService';
import { audioService } from './services/audioService';
import { Monitor, Volume2, Settings, Eye, Video, StopCircle, Zap, ScreenShare } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'Agent Sarah',
      content: 'I am ready. Click "Share Screen" and select your WhatsApp window. I will read new messages automatically.',
      timestamp: new Date(),
      isMe: false,
      read: true,
      type: 'text'
    }
  ]);

  const [isWatching, setIsWatching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastReadContent, setLastReadContent] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState<AgentVoice>(AgentVoice.Kore);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const stopWatcher = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
    }
    setIsWatching(false);
  };

  const startScreenShare = async () => {
    // Check if browser supports screen sharing
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert("Screen sharing is not supported in this browser. Please use Chrome, Edge, or Safari on Desktop.");
        return;
    }

    try {
        // Request screen share with simplified constraints
        // We accept 'any' type to bypass strict TS check on display-capture constraints if needed
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
            video: true, 
            audio: false 
        });

        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Explicitly play the video to ensure it renders
            await videoRef.current.play();
        }
        
        streamRef.current = stream;
        setIsWatching(true);
        setLastReadContent(''); // Reset so it reads whatever is on screen now

        // Handle case where user stops sharing via browser UI (e.g. Chrome's "Stop sharing" banner)
        const videoTrack = stream.getVideoTracks()[0];
        videoTrack.onended = () => {
            stopWatcher();
        };

    } catch (err) {
        console.error("Error accessing screen share:", err);
        const errorMsg = (err as any).message || "";
        
        if (errorMsg.includes("permissions policy")) {
             alert("Screen sharing is blocked by the environment's permission policy. Please check metadata.json has 'display-capture'.");
        } else if ((err as any).name !== 'NotAllowedError') {
             alert("Failed to start screen share: " + errorMsg);
        }
        setIsWatching(false);
    }
  };

  // Polling / Scanning Logic
  useEffect(() => {
    let intervalId: any;

    if (isWatching) {
      intervalId = setInterval(async () => {
        if (isProcessing) return; // Skip if busy
        await captureAndAnalyze();
      }, 4000); // Scan every 4 seconds
    }

    return () => clearInterval(intervalId);
  }, [isWatching, isProcessing, lastReadContent]);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Check if video is actually playing/ready
    if (videoRef.current.readyState < 2) return; // HAVE_CURRENT_DATA or higher

    setIsProcessing(true);
    try {
        // Draw video frame to canvas
        const context = canvasRef.current.getContext('2d');
        if (!context) return;

        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

        // Get Base64
        const base64Image = canvasRef.current.toDataURL('image/png');
        
        // Send to Gemini Vision
        const result = await detectMessageFromScreen(base64Image);

        if (result && result.content) {
            // Check if we already read this message to avoid loops
            if (result.content.trim() !== lastReadContent.trim()) {
                console.log("New message detected:", result);
                setLastReadContent(result.content);
                
                const newMessage: Message = {
                    id: Date.now().toString(),
                    sender: result.sender || 'Someone',
                    content: result.content,
                    timestamp: new Date(),
                    isMe: false,
                    read: false,
                    type: 'text'
                };

                setMessages(prev => [...prev, newMessage]);
                await handleReadMessage(newMessage);
            }
        }

    } catch (error) {
        console.error("Scan error:", error);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleReadMessage = async (message: Message) => {
    try {
      const textToSpeak = await analyzeAndFormatForSpeech(message.sender, message.content);
      const audioBase64 = await speakText(textToSpeak, selectedVoice);
      if (audioBase64) {
        await audioService.playAudio(audioBase64);
      }
    } catch (error) {
      console.error("Playback failed", error);
    }
  };

  const toggleWatcher = () => {
    if (isWatching) {
        stopWatcher();
    } else {
        startScreenShare();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      
      {/* HEADER / STATUS */}
      <div className="w-full p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center z-10 shadow-md">
         <div className="flex items-center gap-3">
             <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-white" />
                </div>
                {isWatching && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-gray-900"></span>
                )}
             </div>
             <div>
                 <h1 className="font-bold text-lg leading-tight">WhatsVoice Visual Agent</h1>
                 <p className="text-xs text-emerald-400 font-mono">
                    {isWatching ? 'MONITORING SCREEN...' : 'WAITING FOR SCREEN SHARE'}
                 </p>
             </div>
         </div>

         <div className="flex items-center gap-2">
            <select 
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value as AgentVoice)}
                className="bg-gray-800 text-xs text-gray-300 py-1 px-2 rounded border border-gray-700 outline-none"
            >
                {Object.keys(AgentVoice).map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <Settings className="w-5 h-5 text-gray-500" />
         </div>
      </div>

      {/* MAIN CONTENT SPLIT */}
      <div className="flex-1 w-full max-w-6xl flex flex-col md:flex-row overflow-hidden">
         
         {/* SCREEN FEED AREA */}
         <div className="flex-1 relative bg-gray-900 flex flex-col items-center justify-center p-4 border-r border-gray-800">
             
             {/* The Video Feed Container */}
             <div className="relative w-full aspect-video rounded-xl overflow-hidden border-4 border-gray-700 shadow-2xl bg-black">
                {/* Placeholder/Instructions when not watching */}
                {!isWatching && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 z-0">
                        <Monitor className="w-16 h-16 mb-4 opacity-50" />
                        <p className="text-center px-4">Click "Share Screen" and select<br/>your WhatsApp window</p>
                    </div>
                )}
                
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className={`w-full h-full object-contain ${isWatching ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 relative z-10`}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Overlays */}
                {isWatching && (
                    <div className="absolute inset-0 pointer-events-none z-20">
                        {/* Scanner Line */}
                        <div className="w-full h-1 bg-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.8)] absolute top-0 animate-[scan_3s_linear_infinite]"></div>
                        
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                            <span className="bg-black/60 text-white/80 text-xs px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                                Analyzing Screen...
                            </span>
                        </div>
                    </div>
                )}
             </div>

             {/* Controls */}
             <div className="mt-8 flex gap-4">
                 <button 
                    onClick={toggleWatcher}
                    className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all transform hover:scale-105 ${
                        isWatching 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                 >
                    {isWatching ? (
                        <> <StopCircle className="w-6 h-6" /> Stop Watching </>
                    ) : (
                        <> <ScreenShare className="w-6 h-6" /> Share Screen </>
                    )}
                 </button>
                 
                 {isWatching && isProcessing && (
                     <div className="flex items-center gap-2 text-emerald-400 animate-pulse mt-2 absolute bottom-6 md:bottom-2">
                        <Zap className="w-4 h-4" /> Analyzing...
                     </div>
                 )}
             </div>
         </div>

         {/* DETECTED CHAT LOG AREA */}
         <div className="w-full md:w-[400px] h-1/2 md:h-auto bg-[#0b141a] flex flex-col border-l border-gray-800">
             <div className="p-4 bg-[#202c33] text-gray-300 text-sm font-medium border-b border-gray-700 flex justify-between items-center">
                 <span>DETECTED MESSAGES</span>
                 {isWatching && <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>}
             </div>
             
             <div 
               className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-opacity-5"
               style={{ backgroundImage: "url('https://camo.githubusercontent.com/854a93c27d64274c4f8f5a0b6ec36ee1d053cfcd934eac6c63bed9eaef9764bd/68747470733a2f2f7765622e77686174736170702e636f6d2f696d672d62672d636861742d74696c652d6461726b5f61346265353132653731393562366b737133332e706e67')" }}
             >
                 {messages.length === 0 && (
                     <div className="text-gray-500 text-center mt-10 text-sm px-6">
                        No messages detected yet. 
                        <br/>
                        Start screen sharing and open WhatsApp Web.
                     </div>
                 )}
                 
                 {messages.map((msg) => (
                    <div key={msg.id} onClick={() => handleReadMessage(msg)} className="cursor-pointer opacity-90 hover:opacity-100 transition-opacity">
                         <ChatBubble message={msg} />
                    </div>
                 ))}
                 <div ref={messagesEndRef} />
             </div>

             <div className="p-3 bg-[#202c33] text-center text-xs text-gray-500 border-t border-gray-700">
                AI Vision Active • Privacy: Screen data is processed securely and not stored.
             </div>
         </div>

      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default App;