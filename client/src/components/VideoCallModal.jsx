import React, { useState, useEffect, useRef, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { Video, VideoOff, Mic, MicOff, Monitor, PhoneOff, Sparkles, X, PhoneCall } from 'lucide-react';

export default function VideoCallModal({ activeChat, isOpen, onClose }) {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerName, setCallerName] = useState('');
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const myVideoRef = useRef(null);
  const userVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const otherUser = activeChat?.isGroup
    ? null
    : activeChat?.participants?.find((p) => p._id !== user?._id);

  // Configuration for WebRTC ICE Servers (STUN)
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  useEffect(() => {
    if (!socket) return;

    // Listen for incoming call
    socket.on('call_incoming', (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerName(data.name);
      setCallerSignal(data.signal);
    });

    // Listen for call accepted
    socket.on('call_accepted', async (signal) => {
      setCallAccepted(true);
      if (peerConnectionRef.current && signal) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        } catch (err) {
          console.error('Error setting remote description:', err);
        }
      }
    });

    // Listen for ICE Candidates
    socket.on('ice_candidate', async (candidate) => {
      if (peerConnectionRef.current && candidate) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      }
    });

    // Listen for ended call
    socket.on('call_ended', () => {
      leaveCall();
    });

    return () => {
      socket.off('call_incoming');
      socket.off('call_accepted');
      socket.off('ice_candidate');
      socket.off('call_ended');
    };
  }, [socket]);

  // Start Local Media Stream (Camera & Mic)
  const startLocalStream = async () => {
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(currentStream);
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = currentStream;
      }
      return currentStream;
    } catch (err) {
      console.error('Failed to access camera/mic:', err);
    }
  };

  // Initiate Call
  const callStudent = async () => {
    if (!otherUser || !socket) return;

    const mediaStream = await startLocalStream();
    const peer = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = peer;

    // Add local tracks to peer connection
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => peer.addTrack(track, mediaStream));
    }

    // Handle remote track arriving
    peer.ontrack = (event) => {
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE Candidates
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice_candidate', {
          to: otherUser._id,
          candidate: event.candidate,
        });
      }
    };

    // Create SDP Offer
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit('call_user', {
      userToCall: otherUser._id,
      signalData: offer,
      from: user._id,
      name: user.name,
      chatId: activeChat._id,
    });
  };

  // Answer Incoming Call
  const answerCall = async () => {
    setCallAccepted(true);
    setReceivingCall(false);

    const mediaStream = await startLocalStream();
    const peer = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = peer;

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => peer.addTrack(track, mediaStream));
    }

    peer.ontrack = (event) => {
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = event.streams[0];
      }
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice_candidate', {
          to: caller,
          candidate: event.candidate,
        });
      }
    };

    if (callerSignal) {
      await peer.setRemoteDescription(new RTCSessionDescription(callerSignal));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit('answer_call', { to: caller, signal: answer });
    }
  };

  // Toggle Mute Audio
  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
      setIsAudioMuted(!isAudioMuted);
    }
  };

  // Toggle Video Camera
  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
      setIsVideoOff(!isVideoOff);
    }
  };

  // Toggle Screen Sharing
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const videoTrack = screenStream.getVideoTracks()[0];

        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders().find((s) => s.track.kind === 'video');
          if (sender) sender.replaceTrack(videoTrack);
        }

        if (myVideoRef.current) myVideoRef.current.srcObject = screenStream;

        videoTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.error('Screen sharing error:', err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (stream && peerConnectionRef.current) {
      const videoTrack = stream.getVideoTracks()[0];
      const sender = peerConnectionRef.current.getSenders().find((s) => s.track.kind === 'video');
      if (sender) sender.replaceTrack(videoTrack);
      if (myVideoRef.current) myVideoRef.current.srcObject = stream;
    }
    setIsScreenSharing(false);
  };

  // End Call & Cleanup
  const leaveCall = () => {
    setCallEnded(true);
    if (socket && otherUser) {
      socket.emit('end_call', { to: otherUser._id, chatId: activeChat?._id });
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setCallAccepted(false);
    setReceivingCall(false);
    onClose();
  };

  if (!isOpen && !receivingCall) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl p-6 shadow-2xl relative flex flex-col justify-between min-h-[500px]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                WebRTC Live Video & Pair Programming
              </h3>
              <p className="text-xs text-slate-400">
                {otherUser ? `Calling ${otherUser.name}` : 'Peer-to-Peer Stream'}
              </p>
            </div>
          </div>

          <button onClick={leaveCall} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Incoming Call Notification */}
        {receivingCall && !callAccepted && (
          <div className="bg-indigo-600/20 border border-indigo-500/40 p-4 rounded-2xl flex items-center justify-between mb-4 animate-bounce">
            <div className="flex items-center gap-3">
              <PhoneCall className="w-6 h-6 text-indigo-400 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-white">{callerName} is calling you...</p>
                <p className="text-xs text-indigo-300">Click Answer to start live video pair programming</p>
              </div>
            </div>
            <button
              onClick={answerCall}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition"
            >
              Answer Call
            </button>
          </div>
        )}

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mb-6">
          {/* My Video Stream */}
          <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center min-h-[220px]">
            <video playsInline muted ref={myVideoRef} autoPlay className="w-full h-full object-cover" />
            <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur text-slate-200 px-3 py-1 rounded-lg text-xs font-semibold">
              You {isScreenSharing && '(Screen Sharing)'}
            </span>
          </div>

          {/* Remote Peer Video Stream */}
          <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center min-h-[220px]">
            {callAccepted && !callEnded ? (
              <video playsInline ref={userVideoRef} autoPlay className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6 text-slate-500">
                <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-40 animate-pulse" />
                <p className="text-xs">Waiting for peer video stream...</p>
              </div>
            )}
            {callAccepted && (
              <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur text-slate-200 px-3 py-1 rounded-lg text-xs font-semibold">
                {otherUser?.name || 'Peer'}
              </span>
            )}
          </div>
        </div>

        {/* Video Call Controls Bar */}
        <div className="flex items-center justify-center gap-3 pt-3 border-t border-slate-800">
          {!callAccepted && !stream && (
            <button
              onClick={callStudent}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition"
            >
              <Video className="w-4 h-4" /> Start Video Stream
            </button>
          )}

          {stream && (
            <>
              <button
                onClick={toggleMute}
                className={`p-3.5 rounded-2xl transition ${
                  isAudioMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleVideo}
                className={`p-3.5 rounded-2xl transition ${
                  isVideoOff ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleScreenShare}
                className={`p-3.5 rounded-2xl transition ${
                  isScreenSharing ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
              >
                <Monitor className="w-5 h-5" />
              </button>

              <button
                onClick={leaveCall}
                className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-lg"
                title="End Call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
