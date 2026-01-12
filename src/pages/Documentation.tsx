import { MainLayout } from "@/components/MainLayout";
import { Scale, ArrowRight, Linkedin, Mail, GraduationCap, Newspaper, Briefcase, BookOpen, Pen, Sparkles, ChevronDown, MessageSquare, Trophy, Wand2, HelpCircle, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";

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

const scoringCriteria = [
  {
    name: "Logical Coherence",
    maxScore: 2.5,
    description: "How well your arguments follow a logical structure. Are your premises sound? Do your conclusions follow from your evidence? Penalties for logical fallacies like ad hominem, strawman, false dichotomy, etc."
  },
  {
    name: "Evidence & Examples",
    maxScore: 2.5,
    description: "The quality and relevance of supporting evidence. Are you using specific examples, statistics, studies, or historical precedents? Vague claims without backing lower this score."
  },
  {
    name: "Rebuttal Strength",
    maxScore: 2.5,
    description: "How effectively you address the opponent's counterarguments. Do you directly engage with their points? Do you concede where appropriate while maintaining your position?"
  },
  {
    name: "Persuasiveness",
    maxScore: 2.5,
    description: "Overall rhetorical effectiveness. Is your argument compelling? Do you use clear language? Is your tone appropriate for the debate context?"
  }
];

const sections = [
  { id: "philosophy", label: "Philosophy" },
  { id: "how-to-use", label: "How to Use" },
  { id: "debate-practice", label: "Debate Practice" },
  { id: "explore-news", label: "Explore News" },
  { id: "key-features", label: "Key Features" },
  { id: "who-is-this-for", label: "Who Is This For?" },
  { id: "tips", label: "Tips" },
  { id: "about", label: "About" },
];

export default function Documentation() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [scoringOpen, setScoringOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("philosophy");
  const isMobile = useIsMobile();
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      
      for (const section of sections) {
        const element = sectionRefs.current[section.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = sectionRefs.current[id];
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <MainLayout>
      <div className="flex gap-8 max-w-5xl mx-auto">
        {/* Side navigation - desktop only */}
        {!isMobile && (
          <nav className="hidden lg:block sticky top-24 h-fit w-40 shrink-0">
            <ul className="space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "text-left text-sm transition-all duration-200 w-full py-1",
                      activeSection === section.id
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground hover:text-foreground font-normal"
                    )}
                  >
                    {section.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <article className="flex-1 max-w-3xl">
          {/* Header */}
          <header className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Scale className="h-10 w-10 text-greek-gold" strokeWidth={1.5} />
              <h1 className="font-serif text-4xl font-medium text-foreground">
                BothSides
              </h1>
            </div>
          </header>

          {/* Philosophy Section - Featured Card */}
          <section 
            id="philosophy" 
            ref={(el) => { sectionRefs.current["philosophy"] = el; }}
            className="mb-16"
          >
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
          <section 
            id="how-to-use" 
            ref={(el) => { sectionRefs.current["how-to-use"] = el; }}
            className="mb-16"
          >
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground mb-8 tracking-tight border-b border-border pb-4">How to Use the Platform</h2>
            
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

          {/* Debate Practice Section */}
          <section 
            id="debate-practice" 
            ref={(el) => { sectionRefs.current["debate-practice"] = el; }}
            className="mb-16"
          >
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground mb-8 tracking-tight border-b border-border pb-4 flex items-center gap-3">
              <MessageSquare className="h-7 w-7 text-greek-gold" />
              Debate Practice
            </h2>
            
            <div className="space-y-6">
              <p className="font-body text-foreground/90 leading-relaxed">
                Sharpen your argumentation skills by sparring with an AI opponent. Unlike the debate generator, Practice Mode puts you in the driver's seat — you make claims, defend your position, and receive real-time counterarguments to strengthen your reasoning.
              </p>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-medium text-foreground">How It Works</h3>
                  <ol className="space-y-3 font-body text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-greek-gold/10 border border-greek-gold/30 flex items-center justify-center font-serif text-sm font-bold text-greek-gold">1</span>
                      <span>Make a claim you want to defend</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-greek-gold/10 border border-greek-gold/30 flex items-center justify-center font-serif text-sm font-bold text-greek-gold">2</span>
                      <span>The AI argues against your position</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-greek-gold/10 border border-greek-gold/30 flex items-center justify-center font-serif text-sm font-bold text-greek-gold">3</span>
                      <span>Respond with counter-arguments</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-greek-gold/10 border border-greek-gold/30 flex items-center justify-center font-serif text-sm font-bold text-greek-gold">4</span>
                      <span>Get detailed feedback on your performance</span>
                    </li>
                  </ol>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-medium text-foreground">Tools at Your Disposal</h3>
                  <ul className="space-y-3 font-body text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-greek-gold shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-foreground">Help Button</span> — Stuck? Generate a suggested counter-argument based on the current debate
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Wand2 className="h-5 w-5 text-greek-gold shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-foreground">Polish Button</span> — Refine your text to sound more formal and persuasive
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Trophy className="h-5 w-5 text-greek-gold shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-foreground">Feedback</span> — See detailed scoring and tips after 4+ exchanges
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <History className="h-5 w-5 text-greek-gold shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-foreground">History</span> — Signed-in users can save and revisit past practice debates
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How We Score - Collapsible */}
            <Collapsible open={scoringOpen} onOpenChange={setScoringOpen} className="mt-8">
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between p-4 bg-muted/50 border border-border hover:bg-muted/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-greek-gold" />
                    <span className="font-serif text-lg font-medium text-foreground">How We Score Your Debate</span>
                  </div>
                  <ChevronDown className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform duration-200",
                    scoringOpen && "rotate-180"
                  )} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border border-t-0 border-border p-6 space-y-6">
                  <p className="font-body text-muted-foreground">
                    Your debate performance is scored out of <span className="font-semibold text-foreground">10.0 points</span> across four categories, each worth up to 2.5 points. The scoring is objective and consistent — your score will improve as you demonstrate stronger argumentation skills.
                  </p>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    {scoringCriteria.map((criterion) => (
                      <div key={criterion.name} className="p-4 bg-background border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-serif font-medium text-foreground">{criterion.name}</h4>
                          <span className="text-sm font-mono text-greek-gold">{criterion.maxScore} pts</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {criterion.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-greek-gold/5 border border-greek-gold/20 p-4">
                    <h4 className="font-serif font-medium text-foreground mb-2">What Gets Penalized?</h4>
                    <ul className="space-y-1.5 font-body text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                        Logical fallacies (ad hominem, strawman, false dichotomy, circular reasoning)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                        Unsupported claims without evidence or examples
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                        Ignoring or misrepresenting the opponent's arguments
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                        Emotional appeals without logical backing
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                        Inconsistent or contradictory positions
                      </li>
                    </ul>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </section>

          {/* Explore News Section - NEW */}
          <section 
            id="explore-news" 
            ref={(el) => { sectionRefs.current["explore-news"] = el; }}
            className="mb-16"
          >
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground mb-8 tracking-tight border-b border-border pb-4 flex items-center gap-3">
              <Newspaper className="h-7 w-7 text-greek-gold" />
              Explore News
            </h2>
            
            <div className="space-y-6">
              <p className="font-body text-foreground/90 leading-relaxed">
                Transform today's headlines into thoughtful debates. The Explore News feature lets you browse current events from multiple countries and categories, then generate balanced debate topics from any story.
              </p>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-medium text-foreground">Features</h3>
                  <ul className="space-y-3 font-body text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-greek-gold rounded-full"></span>
                      Filter by country (US, Canada, UK, Australia)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-greek-gold rounded-full"></span>
                      Browse categories: General, Business, Tech, Sports, Health, Science, Entertainment
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-greek-gold rounded-full"></span>
                      Hover over any headline to generate debate topics
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-greek-gold rounded-full"></span>
                      View original articles directly
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-greek-gold rounded-full"></span>
                      News refreshes daily with manual refresh option
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-medium text-foreground">How It Works</h3>
                  <ol className="space-y-3 font-body text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-greek-gold/10 border border-greek-gold/30 flex items-center justify-center font-serif text-sm font-bold text-greek-gold">1</span>
                      <span>Select your preferred country and category</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-greek-gold/10 border border-greek-gold/30 flex items-center justify-center font-serif text-sm font-bold text-greek-gold">2</span>
                      <span>Browse the latest headlines</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-greek-gold/10 border border-greek-gold/30 flex items-center justify-center font-serif text-sm font-bold text-greek-gold">3</span>
                      <span>Hover and click "Generate Debate"</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-greek-gold/10 border border-greek-gold/30 flex items-center justify-center font-serif text-sm font-bold text-greek-gold">4</span>
                      <span>Select a debate topic and explore both sides</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* Key Features Section */}
          <section 
            id="key-features" 
            ref={(el) => { sectionRefs.current["key-features"] = el; }}
            className="mb-16"
          >
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
          <section 
            id="who-is-this-for" 
            ref={(el) => { sectionRefs.current["who-is-this-for"] = el; }}
            className="mb-16"
          >
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground mb-8 tracking-tight border-b border-border pb-4">
              Who Is This For?
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {audienceCards.map((card, index) => (
                <div 
                  key={card.title} 
                  className={cn(
                    "relative p-6 border border-border bg-card transition-all duration-300 cursor-default overflow-hidden group", 
                    hoveredCard === index && "border-greek-gold shadow-lg"
                  )} 
                  onMouseEnter={() => setHoveredCard(index)} 
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Shimmer effect */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r from-transparent via-greek-gold/10 to-transparent -translate-x-full transition-transform duration-700", 
                    hoveredCard === index && "translate-x-full"
                  )} />
                  
                  <card.icon className={cn(
                    "h-8 w-8 mb-4 transition-colors duration-300", 
                    hoveredCard === index ? "text-greek-gold" : "text-muted-foreground"
                  )} />
                  <h3 className="font-serif text-lg font-medium text-foreground mb-2">{card.title}</h3>
                  <p className="font-body text-sm text-muted-foreground">{card.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tips Section */}
          <section 
            id="tips" 
            ref={(el) => { sectionRefs.current["tips"] = el; }}
            className="mb-16"
          >
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground mb-8 tracking-tight border-b border-border pb-4">
              Tips for Best Results
            </h2>
            
            <div className="space-y-4 font-body text-muted-foreground">
              <div className="flex flex-col md:flex-row gap-2 md:gap-3 md:items-center">
                <span className="font-serif font-bold text-foreground shrink-0">Be Specific</span>
                <span>"Social media affects mental health" will generate more focused arguments than "social media is bad"</span>
              </div>
              <div className="flex flex-col md:flex-row gap-2 md:gap-3 md:items-center">
                <span className="font-serif font-bold text-foreground shrink-0">Use Perspectives</span>
                <span>Adding an "Economist" lens to a healthcare debate highlights different considerations than a "Medical Professional" lens</span>
              </div>
              <div className="flex flex-col md:flex-row gap-2 md:gap-3 md:items-center">
                <span className="font-serif font-bold text-foreground shrink-0">Follow the Refutations</span>
                <span>The deepest insights often come from following an argument thread several levels deep</span>
              </div>
              <div className="flex flex-col md:flex-row gap-2 md:gap-3 md:items-center">
                <span className="font-serif font-bold text-foreground shrink-0">Try the Complexity Slider</span>
                <span>Academic mode for research papers, Simple mode for accessible explanations</span>
              </div>
            </div>
          </section>

          {/* About the Creator */}
          <section 
            id="about" 
            ref={(el) => { sectionRefs.current["about"] = el; }}
            className="mb-16"
          >
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground mb-8 tracking-tight border-b border-border pb-4">
              About the Creator
            </h2>
            
            <div className="font-body text-muted-foreground leading-relaxed space-y-4">
              <p>
                BothSides was created by <span className="font-serif font-medium text-foreground">Abeer Das</span>, a Systems Design Engineering student at the University of Waterloo. Passionate about building tools that promote critical thinking and balanced discourse, Abeer brings experience from multiple software engineering internships to create impactful products.
              </p>
              <p>
                Always open to feedback, collaboration, and new opportunities.
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
      </div>
    </MainLayout>
  );
}
