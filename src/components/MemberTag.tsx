import { useMembers } from "@/hooks/useMembers";
import { MemberDot } from "./MemberFilterBar";

export function MemberTag({ memberId }: { memberId: string | null | undefined }) {
  const { data: members = [] } = useMembers();
  if (!memberId) return null;
  const m = members.find((x) => x.id === memberId);
  if (!m) return null;
  return <MemberDot color={m.color} label={m.short_name || m.name} emoji={m.emoji} />;
}
