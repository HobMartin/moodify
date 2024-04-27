import { MoodSlider } from "@/components/slider";

import { generatePlaylist } from "@/lib/spotify";
import { getAuthSession } from "@/utils/serverUtils";
import { redirect } from "next/navigation";
import { Playlist } from "@/components/Playlist";
import { Suspense } from "react";
import Loading from "./loading";

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getAuthSession();

  if (!session?.session || !session.spotifyApi) {
    redirect("/login");
  }

  const mood = parseFloat(searchParams.mood as string) || 0;

  const playlistId = await generatePlaylist(session.session, mood);

  return (
    <main className="flex min-h-screen flex-col items-center gap-28 p-24">
      <section className="flex flex-col gap-11">
        <h1 className="text-9xl font-bold bg-gradient-to-r from-orange-700 via-blue-500 to-green-400 text-transparent bg-clip-text animate-gradient">
          Take your mood
        </h1>
        <p className="text-2xl text-center">
          How are you feeling today? Drag the slider to let us know.
        </p>
        <MoodSlider initialMood={mood} />
      </section>
      <Suspense fallback={<Loading />}>
        <Playlist playlistId={playlistId} />
      </Suspense>
    </main>
  );
}
