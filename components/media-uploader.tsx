"use client";

import { ChangeEvent, useRef, useState } from "react";

export function MediaUploader({
  value,
  onChange,
  label = "Image",
  publication = false,
  avatar = false,
}: {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  publication?: boolean;
  avatar?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  async function upload(file?: File) {
    if (!file || uploading) return;
    setStatus("");
    try {
      if (![/^image\/jpeg$/, /^image\/png$/, /^image\/webp$/].some((type) => type.test(file.type))) {
        setStatus("Choose a JPEG, PNG or WebP image.");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setStatus("The image must be smaller than 8 MB.");
        return;
      }
      if (publication || avatar) {
        const bitmap = await createImageBitmap(file);
        const width = bitmap.width;
        const height = bitmap.height;
        const ratio = width / height;
        bitmap.close();
        if (publication && (width < 1200 || height < 750 || ratio < 1.5 || ratio > 1.72)) {
          setStatus("Publication images must be at least 1200 × 750 px with a landscape 8:5 shape.");
          return;
        }
        if (avatar && (width < 300 || height < 300 || ratio < 0.8 || ratio > 1.2)) {
          setStatus("Author avatars must be at least 300 × 300 px and approximately square.");
          return;
        }
      }

      setUploading(true);
      setStatus("Uploading…");
      const data = new FormData();
      data.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: data });
      const responseText = await response.text();
      let result: { error?: unknown; url?: unknown } = {};
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        // The route may be intercepted by a proxy or hosting error page.
      }
      if (!response.ok) {
        const message = typeof result.error === "string" ? result.error : `The image could not be uploaded (${response.status}).`;
        throw new Error(message);
      }
      if (typeof result.url !== "string" || !result.url.trim()) {
        throw new Error("The upload completed without returning an image URL.");
      }
      onChange(result.url);
      setStatus("Image uploaded. Publish changes when you are ready.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The image could not be uploaded.");
    } finally {
      setUploading(false);
    }
  }

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    await upload(input.files?.[0]);
    input.value = "";
  }

  return (
    <div className={`media-uploader ${avatar ? "avatar-uploader" : ""}`}>
      <div className="media-uploader-heading">
        <div><strong>{label}</strong><small>{publication ? "1600 × 1000 px recommended. Minimum 1200 × 750 px; JPEG, PNG or WebP; maximum 8 MB." : avatar ? "Square image recommended. Minimum 300 × 300 px; maximum 8 MB." : "JPEG, PNG or WebP; maximum 8 MB."}</small></div>
        {value && <button type="button" onClick={() => onChange("")}>Remove image</button>}
      </div>
      {value && <div className="media-preview">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={value} alt="Current upload preview" /></div>}
      <button className="media-upload-button" type="button" disabled={uploading} onClick={() => inputRef.current?.click()}>{uploading ? "Uploading…" : value ? "Replace image" : "Choose image"}</button>
      <input ref={inputRef} className="media-upload-input" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={chooseFile} tabIndex={-1} />
      {status && <p className="media-upload-status" role="status">{status}</p>}
    </div>
  );
}
