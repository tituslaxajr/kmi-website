import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../components/SiteChrome";
import { formatDate, getProgram, stories as seedStories } from "../../lib/data";
import { getPublishedStories } from "../../lib/content";

export const dynamic = "force-dynamic";
export function generateStaticParams() { return seedStories.map(({ slug }) => ({ slug })); }

function StoryBlock({ block }: { block: string }) {
  if (block.startsWith("## ")) return <h2>{block.slice(3)}</h2>;
  if (block.startsWith("> ")) return <blockquote>{block.slice(2)}</blockquote>;
  if (/^[-*] /.test(block)) return <ul>{block.split("\n").map((line) => <li key={line}>{line.replace(/^[-*] /, "")}</li>)}</ul>;
  return <p>{block.replace(/\*\*(.*?)\*\*/g, "$1")}</p>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const story = (await getPublishedStories()).find((item) => item.slug === slug);
  return { title: story?.title || "Story", description: story?.excerpt };
}

export default async function StoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = (await getPublishedStories()).find((item) => item.slug === slug);
  if (!story) notFound();
  const program = getProgram(story.programSlug);
  return (
    <>
      <Breadcrumbs items={[{ href: "/stories", label: "Stories" }, { label: story.title }]} />
      <article className="article-layout shell story-article"><header className="article-header"><p className="eyebrow">{program?.title} · {formatDate(story.date)}</p><h1>{story.title}</h1><p className="article-deck">{story.subtitle}</p></header><figure className="article-image"><Image unoptimized src={story.image} alt={story.alt} width={1024} height={683} sizes="(max-width: 1000px) 100vw, 980px" /></figure><div className="prose">{story.body.map((block) => <StoryBlock block={block} key={block} />)}<blockquote>Fruit grows where local churches remain present, partners walk alongside them, and God provides through His people.</blockquote></div></article>
      <section className="closing-cta shell"><p className="eyebrow">Keep following</p><h2>Move from testimony to prayerful partnership.</h2><div className="button-row"><Link className="button" href="/active-needs">See active needs</Link><Link className="button button-outline" href="/stories">More stories</Link></div></section>
    </>
  );
}
