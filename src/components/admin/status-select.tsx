"use client";

import { useEffect, useState } from "react";
import { LEAD_STATUSES } from "@/config/statuses";
import { updateLeadAction } from "@/app/admin/actions";

export function StatusSelect({ id, status }: { id: string; status: string }) {
  const [value, setValue] = useState(status);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setValue(status);
  }, [status]);

  async function onChange(next: string) {
    const previous = value;
    setValue(next);
    setPending(true);
    setMessage("");
    const result = await updateLeadAction(id, { status: next });
    setPending(false);
    if (!result.ok) {
      setValue(previous);
      setMessage(result.error);
      return;
    }
    setMessage("Saved");
    window.setTimeout(() => setMessage(""), 1600);
  }

  return (
    <label className="field">
      <span className="sr-only">Status</span>
      <select className="status-select" value={value} disabled={pending} aria-label="Lead status" onChange={(event) => onChange(event.target.value)}>
        {LEAD_STATUSES.map((item) => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </select>
      {message ? <span className={message === "Saved" ? "faint" : "field-error"}>{message}</span> : null}
    </label>
  );
}
