"use client"

import { useState } from "react"

export default function DropZone({ onFile }: { onFile: (file: File) => void }) {
  const [dragging, setDragging] = useState(false)
  const acceptFile = (file?: File) => {
    if (file?.type.startsWith("image/")) onFile(file)
  }

  return <label className={`drop-zone ${dragging ? "drop-zone--active" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); acceptFile(event.dataTransfer.files[0]) }}>
    <input type="file" accept="image/*" onChange={(event) => acceptFile(event.target.files?.[0])} />
    <span className="drop-zone__orb">+</span>
    <span className="eyebrow">Evidence intake / 01</span>
    <strong>Drop an image to begin</strong>
    <span className="drop-zone__hint">PNG, JPG, or WEBP. Local pixel analysis with an optional HF signal.</span>
    <span className="drop-zone__action">Choose file <b>↗</b></span>
  </label>
}
