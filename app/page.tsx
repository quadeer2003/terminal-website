
"use client";
import { autocompletion, CompletionContext, completionKeymap, CompletionResult } from "@codemirror/autocomplete";
import { DM_Sans } from "next/font/google";
import { Aclonica } from "next/font/google";
import { useState, useRef, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { vim } from "@replit/codemirror-vim";
import { cpp } from "@codemirror/lang-cpp";
import { oneDark } from "@codemirror/theme-one-dark";
import { keymap } from "@codemirror/view";
import { historyKeymap, defaultKeymap } from "@codemirror/commands";

// Load fonts
const font = DM_Sans({
  weight: "400",
  subsets: ["latin"],
});
const fonth = Aclonica({
  weight: "400",
  subsets: ["latin"],
});

// Custom autocompletion configuration
const customCompletion = autocompletion({
  override: [
    async (context: CompletionContext): Promise<CompletionResult> => {
      const keywords = [
        "int", "float", "double", "char", "void", "for", "while", "if", "else",
        "return", "switch", "case", "break", "continue", "class", "public",
        "private", "protected", "try", "catch", "throw", "template", "typename",
        "static", "const", "unsigned", "long", "short", "sizeof", "include",
        "namespace", "using", "this", "virtual", "new", "delete", "struct",
        "enum", "operator", "dynamic_cast", "static_cast", "const_cast", "reinterpret_cast"
      ];

      const word = context.matchBefore(/\w*/);

      // Handle the case where `word` might be `null`
      if (!word || word.text.length < 2) {
        return {
          from: context.pos,
          to: context.pos,
          options: [],
        };
      }

      const completions = keywords
        .filter(keyword => keyword.startsWith(word.text))
        .map(keyword => ({ label: keyword, type: "keyword" }));

      return {
        from: word.from,
        to: word.to,
        options: completions,
      };
    }
  ]
});


const commands = [
  "help",
  "about",
  "projects",
  "contact",
  "clear",
  "vim"
];

const Home = () => {
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string[]>([]);
  const [showHelpMessage, setShowHelpMessage] = useState<boolean>(true);
  const [isVimMode, setIsVimMode] = useState<boolean>(false);
  const [editorContent, setEditorContent] = useState<string>(""); // To store editor content
  const [suggestion, setSuggestion] = useState<string | null>(null); // Updated to handle single suggestion
  const [selectedIndex, setSelectedIndex] = useState<number>(-1); // Track selected suggestion index
  const terminalRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null); // Temporarily using `any` for ref
  const inputRef = useRef<HTMLInputElement>(null); // Ref for the input element

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    // Update suggestion based on input
    if (input) {
      const filtered = commands.filter(command =>
        command.startsWith(input.trim())
      );
      setSuggestion(filtered[0] || null); // Set the first suggestion or null
      setSelectedIndex(-1); // Reset the selected index when input changes
    } else {
      setSuggestion(null);
    }
  }, [input]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setShowHelpMessage(e.target.value === "");
  };

  const processCommand = (command: string) => {
    if (command === "clear") {
      setOutput([]);
    } else if (command === "vim") {
      setIsVimMode(true);
    } else {
      setOutput((prevOutput) => [
        ...prevOutput,
        `quadeer@pc:~$ ${command}`,
        ...handleCommand(command),
      ]);
    }
  };

  const handleCommand = (command: string) => {
    switch (command) {
      case "help":
        return [
          "Available commands:",
          ' <span style="color:green">vim</span> :     Enter Vim mode to code',
          ' <span style="color:green">help</span> :     Show this help message',
          ' <span style="color:green">about</span> :    Learn more about me',
          ' <span style="color:green">projects</span> : See my projects',
          ' <span style="color:green">contact</span> :  Get in touch',
          ' <span style="color:green">clear</span> :  Clear screen',
        ];
      case "about":
        return ["I am a Linux enthusiast with a passion for AI/ML and a keen interest in cybersecurity."];
      case "projects":
        return ["Project 1: Awesome Project", "Project 2: Another Cool Project"];
      case "contact":
        return ["Email: example@example.com", "LinkedIn: linkedin.com/in/example"];
      default:
        return [`'${command.replace(/'/g, "&#39;")}' is not recognized as a valid command. Type 'help' to see available commands.`];
    }
  };





  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      processCommand(input.trim());
      setInput("");
      setSuggestion(null);
      setShowHelpMessage(true);
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (suggestion) {
        setInput(suggestion);
        setSuggestion(null);
        setShowHelpMessage(false);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prevIndex) =>
        prevIndex < (suggestion ? [suggestion].length - 1 : 0) ? prevIndex + 1 : prevIndex
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : 0
      );
    }
  };

  const handleVimKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Vim commands are handled in the CodeMirror instance, so this can remain empty or be adjusted as needed.
  };

  const saveFile = () => {
    const blob = new Blob([editorContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "code.cpp"; // Adjust filename as needed
    a.click();
    URL.revokeObjectURL(url);
  };

  const getAutocompleteDisplay = () => {
    if (!suggestion || !input) return "";

    const index = suggestion.indexOf(input);
    if (index === -1) return "";

    const after = suggestion.slice(index + input.length);

    return after;
  };

  return (
    <div className={font.className}>
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/bg-d.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-black bg-opacity-30 md:backdrop-blur-0"></div>

        <div className="relative z-10 flex flex-col items-center justify-center p-4 w-full max-w-screen-lg">
          <h1 className={`text-2xl md:text-3xl font-bold mb-4 text-center ${fonth.className}`}>
            Quadeer&apos;s Terminal
          </h1>
          <div className="w-screen max-w-5xl p-4">
            <div
              className="bg-white bg-opacity-10 backdrop-blur-lg border border-white/20 rounded-lg w-full"
              style={{
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="flex items-center p-2 space-x-2 bg-gray-800 rounded-t-lg">
                <div className="w-3 h-3 bg-red-500 rounded-full cursor-pointer" title="Close"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full cursor-pointer" title="Minimize"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full cursor-pointer" title="Maximize"></div>
                <div className="flex-grow"></div>
                <div className="text-white text-sm px-4">Quadeer.dmskrose</div>
              </div>

              <div
                ref={terminalRef}
                className="p-4 h-[520px] overflow-y-auto bg-gray-900 bg-opacity-70 rounded-b-lg"
                onKeyDown={handleVimKeyDown}
                tabIndex={0}
              >
                <div className="mb-0">
                  <img src="/bot.gif" alt="Terminal Header" className="w-24 h-auto" />
                </div>
                {output.map((line, index) => (
                  <div
                    key={index}
                    className="mb-1 text-white"
                    dangerouslySetInnerHTML={{ __html: line }}
                  ></div>
                ))}
                {!isVimMode ? (
                  <div className="relative flex items-center">
                    <span className="mr-2 text-blue-400 whitespace-nowrap">quadeer@pc:~$</span>
                    <input
                      type="text"
                      className="bg-transparent focus:outline-none text-white w-full"
                      value={input}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      ref={inputRef}
                    />
                    {showHelpMessage && (
                      <span
                        className="absolute left-0 top-0 text-gray-500 cursor-pointer"
                        style={{ left: "8.5rem" }}
                        onClick={() => inputRef.current?.focus()}
                      >
                        Type &apos;help&apos; for a list of commands
                      </span>
                    )}
                    {input && (
                      <span
                        className="absolute top-0 text-gray-500"
                        style={{ left: `${input.length + 11.6}ch` }}
                      >
                        {getAutocompleteDisplay()}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <CodeMirror
                      value={`// Press "i" (insert mode) to start coding with Vim in Quadeer's terminal!\n// Supports all Vim key bindings, auto-complete, and syntax highlighting.`}
                      height="270px"
                      extensions={[
                        vim(), // Vim key bindings
                        cpp(), // C++ language support
                        oneDark, // Dark theme
                        keymap.of([...defaultKeymap, ...historyKeymap, ...completionKeymap]), // Keymaps for autocompletion and other commands
                        customCompletion, // Custom autocompletion
                      ]}
                      className="mt-4 border border-gray-700 rounded-lg"
                      onChange={(value) => setEditorContent(value)}
                      theme={oneDark}
                      ref={(ref) => {
                        if (ref) {
                          editorRef.current = ref.view;
                        }
                      }}
                    />

                    <div className="mt-4 flex space-x-2">
                      <button
                        className="bg-gray-800 text-white py-1 px-2 rounded text-sm border border-gray-700"
                        onClick={() => {
                          setIsVimMode(false);
                          setOutput((prevOutput) => [...prevOutput, "Vim mode deactivated"]);
                        }}
                      >
                        Exit Vim
                      </button>
                      <button
                        className="bg-gray-800 text-white py-1 px-2 rounded text-sm border border-gray-700"
                        onClick={saveFile}
                      >
                        Save File
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
