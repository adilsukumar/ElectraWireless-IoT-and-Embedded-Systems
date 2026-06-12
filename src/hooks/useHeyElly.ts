import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

export function useHeyElly({ onWakeWord, pause }: { onWakeWord?: (cmd?: string) => void, pause?: boolean } = {}) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (pause) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    // Check if the browser supports Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API is not supported in this browser/webview.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      // Get the latest transcript
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.toLowerCase();
      
      console.log("Heard:", transcript);

      if (transcript.includes("hey elly") || transcript.includes("hi elly")) {
        let cmd = transcript.replace("hey elly", "").replace("hi elly", "").trim();
        toast.success("ELLY: I am awake!");
        if (onWakeWord) onWakeWord(cmd || undefined);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        toast.error("Microphone permission denied for Hey Elly.");
      }
    };

    recognition.onend = () => {
      // Automatically restart listening if it stops and we are not paused
      setIsListening(false);
      if (!pause) {
        try {
          recognition.start();
        } catch (e) {
          // Ignore errors if already started
        }
      }
    };

    recognitionRef.current = recognition;

    // Start listening initially
    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition automatically", e);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null; // Prevent restart loop on unmount
        recognitionRef.current.stop();
      }
    };
  }, [pause, onWakeWord]);

  return { isListening };
}

export async function enableBackgroundListening() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission !== 'granted') {
      try {
        await Notification.requestPermission();
      } catch (e) {}
    }
  }
  
  const bgMode = (window as any).cordova?.plugins?.backgroundMode;
  if (bgMode) {
    try {
      bgMode.setDefaults({
          title: 'Elly AI Background Service',
          text: 'Listening for "Hey Elly"... (Tap to open app)',
          icon: 'ic_launcher',
          color: 'A855F7',
          resume: true,
          hidden: false,
          bigText: true
      });
      bgMode.enable();
      bgMode.disableWebViewOptimizations();
      bgMode.disableBatteryOptimizations();
      toast.success("Foreground Service Started! You can now close the app.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to start service. Check permissions.");
    }
  } else {
    toast.error("Background plugin not loaded. Ensure you are on a real Android phone.");
  }
}

export function disableBackgroundListening() {
  const bgMode = (window as any).cordova?.plugins?.backgroundMode;
  if (bgMode) {
    bgMode.disable();
    toast("Background Service Stopped.");
  }
}
