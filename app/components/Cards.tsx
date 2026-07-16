import Link from "next/link";
import Image from "next/image";
import { Church, FieldUpdate, Need, PrayerRequest, Program, Story, formatDate, formatPeso, getChurch, getProgram } from "../lib/data";

export function ProgramCard({ program }: { program: Program }) {
  return (
    <article className={`program-card accent-${program.accent}`}>
      <Image unoptimized src={program.image} alt={program.alt} width={1024} height={683} sizes="(max-width: 820px) 100vw, 42vw" />
      <div className="card-body">
        <p className="card-kicker">{program.model}</p>
        <h3>{program.title}</h3>
        <p>{program.summary}</p>
      </div>
    </article>
  );
}

export function ChurchCard({ church }: { church: Church }) {
  return (
    <article className="church-card">
      <Image unoptimized src={church.image} alt={church.alt} width={1024} height={683} sizes="(max-width: 820px) 100vw, 33vw" />
      <div className="card-body">
        <p className="card-kicker">{church.location}</p>
        <h3><Link href={`/partner-churches/${church.slug}`}>{church.name}</Link></h3>
        <p>{church.summary}</p>
        <div className="tag-row">
          {church.programs.map((slug) => <span className="tag" key={slug}>{getProgram(slug)?.shortTitle}</span>)}
        </div>
        <Link className="arrow-link" href={`/partner-churches/${church.slug}`}>Meet the church <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}

export function StatusBadge({ status }: { status: Need["status"] }) {
  const labels = { active: "Open", closing: "Closing soon", completed: "Completed", "fully-funded": "Fully funded" };
  return <span className={`status-badge status-${status}`}>{labels[status]}</span>;
}

export function NeedCard({ need, compact = false }: { need: Need; compact?: boolean }) {
  const church = getChurch(need.churchSlug);
  const program = getProgram(need.programSlug);
  const percentage = need.target > 0 ? Math.min(100, Math.round((need.received / need.target) * 100)) : 0;
  const canGive = need.status === "active" || need.status === "closing";

  return (
    <article className={`need-card ${compact ? "need-card-compact" : ""}`}>
      <div className="need-card-top">
        <StatusBadge status={need.status} />
        <span className="card-kicker">{program?.shortTitle}</span>
      </div>
      <h3><Link href={`/active-needs/${need.slug}`}>{need.title}</Link></h3>
      <p className="church-line">Led on the ground by <Link href={`/partner-churches/${need.churchSlug}`}>{need.churchName || church?.name || "a KMI partner church"}</Link></p>
      {!compact && <p>{need.summary}</p>}
      <div className="funding-row">
        <strong>{formatPeso(need.received)}</strong>
        <span>of {formatPeso(need.target)}</span>
      </div>
      <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} aria-label={`${percentage}% funded`}>
        <span style={{ width: `${percentage}%` }} />
      </div>
      <div className="need-meta">
        <span><small>Phase</small>{need.phase.split(" — ")[0]}</span>
        <span><small>{need.status === "completed" ? "Closed" : "By"}</small>{formatDate(need.deadline)}</span>
      </div>
      <div className="card-actions">
        <Link className="arrow-link" href={`/active-needs/${need.slug}`}>View details <span aria-hidden="true">→</span></Link>
        {canGive && <Link className="button button-small button-secondary" href={`/give?need=${need.slug}`}>Support this need</Link>}
      </div>
    </article>
  );
}

export function UpdateCard({ update }: { update: FieldUpdate }) {
  const church = getChurch(update.churchSlug);
  const program = getProgram(update.programSlug);
  return (
    <article className="update-card">
      <Link className="image-link" href={`/field-updates/${update.slug}`}><Image unoptimized src={update.image} alt={update.alt} width={1024} height={683} sizes="(max-width: 820px) 100vw, 33vw" /></Link>
      <div className="card-body">
        <div className="card-meta"><span>{program?.shortTitle}</span><time dateTime={update.date}>{formatDate(update.date)}</time></div>
        <h3><Link href={`/field-updates/${update.slug}`}>{update.title}</Link></h3>
        <p className="church-line">Report from {update.churchName || church?.name || "a KMI partner church"}</p>
        <p>{update.summary}</p>
        <Link className="arrow-link" href={`/field-updates/${update.slug}`}>Read the verified update <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}

export function PrayerCard({ prayer }: { prayer: PrayerRequest }) {
  return (
    <article className="prayer-card">
      <div className="prayer-card-mark" aria-hidden="true">Pray</div>
      <div>
        <time dateTime={prayer.date}>{formatDate(prayer.date)}</time>
        <h3><Link href={`/prayer/${prayer.slug}`}>{prayer.title}</Link></h3>
        <p>{prayer.summary}</p>
        <p className="prayer-focus"><strong>Focus:</strong> {prayer.focus}</p>
        <Link className="arrow-link" href={`/prayer/${prayer.slug}`}>Pray with us <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}

export function StoryCard({ story }: { story: Story }) {
  const program = getProgram(story.programSlug);
  return (
    <article className="story-card">
      <Link className="image-link" href={`/stories/${story.slug}`}><Image unoptimized src={story.image} alt={story.alt} width={1024} height={683} sizes="(max-width: 820px) 100vw, 33vw" /></Link>
      <div className="card-body">
        <p className="card-kicker">{program?.title}</p>
        <h3><Link href={`/stories/${story.slug}`}>{story.title}</Link></h3>
        <p className="story-subtitle">{story.subtitle}</p>
        <p>{story.excerpt}</p>
        <Link className="arrow-link" href={`/stories/${story.slug}`}>Read the story <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}
