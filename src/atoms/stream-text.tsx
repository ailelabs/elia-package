"use client";

import { useEffect, useRef, useState } from "react";

/* Word-by-word streaming text; words resolve out of blur. */
export function StreamText({
  text,
  wordMs = 55,
  onProgress,
  onDone,
}: {
  text: string;
  wordMs?: number;
  onProgress?: () => void;
  onDone?: () => void;
}) {
  const words = useRef(text.split(" "));
  const [count, setCount] = useState(0);
  const done = count >= words.current.length;

  useEffect(() => {
    words.current = text.split(" ");
    setCount(0);
  }, [text]);

  useEffect(() => {
    if (done) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => {
      setCount((c) => c + 1);
      onProgress?.();
    }, wordMs);
    return () => clearTimeout(t);
  }, [count, done, wordMs, onProgress, onDone]);

  return (
    <>
      {words.current.slice(0, count).map((word, i) => (
        <span
          key={i}
          className="inline [will-change:filter,opacity]"
          style={{ animation: "stream-in 420ms cubic-bezier(0.22,0.61,0.25,1) both" }}
        >
          {word}{" "}
        </span>
      ))}
    </>
  );
}
