import { func } from "prop-types";
import "./style.css";
import { useEffect, useState } from "react";
import supabase from "./supabase";
// Github comment for testing

function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");

  useEffect(
    function () {
      async function getFacts() {
        setIsLoading(true);

        let query = supabase.from("facts").select("*");

        if (currentCategory !== "all") {
          query = query.eq("category", currentCategory);
        }

        const { data: facts, error } = await query
          .order("likes", { ascending: false })
          .limit(100);

        if (error == null) setFacts(facts);
        else alert("A página estoirou, não consegue trazer os fax.");
        setIsLoading(false);
      }
      getFacts();
    },
    [currentCategory]
  );

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />

      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}

      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {isLoading ? (
          <Loader />
        ) : (
          <FactList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  );
}

function Header({ showForm, setShowForm }) {
  const appTitle = "Fax site";

  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" alt="Today I Learned logo" />
        <h1>{appTitle}</h1>
      </div>
      <button
        className="btn btn-large btn-open"
        onClick={() => setShowForm((show) => !show)}
      >
        {showForm ? "Close" : "Faxxx? Click me!"}
      </button>
    </header>
  );
}

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "countries", color: "#16a34a" },
  { name: "sports", color: "#ef4444" },
  { name: "animals", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "bodybuilding", color: "#f97316" },
  { name: "cooking", color: "#8b5cf6" },
];

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const charTextLength = text.length;

  function isValidHttpUrl(string) {
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }

  async function handleSubmit(e) {
    // 1. Prevent the browser reload
    e.preventDefault();

    // 2. Check if data is valid. If so, create a new fact
    if (text && isValidHttpUrl(source) && category && charTextLength <= 200) {
      // 3. Upload fact to supabase and receive the new fact object
      setIsUploading(true);
      const { data: newFact, error } = await supabase
        .from("facts")
        .insert([{ text, source, category }])
        .select();

      setIsUploading(false);

      // 4. Add the new fact to the UI: add the fact to state

      if (!error) setFacts((facts) => [newFact[0], ...facts]);
    } else if (!isValidHttpUrl(source)) {
      alert("Tem que meter uma source válida.");
    }

    // 5. Reset input fields
    setText("");
    setSource("");
    setCategory("");

    // 6. Close the form
    setShowForm(false); // or just put false inside
  }

  return (
    <form className="fact-form " onSubmit={handleSubmit}>
      <input
        disabled={isUploading}
        type="text"
        placeholder="Share some faxxx"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <span>{200 - text.length}</span>
      <input
        disabled={isUploading}
        type="text"
        placeholder="Trustworthy source..."
        value={source}
        onChange={(e) => setSource(e.target.value)}
      />
      <select
        disabled={isUploading}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Choose category:</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("all")}
          >
            All
          </button>
        </li>

        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: cat.color }}
              onClick={() => setCurrentCategory(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

function FactList({ facts, setFacts }) {
  if (facts.length === 0) {
    return (
      <p className="message">
        No facts for this category yet! Create the first one 😊
      </p>
    );
  }
  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} setFacts={setFacts} />
        ))}
      </ul>
    </section>
  );
}

function Fact({ fact, setFacts }) {
  function applyFactCategoryColor() {
    const factCategory = fact.category;

    for (let i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].name === factCategory) {
        return CATEGORIES[i].color;
      }
    }
  }

  async function handleVote(columnName) {
    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ [columnName]: fact[columnName] + 1 })
      .eq("id", fact.id)
      .select();

    if (!error) {
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
      );
    }
  }

  return (
    <li key={fact.id} className="fact">
      <p>
        {fact.text}
        <a className="source" href={fact.source} target="_blank">
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: applyFactCategoryColor(),
        }}
      >
        {fact.category}
      </span>
      <div className="vote-buttons">
        <button onClick={() => handleVote("likes")}>👍 {fact.likes}</button>
        <button onClick={() => handleVote("votesMindBlowing")}>
          🤯 {fact.votesMindBlowing}
        </button>
        <button onClick={() => handleVote("votesCap")}>
          ⛔ {fact.votesCap}
        </button>
      </div>
    </li>
  );
}

export default App;
