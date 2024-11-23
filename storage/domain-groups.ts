import { Storage } from "@plasmohq/storage";
import type { DomainGroup } from "~types";

const storage = new Storage();

export const getDomainGroups = async (): Promise<DomainGroup[]> => {
  return (await storage.get("domainGroups")) || [];
};

export const setDomainGroups = async (groups: DomainGroup[]) => {
  await storage.set("domainGroups", groups);
};

export const addDomainGroup = async (group: DomainGroup) => {
  const groups = await getDomainGroups();
  groups.push(group);
  await setDomainGroups(groups);
};

export const deleteDomainGroup = async (id: string) => {
  const groups = await getDomainGroups();
  const filtered = groups.filter((g) => g.id !== id);
  await setDomainGroups(filtered);
};
