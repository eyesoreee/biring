import { useQuery } from "@powersync/react";
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { useSession } from "@/lib/auth";

import { HOUSEHOLD_SQL, MEMBERS_SQL } from "./sql";
import type { Household, Member } from "./types";

type HouseholdContextValue = {
  id: string;
  household?: Household;
  members: Member[];
  me?: Member;
};

const HouseholdContext = createContext<HouseholdContextValue | null>(null);

export function HouseholdProvider({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const session = useSession();
  const { data: members } = useQuery<Member>(MEMBERS_SQL, [id]);
  const { data: households } = useQuery<Household>(HOUSEHOLD_SQL, [id]);

  const household = households[0];
  const me = members.find((member) => member.user_id === session?.user.id);

  const value = useMemo(
    () => ({ id, household, members, me }),
    [id, household, members, me],
  );

  return (
    <HouseholdContext.Provider value={value}>
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold() {
  const value = useContext(HouseholdContext);
  if (!value) {
    throw new Error("useHousehold must be used within HouseholdProvider");
  }
  return value;
}
