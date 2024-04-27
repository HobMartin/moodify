"use client";

import { motion } from "framer-motion";

type Props = {
  playlistId: string;
};
export const Playlist = ({ playlistId }: Props) => {
  return (
    <section className="flex flex-col gap-4 w-full">
      <h2 className="text-4xl font-bold">Playlist for your mood</h2>
      <motion.div layout className="w-full">
        <iframe
          className="rounded-lg"
          src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`}
          width="100%"
          height="600"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      </motion.div>
    </section>
  );
};
//
