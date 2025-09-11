// app/context/AddressContext.tsx
"use client";
import { createContext, useContext, useState } from "react";

type AddressCtx = {
  address: string;
  setAddress: (v: string) => void;
  state: string;
  setState: (v: string) => void;
};

const Ctx = createContext<AddressCtx | null>(null);

export default function AddressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  return (
    <Ctx.Provider value={{ address, setAddress, state, setState }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAddress() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAddress must be used within AddressProvider");
  return c;
}
