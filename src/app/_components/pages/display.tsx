import { Badge } from "~/app/_components/ui/badge";

export const PageStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  return <Badge>{status}</Badge>;
};
