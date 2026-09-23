/** iOS-style squircle app icons under public/apps/, rendered from each client site's favicon; projects without a usable favicon get the rail placeholder instead */
export const appIcons: Record<string, string> = {
  'abitare-in-legno': '/apps/abitare-in-legno/app-icon.png',
  'apr-instruments': '/apps/apr-instruments/app-icon.png',
  'bloem': '/apps/bloem/app-icon.png',
  'davide-derocchi': '/apps/davide-derocchi/app-icon.png',
  'ea-kahane': '/apps/ea-kahane/app-icon.png',
  'fame-la-frittura-di-napoli': '/apps/fame-la-frittura-di-napoli/app-icon.png',
  'flavio-nani': '/apps/flavio-nani/app-icon.png',
  'francesco-bellisario': '/apps/francesco-bellisario/app-icon.png',
  'laura-baresi': '/apps/laura-baresi/app-icon.png',
  'lorem': '/apps/lorem/app-icon.png',
  'miriam-mora': '/apps/miriam-mora/app-icon.png',
  'momento-golf': '/apps/momento-golf/app-icon.png',
  'music-mascots-archive': '/apps/music-mascots-archive/app-icon.png',
  'omb-saleri': '/apps/omb-saleri/app-icon.png',
  'origami-project': '/apps/origami-project/app-icon.png',
  'pasolini': '/apps/pasolini/app-icon.png',
  'studio-psicologia-doria': '/apps/studio-psicologia-doria/app-icon.png',
};

export const appIcon = (slug: string): string | undefined => appIcons[slug];
