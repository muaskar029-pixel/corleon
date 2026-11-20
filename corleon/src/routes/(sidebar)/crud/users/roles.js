// DAM access levels, shared by the users list (badges) and the create/edit forms (role cards).
// badge: brand palette only (red / navy / lavender), per the RADOVA guideline.
export const roles = [
  {
    value: 'administrator',
    level: 1,
    name: 'Administrator',
    desc: 'Full access',
    badge: 'bg-[#DB000F] text-white'
  },
  {
    value: 'dam_contributor',
    level: 2,
    name: 'DAM Contributor',
    desc: 'Upload & edit assets',
    badge: 'bg-[#0B2E8D] text-white dark:bg-[#0035C6]'
  },
  {
    value: 'dam_subscriber',
    level: 3,
    name: 'DAM Subscriber',
    desc: 'View & low-res download',
    badge: 'bg-[#C4C0D4]/50 text-[#0E0347] dark:bg-white/10 dark:text-[#C4C0D4]'
  }
];

// UI permissions per access level. They only hide/show screens; WordPress still enforces them server-side.
export const isAdmin = (role) => role === 'administrator';
export const canEditAssets = (role) => role === 'administrator' || role === 'dam_contributor';

// access_level terms each role may not see; any other role (subscriber, logged out) gets the strictest list
const hiddenLevels = {
  administrator: [],
  dam_contributor: ['restricted', 'confidential']
};
export function canViewAsset(role, asset) {
  const hidden = hiddenLevels[role] ?? ['internal', 'restricted', 'confidential'];
  const terms = asset._embedded?.['wp:term']?.flat() || [];
  return !terms.some((t) => t.taxonomy === 'access_level' && hidden.includes(t.slug.toLowerCase()));
}

// unknown WordPress roles (e.g. "subscriber") fall back to a neutral outline badge
export const roleOf = (value) =>
  roles.find((r) => r.value === value) ?? {
    value,
    name: value,
    badge: 'border border-[#C4C0D4] text-[#0E0347] dark:border-white/20 dark:text-[#C4C0D4]'
  };
