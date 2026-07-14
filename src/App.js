import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  X,
  Copy,
  Trash2,
  FileText,
  CheckCircle2,
  Search,
  Upload,
} from "lucide-react";

const App = () => {
  // Default keywords
  const [keywords, setKeywords] = useState(["blocking", "cleaning"]);
  const [newKeyword, setNewKeyword] = useState("");
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState([]);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef(null);

  // Function to add a new keyword
  const handleAddKeyword = (e) => {
    e.preventDefault();
    const trimmed = newKeyword.trim().toLowerCase();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setNewKeyword("");
    }
  };

  // Function to remove a keyword
  const handleRemoveKeyword = (keywordToRemove) => {
    setKeywords(keywords.filter((kw) => kw !== keywordToRemove));
  };

  // Function to process and filter the text
  const processText = () => {
    if (!inputText.trim() || keywords.length === 0) {
      setResults([]);
      return;
    }

    // Split text by lines
    const lines = inputText.split("\n");
    const matchedLines = [];

    lines.forEach((line) => {
      const lowerLine = line.toLowerCase();
      // Check if the line contains any of the keywords
      const hasMatch = keywords.some((kw) => lowerLine.includes(kw));

      if (hasMatch && line.trim() !== "") {
        matchedLines.push(line.trim());
      }
    });

    setResults(matchedLines);
  };

  // Auto-process when text or keywords change
  useEffect(() => {
    processText();
  }, [inputText, keywords]);

  // Function to copy results to clipboard
  const handleCopy = () => {
    if (results.length === 0) return;

    const textToCopy = results.join("\n");

    const fallbackCopy = () => {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      // Prevent scrolling when focusing on textarea
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand("copy");
        showCopiedFeedback();
      } catch (err) {
        console.error("Oops, unable to copy", err);
        alert("Gagal menyalin teks. Silakan salin secara manual.");
      }
      document.body.removeChild(textArea);
    };

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          showCopiedFeedback();
        })
        .catch((err) => {
          console.warn(
            "Clipboard API diblokir, menggunakan cara alternatif.",
            err
          );
          fallbackCopy();
        });
    } else {
      fallbackCopy();
    }
  };

  const showCopiedFeedback = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Highlight matched keywords in the result display
  const highlightText = (text) => {
    if (keywords.length === 0) return text;

    // Create a regex to match all keywords, case insensitive
    const regexPattern = new RegExp(`(${keywords.join("|")})`, "gi");
    const parts = text.split(regexPattern);

    return parts.map((part, index) => {
      // If the part matches a keyword, highlight it
      if (keywords.some((kw) => kw.toLowerCase() === part.toLowerCase())) {
        return (
          <span
            key={index}
            className="bg-teal-200 text-teal-900 font-semibold px-1 rounded"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Function to handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setInputText(content);
    };

    // Check file type and read accordingly
    if (
      file.type.match("text.*") ||
      file.name.endsWith(".log") ||
      file.name.endsWith(".csv")
    ) {
      reader.readAsText(file);
    } else {
      alert("Mohon upload file berbasis teks (.txt, .csv, .log).");
    }

    // Reset input so the same file can be uploaded again if needed
    e.target.value = "";
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-4 md:p-8 flex flex-col">
      <div className="max-w-6xl mx-auto space-y-6 flex-grow w-full">
        {/* Header */}
        <header className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-teal-600 p-3 rounded-lg text-white">
              <FileText size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Rekap Laporan Shift
              </h1>
              <p className="text-slate-500 text-sm">
                PLN Indonesia Power - Alat Bantu Filter Kata Kunci
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Input & Settings */}
          <div className="lg:col-span-1 space-y-6">
            {/* Keywords Manager */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
                <Search size={18} className="text-teal-600" />
                Kata Kunci Filter
              </h2>

              <form onSubmit={handleAddKeyword} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Tambah kata (misal: trip)"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Plus size={18} />
                </button>
              </form>

              <div className="flex flex-wrap gap-2">
                {keywords.map((kw) => (
                  <div
                    key={kw}
                    className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
                  >
                    <span>{kw}</span>
                    <button
                      onClick={() => handleRemoveKeyword(kw)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      title="Hapus kata kunci"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {keywords.length === 0 && (
                  <p className="text-sm text-slate-400 italic">
                    Belum ada kata kunci.
                  </p>
                )}
              </div>
            </div>

            {/* Input Text Area */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200 flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-800">
                  Teks Laporan Mentah
                </h2>
                <div className="flex gap-3">
                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".txt,.csv,.log"
                  />
                  <button
                    onClick={triggerFileInput}
                    className="text-slate-600 hover:text-teal-600 transition-colors flex items-center gap-1 text-sm bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded"
                    title="Upload File Teks (.txt, .log)"
                  >
                    <Upload size={16} /> Upload
                  </button>
                  <button
                    onClick={() => setInputText("")}
                    className="text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 text-sm"
                    title="Bersihkan teks"
                  >
                    <Trash2 size={16} /> Bersihkan
                  </button>
                </div>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste (tempel) laporan shift dari WhatsApp, Email, atau sistem di sini...&#10;&#10;Atau klik tombol Upload untuk memasukkan file teks (.txt).&#10;&#10;Sistem akan otomatis menyeleksi baris kalimat yang mengandung kata kunci di samping."
                className="flex-1 w-full p-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm leading-relaxed"
              ></textarea>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
              {/* Result Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    Hasil Rekapitulasi
                  </h2>
                  <p className="text-sm text-slate-500">
                    Ditemukan{" "}
                    <span className="font-bold text-teal-600">
                      {results.length}
                    </span>{" "}
                    baris kalimat.
                  </p>
                </div>

                <button
                  onClick={handleCopy}
                  disabled={results.length === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    results.length === 0
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : isCopied
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <CheckCircle2 size={18} /> Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy size={18} /> Salin Hasil
                    </>
                  )}
                </button>
              </div>

              {/* Result Content */}
              <div className="p-5 flex-1 overflow-auto bg-slate-50 min-h-[500px] rounded-b-xl">
                {results.length > 0 ? (
                  <ul className="space-y-3">
                    {results.map((line, index) => (
                      <li
                        key={index}
                        className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm text-sm text-slate-700 leading-relaxed pl-4 border-l-4 border-l-teal-500"
                      >
                        {highlightText(line)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                    <FileText size={48} className="opacity-20" />
                    <p>Hasil filter akan muncul di sini.</p>
                    <p className="text-sm max-w-sm text-center">
                      Pastikan ada teks laporan yang di-paste atau di-upload,
                      dan kata kunci sudah sesuai.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 pb-4 text-sm text-slate-500 font-medium">
          Built by Novan Darmawan
        </footer>
      </div>
    </div>
  );
};

export default App;
