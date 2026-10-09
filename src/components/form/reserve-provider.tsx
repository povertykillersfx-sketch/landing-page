"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { CountryOption } from "@/lib/countries";
import { ReserveForm } from "@/components/form/reserve-form";

type ReserveContextValue = {
  open: () => void;
  close: () => void;
  opened: boolean;
};

const ReserveContext = createContext<ReserveContextValue | null>(null);

export function useReserveForm() {
  return useContext(ReserveContext);
}

export function ReserveProvider({
  countries,
  children,
}: {
  countries: CountryOption[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [opened, setOpened] = useState(false);
  const open = useCallback(() => setOpened(true), []);
  const close = useCallback(() => setOpened(false), []);
  useEffect(() => {
    if (pathname === "/book-call") setOpened(false);
  }, [pathname]);
  const value = useMemo(() => ({ open, close, opened }), [open, close, opened]);
  return (
    <ReserveContext.Provider value={value}>
      {children}
      {opened ? <ReserveForm countries={countries} onClose={close} /> : null}
    </ReserveContext.Provider>
  );
}
