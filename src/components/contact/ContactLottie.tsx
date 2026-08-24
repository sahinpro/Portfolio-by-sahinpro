"use client";

import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { useEffect, useRef, useState } from "react";

/**
 * Success/error confirmation animations for the contact form.
 * Split into their own client chunk (lottie-react + JSON payloads, ~45 kB
 * combined) so they only load after a submit attempt, not on first paint
 * of the Contact route.
 */

const SUCCESS_SPEED = 1;
const ERROR_SPEED = 1;
const SUCCESS_SEGMENT: [number, number] = [0, 354];
const ERROR_SEGMENT: [number, number] = [0, 21];

export function SuccessLottie(): JSX.Element {
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("@/assets/lottie/success.json").then((mod) => {
      if (!cancelled) setData(mod.default as object);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-[180px] h-[180px] shrink-0 flex items-center justify-center">
      {data && (
        <Lottie
          lottieRef={lottieRef}
          animationData={data}
          loop={false}
          autoplay
          initialSegment={SUCCESS_SEGMENT}
          onDOMLoaded={() => {
            lottieRef.current?.setSpeed(SUCCESS_SPEED);
            lottieRef.current?.play();
          }}
          style={{ width: 180, height: 180 }}
        />
      )}
    </div>
  );
}

export function ErrorLottie(): JSX.Element {
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("@/assets/lottie/error.json").then((mod) => {
      if (!cancelled) setData(mod.default as object);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-[100px] h-[100px] shrink-0 flex items-center justify-center mx-auto">
      {data && (
        <Lottie
          lottieRef={lottieRef}
          animationData={data}
          loop={false}
          autoplay
          initialSegment={ERROR_SEGMENT}
          onDOMLoaded={() => {
            lottieRef.current?.setSpeed(ERROR_SPEED);
            lottieRef.current?.play();
          }}
          style={{ width: 100, height: 100 }}
        />
      )}
    </div>
  );
}
