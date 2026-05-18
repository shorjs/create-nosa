import { useServerFn } from '@tanstack/react-start'
import { getCount } from './counter.functions'
import { useState } from 'react'

export function Counter() {
  const fetchCount = useServerFn(getCount)
  const [count, setCount] = useState(0)

  return (
    <div>
      <h2 className="font-medium">Counter example</h2>
      <p>Client count: {count}</p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          className="cursor-pointer rounded-sm border px-3 py-1 text-sm hover:bg-neutral-100"
        >
          Increment
        </button>
        <button
          type="button"
          onClick={async () => {
            const data = await fetchCount()
            setCount(data.count)
          }}
          className="cursor-pointer rounded-sm border px-3 py-1 text-sm hover:bg-neutral-100"
        >
          Fetch from server
        </button>
      </div>
    </div>
  )
}
