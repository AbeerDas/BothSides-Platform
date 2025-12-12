import { MainLayout } from "@/components/MainLayout";
import { Scale, ArrowRight, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function Documentation() {
  return <MainLayout>
      <article className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert prose-headings:font-serif prose-p:font-body prose-p:text-base prose-p:leading-relaxed prose-li:font-body">
        {/* Header */}
        <header className="not-prose text-center mb-12 pb-8 border-b border-border">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Scale className="h-10 w-10 text-greek-gold" strokeWidth={1.5} />
            <h1 className="font-serif text-4xl font-medium text-foreground">
              BothSides
            </h1>
          </div>
          <p className="text-lg text-muted-foreground font-body max-w-xl mx-auto">
            An AI-powered platform for exploring multiple perspectives on any topic. 
            See both sides of any argument, backed by research and citations.
          </p>
        </header>

        {/* Introduction */}
        <section className="mb-12">
          <h2 className="text-2xl mb-4">What is BothSides?</h2>
          <p>
            In an age of polarized discourse and echo chambers, BothSides was created to help people 
            understand complex issues from multiple angles. Whether you're researching a topic, preparing 
            for a debate, or simply curious about different viewpoints, BothSides generates comprehensive 
            arguments for and against any statement you provide.
          </p>
          <p className="my-[24px]">
            Our AI analyzes your topic and constructs well-reasoned arguments supported by relevant 
            sources and citations. This isn't about telling you what to think—it's about giving you 
            the tools to think more deeply.
          </p>
        </section>

        {/* How to Use */}
        <section className="mb-12">
          <h2 className="text-2xl mb-4">How to Use BothSides</h2>
          
          <h3 className="text-xl mt-6 mb-3">1. Enter Your Statement</h3>
          <p>
            Start by typing any debatable statement or question into the input field. This could be 
            anything from "Remote work is more productive than office work" to "Space exploration 
            is worth the investment." The more specific your statement, the more focused the 
            arguments will be.
          </p>
          
          <h3 className="text-xl mt-6 mb-3">2. Add Perspectives (Optional)</h3>
          <p>
            Want arguments from specific viewpoints? Click "Add Perspective" to filter arguments 
            through particular lenses like an Economist, Philosopher, Historian, or Climate Scientist. 
            This helps tailor the debate to your interests or research needs.
          </p>
          
          <h3 className="text-xl mt-6 mb-3">3. Generate the Debate</h3>
          <p>
            Click "Generate" and watch as the AI constructs balanced arguments for both sides. 
            Each argument includes a title, summary, detailed explanation, and citations to 
            relevant sources.
          </p>
          
          <h3 className="text-xl mt-6 mb-3">4. Explore and Expand</h3>
          <p>
            Once generated, you can:
          </p>
          <ul>
            <li><strong>Add more arguments</strong> to either side</li>
            <li><strong>Generate refutations</strong> to dive deeper into counterpoints</li>
            <li><strong>Change complexity</strong> from academic to simple language</li>
            <li><strong>Apply different lenses</strong> to see how perspectives shift</li>
            <li><strong>Export to PDF</strong> for offline reading or sharing</li>
          </ul>
        </section>

        {/* Features */}
        <section className="mb-12">
          <h2 className="text-2xl mb-4">Key Features</h2>
          
          <h3 className="text-xl mt-6 mb-3">Balanced Arguments</h3>
          <p>
            Every debate is generated with equal attention to both sides. Our AI doesn't take 
            sides—it presents the strongest possible arguments for each position, letting you 
            form your own conclusions.
          </p>
          
          <h3 className="text-xl mt-6 mb-3">Source Citations</h3>
          <p>
            Arguments aren't just opinions. Each point is backed by relevant sources and citations, 
            giving you starting points for deeper research and verification.
          </p>
          
          <h3 className="text-xl mt-6 mb-3">Nested Refutations</h3>
          <p>
            Real debates don't stop at initial arguments. BothSides allows you to generate 
            refutations to any point, creating a tree of arguments and counterarguments that 
            mirrors authentic intellectual discourse.
          </p>
          
          <h3 className="text-xl mt-6 mb-3">AI-Generated Conclusions</h3>
          <p>
            After presenting both sides, BothSides provides an AI-generated conclusion that 
            weighs the evidence and suggests which position has stronger support—always with 
            the caveat that you should draw your own conclusions.
          </p>
          
          <h3 className="text-xl mt-6 mb-3">Public Debates Library</h3>
          <p>
            Browse debates created by the community. Filter by tags, search for topics, and 
            discover new perspectives on issues you care about.
          </p>
        </section>

        {/* Use Cases */}
        <section className="mb-12">
          <h2 className="text-2xl mb-4">Who Is This For?</h2>
          
          <ul>
            <li>
              <strong>Students</strong> researching essay topics or preparing for debates
            </li>
            <li>
              <strong>Journalists</strong> seeking to understand multiple angles of a story
            </li>
            <li>
              <strong>Decision makers</strong> weighing pros and cons of business choices
            </li>
            <li>
              <strong>Curious minds</strong> who want to challenge their own assumptions
            </li>
            <li>
              <strong>Educators</strong> teaching critical thinking skills
            </li>
            <li>
              <strong>Writers</strong> developing well-rounded characters or storylines
            </li>
          </ul>
        </section>

        {/* Philosophy */}
        <section className="mb-12">
          <h2 className="text-2xl mb-4">Our Philosophy</h2>
          <p>
            BothSides is built on the belief that understanding opposing viewpoints makes us 
            better thinkers. It's easy to dismiss ideas we disagree with, but true intellectual 
            growth comes from engaging with them seriously.
          </p>
          <p>
            This doesn't mean all positions are equally valid—some arguments are stronger than 
            others, and evidence should guide our conclusions. But we can't evaluate ideas 
            fairly if we don't first understand them charitably.
          </p>
          <p>
            Our goal is not to promote false equivalence but to encourage deeper thinking. 
            By seeing the best arguments on both sides, you're better equipped to form 
            well-reasoned opinions and engage in productive dialogue.
          </p>
        </section>

        {/* Tips */}
        <section className="mb-12">
          <h2 className="text-2xl mb-4">Tips for Best Results</h2>
          <ul>
            <li>
              <strong>Be specific:</strong> "Social media affects mental health" will generate 
              more focused arguments than "social media is bad"
            </li>
            <li>
              <strong>Use perspectives:</strong> Adding an "Economist" lens to a healthcare 
              debate highlights different considerations than a "Medical Professional" lens
            </li>
            <li>
              <strong>Follow the refutations:</strong> The deepest insights often come from 
              following an argument thread several levels deep
            </li>
            <li>
              <strong>Try the complexity slider:</strong> Academic mode for research papers, 
              Simple mode for accessible explanations
            </li>
            <li>
              <strong>Save and share:</strong> Export your debates to PDF or share links with 
              others to continue the discussion
            </li>
          </ul>
        </section>

        {/* Creator */}
        <section className="mb-12">
          <h2 className="text-2xl mb-4">About the Creator</h2>
          <p>
            BothSides was created by Abeer Das, a developer passionate about building tools 
            that encourage critical thinking and balanced discourse. To learn more about the 
            creator and connect professionally, visit the LinkedIn profile below.
          </p>
          
          <div className="not-prose mt-6">
            <Button asChild className="gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white">
              <a href="https://www.linkedin.com/in/abeerdas/" target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-4 w-4" />
                Connect on LinkedIn
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="not-prose text-center pt-8 border-t border-border text-sm text-muted-foreground">
          <p>
            Built with care for thoughtful discourse. © {new Date().getFullYear()} BothSides
          </p>
        </footer>
      </article>
    </MainLayout>;
}