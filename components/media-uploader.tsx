"use client";

import { useState } from "react";

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
  const [status, setStatus] = useState("");

  async function upload(file?: File) {
    if (!file) return;
    if (![/^image\/jpeg$/, /^image\/png$/, /^image\/webp$/].some((type) => type.test(file.type))) {
      setStatus("Choose a JPEG, PNG or WebP image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setStatus("The image must be smaller than 8 MB.");
      return;
    }
    if (publication) {
      const bitmap = await createImageBitmap(file);
      const width = bitmap.width;
      const height = bitmap.height;
      const ratio = width / height;
      bitmap.close();
      if (width < 1200 || height < 750 || ratio < 1.5 || ratio > 1.72) {
        setStatus("Publication images must be at least 1200 × 750 px with a landscape 8:5 shape.");
        return;
      }
    }
    if (avatar) {
      const bitmap = await createImageBitmap(file);
      const width = bitmap.width;
      const height = bitmap.height;
      const ratio = width / height;
      bitmap.close();
      if (width < 300 || height < 300 || ratio < 0.8 || ratio > 1.2) {
        setStatus("Author avatars must be at least 300 × 300 px and approximately square.");
        return;
      }
    }

    setStatus("Uploading…");
    const data = new FormData();
    data.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body: data });
    const result = await response.json();
    if (!response.ok) {
      setStatus(result.error ?? "The image could not be uploaded.");
      return;
    }
    onChange(result.url);
    setStatus("Image uploaded.");
  }

  return (
    <div className={`media-uploader ${avatar ? "avatar-uploader" : ""}`}>
      <div className="media-uploader-heading">
        <div><strong>{label}</strong><small>{publication ? "1600 × 1000 px recommended. Minimum 1200 × 750 px; JPEG, PNG or WebP; maximum 8 MB." : avatar ? "Square image recommended. Minimum 300 × 300 px; maximum 8 MB." : "JPEG, PNG or WebP; maximum 8 MB."}</small></div>
        {value && <button type="button" onClick={() => onChange("")}>Remove image</button>}
      </div>
      {value && <div className="media-preview">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={value} alt="Current upload preview" /></div>}
      <label className="media-upload-button"><span>{value ? "Replace image" : "Choose image"}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => upload(event.target.files?.[0])} /></label>
      {status && <p className="media-upload-status" role="status">{status}</p>}
    </div>
  );
}
