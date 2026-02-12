"use client";

import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

export default function WorkerDetailsModal({ worker, onClose, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (worker)
      setForm({
        id: worker.id,
        name: worker.name ?? "",
        age: worker.age ?? "",
        bloodGroup: worker.bloodGroup ?? "",
        knownDiseases: worker.knownDiseases ?? "",
        emergencyContact: worker.emergencyContact ?? "",
        location: worker.location ?? "",
      });
  }, [worker]);

  if (!worker) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleSave() {
    const updated = { ...worker, ...form };
    if (onSave) onSave(updated);
    setIsEditing(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <Card
        className="max-w-lg w-full p-6 bg-gray-900 border border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-yellow-400">
            {form.name || worker.name}
          </h3>
          <div className="flex items-center gap-3">
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} className="px-3 py-1">
                Edit
              </Button>
            )}
            <button
              className="text-gray-400 hover:text-gray-200"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Age:</span>
            {isEditing ? (
              <input
                name="age"
                value={form.age}
                onChange={handleChange}
                className="ml-4 w-32 px-2 py-1 rounded bg-gray-800 text-gray-200 border border-gray-700"
              />
            ) : (
              <span>{worker.age ?? "N/A"}</span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Blood Group:</span>
            {isEditing ? (
              <input
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
                className="ml-4 w-32 px-2 py-1 rounded bg-gray-800 text-gray-200 border border-gray-700"
              />
            ) : (
              <span>{worker.bloodGroup ?? "N/A"}</span>
            )}
          </div>

          <div className="flex items-start justify-between">
            <span className="text-gray-500">Known Diseases:</span>
            {isEditing ? (
              <textarea
                name="knownDiseases"
                value={form.knownDiseases}
                onChange={handleChange}
                rows={3}
                className="ml-4 flex-1 px-3 py-2 rounded bg-gray-800 text-gray-200 border border-gray-700 resize-vertical"
              />
            ) : (
              <div className="ml-4 text-gray-300 whitespace-pre-line">
                {worker.knownDiseases && worker.knownDiseases.trim() !== ""
                  ? worker.knownDiseases
                  : "None reported"}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Emergency Contact:</span>
            {isEditing ? (
              <input
                name="emergencyContact"
                value={form.emergencyContact}
                onChange={handleChange}
                className="ml-4 w-48 px-2 py-1 rounded bg-gray-800 text-gray-200 border border-gray-700"
              />
            ) : (
              <span className="text-gray-300">
                {worker.emergencyContact ?? "N/A"}
              </span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Location:</span>
            {isEditing ? (
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className="ml-4 w-48 px-2 py-1 rounded bg-gray-800 text-gray-200 border border-gray-700"
              />
            ) : (
              <span className="text-gray-300">
                {worker.location ?? "Unknown"}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          {isEditing ? (
            <>
              <Button onClick={handleSave} className="px-4 py-2">
                Save
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setForm({ ...worker });
                }}
                className="px-4 py-2"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={onClose} className="px-4 py-2">
              Close
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
