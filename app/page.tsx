import Link from "next/link";
import Image from "next/image";
import { FileText, Github, Linkedin, Mail, Twitter } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const publications = [
  {
    title: "Structure-Aware Adaptation for Domain-Specific Language Models",
    venue: "ACL Findings",
    year: "2024",
    authors: ["Your Name", "Collaborator", "Advisor"],
    summary: "Parameter-efficient adapters that preserve syntactic priors, improving factual consistency on scientific corpora.",
    links: [
      { label: "PDF", href: "#" },
      { label: "Code", href: "#" },
    ],
  },
  {
    title: "Efficient Evaluation Pipelines for Long-Context Models",
    venue: "EMNLP",
    year: "2023",
    authors: ["Your Name", "Collaborator"],
    summary: "Streaming evaluation toolkit with reproducible prompts and calibrated scoring for long-context QA.",
    links: [
      { label: "Preprint", href: "#" },
      { label: "Code", href: "#" },
    ],
  },
];

const projects = [
  {
    title: "Interpretable Retrieval Sandbox",
    type: "Research",
    tags: ["RAG", "Attribution", "Visualization"],
    summary: "Minimal retrieval playground with saliency overlays to study grounding in multi-hop QA.",
    link: "#",
  },
  {
    title: "Course Project · Systems for ML Ops",
    type: "Course",
    tags: ["Tracing", "Scheduling", "Observability"],
    summary: "Tracing layer surfacing data drift and resource hotspots in distributed training jobs.",
    link: "#",
  },
  {
    title: "Side Project · QuietNotes",
    type: "Side",
    tags: ["Writing", "Next.js", "Design"],
    summary: "Calm writing space with semantic snippets, tuned for bilingual note-taking and citation exports.",
    link: "#",
  },
];

const researchTags = ["Alignment", "Evaluation", "Retrieval", "Pedagogy", "Systems", "Interpretability"];

const socialLinks = [
  { label: "GitHub", href: "https://github.com", icon: Github },
  { label: "Google Scholar", href: "https://scholar.google.com", icon: FileText },
  { label: "LinkedIn", href: "https://www.linkedin.com", icon: Linkedin },
  { label: "Twitter", href: "https://twitter.com", icon: Twitter },
];

export default function Home() {
  return (
    <main id="top" className="mx-auto flex max-w-6xl flex-col gap-16 px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pt-12">
      <Hero />
      <About />
      <Publications />
      <Projects />
      <Contact />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
      <div className="order-2 flex flex-col gap-4 lg:order-1">
        <Badge variant="secondary" className="w-fit">
          PhD Student · University / Lab
        </Badge>
        <div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Your Name</h1>
          <p className="text-lg text-muted-foreground">Graduate researcher, focusing on trustworthy language technology.</p>
        </div>
        <p className="text-base leading-7 text-muted-foreground sm:text-lg">
          I study alignment, structure-aware adaptation, and evaluation of domain-specific language models. Recent work
          looks at calibration, retrieval grounding, and lightweight evaluation harnesses for long-context settings.
        </p>
        <div className="flex flex-wrap gap-2">
          {["Machine Learning", "NLP", "Systems", "Evaluation"].map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="#publications">View publications</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="mailto:you@example.com">Email me</Link>
          </Button>
        </div>
      </div>
      <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
        <Card className="relative h-[360px] w-full max-w-md overflow-hidden border-border/70 bg-card/70 shadow-sm sm:h-[420px] lg:h-[520px]">
          <Image
            src="/portrait.jpg"
            alt="Portrait"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 480px"
            priority
          />
        </Card>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="space-y-4">
      <div className="space-y-1">
        <Badge variant="outline">About / Research</Badge>
        <h2 className="text-3xl font-semibold tracking-tight">Research Overview</h2>
      </div>
      <div className="space-y-3 text-base leading-7 text-muted-foreground">
        <p>
          I focus on adapting large language models to specialized domains while keeping them calibrated and grounded. I
          build evaluation rigs that are reproducible, study interpretable retrieval, and design workflows that support
          bilingual reading and writing in research contexts.
        </p>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Research Interests</h3>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {researchTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs font-medium text-foreground/80"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Publications() {
  return (
    <section id="publications" className="space-y-4">
      <div className="space-y-1">
        <Badge variant="outline">Selected Publications</Badge>
        <h2 className="text-3xl font-semibold tracking-tight">Recent work</h2>
        <p className="text-sm text-muted-foreground">Representative papers and preprints.</p>
      </div>
      <div className="space-y-6">
        {publications.map((pub, idx) => (
          <div key={pub.title} className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <p className="text-lg font-semibold leading-tight">{pub.title}</p>
              <Badge variant="secondary" className="shrink-0">
                {pub.year}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {pub.authors.map((author, i) => {
                const isSelf = author.toLowerCase().includes("your");
                return (
                  <span key={author}>
                    {isSelf ? <strong className="text-foreground">{author}</strong> : author}
                    {i < pub.authors.length - 1 ? ", " : ""}{" "}
                  </span>
                );
              })}
            </p>
            <p className="text-sm text-muted-foreground">
              {pub.venue} · {pub.year}
            </p>
            <p className="text-sm leading-6 text-muted-foreground">{pub.summary}</p>
            <div className="flex flex-wrap gap-2">
              {pub.links.map((link) => (
                <Button key={link.label} asChild size="sm" variant="ghost" className="h-8 px-2 text-sm">
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
            </div>
            {idx < publications.length - 1 && <Separator className="opacity-60" />}
          </div>
        ))}
      </div>
    </section>
  );
}

function Projects() {
  return (
    <section id="projects" className="space-y-4">
      <div className="space-y-1">
        <Badge variant="outline">Selected Projects</Badge>
        <h2 className="text-3xl font-semibold tracking-tight">Research & course work</h2>
        <p className="text-sm text-muted-foreground">Curated systems and exploratory builds.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.title} className="border border-border/40 bg-card/40 shadow-none">
            <CardHeader className="space-y-1 pb-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base font-semibold leading-tight">{project.title}</CardTitle>
                <Badge variant="secondary" className="shrink-0">
                  {project.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pb-4 text-sm">
              <CardDescription className="text-muted-foreground">{project.summary}</CardDescription>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button asChild size="sm" variant="ghost" className="h-8 px-0 text-primary hover:text-primary">
                <Link href={project.link}>View details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="space-y-4">
      <div className="space-y-1">
        <Badge variant="outline">Contact</Badge>
        <h2 className="text-3xl font-semibold tracking-tight">Get in touch</h2>
        <p className="text-sm text-muted-foreground">One place to reach me for collaborations or questions.</p>
      </div>
      <Card className="border-border/70 bg-card/70">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Primary email</div>
            <div className="text-lg font-semibold">you@example.com</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="mailto:you@example.com">
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Link>
            </Button>
            {socialLinks.map((item) => (
              <Button key={item.label} asChild variant="outline">
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function Footer() {
  return (
    <footer className="space-y-4">
      <Separator />
      <div className="flex flex-col items-start justify-between gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center">
        <div>© {new Date().getFullYear()} · Built with Next.js, Tailwind, and shadcn/ui.</div>
        <div className="text-xs text-muted-foreground">Codebase organized for GitHub Pages-friendly static export.</div>
      </div>
    </footer>
  );
}
