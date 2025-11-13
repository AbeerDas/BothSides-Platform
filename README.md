# BothSides

BothSides is an interactive debate platform that helps users explore both sides of any argument. You type in a statement or opinion, and the app generates structured arguments for and against it — complete with evidence and threaded refutations that evolve naturally like a real debate.

The goal is to make critical thinking and discussion more interactive, transparent, and engaging.

Link: [Website](https://dialectic.lovable.app/)

<img width="1462" height="832" alt="Screenshot 2025-11-13 at 4 40 26 PM" src="https://github.com/user-attachments/assets/c3e6154f-c44f-4b1c-8932-61e79256401b" />

---

## Features

### Debate Generation
Enter any statement — from political topics to light takes like *“Michael Jordan > LeBron.”*  
Dialectic analyzes sources and generates a balanced debate between opposing sides.

### Perspective Selector
Choose a specific perspective (political, ethical, economic, etc.) to shape how the debate is framed.  
The dropdown sits beside the “Generate Debate” button on desktop, and stacks cleanly on mobile.

### Threaded Refutations
Each argument can be refuted multiple times, forming a logical chain of responses.  
This keeps the debate flowing as long as needed, like an interactive back-and-forth discussion.
<img width="1462" height="832" alt="Screenshot 2025-11-13 at 4 42 24 PM" src="https://github.com/user-attachments/assets/a91f735a-f9ae-4bd7-a920-95c2dd30f304" />

### Evidence Expansion
Additional evidence appears as an inline expansion within the same container rather than a new thread.  
This keeps the layout clean and focused on clarity.

### Add Arguments

Each side has an **“Add Argument”** button at the bottom.  
New arguments dynamically appear and push existing content down, keeping structure intact.

### Account System
You can use BothSides with or without signing in.

Logging in unlocks two extra features in the top navigation:
- **Recent Logs:** personal list of your past debates  
- **Public Debates:** a shared space showing all debates from every user
<img width="1462" height="832" alt="Screenshot 2025-11-13 at 4 46 51 PM" src="https://github.com/user-attachments/assets/aa838e5b-e115-4557-aac6-797218c6e059" />

Each debate has a unique URL and is stored as JSON with its arguments, evidence, and refutations.  
Anonymous debates still appear publicly, but without a linked account.

---

## Coming Next
- Real-time debate mode for collaborative arguing  
- Upvote and comment system for public debates  
- Debate summarization and takeaway highlights  
- Tags, filters, and search in the public feed  
- Dark mode support  

---

## Getting Started

Clone the repo and install dependencies:
```bash
npm install
npm run dev
