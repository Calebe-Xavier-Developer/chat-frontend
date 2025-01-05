'use client';
import { useState, useRef } from 'react';
import { sendMessage } from '@/services/chatApi';
import { sendMessageSocket, emitTyping } from '@/services/socket';
import { useChat } from '@/context/ChatContext';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export default function MessageInput() {
  const { chosenChat } = useChat();
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      setAudioDuration(0);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      audioTimerRef.current = setInterval(() => {
        setAudioDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('❌ Error starting audio recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (audioTimerRef.current) clearInterval(audioTimerRef.current);
  };

  const handleSendMessage = async () => {
    try {
      if (message.trim()) {
        await sendMessage(chosenChat.chat_id, message, 'text');
        sendMessageSocket(chosenChat.chat_id, message, 'text');
        setMessage('');
      } else if (file) {
        const fileUrl = URL.createObjectURL(file);
        const fileType = file.type.startsWith('audio') ? 'audio' : 'image';
        await sendMessage(chosenChat.chat_id, fileUrl, fileType);
        sendMessageSocket(chosenChat.chat_id, fileUrl, fileType);
        setFile(null);
      } else if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        await sendMessage(chosenChat.chat_id, audioUrl, 'audio');
        sendMessageSocket(chosenChat.chat_id, audioUrl, 'audio');
        setAudioBlob(null);
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  };

  const handleTyping = (e: React.KeyboardEvent<HTMLInputElement>) => {
    emitTyping(chosenChat.chat_id);
    if (e.key === 'Enter') handleSendMessage();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const resetAudioState = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioDuration(0);
    setIsRecording(false);
    if (audioTimerRef.current) clearInterval(audioTimerRef.current);
  };

  return (
    <div className="relative w-full h-[10%] flex rounded-b-[24px] justify-between items-center p-2 bg-dark-blue">
      {file && (
        <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-md p-2">
          {file.type.startsWith('image') ? (
            <img src={URL.createObjectURL(file)} alt="Preview" className="w-[200px] h- object-cover" />
          ) : (
            <span className="text-gray-500">{file.name}</span>
          )}
          <button onClick={() => setFile(null)} className="text-red-500">
            <DeleteOutlineIcon />
          </button>
        </div>
      )}

      {isRecording ? (
        <div className="flex items-center justify-end space-x-2 w-full">
          <button onClick={() => resetAudioState()} className="bg-red-500 text-white p-2 rounded-md">
            <DeleteOutlineIcon />
          </button>
          <div className="bg-gray-200 p-2 rounded-md text-black">
            {Math.floor(audioDuration / 60)}:{String(audioDuration % 60).padStart(2, '0')}
          </div>
          <button onClick={stopRecording} className="bg-blue-500 text-white p-2 rounded-md">
            <StopCircleIcon />
          </button>
          <button disabled className="bg-gray-500 text-white p-2 rounded-md">
            <SendIcon />
          </button>
        </div>
      ) : audioBlob ? (
        <div className="flex items-center justify-end space-x-2 w-full">
          <button onClick={() => resetAudioState()} className="bg-red-500 text-white p-2 rounded-md">
            <DeleteOutlineIcon />
          </button>
          <div>
            {audioUrl && (
              <audio
                src={audioUrl}
                controls
                controlsList="nodownload noremoteplayback nofullscreen"
                className="custom-audio"
              />
            )}
          </div>
          <button onClick={handleSendMessage} className="bg-blue-500 text-white p-2 rounded-md">
            <SendIcon />
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleTyping}
            disabled={!!file}
            placeholder="Type a message"
            className="w-3/5 border-none outline-none bg-transparent text-white placeholder:text-white p-2 rounded-md"
          />
          <div className='w-2/5 flex justify-end items-center space-x-2'>
            <input type="file" id="fileInput" accept="image/*,audio/*" onChange={handleFileChange} className="hidden" />
            <label htmlFor="fileInput" className="bg-blue-500 text-white p-2 rounded-md cursor-pointer">
              <AttachFileIcon />
            </label>
            <button onClick={startRecording} className="bg-blue-500 text-white p-2 rounded-md" disabled={!!file}>
              <MicIcon />
            </button>
            <button onClick={handleSendMessage} className="bg-blue-500 text-white p-2 rounded-md">
              <SendIcon />
            </button>
          </div>
        </>
      )}
    </div>
  );
}