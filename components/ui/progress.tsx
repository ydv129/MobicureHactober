export function Progress({ value = 0 }: { value?: number }) { return <progress max={100} value={value} /> }
