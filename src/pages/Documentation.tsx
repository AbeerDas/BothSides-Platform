import { MainLayout } from "@/components/MainLayout";
import { Scale, ArrowRight, Linkedin, Mail, GraduationCap, Newspaper, Briefcase, BookOpen, Pen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
const audienceCards = [{
  icon: GraduationCap,
  title: "Students",
  description: "researching essay topics or preparing for debates"
}, {
  icon: Newspaper,
  title: "Journalists",
  description: "seeking to understand multiple angles of a story"
}, {
  icon: Briefcase,
  title: "Decision Makers",
  description: "weighing pros and cons of business choices"
}, {
  icon: BookOpen,
  title: "Educators",
  description: "teaching critical thinking skills"
}, {
  icon: Pen,
  title: "Writers",
  description: "developing well-rounded characters or storylines"
}, {
  icon: Sparkles,
  title: "Curious Minds",
  description: "who want to challenge their own assumptions"
}];
export default function Documentation() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  return <MainLayout>
      <article className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16 pb-8 ">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Scale className="h-10 w-10 text-greek-gold" strokeWidth={1.5} />
            <h1 className="font-serif text-4xl font-medium text-foreground">
              BothSides
            </h1>
          </div>
          
        </header>

        {/* Philosophy Section - Featured Card */}
        <section className="mb-16">
          <div className="bg-muted/50 border border-border p-8 md:p-10">
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground mb-6 tracking-tight">The Philosophy</h2>
            <div className="font-serif text-base md:text-lg leading-relaxed text-foreground/90 space-y-6">
              <p className="first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-greek-gold">
                BothSides was created to help people move beyond polarized discourse by exploring complex issues from multiple perspectives. When you enter a topic, our AI generates clear, well-supported arguments for and against it, giving you the material you need to think critically rather than accept a single narrative.
              </p>
              <p>
                The platform is built on a simple belief: understanding opposing viewpoints makes us better thinkers. Not all arguments are equally strong and evidence should guide our conclusions, but we cannot evaluate ideas fairly unless we understand them fully and charitably.
              </p>
              <p>
                BothSides aims to promote deeper reasoning, not false equivalence. By seeing the strongest arguments on each side, you can form more informed opinions and engage in conversations with greater clarity and openness.
              </p>
            </div>
          </div>
        </section>

        {/* How to Use Section */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground mb-8 tracking-tight border-b border-border pb-4">
            How to Use BothSides
          </h2>
          
          <div className="space-y-8">
            <div className="group">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-10 h-10 bg-greek-gold/10 border border-greek-gold/30 flex items-center justify-center font-serif text-lg font-bold text-greek-gold">
                  1
                </span>
                <div>
                  <h3 className="font-serif text-xl font-medium text-foreground mb-2">Enter Your Statement</h3>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    Start by typing a debatable statement into the input field. This could be anything from "Remote work is more productive than office work" to "Space exploration is worth the investment." The more specific your statement, the more focused the arguments will be.
                  </p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-10 h-10 bg-greek-gold/10 border border-greek-gold/30 flex items-center justify-center font-serif text-lg font-bold text-greek-gold">
                  2
                </span>
                <div>
                  <h3 className="font-serif text-xl font-medium text-foreground mb-2">Add Perspectives (Optional)</h3>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    Want arguments from specific viewpoints? Click "Add Perspective" to filter arguments through particular lenses like an Economist, Philosopher, Historian, or Climate Scientist. This helps tailor the debate to your interests or research needs.
                  </p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-10 h-10 bg-greek-gold/10 border border-greek-gold/30 flex items-center justify-center font-serif text-lg font-bold text-greek-gold">
                  3
                </span>
                <div>
                  <h3 className="font-serif text-xl font-medium text-foreground mb-2">Generate the Debate</h3>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    Click "Generate" and watch as the AI constructs balanced arguments for both sides. Each argument includes a title, summary, detailed explanation, and citations to relevant sources.
                  </p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-10 h-10 bg-greek-gold/10 border border-greek-gold/30 flex items-center justify-center font-serif text-lg font-bold text-greek-gold">
                  4
                </span>
                <div>
                  <h3 className="font-serif text-xl font-medium text-foreground mb-2">Explore and Expand</h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-4">
                    Once generated, you can:
                  </p>
                  <ul className="space-y-2 font-body text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-greek-gold rounded-full"></span>
                      Add more arguments to either side
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-greek-gold rounded-full"></span>
                      Generate refutations to dive deeper into counterpoints
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-greek-gold rounded-full"></span>
                      Change complexity from academic to simple language
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-greek-gold rounded-full"></span>
                      Apply different lenses to see how perspectives shift
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-greek-gold rounded-full"></span>
                      Export to PDF for offline reading or sharing
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground mb-8 tracking-tight border-b border-border pb-4">
            Key Features
          </h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="font-serif text-xl font-medium text-foreground mb-2">Balanced Arguments</h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                Every debate is generated with equal attention to both sides. Our AI doesn't take sides—it presents the strongest possible arguments for each position, letting you form your own conclusions.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-xl font-medium text-foreground mb-2">Source Citations</h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                Arguments aren't just opinions. Each point is backed by relevant sources and citations, giving you starting points for deeper research and verification.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-xl font-medium text-foreground mb-2">Nested Refutations</h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                Real debates don't stop at initial arguments. BothSides allows you to generate refutations to any point, creating a tree of arguments and counterarguments that mirrors authentic intellectual discourse. These do not get saved after the initial generation.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-xl font-medium text-foreground mb-2">Generated Conclusions</h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                After presenting both sides, BothSides provides a generated conclusion that weighs the evidence and suggests which position has stronger support, always with the caveat that you should draw your own conclusions.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-xl font-medium text-foreground mb-2">Public Debates Library</h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                Browse debates created by the community. Filter by tags, search for topics, and discover new perspectives on issues you care about.
              </p>
            </div>
          </div>
        </section>

        {/* Who Is This For - Interactive Tiles */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground mb-8 tracking-tight border-b border-border pb-4">
            Who Is This For?
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {audienceCards.map((card, index) => <div key={card.title} className={cn("relative p-6 border border-border bg-card transition-all duration-300 cursor-default overflow-hidden group", hoveredCard === index && "border-greek-gold shadow-lg")} onMouseEnter={() => setHoveredCard(index)} onMouseLeave={() => setHoveredCard(null)}>
                {/* Shimmer effect */}
                <div className={cn("absolute inset-0 bg-gradient-to-r from-transparent via-greek-gold/10 to-transparent -translate-x-full transition-transform duration-700", hoveredCard === index && "translate-x-full")} />
                
                <card.icon className={cn("h-8 w-8 mb-4 transition-colors duration-300", hoveredCard === index ? "text-greek-gold" : "text-muted-foreground")} />
                <h3 className="font-serif text-lg font-medium text-foreground mb-2">{card.title}</h3>
                <p className="font-body text-sm text-muted-foreground">{card.description}</p>
              </div>)}
          </div>
        </section>

        {/* Tips Section */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground mb-8 tracking-tight border-b border-border pb-4">
            Tips for Best Results
          </h2>
          
          <div className="space-y-4 font-body text-muted-foreground">
            <div className="flex gap-3">
              <span className="font-serif font-bold text-foreground">Be specific:</span>
              <span>"Social media affects mental health" will generate more focused arguments than "social media is bad"</span>
            </div>
            <div className="flex gap-3">
              <span className="font-serif font-bold text-foreground">Use perspectives:</span>
              <span>Adding an "Economist" lens to a healthcare debate highlights different considerations than a "Medical Professional" lens</span>
            </div>
            <div className="flex gap-3">
              <span className="font-serif font-bold text-foreground">Follow the refutations:</span>
              <span>The deepest insights often come from following an argument thread several levels deep</span>
            </div>
            <div className="flex gap-3">
              <span className="font-serif font-bold text-foreground">Try the complexity slider:</span>
              <span>Academic mode for research papers, Simple mode for accessible explanations</span>
            </div>
            <div className="flex gap-3">
              <span className="font-serif font-bold text-foreground">Save and share:</span>
              <span>Export your debates to PDF or share links with others to continue the discussion</span>
            </div>
          </div>
        </section>

        {/* About the Creator */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground mb-8 tracking-tight border-b border-border pb-4">
            About the Creator
          </h2>
          
          <div className="font-body text-muted-foreground leading-relaxed space-y-4">
            <p>
              BothSides was created by <span className="font-serif font-medium text-foreground">Abeer Das</span>, a software engineer studying Systems Design at the University of Waterloo. He is passionate about building tools that promote critical thinking, intellectual honesty, and balanced discourse.
            </p>
            <p>
              With experience across three software engineering internships and an ongoing interest in impactful product development, he is always open to feedback, collaboration, and new internship opportunities.
            </p>
            <p>
              To learn more or connect professionally, visit his LinkedIn profile below.
            </p>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button asChild className="gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white">
              <a href="https://www.linkedin.com/in/abeerdas/" target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-4 w-4" />
                Connect on LinkedIn
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <a href="mailto:abeerdas647@gmail.com">
                <Mail className="h-4 w-4" />
                Email Me
              </a>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-border text-sm text-muted-foreground">
          <p>
            Built with care for thoughtful discourse. © {new Date().getFullYear()} BothSides
          </p>
        </footer>
      </article>
    </MainLayout>;
}