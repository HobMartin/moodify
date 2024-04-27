"use client";
import { debounce, initial } from "lodash";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

type Props = {
  initialMood: number;
};

export const MoodSlider = ({ initialMood }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(initialMood ? initialMood * 100 : 0);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const handleDebounceFn = (value: number) => {
    console.log("debounced value", value);
    const mood = value / 100;

    router.push(pathname + "?" + createQueryString("mood", mood.toFixed(2)));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceFn = useCallback(debounce(handleDebounceFn, 1000), []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(parseInt(e.target.value));
    debounceFn(parseInt(e.target.value));
  };

  return (
    <div className="relative mb-6">
      <input
        id="labels-range-input"
        type="range"
        onChange={handleChange}
        value={value}
        min="0"
        max="100"
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
      />
      <span className="text-2xl text-gray-500 dark:text-gray-400 absolute start-0 -bottom-8">
        {/* sad emote */}
        😞
      </span>
      <span className="text-2xl text-gray-500 dark:text-gray-400 absolute start-1/3 -translate-x-1/2 rtl:translate-x-1/2 -bottom-8">
        {/* semi sed emote */}
        😐
      </span>
      <span className="text-2xl text-gray-500 dark:text-gray-400 absolute start-2/3 -translate-x-1/2 rtl:translate-x-1/2 -bottom-8">
        {/* semi happy emote */}
        😊
      </span>
      <span className="text-2xl text-gray-500 dark:text-gray-400 absolute end-0 -bottom-8">
        {/* happy emote */}
        😄
      </span>
    </div>
  );
};
