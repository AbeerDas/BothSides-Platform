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
    name: "Logical Architecture",
    maxScore: 2.0,
    description: "Premise validity, inferential strength, structural coherence, and fallacy avoidance. Penalties for ad hominem, strawman, false dichotomy, and circular reasoning."
  },
  {
    name: "Evidence Quality",
    maxScore: 2.0,
    description: "Specificity of claims (statistics, studies, named experts), relevance to the argument, source credibility, and sufficiency of evidence."
  },
  {
    name: "Rebuttal Effectiveness",
    maxScore: 2.0,
    description: "Direct engagement with opponent's strongest points, quality of refutation, strategic concessions, and depth of clash."
  },
  {
    name: "Persuasive Impact",
    maxScore: 2.0,
    description: "Clarity of expression, effective framing of the debate, appropriate emotional resonance, and memorability of key points."
  },
  {
    name: "Strategic Execution",
    maxScore: 2.0,
    description: "Understanding of burden of proof, anticipation of objections, resource allocation to important arguments, and adaptability."
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
      const viewportCenter = window.innerHeight / 2;
      let closestSection = sections[0].id;
      let closestDistance = Infinity;
      
      for (const section of sections) {
        const element = sectionRefs.current[section.id];
        if (element) {
          const rect = element.getBoundingClientRect();
          const sectionCenter = rect.top + rect.height / 2;
          const distance = Math.abs(sectionCenter - viewportCenter);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestSection = section.id;
          }
        }
      }
      
      setActiveSection(closestSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
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
        {/* Side navigation - desktop only, centered vertically */}
        {!isMobile && (
          <nav className="hidden lg:flex sticky top-1/2 -translate-y-1/2 h-fit w-40 shrink-0 flex-col">
            <ul className="space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "text-left text-sm transition-all duration-300 w-full py-1",
                      activeSection === section.id
                        ? "font-bold text-foreground"
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
                  BothSides helps people move beyond polarized discourse by exploring complex issues from multiple perspectives. Enter a topic, and the AI generates clear arguments for and against, giving you the material to think critically.
                </p>
                <p>
                  The platform is built on a simple belief: understanding opposing viewpoints makes us better thinkers. Not all arguments are equally strong, but we cannot evaluate ideas fairly unless we understand them fully.
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
                      Type a debatable statement into the input field. Example: "Remote work is more productive than office work." The more specific, the more focused the arguments.
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
                      Click <code className="bg-muted px-1.5 py-0.5 rounded text-sm">Add Perspective</code> to filter arguments through lenses like Economist, Philosopher, or Historian.
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
                      Click <code className="bg-muted px-1.5 py-0.5 rounded text-sm">Generate</code> and watch as the AI constructs balanced arguments for both sides, each with citations.
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
                      Once generated, you can add more arguments, generate refutations, adjust complexity, or export to PDF.
                    </p>
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
                Sharpen your argumentation skills by sparring with an AI opponent. You make claims, defend your position, and receive real-time counterarguments.
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
                      <span>Click <code className="bg-muted px-1 py-0.5 rounded text-xs">See how you're doing</code> for feedback</span>
                    </li>
                  </ol>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-medium text-foreground">Tools</h3>
                  <ul className="space-y-3 font-body text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-greek-gold shrink-0 mt-0.5" />
                      <div>
                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm">Help</code> — Generates a suggested counter-argument
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Wand2 className="h-5 w-5 text-greek-gold shrink-0 mt-0.5" />
                      <div>
                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm">Polish</code> — Refines your text to sound more formal
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Trophy className="h-5 w-5 text-greek-gold shrink-0 mt-0.5" />
                      <div>
                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm">See how you're doing</code> — Detailed scoring after 4+ exchanges
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <History className="h-5 w-5 text-greek-gold shrink-0 mt-0.5" />
                      <div>
                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm">History</code> — Save and revisit past debates (signed-in users)
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
                    Your debate is scored out of <span className="font-semibold text-foreground">10.0 points</span> across five categories. Each category has subcriteria evaluated on a 0.0-0.5 scale that sum to 2.0 max per category.
                  </p>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {scoringCriteria.map((criterion) => (
                      <div key={criterion.name} className="p-4 bg-background border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-serif font-medium text-foreground text-sm">{criterion.name}</h4>
                          <span className="text-xs font-mono text-greek-gold">{criterion.maxScore} pts</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {criterion.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-greek-gold/5 border border-greek-gold/20 p-4">
                    <h4 className="font-serif font-medium text-foreground mb-2">Scoring Philosophy</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      We avoid clustering around 7.0-7.9. Most debaters score either below 6.5 (developing) or above 8.0 (strong). The feedback tells you who is "winning" based on standing arguments, burden of proof, and framing effectiveness.
                    </p>
                    <h4 className="font-serif font-medium text-foreground mb-2">What Gets Penalized</h4>
                    <ul className="space-y-1.5 font-body text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                        Logical fallacies (ad hominem, strawman, false dichotomy)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                        Unsupported claims without evidence
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                        Ignoring or misrepresenting opponent's arguments
                      </li>
                    </ul>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </section>

          {/* Explore News Section */}
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
                Transform headlines into thoughtful debates. Browse current events from multiple countries, then generate balanced debate topics from any story.
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
                      Categories: General, Business, Tech, Sports, Health, Science
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-greek-gold rounded-full"></span>
                      Hover on any headline → <code className="bg-muted px-1 py-0.5 rounded text-xs">Generate Debate</code>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-greek-gold rounded-full"></span>
                      Click <code className="bg-muted px-1 py-0.5 rounded text-xs">View Article</code> to read original
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-medium text-foreground">How It Works</h3>
                  <ol className="space-y-3 font-body text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-greek-gold/10 border border-greek-gold/30 flex items-center justify-center font-serif text-sm font-bold text-greek-gold">1</span>
                      <span>Select country and category from dropdowns</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-greek-gold/10 border border-greek-gold/30 flex items-center justify-center font-serif text-sm font-bold text-greek-gold">2</span>
                      <span>Browse today's headlines</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-greek-gold/10 border border-greek-gold/30 flex items-center justify-center font-serif text-sm font-bold text-greek-gold">3</span>
                      <span>Hover and click <code className="bg-muted px-1 py-0.5 rounded text-xs">Generate Debate</code></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-greek-gold/10 border border-greek-gold/30 flex items-center justify-center font-serif text-sm font-bold text-greek-gold">4</span>
                      <span>Pick a debate topic and explore both sides</span>
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
                  Every debate presents the strongest possible arguments for each position. The AI doesn't take sides.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-xl font-medium text-foreground mb-2">Source Citations</h3>
                <p className="font-body text-muted-foreground leading-relaxed">
                  Arguments include citations for deeper research and verification.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-xl font-medium text-foreground mb-2">Nested Refutations</h3>
                <p className="font-body text-muted-foreground leading-relaxed">
                  Generate refutations to any point, creating argument trees that mirror authentic discourse.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-xl font-medium text-foreground mb-2">Public Debates Library</h3>
                <p className="font-body text-muted-foreground leading-relaxed">
                  Browse community debates. Filter by tags and discover new perspectives.
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

          {/* Tips Section - Table format */}
          <section 
            id="tips" 
            ref={(el) => { sectionRefs.current["tips"] = el; }}
            className="mb-16"
          >
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground mb-8 tracking-tight border-b border-border pb-4">
              Tips for Best Results
            </h2>
            
            <div className="border border-border">
              <table className="w-full">
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-4 font-serif font-bold text-foreground align-top w-1/4">Be Specific</td>
                    <td className="p-4 text-muted-foreground text-right">"Social media affects mental health" generates more focused arguments than "social media is bad"</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-serif font-bold text-foreground align-top">Use Perspectives</td>
                    <td className="p-4 text-muted-foreground text-right">An "Economist" lens on healthcare highlights different points than a "Medical Professional" lens</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-serif font-bold text-foreground align-top">Follow Refutations</td>
                    <td className="p-4 text-muted-foreground text-right">The deepest insights come from following argument threads several levels deep</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-serif font-bold text-foreground align-top">Complexity Slider</td>
                    <td className="p-4 text-muted-foreground text-right">Academic mode for papers, Simple mode for accessible explanations</td>
                  </tr>
                </tbody>
              </table>
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
                BothSides was created by <span className="font-serif font-medium text-foreground">Abeer Das</span>, a Systems Design Engineering student at the University of Waterloo. Always open to feedback and collaboration.
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
