import * as fs from "fs";
import * as path from "path";

interface StaffMember {
  name: string;
  position: string;
  email: string;
}

interface RegionalHub {
  hub_name: string;
  category: string;
  title: string | null;
  leader: {
    name: string;
    position: string;
    contact_or_social: string | null;
  } | null;
}

interface StaffData {
  astana_hub_central: {
    organization: string;
    mission: string;
    team: StaffMember[];
  };
  regional_hubs_and_partners: RegionalHub[];
}

let _staffData: StaffData | null = null;

function getStaffData(): StaffData {
  if (!_staffData) {
    _staffData = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "src", "data", "staff.json"),
        "utf-8"
      )
    ) as StaffData;
  }
  return _staffData;
}

export function formatStaffForPrompt(): string {
  const d = getStaffData();
  const lines: string[] = [
    "ЦЕНТРАЛЬНАЯ КОМАНДА ASTANA HUB:",
    `Организация: ${d.astana_hub_central.organization}`,
    `Миссия: ${d.astana_hub_central.mission}`,
    "",
  ];
  for (const m of d.astana_hub_central.team) {
    lines.push(`- ${m.name}, ${m.position} (${m.email})`);
  }
  lines.push("", "РЕГИОНАЛЬНЫЕ ХАБЫ:");
  for (const h of d.regional_hubs_and_partners) {
    if (h.leader) {
      lines.push(
        `- ${h.hub_name}: ${h.leader.name} - ${h.leader.position}`
      );
      if (h.leader.contact_or_social) {
        lines.push(`  Контакт: ${h.leader.contact_or_social}`);
      }
    } else {
      lines.push(`- ${h.hub_name}`);
    }
  }
  return lines.join("\n");
}