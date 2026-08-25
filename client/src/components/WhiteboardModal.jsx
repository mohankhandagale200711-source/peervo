import React, { useState, useEffect, useRef, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { Palette, Download, Trash2, X, Sparkles, Circle, Square, Minus, Edit3, Eraser } from 'lucide-react';

export default function WhiteboardModal({ activeChat, isOpen, onClose }) {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const [color, setColor] = useState('#818cf8'); // Default indigo
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState('brush'); // 'brush' | 'rectangle' | 'circle' | 'line' | 'eraser'

  const colors = ['#ffffff', '#818cf8', '#38bdf8', '#34d399', '#facc15', '#f87171', '#c084fc', '#94a3b8'];

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Resize canvas to fit container
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Fill dark background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [isOpen]);

  useEffect(() => {
    if (!socket || !activeChat) return;

    // Listen for live drawing strokes from other students in the room
    const handleRemoteDraw = (data) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      ctx.save();
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (data.tool === 'eraser') {
        ctx.strokeStyle = '#090d16';
      }

      if (data.tool === 'brush' || data.tool === 'eraser') {
        ctx.beginPath();
        ctx.moveTo(data.x0, data.y0);
        ctx.lineTo(data.x1, data.y1);
        ctx.stroke();
      } else if (data.tool === 'rectangle') {
        ctx.strokeRect(data.x0, data.y0, data.width, data.height);
      } else if (data.tool === 'circle') {
        ctx.beginPath();
        ctx.arc(data.x0, data.y0, data.radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (data.tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(data.x0, data.y0);
        ctx.lineTo(data.x1, data.y1);
        ctx.stroke();
      }

      ctx.restore();
    };

    const handleRemoteClear = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    socket.on('whiteboard_draw', handleRemoteDraw);
    socket.on('whiteboard_clear', handleRemoteClear);

    return () => {
      socket.off('whiteboard_draw');
      socket.off('whiteboard_clear');
    };
  }, [socket, activeChat]);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    isDrawing.current = true;
    const coords = getCanvasCoords(e);
    startPos.current = coords;
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCanvasCoords(e);

    if (tool === 'brush' || tool === 'eraser') {
      ctx.save();
      ctx.strokeStyle = tool === 'eraser' ? '#090d16' : color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(startPos.current.x, startPos.current.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      ctx.restore();

      if (socket && activeChat) {
        socket.emit('whiteboard_draw', {
          chatId: activeChat._id,
          tool,
          x0: startPos.current.x,
          y0: startPos.current.y,
          x1: coords.x,
          y1: coords.y,
          color,
          lineWidth,
        });
      }

      startPos.current = coords;
    }
  };

  const stopDrawing = (e) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (tool !== 'brush' && tool !== 'eraser') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const coords = getCanvasCoords(e);

      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';

      let drawPayload = { chatId: activeChat._id, tool, color, lineWidth };

      if (tool === 'rectangle') {
        const width = coords.x - startPos.current.x;
        const height = coords.y - startPos.current.y;
        ctx.strokeRect(startPos.current.x, startPos.current.y, width, height);
        drawPayload = { ...drawPayload, x0: startPos.current.x, y0: startPos.current.y, width, height };
      } else if (tool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(coords.x - startPos.current.x, 2) + Math.pow(coords.y - startPos.current.y, 2)
        );
        ctx.beginPath();
        ctx.arc(startPos.current.x, startPos.current.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        drawPayload = { ...drawPayload, x0: startPos.current.x, y0: startPos.current.y, radius };
      } else if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPos.current.x, startPos.current.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        drawPayload = {
          ...drawPayload,
          x0: startPos.current.x,
          y0: startPos.current.y,
          x1: coords.x,
          y1: coords.y,
        };
      }

      ctx.restore();

      if (socket && activeChat) {
        socket.emit('whiteboard_draw', drawPayload);
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (socket && activeChat) {
      socket.emit('whiteboard_clear', { chatId: activeChat._id });
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `Peervo_Whiteboard_${Date.now()}.png`;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-3xl p-6 shadow-2xl relative flex flex-col justify-between h-[85vh]">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                Real-Time Whiteboard & Diagram Canvas
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </h3>
              <p className="text-xs text-slate-400">
                Collaborative Architecture & Flowchart Drawing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadCanvas}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
              title="Download Canvas Image"
            >
              <Download className="w-3.5 h-3.5" /> Save PNG
            </button>

            <button
              onClick={clearCanvas}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold rounded-xl border border-rose-500/30 transition"
              title="Clear Canvas"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>

            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawing Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 my-3">
          {/* Tools Selector */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setTool('brush')}
              className={`p-2 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                tool === 'brush' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Brush Pen"
            >
              <Edit3 className="w-4 h-4" /> Brush
            </button>

            <button
              onClick={() => setTool('rectangle')}
              className={`p-2 rounded-lg text-xs font-bold transition ${
                tool === 'rectangle' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Rectangle"
            >
              <Square className="w-4 h-4" />
            </button>

            <button
              onClick={() => setTool('circle')}
              className={`p-2 rounded-lg text-xs font-bold transition ${
                tool === 'circle' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Circle"
            >
              <Circle className="w-4 h-4" />
            </button>

            <button
              onClick={() => setTool('line')}
              className={`p-2 rounded-lg text-xs font-bold transition ${
                tool === 'line' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Line"
            >
              <Minus className="w-4 h-4" />
            </button>

            <button
              onClick={() => setTool('eraser')}
              className={`p-2 rounded-lg text-xs font-bold transition ${
                tool === 'eraser' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Eraser"
            >
              <Eraser className="w-4 h-4" />
            </button>
          </div>

          {/* Color Palette Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">Color:</span>
            <div className="flex items-center gap-1.5">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition ${
                    color === c ? 'scale-125 border-white shadow-md' : 'border-transparent hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                ></button>
              ))}
            </div>
          </div>

          {/* Line Width */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">Stroke:</span>
            <select
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 text-white text-xs px-2.5 py-1.5 rounded-xl font-bold focus:outline-none"
            >
              <option value={2}>Thin (2px)</option>
              <option value={4}>Medium (4px)</option>
              <option value={8}>Thick (8px)</option>
              <option value={14}>Heavy (14px)</option>
            </select>
          </div>
        </div>

        {/* Live Canvas Area */}
        <div className="flex-1 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 relative cursor-crosshair shadow-inner">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full h-full touch-none"
          />
        </div>
      </div>
    </div>
  );
}
