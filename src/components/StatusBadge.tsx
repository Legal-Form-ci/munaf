import type { MemberStatus, DossierStatus } from "@/lib/mock-data";
import { STATUS_LABEL, DOSSIER_LABEL } from "@/lib/mock-data";

const MEMBER_STYLES: Record<MemberStatus, string> = {
  actif: "bg-success/15 text-success border-success/30",
  carence: "bg-warning/20 text-warning-foreground border-warning/40",
  suspendu: "bg-muted text-muted-foreground border-border",
  expire: "bg-orange-500/15 text-orange-700 border-orange-500/30",
  resilie: "bg-muted text-muted-foreground border-border",
  decede: "bg-destructive/15 text-destructive border-destructive/30",
};

const DOSSIER_STYLES: Record<DossierStatus, string> = {
  declare: "bg-info/15 text-info border-info/30",
  verification: "bg-warning/20 text-warning-foreground border-warning/40",
  valide: "bg-info/20 text-info border-info/40",
  transmis: "bg-primary/10 text-primary border-primary/30",
  assistance_versee: "bg-success/15 text-success border-success/30",
  cloture: "bg-muted text-muted-foreground border-border",
};

export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${MEMBER_STYLES[status]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function DossierStatusBadge({ status }: { status: DossierStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${DOSSIER_STYLES[status]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {DOSSIER_LABEL[status]}
    </span>
  );
}
