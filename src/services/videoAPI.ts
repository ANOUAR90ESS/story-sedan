export async function generateVideoWithSeedance(apiKey: string, prompt: string, imageUrl: string): Promise<string> {
  const res = await fetch("https://api.seedance.ai/v1/videos/generate", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt, image_url: imageUrl, model: "seedance-2" })
  });
  if (!res.ok) {
     throw new Error("Seedance API generation failed");
  }
  const data = await res.json();
  let taskId = data.id || data.task_id;

  if (!taskId) throw new Error("Seedance API missing task_id in response");

  // Poll
  for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const statusRes = await fetch(`https://api.seedance.ai/v1/videos/status/${taskId}`, {
            headers: { "Authorization": `Bearer ${apiKey}` },
            method: "GET"
        });
        if (!statusRes.ok) continue;
        const statusData = await statusRes.json();
        if (statusData.status === "completed" || statusData.state === "completed") {
            return statusData.video_url || statusData.url || "";
        } else if (statusData.status === "failed" || statusData.state === "failed") {
            throw new Error("Seedance generation failed");
        }
    }
    throw new Error("Seedance generation timeout");
}

export async function generateVideoWithLuma(apiKey: string, prompt: string, imageUrl: string): Promise<string> {

    const res = await fetch("https://api.lumalabs.ai/dream-machine/v1/generations", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt, image_url: imageUrl })
    });
    if (!res.ok) throw new Error("Luma API generation failed: " + await res.text());
    const data = await res.json();
    let generationId = data.id;

    // Poll for status
    for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const statusRes = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`, {
            headers: { "Authorization": `Bearer ${apiKey}` }
        });
        if (!statusRes.ok) continue;
        const statusData = await statusRes.json();
        if (statusData.state === "completed") {
            return statusData.assets.video;
        } else if (statusData.state === "failed") {
            throw new Error("Luma generation failed. " + statusData.failure_reason);
        }
    }
    throw new Error("Luma generation timeout");
}

export async function generateVideoWithHeyGen(payload: any): Promise<any> {
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
    return res.json();
}

export async function translateVideo(videoUrl: string, outputLanguages: string[]): Promise<any> {
    const res = await fetch("/api/translate-video", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ videoUrl, outputLanguages })
    });
    if (!res.ok) {
        throw new Error("Failed to initiate video translation");
    }
    return res.json();
}

export async function generateVideoWithKling(apiKey: string, prompt: string, imageUrl: string): Promise<string> {
  const res = await fetch("https://api.klingai.com/v1/videos/image2video", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt, image_url: imageUrl, model: "kling-v1" })
  });
  if (!res.ok) {
     throw new Error("Kling API generation failed");
  }
  const data = await res.json();
  let taskId = data.data?.task_id;

  if (!taskId) throw new Error("Kling API missing task_id in response");

  // Poll
  for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const statusRes = await fetch(`https://api.klingai.com/v1/videos/image2video/${taskId}`, {
            headers: { "Authorization": `Bearer ${apiKey}` },
            method: "GET"
        });
        if (!statusRes.ok) continue;
        const statusData = await statusRes.json();
        if (statusData.data?.task_status === "succeed" || statusData.data?.task_status === "completed") {
            return statusData.data.task_result?.videos?.[0]?.url || "";
        } else if (statusData.data?.task_status === "failed") {
            throw new Error("Kling generation failed");
        }
    }
    throw new Error("Kling generation timeout");
}
