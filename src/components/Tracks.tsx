"use client";

import { motion } from "framer-motion";

type Props = {
  trackIds: string[];
};
export const Tracks = ({ trackIds }: Props) => {
  console.log("trackIds", trackIds);

  return (
    <section className="flex flex-col gap-4 w-full">
      <h2 className="text-4xl font-bold">Tracks for your mood</h2>
      <motion.div layout className="grid grid-cols-2 gap-4">
        {trackIds?.map((track: any) => (
          <iframe
            key={track}
            className="rounded-lg"
            src={`https://open.spotify.com/embed/track/${track}?utm_source=generator`}
            width="100%"
            height="352"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        ))}
      </motion.div>
    </section>
  );
};
//
