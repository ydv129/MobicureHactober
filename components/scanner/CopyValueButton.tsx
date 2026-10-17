"use client"
export default function CopyValueButton({ value }: { value: string }) { return <button type="button" onClick={() => navigator.clipboard?.writeText(value)}>Copy</button> }
