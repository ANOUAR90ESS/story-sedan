export interface HeyGenVideoPayload {
  title?: string;
  caption?: boolean;
  dimension?: {
    width: number;
    height: number;
  };
  video_inputs: Array<{
    character: {
      type: string;
      avatar_id: string;
      avatar_style: string;
    };
    voice: {
      type: string;
      voice_id: string;
      input_text: string;
      speed?: number;
    };
    background: {
      type: "color" | "image" | "video";
      value?: string;
      url?: string;
    };
  }>;
}

export async function generateHeyGenVideo(payload: HeyGenVideoPayload): Promise<{ video_id: string }> {
  const res = await fetch("/api/heygen-generate-video", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to generate video with HeyGen: ${err.details || res.statusText}`);
  }
  
  const data = await res.json();
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data.data; // Usually { video_id: "..." }
}

export async function checkHeyGenVideoStatus(taskId: string): Promise<any> {
  const res = await fetch(`/api/heygen-video-status/${taskId}`);
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to check video status: ${err.details || res.statusText}`);
  }
  
  const data = await res.json();
  return data.data;
}

export async function fetchHeyGenAvatars(): Promise<any[]> {
  const res = await fetch("/api/heygen-avatars");
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to fetch avatars: ${err.details || res.statusText}`);
  }
  const data = await res.json();
  return data.data?.avatars || [];
}

export async function fetchHeyGenVoices(): Promise<any[]> {
  const res = await fetch("/api/heygen-voices");
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to fetch voices: ${err.details || res.statusText}`);
  }
  const data = await res.json();
  return data.data?.voice_list || data.data?.voices || [];
}

