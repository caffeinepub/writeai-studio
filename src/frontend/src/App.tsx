import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Clapperboard,
  Clock,
  Copy,
  Download,
  FileText,
  Flame,
  Loader2,
  Mail,
  PenLine,
  RefreshCw,
  Smartphone,
  Sparkles,
  Wand2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  ContentType,
  type GeneratedContent,
  Language,
  Length,
  Tone,
  useGenerateContent,
  useGetAllTemplates,
  useGetHistory,
  useRewriteText,
} from "./hooks/useQueries";

// ─── Writing Modes ───────────────────────────────────────────────────────────

const WRITING_MODES = [
  {
    id: ContentType.blog,
    icon: FileText,
    emoji: "📝",
    title: "Blog Writer",
    desc: "Articles, listicles, how-tos",
    color: "from-purple-500/20 to-purple-600/10",
    border: "border-purple-500/30 hover:border-purple-400/60",
    glow: "hover:shadow-[0_0_20px_oklch(0.62_0.22_295/0.25)]",
  },
  {
    id: ContentType.story,
    icon: BookOpen,
    emoji: "📖",
    title: "Story Generator",
    desc: "Fiction, drama, thriller",
    color: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-500/30 hover:border-blue-400/60",
    glow: "hover:shadow-[0_0_20px_oklch(0.65_0.22_260/0.25)]",
  },
  {
    id: ContentType.email,
    icon: Mail,
    emoji: "📧",
    title: "Email Writer",
    desc: "Professional & personal emails",
    color: "from-emerald-500/20 to-emerald-600/10",
    border: "border-emerald-500/30 hover:border-emerald-400/60",
    glow: "hover:shadow-[0_0_20px_oklch(0.7_0.2_160/0.25)]",
  },
  {
    id: ContentType.resume,
    icon: Briefcase,
    emoji: "📄",
    title: "Resume Builder",
    desc: "CV & cover letters",
    color: "from-amber-500/20 to-amber-600/10",
    border: "border-amber-500/30 hover:border-amber-400/60",
    glow: "hover:shadow-[0_0_20px_oklch(0.75_0.2_70/0.25)]",
  },
  {
    id: ContentType.socialMedia,
    icon: Smartphone,
    emoji: "📱",
    title: "Social Media",
    desc: "Instagram, Twitter captions",
    color: "from-pink-500/20 to-pink-600/10",
    border: "border-pink-500/30 hover:border-pink-400/60",
    glow: "hover:shadow-[0_0_20px_oklch(0.65_0.26_340/0.25)]",
  },
  {
    id: ContentType.tamilContent,
    icon: Flame,
    emoji: "🔥",
    title: "Tamil Content",
    desc: "Tamil stories, captions, scripts",
    color: "from-orange-500/20 to-red-500/10",
    border: "border-orange-500/30 hover:border-orange-400/60",
    glow: "hover:shadow-[0_0_20px_oklch(0.7_0.24_40/0.25)]",
  },
  {
    id: ContentType.script,
    icon: Clapperboard,
    emoji: "🎬",
    title: "Script Writer",
    desc: "Reels, short films, dialogues",
    color: "from-violet-500/20 to-fuchsia-500/10",
    border: "border-violet-500/30 hover:border-violet-400/60",
    glow: "hover:shadow-[0_0_20px_oklch(0.6_0.24_310/0.25)]",
  },
] as const;

// ─── Templates by Mode ────────────────────────────────────────────────────────

const MODE_TEMPLATES: Record<ContentType, string[]> = {
  [ContentType.blog]: [
    "How-to guide",
    "Listicle (Top 10)",
    "Opinion piece",
    "Product review",
    "Travel blog",
    "Tech explainer",
  ],
  [ContentType.story]: [
    "Romance thriller",
    "Horror story",
    "Comedy skit",
    "Sci-fi adventure",
    "Emotional drama",
    "Mystery plot",
  ],
  [ContentType.email]: [
    "Apology email",
    "Follow-up email",
    "Intro email",
    "Job application",
    "Meeting request",
    "Thank you note",
  ],
  [ContentType.resume]: [
    "Tech resume",
    "Fresher CV",
    "Cover letter",
    "Designer portfolio",
    "MBA profile",
    "LinkedIn summary",
  ],
  [ContentType.socialMedia]: [
    "Travel caption",
    "Food post",
    "Motivation quote",
    "Product launch",
    "Event promo",
    "Personal milestone",
  ],
  [ContentType.tamilContent]: [
    "Tamil love story",
    "Tamil caption",
    "Tamil YouTube intro",
    "Tamil motivational post",
    "Kollywood dialogue",
    "Tamil poem",
  ],
  [ContentType.script]: [
    "30 sec reel",
    "5 min short film",
    "Dialogue scene",
    "YouTube intro",
    "Startup pitch",
    "Comedy sketch",
  ],
  [ContentType.template]: [],
};

// ─── Rewrite Modes ────────────────────────────────────────────────────────────

type RewriteMode = "simplify" | "professional" | "emotional" | "translate";

const REWRITE_MODES: { id: RewriteMode; label: string; emoji: string }[] = [
  { id: "simplify", label: "Simplify", emoji: "✂️" },
  { id: "professional", label: "Make Professional", emoji: "💼" },
  { id: "emotional", label: "Make Emotional", emoji: "💖" },
  { id: "translate", label: "Translate", emoji: "🌐" },
];

// ─── Pill label component ─────────────────────────────────────────────────────

function PillLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
      {children}
    </span>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<"create" | "rewrite">("create");

  // Create state
  const [selectedMode, setSelectedMode] = useState<ContentType>(
    ContentType.blog,
  );
  const [tone, setTone] = useState<Tone>(Tone.casual);
  const [length, setLength] = useState<Length>(Length.medium);
  const [language, setLanguage] = useState<Language>(Language.english);
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");

  // Rewrite state
  const [rewriteInput, setRewriteInput] = useState("");
  const [rewriteMode, setRewriteMode] = useState<RewriteMode>("professional");
  const [rewriteTone, setRewriteTone] = useState<Tone>(Tone.formal);
  const [rewriteLanguage, setRewriteLanguage] = useState<Language>(
    Language.english,
  );
  const [translateTarget, setTranslateTarget] = useState<Language>(
    Language.tamil,
  );
  const [rewriteOutput, setRewriteOutput] = useState("");

  const [historyOpen, setHistoryOpen] = useState(false);

  const { data: history = [] } = useGetHistory();
  const { data: backendTemplates = [] } = useGetAllTemplates();
  const generateMutation = useGenerateContent();
  const rewriteMutation = useRewriteText();

  const currentMode = WRITING_MODES.find((m) => m.id === selectedMode)!;

  const currentTemplates =
    backendTemplates.length > 0
      ? backendTemplates.map(([name]) => name)
      : (MODE_TEMPLATES[selectedMode] ?? []);

  const handleTemplateClick = useCallback((template: string) => {
    setPrompt(`Write a ${template.toLowerCase()} about `);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt first!");
      return;
    }
    try {
      const result = await generateMutation.mutateAsync({
        contentType: selectedMode,
        tone,
        length,
        language,
        prompt: prompt.trim(),
      });
      setOutput(result);
      toast.success("Content generated!");
    } catch {
      toast.error("Generation failed. Please try again.");
    }
  };

  const handleRewrite = async () => {
    if (!rewriteInput.trim()) {
      toast.error("Please paste some text to rewrite!");
      return;
    }
    try {
      const options = {
        simplify: rewriteMode === "simplify",
        makeProfessional: rewriteMode === "professional",
        makeEmotional: rewriteMode === "emotional",
        translate: rewriteMode === "translate",
        targetLanguage:
          rewriteMode === "translate" ? translateTarget : undefined,
      };
      const result = await rewriteMutation.mutateAsync({
        originalText: rewriteInput.trim(),
        tone: rewriteTone,
        language: rewriteLanguage,
        options,
      });
      setRewriteOutput(result);
      toast.success("Text rewritten!");
    } catch {
      toast.error("Rewrite failed. Please try again.");
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const contentTypeLabel = (ct: ContentType) =>
    WRITING_MODES.find((m) => m.id === ct)?.title ?? ct;

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" theme="dark" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center glow-purple">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl gradient-text leading-none">
                WriteAI Studio
              </h1>
              <p className="text-muted-foreground text-xs mt-0.5">
                Your AI-powered creative writing companion
              </p>
            </div>
          </div>

          <div className="flex gap-1 p-1 glass rounded-xl">
            <button
              type="button"
              data-ocid="nav.create.tab"
              onClick={() => setActiveTab("create")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "create"
                  ? "gradient-bg text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <PenLine className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Create
            </button>
            <button
              type="button"
              data-ocid="nav.rewrite.tab"
              onClick={() => setActiveTab("rewrite")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "rewrite"
                  ? "gradient-bg text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Wand2 className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Rewrite
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "create" ? (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
            >
              {/* Hero */}
              <div className="text-center mb-10">
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="font-display font-bold text-3xl md:text-4xl lg:text-5xl mb-3"
                >
                  What do you want to{" "}
                  <span className="gradient-text">create today?</span>
                </motion.h2>
                <p className="text-muted-foreground text-lg">
                  Choose a writing mode and let AI do the heavy lifting.
                </p>
              </div>

              {/* Writing Modes Grid */}
              <section className="mb-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {WRITING_MODES.map((mode, i) => (
                    <motion.button
                      type="button"
                      key={mode.id}
                      data-ocid={`mode.${mode.id}.card`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => {
                        setSelectedMode(mode.id);
                        setOutput("");
                      }}
                      className={`relative p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        selectedMode === mode.id
                          ? `border-primary/80 bg-gradient-to-br ${mode.color} shadow-glow`
                          : `border-border bg-card/50 ${mode.border} ${mode.glow}`
                      }`}
                    >
                      {selectedMode === mode.id && (
                        <div className="absolute inset-0 rounded-xl gradient-border opacity-60" />
                      )}
                      <div className="text-2xl mb-2">{mode.emoji}</div>
                      <div className="font-semibold text-sm text-foreground">
                        {mode.title}
                      </div>
                      <div className="text-muted-foreground text-xs mt-0.5">
                        {mode.desc}
                      </div>
                      {selectedMode === mode.id && (
                        <motion.div
                          layoutId="mode-indicator"
                          className="absolute top-2 right-2 w-2 h-2 rounded-full gradient-bg"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* Quick Templates */}
              <section className="mb-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                  ⚡ Quick Templates
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {currentTemplates.map((tpl, i) => (
                    <motion.button
                      type="button"
                      key={tpl}
                      data-ocid={`template.item.${i + 1}`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => handleTemplateClick(tpl)}
                      className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm border border-border/60 text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-primary/10 transition-all"
                    >
                      {tpl}
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* Controls Bar */}
              <section className="glass rounded-xl p-4 mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                  {/* Tone */}
                  <div className="flex flex-col gap-1.5">
                    <PillLabel>Tone</PillLabel>
                    <div
                      className="flex gap-1.5"
                      data-ocid="controls.tone.toggle"
                    >
                      {(
                        [
                          Tone.formal,
                          Tone.casual,
                          Tone.funny,
                          Tone.emotional,
                        ] as Tone[]
                      ).map((t) => (
                        <button
                          type="button"
                          key={t}
                          data-ocid={`tone.${t}.toggle`}
                          onClick={() => setTone(t)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${
                            tone === t
                              ? "gradient-bg text-white"
                              : "border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator
                    orientation="vertical"
                    className="h-8 hidden sm:block"
                  />

                  {/* Length */}
                  <div className="flex flex-col gap-1.5">
                    <PillLabel>Length</PillLabel>
                    <div
                      className="flex gap-1.5"
                      data-ocid="controls.length.toggle"
                    >
                      {(
                        [
                          { label: "Short", val: Length.short_ },
                          { label: "Medium", val: Length.medium },
                          { label: "Long", val: Length.long_ },
                        ] as { label: string; val: Length }[]
                      ).map(({ label, val }) => (
                        <button
                          type="button"
                          key={val}
                          data-ocid={`length.${label.toLowerCase()}.toggle`}
                          onClick={() => setLength(val)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            length === val
                              ? "gradient-bg text-white"
                              : "border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator
                    orientation="vertical"
                    className="h-8 hidden sm:block"
                  />

                  {/* Language */}
                  <div className="flex flex-col gap-1.5">
                    <PillLabel>Language</PillLabel>
                    <div
                      className="flex gap-1.5"
                      data-ocid="controls.language.toggle"
                    >
                      {(
                        [
                          { label: "English", val: Language.english },
                          { label: "Tamil", val: Language.tamil },
                          { label: "Hinglish", val: Language.hinglish },
                        ] as { label: string; val: Language }[]
                      ).map(({ label, val }) => (
                        <button
                          type="button"
                          key={val}
                          data-ocid={`language.${val}.toggle`}
                          onClick={() => setLanguage(val)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            language === val
                              ? "gradient-bg text-white"
                              : "border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Prompt Input */}
              <section className="mb-6">
                <div className="relative">
                  <Textarea
                    data-ocid="create.prompt.textarea"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`Describe what you want to write... e.g., "A ${currentMode.title.toLowerCase()} about morning routines for productivity"`}
                    className="min-h-[140px] resize-none glass border-border/60 focus:border-primary/60 text-foreground placeholder:text-muted-foreground/60 text-base rounded-xl transition-all"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) handleGenerate();
                    }}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-muted-foreground/50">
                    Ctrl+Enter to generate
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <Button
                    data-ocid="create.generate.primary_button"
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending}
                    className="gradient-bg text-white hover:opacity-90 transition-opacity px-8 py-5 text-base font-semibold rounded-xl glow-purple border-0"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate ✨
                      </>
                    )}
                  </Button>
                </div>
              </section>

              {/* Output */}
              <AnimatePresence>
                {output && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    data-ocid="create.output.section"
                    className="mb-6"
                  >
                    <div className="glass rounded-xl p-5 gradient-border">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full gradient-bg animate-pulse-glow" />
                          <span className="text-sm font-medium gradient-text">
                            Generated Output
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-xs bg-primary/10 text-primary/80 border-primary/20"
                          >
                            {currentMode.title}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            data-ocid="create.output.copy.button"
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(output)}
                            className="text-muted-foreground hover:text-foreground h-8 px-2"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            data-ocid="create.output.download.button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              downloadText(output, "writeai-output.txt")
                            }
                            className="text-muted-foreground hover:text-foreground h-8 px-2"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            data-ocid="create.output.regenerate.button"
                            variant="ghost"
                            size="sm"
                            onClick={handleGenerate}
                            disabled={generateMutation.isPending}
                            className="text-muted-foreground hover:text-foreground h-8 px-2"
                          >
                            <RefreshCw
                              className={`w-4 h-4 ${generateMutation.isPending ? "animate-spin" : ""}`}
                            />
                          </Button>
                        </div>
                      </div>
                      <ScrollArea className="max-h-[400px]">
                        <pre className="whitespace-pre-wrap text-sm text-foreground/90 font-sans leading-relaxed">
                          {output}
                        </pre>
                      </ScrollArea>
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>

              {/* History Panel */}
              <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
                <CollapsibleTrigger
                  data-ocid="history.panel.toggle"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full py-2"
                >
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Recent History</span>
                  {history.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 text-xs bg-muted"
                    >
                      {history.length}
                    </Badge>
                  )}
                  <div className="ml-auto">
                    {historyOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <AnimatePresence>
                    {historyOpen && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-2 space-y-2"
                        data-ocid="history.panel.section"
                      >
                        {history.length === 0 ? (
                          <div
                            data-ocid="history.empty_state"
                            className="text-center py-8 text-muted-foreground text-sm"
                          >
                            No history yet. Start creating!
                          </div>
                        ) : (
                          history
                            .slice(0, 5)
                            .map((item: GeneratedContent, i: number) => (
                              <motion.div
                                key={item.id}
                                data-ocid={`history.item.${i + 1}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass rounded-lg p-3 flex items-start gap-3 cursor-pointer hover:border-primary/30 transition-all"
                                onClick={() => setOutput(item.generatedText)}
                              >
                                <div className="text-lg mt-0.5">
                                  {WRITING_MODES.find(
                                    (m) => m.id === item.contentType,
                                  )?.emoji ?? "📄"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-foreground">
                                      {contentTypeLabel(item.contentType)}
                                    </span>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-muted/50 capitalize"
                                    >
                                      {item.tone}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {item.originalPrompt}
                                  </p>
                                </div>
                              </motion.div>
                            ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          ) : (
            /* ── Rewrite Tab ─────────────────────────────────────────────── */
            <motion.div
              key="rewrite"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center mb-10">
                <h2 className="font-display font-bold text-3xl md:text-4xl mb-3">
                  AI <span className="gradient-text">Rewrite Tool</span>
                </h2>
                <p className="text-muted-foreground text-lg">
                  Paste your text and transform it instantly.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Input side */}
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-foreground/80 mb-2 block">
                      Your Text
                    </span>
                    <Textarea
                      data-ocid="rewrite.input.textarea"
                      value={rewriteInput}
                      onChange={(e) => setRewriteInput(e.target.value)}
                      placeholder="Paste your text here to rewrite, improve, or translate..."
                      className="min-h-[200px] resize-none glass border-border/60 focus:border-primary/60 rounded-xl text-sm"
                    />
                  </div>

                  {/* Rewrite modes */}
                  <div>
                    <PillLabel>Rewrite Mode</PillLabel>
                    <div
                      className="grid grid-cols-2 gap-2 mt-2"
                      data-ocid="rewrite.mode.toggle"
                    >
                      {REWRITE_MODES.map((mode) => (
                        <button
                          type="button"
                          key={mode.id}
                          data-ocid={`rewrite.${mode.id}.button`}
                          onClick={() => setRewriteMode(mode.id)}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                            rewriteMode === mode.id
                              ? "gradient-bg text-white border-transparent"
                              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          }`}
                        >
                          <span>{mode.emoji}</span>
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Translate target */}
                  <AnimatePresence>
                    {rewriteMode === "translate" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <PillLabel>Translate to</PillLabel>
                        <Select
                          value={translateTarget}
                          onValueChange={(v) =>
                            setTranslateTarget(v as Language)
                          }
                        >
                          <SelectTrigger
                            data-ocid="rewrite.translate.select"
                            className="glass border-border/60 mt-2"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value={Language.tamil}>
                              Tamil 🔥
                            </SelectItem>
                            <SelectItem value={Language.english}>
                              English 🌐
                            </SelectItem>
                            <SelectItem value={Language.hinglish}>
                              Hinglish 🇮🇳
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Tone and Language for rewrite */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <PillLabel>Tone</PillLabel>
                      <Select
                        value={rewriteTone}
                        onValueChange={(v) => setRewriteTone(v as Tone)}
                      >
                        <SelectTrigger
                          data-ocid="rewrite.tone.select"
                          className="glass border-border/60 mt-2"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value={Tone.formal}>Formal</SelectItem>
                          <SelectItem value={Tone.casual}>Casual</SelectItem>
                          <SelectItem value={Tone.funny}>Funny</SelectItem>
                          <SelectItem value={Tone.emotional}>
                            Emotional
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <PillLabel>Language</PillLabel>
                      <Select
                        value={rewriteLanguage}
                        onValueChange={(v) => setRewriteLanguage(v as Language)}
                      >
                        <SelectTrigger
                          data-ocid="rewrite.language.select"
                          className="glass border-border/60 mt-2"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value={Language.english}>
                            English
                          </SelectItem>
                          <SelectItem value={Language.tamil}>Tamil</SelectItem>
                          <SelectItem value={Language.hinglish}>
                            Hinglish
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    data-ocid="rewrite.submit_button"
                    onClick={handleRewrite}
                    disabled={rewriteMutation.isPending}
                    className="w-full gradient-bg text-white hover:opacity-90 py-5 text-base font-semibold rounded-xl glow-pink border-0"
                  >
                    {rewriteMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Rewriting...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        Rewrite Now ✨
                      </>
                    )}
                  </Button>
                </div>

                {/* Output side */}
                <div>
                  <span className="text-sm font-medium text-foreground/80 mb-2 block">
                    Rewritten Output
                  </span>
                  {rewriteOutput ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      data-ocid="rewrite.output.section"
                      className="glass rounded-xl p-4 gradient-border h-full min-h-[200px]"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full gradient-bg animate-pulse-glow" />
                          <span className="text-sm font-medium gradient-text">
                            Output
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            data-ocid="rewrite.output.copy.button"
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(rewriteOutput)}
                            className="h-7 px-2 text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            data-ocid="rewrite.output.download.button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              downloadText(rewriteOutput, "writeai-rewrite.txt")
                            }
                            className="h-7 px-2 text-muted-foreground hover:text-foreground"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <ScrollArea className="max-h-[400px]">
                        <pre className="whitespace-pre-wrap text-sm text-foreground/90 font-sans leading-relaxed">
                          {rewriteOutput}
                        </pre>
                      </ScrollArea>
                    </motion.div>
                  ) : (
                    <div
                      data-ocid="rewrite.output.empty_state"
                      className="glass rounded-xl min-h-[200px] flex flex-col items-center justify-center text-center p-8 border-dashed"
                    >
                      <Wand2 className="w-10 h-10 text-muted-foreground/40 mb-3" />
                      <p className="text-muted-foreground text-sm">
                        Your rewritten text will appear here
                      </p>
                      <p className="text-muted-foreground/60 text-xs mt-1">
                        Paste text and hit &ldquo;Rewrite Now&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()}. Built with{" "}
          <span className="text-accent">&hearts;</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/80 hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
