"use client";

import { useState } from "react";

export default function NewQuestPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          buildingId: "test-building",
          rewardCredits: 10,
          creatorId: "test-user",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // This is where moderation rejections will surface!
        setError(data.error || "Failed to create quest.");
      } else {
        setMessage("Quest created successfully! It passed moderation.");
        setTitle("");
        setDescription("");
      }
    } catch (err: any) {
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border font-sans">
      <h1 className="text-2xl font-bold mb-4">Create a New Quest</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">
          <strong>Moderation Error:</strong> {error}
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md border border-green-300">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quest Title
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g. Need help studying for Calc 2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quest Description
          </label>
          <textarea
            required
            rows={4}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Describe what you need help with..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Checking AI Moderation..." : "Submit Quest"}
        </button>
      </form>
    </div>
  );
}
