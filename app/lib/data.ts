export type NeedStatus = "active" | "closing" | "completed" | "fully-funded";

export type Program = {
  slug: string;
  title: string;
  shortTitle: string;
  model: string;
  summary: string;
  image: string;
  alt: string;
  accent: "red" | "gold" | "navy" | "blue";
};

export type Church = {
  slug: string;
  name: string;
  location: string;
  summary: string;
  programs: string[];
  prayer: string;
  verified: string;
  image: string;
  alt: string;
};

export type Need = {
  slug: string;
  title: string;
  churchSlug: string;
  programSlug: string;
  status: NeedStatus;
  phase: string;
  target: number;
  received: number;
  deadline: string;
  cadence: string;
  designation: string;
  verifiedAt: string;
  summary: string;
  prayer: string;
  nextMilestone: string;
  transitionGoal: string;
  churchName?: string;
  churchLocation?: string;
  sample?: boolean;
};

export type FieldUpdate = {
  slug: string;
  title: string;
  churchSlug: string;
  programSlug: string;
  date: string;
  summary: string;
  happened: string;
  stewardship: string;
  challenge: string;
  prayer: string;
  next: string;
  image: string;
  alt: string;
  churchName?: string;
};

export type PrayerRequest = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  body: string[];
  focus: string;
  image: string;
  alt: string;
};

export type Story = {
  slug: string;
  title: string;
  subtitle: string;
  programSlug: string;
  date: string;
  excerpt: string;
  body: string[];
  image: string;
  alt: string;
};

export const programs: Program[] = [
  {
    slug: "feeding-program",
    title: "Feeding Program",
    shortTitle: "Feeding",
    model: "Continuous ministry",
    summary:
      "Local churches gather and feed children while sharing the Gospel. Kapatid helps partners understand the need, support the work, and stay connected as circumstances change.",
    image: "/ministry-seniors.jpg",
    alt: "Children sharing a meal during a community feeding activity",
    accent: "red",
  },
  {
    slug: "child-sponsorship",
    title: "Child Sponsorship Program",
    shortTitle: "Sponsorship",
    model: "Church and child levels",
    summary:
      "Churches care for children and families over time. Sponsors receive respectful, protective updates about growth, schooling, wellbeing, and prayer.",
    image: "/ministry-feeding.jpg",
    alt: "A school-aged child supported through a local church ministry",
    accent: "navy",
  },
  {
    slug: "bless-a-senior",
    title: "Bless a Senior Citizen",
    shortTitle: "Senior Citizens",
    model: "Two seasonal cycles each year",
    summary:
      "Partner churches identify seniors, prepare each cycle, distribute timely support, and close with a verified church-by-church report.",
    image: "/ministry-sponsorship.jpg",
    alt: "Senior citizens gathered for a partner church ministry activity",
    accent: "gold",
  },
  {
    slug: "ofw-families",
    title: "OFW Families Program",
    shortTitle: "OFW Families",
    model: "Verified, case-based support",
    summary:
      "A family or partner church may raise a need. Kapatid verifies the case, matches appropriate support, and stays involved until the specific need is resolved.",
    image: "/hero-community.jpg",
    alt: "A local church worker visiting and listening to community members",
    accent: "blue",
  },
];

export const churches: Church[] = [
  {
    slug: "christ-in-you-forever",
    name: "Christ in You Forever Christian Baptist Church",
    location: "Sitio Sinipit, Bulacan",
    summary:
      "A local congregation ministering to children, families, and senior citizens through regular Gospel-centered community work.",
    programs: ["feeding-program", "bless-a-senior"],
    prayer:
      "Pray for wisdom, endurance, and deeper relationships with the families gathering each week.",
    verified: "Field profile reviewed for local preview",
    image: "/church-partners.jpg",
    alt: "Church workers gathering with children and families in a community",
  },
  {
    slug: "san-rafael-fundamental-baptist",
    name: "San Rafael Fundamental Baptist Church",
    location: "San Rafael, Bulacan",
    summary:
      "A ministry partner serving its surrounding community through discipleship, feeding, senior care, and practical assistance.",
    programs: ["feeding-program", "bless-a-senior"],
    prayer:
      "Pray that the church will faithfully care for seniors and children while clearly sharing the hope of Christ.",
    verified: "Field profile reviewed for local preview",
    image: "/ministry-sponsorship.jpg",
    alt: "Senior citizens attending a community gathering",
  },
  {
    slug: "kingdom-righteousness",
    name: "Kingdom Righteousness Ministry",
    location: "Metro Manila",
    summary:
      "A partner church walking with children and families through education support, mentoring, and local discipleship.",
    programs: ["child-sponsorship", "feeding-program"],
    prayer:
      "Pray for students approaching major school transitions and for the families and church mentors supporting them.",
    verified: "Field profile reviewed for local preview",
    image: "/ministry-feeding.jpg",
    alt: "A school-aged child connected to a community ministry",
  },
];

export const needs: Need[] = [
  {
    slug: "sinipit-feeding-cycle",
    title: "Sustain the next community feeding cycle",
    churchSlug: "christ-in-you-forever",
    programSlug: "feeding-program",
    status: "active",
    phase: "Ongoing — weekly ministry",
    target: 60000,
    received: 37500,
    deadline: "2026-09-30",
    cadence: "Monthly field update",
    designation: "SINIPIT FEEDING 2026",
    verifiedAt: "2026-07-10",
    summary:
      "Support food preparation and weekly church-led gatherings for children and families during the next ministry cycle.",
    prayer:
      "Pray that children will return consistently and that parents will welcome the church’s pastoral care.",
    nextMilestone: "Confirm the next eight-week meal and teaching schedule.",
    transitionGoal:
      "Finish the cycle with attendance, expense, and testimony updates from the church.",
    sample: true,
  },
  {
    slug: "senior-blessing-cycle-two",
    title: "Prepare the second senior blessing cycle",
    churchSlug: "san-rafael-fundamental-baptist",
    programSlug: "bless-a-senior",
    status: "fully-funded",
    phase: "Pre-season — church preparation",
    target: 45000,
    received: 45000,
    deadline: "2026-10-15",
    cadence: "Pre-season and closeout updates",
    designation: "SAN RAFAEL SENIORS CYCLE 2",
    verifiedAt: "2026-07-08",
    summary:
      "The church is confirming the senior list and preparing a timely distribution and Gospel gathering.",
    prayer:
      "Pray for the health of each senior and for meaningful conversations with church volunteers.",
    nextMilestone: "Finalize the verified senior list and distribution plan.",
    transitionGoal: "Share a signed distribution summary and church testimony after the season.",
    sample: true,
  },
  {
    slug: "student-transition-support",
    title: "Walk with students entering a new school year",
    churchSlug: "kingdom-righteousness",
    programSlug: "child-sponsorship",
    status: "closing",
    phase: "Ongoing — school transition",
    target: 80000,
    received: 71800,
    deadline: "2026-08-31",
    cadence: "Quarterly child-safe update",
    designation: "KRM STUDENT TRANSITION",
    verifiedAt: "2026-07-11",
    summary:
      "Help the church complete school-readiness support and child-safe sponsor updates for participating students.",
    prayer:
      "Pray for courage, diligence, and healthy relationships as students enter a new school year.",
    nextMilestone: "Complete school-readiness checks with participating families.",
    transitionGoal: "Move each student into the normal quarterly sponsorship rhythm.",
    sample: true,
  },
  {
    slug: "ofw-family-emergency-case",
    title: "OFW family emergency case",
    churchSlug: "san-rafael-fundamental-baptist",
    programSlug: "ofw-families",
    status: "completed",
    phase: "Support completed",
    target: 30000,
    received: 30000,
    deadline: "2026-05-20",
    cadence: "Case update at verification and completion",
    designation: "CLOSED CASE — NO NEW GIFTS",
    verifiedAt: "2026-05-26",
    summary:
      "A family need was verified, supported, and reconciled with the referring church.",
    prayer: "Give thanks for provision and pray for the family’s continued stability.",
    nextMilestone: "No further financial action. Pastoral follow-up continues through the church.",
    transitionGoal: "Support completed and finances reconciled.",
    sample: true,
  },
];

export const updates: FieldUpdate[] = [
  {
    slug: "sinipit-eight-weeks-together",
    title: "Eight weeks of meals, Scripture, and returning families",
    churchSlug: "christ-in-you-forever",
    programSlug: "feeding-program",
    date: "2026-07-06",
    summary:
      "The church completed eight weekly gatherings and is preparing the next cycle with families who continue to return.",
    happened:
      "Church volunteers prepared weekly meals, welcomed children, shared Scripture, and followed up with parents in the surrounding community.",
    stewardship:
      "Kapatid collected the field summary, checked the attendance and expense record, and matched the next request to the active need.",
    challenge:
      "Heavy rain affected attendance twice, and food costs were higher than the church’s first estimate.",
    prayer:
      "Pray for safe travel, steady volunteers, and open homes as the church deepens its relationships with families.",
    next: "The church will confirm the next eight-week schedule and submit an updated food plan.",
    image: "/church-partners.jpg",
    alt: "Church workers and children gathered during a community activity",
  },
  {
    slug: "senior-listening-visits",
    title: "Listening visits shape the next senior blessing cycle",
    churchSlug: "san-rafael-fundamental-baptist",
    programSlug: "bless-a-senior",
    date: "2026-06-21",
    summary:
      "Church volunteers are visiting seniors before preparing the next seasonal distribution.",
    happened:
      "The church began confirming names, health concerns, household needs, and opportunities for pastoral care.",
    stewardship:
      "Kapatid provided the cycle checklist and is waiting for the verified list before any disbursement is scheduled.",
    challenge:
      "Several seniors have changing health needs that require careful, respectful coordination with their families.",
    prayer: "Pray for strength, comfort, and clear Gospel conversations during each home visit.",
    next: "Finalize the list and agree on the distribution date and reporting cadence.",
    image: "/ministry-sponsorship.jpg",
    alt: "Senior citizens gathered outdoors for a church activity",
  },
  {
    slug: "students-ready-for-transition",
    title: "Students prepare for a new school transition",
    churchSlug: "kingdom-righteousness",
    programSlug: "child-sponsorship",
    date: "2026-07-02",
    summary:
      "Church mentors are checking school readiness and walking with students through the practical and emotional transition.",
    happened:
      "Families met with church mentors to review enrollment, school supplies, transport, and each student’s prayer concerns.",
    stewardship:
      "Kapatid matched the church’s verified checklist with sponsor designations and prepared child-safe update prompts.",
    challenge:
      "A small number of enrollment documents remain incomplete and require family follow-up.",
    prayer: "Pray for diligence, confidence, and wise support from parents, mentors, and teachers.",
    next: "Complete readiness checks and send the next protected sponsor update.",
    image: "/ministry-feeding.jpg",
    alt: "A child in school uniform supported through a local church",
  },
];

export const stories: Story[] = [
  {
    slug: "abegail-graduate",
    title: "Abegail’s Story: A Graduate of Child Sponsorship Program",
    subtitle: "A graduate of the Child Sponsorship Program",
    programSlug: "child-sponsorship",
    date: "2025-08-18",
    excerpt:
      "After nine years in the program, Abegail completed her studies while serving as a worship-team instrumentalist.",
    body: [
      "Abegail’s journey was shaped by the love of her family, the steady presence of her church, the generosity of her sponsor, and God’s sustaining grace.",
      "As she continued her studies, she also grew in faith and used her musical ability in the worship ministry. Her graduation is not presented as Kapatid’s achievement, but as a testimony of faithful work and faithful support coming together.",
      "Her story reminds giving partners why consistent prayer, honest updates, and long-term relationships matter.",
    ],
    image: "/ministry-feeding.jpg",
    alt: "A child in school uniform representing the child sponsorship ministry",
  },
  {
    slug: "church-in-sinipit",
    title: "A church keeps showing up in Sitio Sinipit",
    subtitle: "Local ministry continues beyond a distribution day",
    programSlug: "bless-a-senior",
    date: "2024-12-15",
    excerpt:
      "Senior citizens and children continued returning to hear the Gospel as the local church established a regular worshiping presence.",
    body: [
      "Christ in You Forever Christian Baptist Church has continued to visit, gather, teach, and care for families in Sitio Sinipit.",
      "A seasonal gift can open a door, but the church’s faithful presence is what sustains relationships after a program activity ends.",
      "Kapatid helps partners see that work clearly, support it responsibly, and understand what follows after each season.",
    ],
    image: "/church-partners.jpg",
    alt: "A local church gathering with children and families",
  },
  {
    slug: "allysas-story-a-graduate-of-child-sponsorship-program",
    title: "Allysa’s Story: A Graduate of Child Sponsorship Program",
    subtitle: "Fifteen years of faith, family, church, and faithful sponsorship",
    programSlug: "child-sponsorship",
    date: "2025-08-12",
    excerpt:
      "Allysa’s journey began in humble circumstances and was strengthened through God’s guidance and the steady support of her family, church, and sponsor.",
    body: [
      "Allysa’s story reflects a long journey through the Child Sponsorship Program, shaped by perseverance, spiritual growth, and faithful people walking beside her.",
      "Kapatid shares her graduation with gratitude to God and to the family, church, and sponsor who supported her along the way.",
    ],
    image: "/ministry-feeding.jpg",
    alt: "A student connected with Kapatid Ministry’s Child Sponsorship Program",
  },
  {
    slug: "airas-story-a-graduate-of-child-sponsorship-program",
    title: "Aira’s Story: A Graduate of Child Sponsorship Program",
    subtitle: "Perseverance, faith, gratitude, and God’s grace",
    programSlug: "child-sponsorship",
    date: "2025-08-05",
    excerpt:
      "Aira completed a Psychology degree after a journey strengthened by faith and by the support of her family, church, sponsor, and the Child Sponsorship Program.",
    body: [
      "Aira grew up in Llano, Caloocan City, in a close-knit family that trusted God through financial challenges. She joined the Child Sponsorship Program as a young child and later served through Sunday school and the church choir.",
      "She credits God’s grace and the people He used—her family, church, and sponsor—for helping her continue when the road was difficult.",
    ],
    image: "/ministry-feeding.jpg",
    alt: "A graduate supported through Kapatid Ministry’s Child Sponsorship Program",
  },
  {
    slug: "prayer-before-support",
    title: "Prayer before support",
    subtitle: "Why verification is part of faithful care",
    programSlug: "ofw-families",
    date: "2025-07-19",
    excerpt:
      "Case-based ministry begins by listening and verifying before a family’s situation is shared publicly.",
    body: [
      "A need may reach Kapatid through a family, relative, giving partner, or local church. Every entry point matters, but public communication waits until the local situation is verified.",
      "That pause protects families, helps the church understand the real need, and allows giving partners to respond to a clear request.",
      "Careful communication includes knowing when not to publish a story yet.",
    ],
    image: "/hero-community.jpg",
    alt: "A church worker listening during a community home visit",
  },
];

export const prayerRequests: PrayerRequest[] = [
  {
    slug: "prayer-focus-for-august-2025",
    title: "Prayer Focus for August 2025",
    date: "2025-08-01",
    summary:
      "Give thanks for God’s provision and pray for new partners, sponsors, ministry teams, and protection through the storm season.",
    body: [
      "Join Kapatid Ministry in thanking God for His faithfulness and in lifting up the churches, ministry teams, children, families, and partners serving across the Philippines.",
      "Pray for new partners and sponsors, wisdom for each ministry decision, and protection for communities experiencing severe weather.",
    ],
    focus: "Thanksgiving, new ministry partners, sponsors, and protection during storms",
    image: "/hero-community.jpg",
    alt: "A local church worker visiting community members",
  },
  {
    slug: "prayer-focus-flood-affected-communities-due-to-typhoons",
    title: "Prayer Focus: Flood-affected communities",
    date: "2025-07-23",
    summary:
      "Pray for Filipino families affected by Typhoon Crising and for communities facing further rain from Typhoons Dante and Emong.",
    body: [
      "Lift up families living through flooding, displacement, damaged homes, and disrupted livelihoods. Pray for safety, wise local response, and timely practical help.",
      "Pray also for local churches serving their neighbors and for protection as more rain reaches vulnerable communities.",
    ],
    focus: "Safety, shelter, provision, local responders, and churches serving flooded communities",
    image: "/church-partners.jpg",
    alt: "Local church workers gathered with families in the community",
  },
  {
    slug: "prayer-focus-for-july-2025",
    title: "Prayer Focus for July 2025",
    date: "2025-07-01",
    summary:
      "Thank God for sustaining the work and continue praying for the churches, volunteers, children, students, seniors, and OFW families they serve.",
    body: [
      "Your prayers help sustain Kapatid Ministry’s partnership in the Gospel. Give thanks for answered prayer and for every local church continuing to serve faithfully.",
      "Ask God for endurance, wisdom, provision, and open hearts in every community.",
    ],
    focus: "Endurance, wisdom, provision, and open hearts across KMI ministries",
    image: "/ministry-seniors.jpg",
    alt: "Children and families participating in a local church ministry",
  },
];

export const stats = [
  { value: "384", label: "children in the average 2024 feeding program" },
  { value: "189", label: "children sponsored in 2024" },
  { value: "87", label: "senior citizens who heard the Gospel in 2024" },
  { value: "130", label: "families assisted during calamities in 2024" },
];

export const getProgram = (slug: string) => programs.find((item) => item.slug === slug);
export const getChurch = (slug: string) => churches.find((item) => item.slug === slug);
export const getNeed = (slug: string) => needs.find((item) => item.slug === slug);
export const getUpdate = (slug: string) => updates.find((item) => item.slug === slug);
export const getStory = (slug: string) => stories.find((item) => item.slug === slug);
export const getPrayerRequest = (slug: string) => prayerRequests.find((item) => item.slug === slug);

export const formatPeso = (value: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-PH", { year: "numeric", month: "long", day: "numeric" }).format(new Date(`${value}T00:00:00`));
