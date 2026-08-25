import React, { useState, useEffect, useRef, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Sparkles, X, PhoneCall } from 'lucide-react';

export default function AudioCallModal({ activeChat, isOpen, onClose }) {
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
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);

  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const otherUser = activeChat?.isGroup
    ? null
    : activeChat?.participants?.find((p) => p._id !== user?._id);

  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('call_incoming_audio', (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerName(data.name);
      setCallerSignal(data.signal);
    });

    socket.on('call_accepted_audio', async (signal) => {
      setCallAccepted(true);
      if (peerConnectionRef.current && signal) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        } catch (err) {
          console.error('Error setting remote audio description:', err);
        }
      }
    });

    socket.on('ice_candidate_audio', async (candidate) => {
      if (peerConnectionRef.current && candidate) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding audio ICE candidate:', err);
        }
      }
    });

    socket.on('call_ended_audio', () => {
      leaveCall();
    });

    return () => {
      socket.off('call_incoming_audio');
      socket.off('call_accepted_audio');
      socket.off('ice_candidate_audio');
      socket.off('call_ended_audio');
    };
  }, [socket]);

  const startLocalAudioStream = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setStream(audioStream);
      return audioStream;
    } catch (err) {
      console.error('Failed to access microphone:', err);
    }
  };

  const callStudentAudio = async () => {
    if (!otherUser || !socket) return;

    const mediaStream = await startLocalAudioStream();
    const peer = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = peer;

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => peer.addTrack(track, mediaStream));
    }

    peer.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice_candidate_audio', {
          to: otherUser._id,
          candidate: event.candidate,
        });
      }
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit('call_user_audio', {
      userToCall: otherUser._id,
      signalData: offer,
      from: user._id,
      name: user.name,
      chatId: activeChat._id,
    });
  };

  const answerAudioCall = async () => {
    setCallAccepted(true);
    setReceivingCall(false);

    const mediaStream = await startLocalAudioStream();
    const peer = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = peer;

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => peer.addTrack(track, mediaStream));
    }

    peer.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice_candidate_audio', {
          to: caller,
          candidate: event.candidate,
        });
      }
    };

    if (callerSignal) {
      await peer.setRemoteDescription(new RTCSessionDescription(callerSignal));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit('answer_call_audio', { to: caller, signal: answer });
    }
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleSpeaker = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !isSpeakerMuted;
      setIsSpeakerMuted(!isSpeakerMuted);
    }
  };

  const leaveCall = () => {
    setCallEnded(true);
    if (socket && otherUser) {
      socket.emit('end_call_audio', { to: otherUser._id, chatId: activeChat?._id });
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
      {/* Hidden Audio Output Tag */}
      <audio ref={remoteAudioRef} autoPlay />

      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative flex flex-col justify-between items-center min-h-[420px]">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">
                WebRTC Audio Call
              </h3>
              <p className="text-[11px] text-slate-400">High-Definition Voice Stream</p>
            </div>
          </div>

          <button onClick={leaveCall} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Incoming Call Alert */}
        {receivingCall && !callAccepted && (
          <div className="w-full bg-emerald-600/20 border border-emerald-500/40 p-4 rounded-2xl flex items-center justify-between mb-4 animate-bounce">
            <div className="flex items-center gap-3">
              <PhoneCall className="w-6 h-6 text-emerald-400 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-white">{callerName} is calling...</p>
                <p className="text-[10px] text-emerald-300">Incoming Audio Call</p>
              </div>
            </div>
            <button
              onClick={answerAudioCall}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              Answer
            </button>
          </div>
        )}

        {/* Voice Activity Pulse Avatar */}
        <div className="flex flex-col items-center justify-center my-6">
          <div className="relative">
            <div className={`absolute -inset-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur opacity-40 ${callAccepted ? 'animate-ping' : ''}`}></div>
            {otherUser?.profilePic ? (
              <img
                src={otherUser.profilePic}
                alt=""
                className="w-24 h-24 rounded-full object-cover border-4 border-slate-800 relative z-10 shadow-2xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white font-extrabold text-2xl border-4 border-slate-800 relative z-10 shadow-2xl">
                {otherUser?.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>

          <h4 className="text-lg font-extrabold text-white mt-4">{otherUser?.name || 'Student Peer'}</h4>
          <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {callAccepted ? 'Voice Call Connected' : receivingCall ? 'Incoming Audio Call...' : 'Connecting Audio Stream...'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4 w-full pt-4 border-t border-slate-800">
          {!callAccepted && !stream && (
            <button
              onClick={callStudentAudio}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/30 transition"
            >
              <Phone className="w-4 h-4" /> Start Audio Call
            </button>
          )}

          {stream && (
            <>
              <button
                onClick={toggleMute}
                className={`p-3.5 rounded-2xl transition ${
                  isAudioMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleSpeaker}
                className={`p-3.5 rounded-2xl transition ${
                  isSpeakerMuted ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title={isSpeakerMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <button
                onClick={leaveCall}
                className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-lg"
                title="End Audio Call"
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
