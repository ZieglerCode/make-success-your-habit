import type {MediaAsset} from "@/lib/content-store";

type UploadOptions = {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
  xhrFactory?: () => XMLHttpRequest;
};

export function uploadMedia(formData: FormData, options: UploadOptions = {}): Promise<MediaAsset> {
  return new Promise((resolve, reject) => {
    const xhr = options.xhrFactory?.() ?? new XMLHttpRequest();
    xhr.open("POST", "/api/media");
    xhr.responseType = "json";
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) options.onProgress?.(Math.round(event.loaded / event.total * 100));
    };
    xhr.onload = () => {
      const data = xhr.response || safeJson(xhr.responseText);
      if (xhr.status >= 200 && xhr.status < 300) resolve(data as MediaAsset);
      else reject(new Error(data?.error || "Die Datei konnte nicht hochgeladen werden."));
    };
    xhr.onerror = () => reject(new Error("Netzwerkfehler beim Upload."));
    xhr.onabort = () => reject(new DOMException("Upload abgebrochen.", "AbortError"));
    const abort = () => xhr.abort();
    options.signal?.addEventListener("abort", abort, {once: true});
    xhr.onloadend = () => options.signal?.removeEventListener("abort", abort);
    xhr.send(formData);
  });
}

function safeJson(value: string) {
  try { return JSON.parse(value); } catch { return null; }
}
