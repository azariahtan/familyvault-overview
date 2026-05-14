import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MemberFilter = "all" | string; // "all" or member id

type AppStore = {
  memberFilter: MemberFilter;
  setMemberFilter: (m: MemberFilter) => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      memberFilter: "all",
      setMemberFilter: (memberFilter) => set({ memberFilter }),
    }),
    { name: "familyvault-ui" },
  ),
);
