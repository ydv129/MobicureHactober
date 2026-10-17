"use client"
export default function FileDropzone({ onFile }: { onFile: (file: File) => void }) { return <input type="file" onChange={(event) => event.target.files?.[0] && onFile(event.target.files[0])} /> }
