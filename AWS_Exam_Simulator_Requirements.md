# System Prompt & Specification Requirement for Claude Code

**Project Title:** AWS Solutions Architect Associate (SAA-C03) Local Practice Exam Simulator (`one-exam`)
**Target Framework:** React (Create React App - CRA)
**UI Reference:** Pearson VUE OnVUE Exam Interface
**Data Source:** `src/data/questions.json`

---

## 1. Project Overview & Goal
Build a local web application using React (CRA) named `one-exam` that simulates the real **AWS Certified Solutions Architect - Associate (SAA-C03)** testing environment provided by **Pearson VUE (OnVUE)**.

The app will load questions from a local `question.json` file, dynamically organize them according to official AWS domain weightings, provide a realistic test-taking experience (timer, flagging, navigation grid, review screen), and offer detailed explanations and domain-based score analytics upon completion.

---

## 2. Technical Stack & Dependencies
* **Framework:** React (Create React App - CRA)
* **Styling:** Tailwind CSS (recommended for fast Pearson VUE lookalike styling) or standard CSS Modules / Styled Components.
* **Icons:** `lucide-react` (for OnVUE UI icons like flags, timers, grid, calculator).
* **State Management:** React Context API or `useReducer` + `localStorage` (to prevent data loss on refresh).

---

## 3. Data Specification (`questions.json`)

### Input Data Format
The app reads from `src/data/questions.json` with the following structure:
```json
[
  {
    "question_number": "1",
    "question": "A company collects data for temperature...",
    "choices": {
      "A": "Turn on S3 Transfer Acceleration...",
      "B": "Upload the data from each site...",
      "C": "Schedule AWS Snowball Edge...",
      "D": "Upload the data from each site to an Amazon EC2..."
    },
    "solutions": [
      "A"
    ],
    "explanation": "Turn on S3 Transfer Acceleration on the destination S3 bucket...",
    "key_word": [
      "across multiple continents",
      "500 G",
      "from each site daily"
    ]
  }
]
```

### Field Rules
| Field | Type | Rule |
|---|---|---|
| `question_number` | string | Unique across the bank. Matches the ExamTopics SAA-C03 topic 1 numbering, which is used to cross-check answers. |
| `question` | string | Full question text, including the `(Choose two.)` / `(Choose three.)` hint for multi-answer questions. |
| `choices` | object | One key per option, `A` to `F` (the UI supports up to `G`). Every option has its own key. Options must never be merged into the text of another option (e.g. `"D": "... E. ..."`). |
| `solutions` | string[] | Correct option letters. The count must equal the number requested by the question (1, 2 or 3). Every letter must exist in `choices`. |
| `explanation` | string | Explains why the correct options are right and why the others are wrong. It must not copy the text of the correct option. |
| `key_word` | string[] | 1–5 short phrases that point to the correct answer, ordered from most to least decisive. Each phrase must be a verbatim, case-sensitive substring of `question` so it can be highlighted later. Never contains text that only appears in the choices. |

### Question Pool Filtering
At load time, `ExamContext` keeps only answerable questions: at least 2 choices and a non-empty `solutions` array. A question whose source data is unusable (e.g. Q477, whose options were images) is kept in the file with `"solutions": []` so it is excluded from every exam.

### Dynamic Logic Requirements
1. **Multi-choice Detection:**
   * If `solutions.length === 1`: Render Radio Buttons (Single choice).
   * If `solutions.length > 1`: Render Checkboxes (Multiple choice) with dynamic text: *"Choose [N] answers"*, where N is `solutions.length`.
2. **Domain Classification & Distribution:**
   AWS SAA-C03 Official Domain Weights:
   * **Domain 1: Design Secure Architectures (30%)** (~19-20 questions for a 65-question exam)
   * **Domain 2: Design Resilient Architectures (26%)** (~17 questions)
   * **Domain 3: Design High-Performing Architectures (24%)** (~15-16 questions)
   * **Domain 4: Design Cost-Optimized Architectures (20%)** (~13 questions)

   *Requirement:*
   If the JSON items lack an explicit `"domain"` key, implement an internal keyword-based auto-classifier or domain tagger mapping questions based on AWS keywords (e.g., IAM, KMS, Security Group $\rightarrow$ Secure; Multi-AZ, Auto Scaling, S3 CRR $\rightarrow$ Resilient; CloudFront, ElastiCache, EBS IOPS $\rightarrow$ High-Performing; S3 Lifecycle, Savings Plans, Spot Instances $\rightarrow$ Cost-Optimized).
   When starting a exam mode (e.g. 65 questions), sample the question pool strictly matching these percentage distributions.

---

## 4. UI/UX Functional Requirements (Pearson VUE / OnVUE Style)

### OnVUE Visual Design Guidelines
* Dark header bar (`#1A2530` / `#002B49`) with high contrast text.
* Clean white/light grey main content container (`#F4F6F8`).
* Fixed bottom action toolbar for primary actions (`Previous`, `Next`, `Navigator/Review`).

### Key Views & Screens

#### A. Exam Start / Config Screen
* Option to select mode:
  1. **Full Exam Mode:** 65 questions, 130-minute timer, strict OnVUE simulation (no instant answers).
  2. **Practice / Study Mode:** Custom question count, optional timer (2 min/question), instant explanation toggle.
* "Start Exam" button.

#### A.1 Practice Mode Instant Feedback
When "Show explanation instantly after answering" is on:
* **Reveal trigger:** the answer is revealed and the question is locked only after the user has selected as many choices as the question requires. Single-answer questions reveal on the first click. A "Choose 3 answers" question reveals on the third selected choice. Before that, multi-answer choices can be toggled freely.
* **Revealed content, in order:**
  1. Verdict (`✓ Correct` only if the selection exactly matches `solutions`, otherwise `✗ Incorrect`) and `Correct answer: B, C, F`.
  2. Correct choices highlighted green, wrong selections red.
  3. `explanation` text.
  4. **Key words** block directly under the explanation: a `KEY WORDS` label followed by each `key_word` phrase as a chip (amber background, AWS orange border). Hidden when `key_word` is missing or empty.

#### B. Active Exam Screen (Pearson VUE OnVUE Header & Layout)
* **Top Bar:**
  * Exam Title: *AWS Certified Solutions Architect - Associate*
  * Live Countdown Timer (e.g., `130:00` minutes). Includes Pause/Hide Timer toggle.
  * Question Counter: `Question X of Y`.
  * **Flag for Review** checkbox / toggle button (top right).
* **Body Area:**
  * Clean presentation of `question` text.
  * Option choices rendered with clear clickable containers (`A` to `F`, in letter order, only the keys present in `choices`). Highlight selected choices.
* **Bottom Navigation Bar:**
  * `[< Previous]` button.
  * `[Next >]` button.
  * `[Question Grid / Navigator]` button.
  * `[Submit Exam]` button (with confirmation modal).

#### C. Question Navigator Drawer / Modal
* Grid of buttons from 1 to N questions.
* Visual indicators:
  * **Answered:** Solid blue background.
  * **Unanswered:** Outline / White.
  * **Flagged:** Flag icon / Yellow highlight.
  * **Current Question:** Bold border / High contrast ring.
* Clicking any question cell jumps directly to that question.

#### D. Review Screen (Before Final Submission)
* Displays table of all questions before submitting:
  * Columns: Question #, Status (Answered / Unanswered), Flagged Status.
  * Warning alert if unanswered questions remain.
  * "Return to Exam" and "Final Submit" buttons.

#### E. Results & Analytics Dashboard (Post Exam)
* **Overall Score:** Calculated out of 1000 points (Passing score: 720). Display Pass/Fail status.
* **Domain Performance Breakdown:**
  * Progress bars / statistics showing percentage correct for each of the 4 AWS Domains.
* **Detailed Question Review Mode:**
  * List all questions with filtering options: *All*, *Incorrect Only*, *Flagged Only*.
  * Display user's choice vs correct `solutions`.
  * Highlight correct answers in Green, incorrect user selections in Red.
  * Display full `explanation` text formatted cleanly.
  * Show the same **Key words** chips (`key_word`) at the bottom of each question's explanation box, using the shared `KeyWords` component.

---

## 5. Proposed Component Structure (`one-exam`)

```
src/
├── assets/
│   └── styles/
├── components/
│   ├── ExamHeader.jsx        # OnVUE header bar, timer, flag toggle
│   ├── QuestionCard.jsx      # Handles question text, choices, single/multi select
│   ├── NavigationFooter.jsx  # Prev, Next, Review, Submit controls
│   ├── QuestionGridModal.jsx # Jump-to-question grid
│   ├── ReviewScreen.jsx      # Summary before final submit
│   ├── ResultDashboard.jsx   # Score, Domain analytics, review explanations
│   └── Timer.jsx             # Countdown timer hook & visual representation
├── context/
│   └── ExamContext.jsx       # State management (answers, flagged, timer, current Q)
├── utils/
│   ├── domainClassifier.js   # Domain classification and weighted sampling
│   ├── scoreCalculator.js    # AWS scaled score (100-1000) & domain accuracy
│   └── storage.js            # LocalStorage persistence helpers
├── data/
│   └── questions.json        # Question bank (choices, solutions, explanation, key_word)
├── App.jsx
└── index.js
```

---

## 6. Implementation Checklist for Claude Code

When writing the code for `one-exam`, please follow these steps sequentially:

1. [ ] **Project Setup:** Verify CRA setup, install `lucide-react` and configure CSS/Tailwind.
2. [ ] **Data Pipeline:** Create `utils/domainClassifier.js` to parse `question.json`, categorize questions into AWS SAA-C03 4 domains, and sample questions according to official weights (30% / 26% / 24% / 20%).
3. [ ] **Context Setup:** Create `ExamContext.jsx` to maintain user selections `{[qId]: ['A']}`, flagged questions `Set`, current index, time remaining, and status (`CONFIG`, `EXAM`, `REVIEW`, `RESULT`). Add `localStorage` auto-save.
4. [ ] **UI Implementation:**
   * Build `ExamHeader` mirroring Pearson VUE OnVUE aesthetics.
   * Build `QuestionCard` supporting single (Radio) & multi (Checkbox) selection modes.
   * Build `QuestionGridModal` showing answered/flagged statuses.
   * Build `ResultDashboard` showing AWS scaled score (100–1000), domain breakdown bars, and step-by-step solution review with `explanation`.
5. [ ] **Testing & Polish:** Ensure full responsiveness, smooth navigation, and edge case handling (e.g., handling missing fields gracefully).
6. [ ] **Data Quality:** Validate `questions.json` against the Field Rules in section 3. Every `key_word` phrase is a substring of its question, every `solutions` letter exists in `choices`, no option text contains another option's letter prefix, and the `solutions` count matches the `(Choose N.)` hint.

### Known Data Issues
* About 35 questions have question text cut off mid-sentence (e.g. Q1, Q19, Q73, Q92, Q461, Q471, Q610). Their `key_word` lists are short because little text remains. Q73 and Q92 lost their `(Choose two.)` hint to the truncation.
* Q96, Q253, Q423, Q429 and Q494 refer to an IAM policy or JSON document that is missing from the data.
* About 12 stored answers are debatable and were left unchanged (e.g. Q82, Q136, Q156, Q157, Q324, Q328, Q372, Q405, Q523, Q536, Q663).

---
*Generated for project `one-exam` - Local AWS SAA-C03 OnVUE Simulator Prompt.*
