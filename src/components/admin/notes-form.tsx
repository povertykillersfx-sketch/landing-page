"use client";

import { useState } from "react";
import { updateLeadAction } from "@/app/admin/actions";

export function NotesForm({ id, notes }: { id: string; notes: string }) {
  const [value, setValue] = useState(notes);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setState("saving");
    setError("");
    const result = await updateLeadAction(id, { notes: value });
    if (!result.ok) {
      setState("error");
      setError(result.error);
      return;
    }
    setValue(result.notes || "");
    setState("saved");
  }

  return (
    <form onSubmit={onSubmit} className="fields">
      <label className="field" htmlFor="notes">
        <span>Internal notes</span>
        <textarea
          id="notes"
          className="input"
          value={value}
          maxLength={5000}
          placeholder="Add private notes about this lead."
          onChange={(event) => {
            setValue(event.target.value);
            setState("idle");
          }}
        />
      </label>
      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={state === "saving"}>
          {state === "saving" ? "Saving…" : "Save notes"}
        </button>
        {state === "saved" ? <span className="faint">Notes saved.</span> : null}
        {error ? <span className="field-error">{error}</span> : null}
      </div>
    </form>
  );
}
