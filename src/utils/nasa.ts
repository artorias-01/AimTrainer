export interface NasaApodItem {
  title: string;
  url: string;
  hdurl?: string;
  date: string;
  copyright?: string;
  explanation?: string;
  media_type: string;
}

// Note: DEMO_KEY is rate-limited (30 req/hr). Users can paste a free personal key from api.nasa.gov in Settings.
export const DEFAULT_NASA_API_KEY = 'DEMO_KEY';

export function getActiveNasaApiKey(): string {
  const userKey = localStorage.getItem('aimtt_nasa_api_key_v1');
  if (userKey && userKey.trim().length > 0) {
    return userKey.trim();
  }
  return DEFAULT_NASA_API_KEY;
}

export function saveNasaApiKey(apiKey: string): void {
  localStorage.setItem('aimtt_nasa_api_key_v1', apiKey.trim());
}

export async function fetchNasaApodGallery(
  count: number = 8,
  apiKeyOverride?: string
): Promise<{ success: boolean; data: NasaApodItem[]; error?: string }> {
  const apiKey = apiKeyOverride || getActiveNasaApiKey();
  const url = `https://api.nasa.gov/planetary/apod?api_key=${encodeURIComponent(apiKey)}&count=${count}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 429) {
        return {
          success: false,
          data: [],
          error: 'NASA API Rate limit exceeded (30 req/hr for DEMO_KEY). Please add your personal API key from api.nasa.gov.',
        };
      }
      return {
        success: false,
        data: [],
        error: `NASA API Error (${res.status}): ${res.statusText}`,
      };
    }

    const json = await res.json();
    const rawItems: NasaApodItem[] = Array.isArray(json) ? json : [json];
    const imageItems = rawItems.filter(
      (item) => item && item.media_type === 'image' && (item.url || item.hdurl)
    );

    return {
      success: true,
      data: imageItems,
    };
  } catch (err: any) {
    console.error('Failed to fetch NASA APOD gallery:', err);
    return {
      success: false,
      data: [],
      error: 'Network error fetching NASA space imagery. Check internet connection.',
    };
  }
}

export async function convertImageUrlToDataUrl(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas 2d context'));
          return;
        }

        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      // Fallback: fetch blob if canvas crossOrigin fails
      fetch(imageUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    };

    img.src = imageUrl;
  });
}
