import type { Metadata } from "next";
import { StoryCard } from "../components/Cards";
import { PageHero } from "../components/SiteChrome";
import { getPublishedStories } from "../lib/content";

export const metadata: Metadata = { title: "Stories" };

export const dynamic = "force-dynamic";

export default async function StoriesPage() {
  const stories = await getPublishedStories();
  return (
    <>
      <PageHero eyebrow="Stories from the field" title="The church stays visible in every testimony." intro="Stories honor God’s provision, the local church’s presence, the dignity of every person, and the partners who pray and support." />
      <section className="section shell"><div className="section-heading compact-heading"><p className="eyebrow">Recent stories</p><h2>Presence, prayer, and God’s provision.</h2></div><div className="story-grid">{stories.map((story) => <StoryCard story={story} key={story.slug} />)}</div></section>
    </>
  );
}
