import type { EstimateDoc, TimeEntry } from './index';

/**
 * Canonical seed rows behind getProjects(), shaped like the future D1 tables
 * (projects, estimates, time_entries). This module is the data store the AI edits.
 */
export interface ProjectRow {
  slug: string;
  title: string;
  description: string;
  /** EUR per hour; omitted = 40 (DEFAULT_RATE_EUR) */
  rate?: number;
}

/** project rows, newest first by the project date in src/data/projects/<slug>.md */
export const projects: ProjectRow[] = [
  { slug: 'davide-derocchi', title: 'Davide Derocchi', description: 'Portfolio — pagine ciclo, gallerie fluide e visualizzatore a schermo intero' },
  { slug: 'ea-kahane', title: 'E.A. Kahane', description: 'Portfolio — archivio opere con tavole a tutta pagina e timeline mostre' },
  { slug: 'miriam-mora', title: 'Miriam Mora', description: 'Portfolio — pagine progetto con ritratti in coppia e note affiancate' },
  { slug: 'abitare-in-legno', title: 'Abitare in Legno', description: 'Sito immobiliare X-Lam — storytelling delle residenze, reveal a scorrimento e budget di rendering stretto' },
  { slug: 'studio-psicologia-doria', title: 'Studio Psicologia Doria', description: 'Sito dello studio — pagine percorsi e passaggio al calendario', rate: 40 },
  { slug: 'fame-la-frittura-di-napoli', title: 'Fame — La Frittura di Napoli', description: 'Sito del locale — template menù e presa fotografica', rate: 40 },
  { slug: 'momento-golf', title: 'Momento Golf', description: 'Negozio online — configuratore mazze e catalogo da tastiera', rate: 40 },
  { slug: 'pasolini', title: 'Pasolini', description: 'Sito istituzionale — mostre, ricerca archivio e pagine evento', rate: 40 },
  { slug: 'apr-instruments', title: 'APR Instruments', description: 'Shop Shopify su misura — visualizzatore Microcamera WebGL e interazioni da tastiera', rate: 30 },
  { slug: 'music-mascots-archive', title: 'Music Mascots Archive', description: 'Archivio pubblico — schede mascotte con filtri, ricerca e anteprime WebGL', rate: 30 },
  { slug: 'gastronomia-lanzani', title: 'Gastronomia Lanzani', description: 'Sito della gastronomia — registro prodotti e aggiornamenti di stagione', rate: 30 },
  { slug: 'lorem', title: 'Lorem', description: 'Catalogo componenti — esempi dal vivo e registro codice', rate: 30 },
  { slug: 'laura-baresi', title: 'Laura Baresi', description: 'Negozio online — varianti, lookbook e import catalogo', rate: 28 },
  { slug: 'origami-project', title: 'Origami Project', description: 'Sito del progetto — calendario laboratori e archivio', rate: 28 },
  { slug: 'omb-saleri', title: 'OMB Saleri', description: 'Sito aziendale — catalogo prodotti, schede tecniche e tre lingue', rate: 25 },
  { slug: 'flavio-nani', title: 'Flavio Nani', description: 'Sito personale — registro ruoli e news', rate: 25 },
  { slug: 'the-big-archive', title: 'The Big Archive', description: 'Archivio di siti — pipeline di cattura e schede con registro metadati', rate: 25 },
  { slug: 'massimo-uberti', title: 'Massimo Uberti', description: "Sito d'artista — archivio opere, mostre e bibliografia", rate: 22 },
  { slug: 'francesco-bellisario', title: 'Francesco Bellisario', description: 'Sito personale — archivio fotografico con gallerie a tutta pagina', rate: 22 },
  { slug: 'bloem', title: 'Bloem', description: 'Testata editoriale longform — template numero e sistema tipografico da lettura', rate: 20 },
];

/** preventivo rows: one base per project plus extensions, PDF at public/preventivi/<slug>/<id>.pdf */
export const estimates: EstimateDoc[] = [
  // === davide-derocchi
  { id: 'est_davide-derocchi_01', slug: 'davide-derocchi', date: '2025-11-17', hours: 60, amount: 2400, note: 'stimo 60 ore a 2400 euro per il portfolio', pdfUrl: '/preventivi/davide-derocchi/est_davide-derocchi_01.pdf' },
  { id: 'est_davide-derocchi_02', slug: 'davide-derocchi', date: '2026-06-08', hours: 20, amount: 800, note: 'il cliente chiede l\'archivio stampa — stimo 20 ore a 800 euro', pdfUrl: '/preventivi/davide-derocchi/est_davide-derocchi_02.pdf' },
  // === ea-kahane
  { id: 'est_ea-kahane_01', slug: 'ea-kahane', date: '2025-11-10', hours: 70, amount: 2800, note: 'stimo 70 ore a 2800 euro per l\'archivio opere', pdfUrl: '/preventivi/ea-kahane/est_ea-kahane_01.pdf' },
  { id: 'est_ea-kahane_02', slug: 'ea-kahane', date: '2026-05-25', hours: 20, amount: 800, note: 'il cliente chiede ricerca e filtri sull\'archivio — stimo 20 ore a 800 euro', pdfUrl: '/preventivi/ea-kahane/est_ea-kahane_02.pdf' },
  // === miriam-mora
  { id: 'est_miriam-mora_01', slug: 'miriam-mora', date: '2025-11-24', hours: 80, amount: 3200, note: 'stimo 80 ore a 3200 euro per il portfolio', pdfUrl: '/preventivi/miriam-mora/est_miriam-mora_01.pdf' },
  // === abitare-in-legno
  { id: 'est_abitare-in-legno_01', slug: 'abitare-in-legno', date: '2025-08-04', hours: 80, amount: 3200, note: 'stimo 80 ore a 3200 euro per il nuovo sito', pdfUrl: '/preventivi/abitare-in-legno/est_abitare-in-legno_01.pdf' },
  { id: 'est_abitare-in-legno_02', slug: 'abitare-in-legno', date: '2026-04-20', hours: 10, amount: 400, note: 'il cliente aggiunge la fase di nuovi appartamenti — stimo 10 ore a 400 euro', pdfUrl: '/preventivi/abitare-in-legno/est_abitare-in-legno_02.pdf' },
  { id: 'est_abitare-in-legno_03', slug: 'abitare-in-legno', date: '2026-07-10', hours: 15, amount: 600, note: "supporto alle pubblicazioni per l'estate — stimo 15 ore a 600 euro", pdfUrl: '/preventivi/abitare-in-legno/est_abitare-in-legno_03.pdf' },
  // === studio-psicologia-doria
  { id: 'est_studio-psicologia-doria_01', slug: 'studio-psicologia-doria', date: '2025-09-08', hours: 30, amount: 1200, note: 'stimo 30 ore a 1200 euro per lo studio', pdfUrl: '/preventivi/studio-psicologia-doria/est_studio-psicologia-doria_01.pdf' },
  // === fame-la-frittura-di-napoli
  { id: 'est_fame-la-frittura-di-napoli_01', slug: 'fame-la-frittura-di-napoli', date: '2025-03-24', hours: 50, amount: 2000, note: 'stimo 50 ore a 2000 euro per il sito del locale', pdfUrl: '/preventivi/fame-la-frittura-di-napoli/est_fame-la-frittura-di-napoli_01.pdf' },
  // === momento-golf
  { id: 'est_momento-golf_01', slug: 'momento-golf', date: '2024-12-16', hours: 90, amount: 3600, note: 'stimo 90 ore a 3600 euro per il negozio online', pdfUrl: '/preventivi/momento-golf/est_momento-golf_01.pdf' },
  // === pasolini
  { id: 'est_pasolini_01', slug: 'pasolini', date: '2025-01-27', hours: 65, amount: 2600, note: 'stimo 65 ore a 2600 euro per il sito istituzionale', pdfUrl: '/preventivi/pasolini/est_pasolini_01.pdf' },
  // === apr-instruments
  { id: 'est_apr-instruments_01', slug: 'apr-instruments', date: '2024-06-24', hours: 60, amount: 1800, note: 'stimo 60 ore a 1800 euro per lo shop su misura', pdfUrl: '/preventivi/apr-instruments/est_apr-instruments_01.pdf' },
  { id: 'est_apr-instruments_02', slug: 'apr-instruments', date: '2024-12-02', hours: 15, amount: 450, note: 'servono le revisioni del catalogo prima del lancio — stimo 15 ore a 450 euro', pdfUrl: '/preventivi/apr-instruments/est_apr-instruments_02.pdf' },
  // === music-mascots-archive
  { id: 'est_music-mascots-archive_01', slug: 'music-mascots-archive', date: '2024-02-26', hours: 75, amount: 2250, note: 'stimo 75 ore a 2250 euro per l\'archivio pubblico', pdfUrl: '/preventivi/music-mascots-archive/est_music-mascots-archive_01.pdf' },
  // === gastronomia-lanzani
  { id: 'est_gastronomia-lanzani_01', slug: 'gastronomia-lanzani', date: '2024-01-22', hours: 50, amount: 1500, note: 'stimo 50 ore a 1500 euro per il sito della gastronomia', pdfUrl: '/preventivi/gastronomia-lanzani/est_gastronomia-lanzani_01.pdf' },
  // === lorem
  { id: 'est_lorem_01', slug: 'lorem', date: '2024-01-29', hours: 45, amount: 1350, note: 'stimo 45 ore a 1350 euro per il catalogo componenti', pdfUrl: '/preventivi/lorem/est_lorem_01.pdf' },
  // === laura-baresi
  { id: 'est_laura-baresi_01', slug: 'laura-baresi', date: '2023-11-20', hours: 75, amount: 2100, note: 'stimo 75 ore a 2100 euro per il negozio online', pdfUrl: '/preventivi/laura-baresi/est_laura-baresi_01.pdf' },
  // === origami-project
  { id: 'est_origami-project_01', slug: 'origami-project', date: '2023-08-14', hours: 50, amount: 1400, note: 'stimo 50 ore a 1400 euro per il sito del progetto', pdfUrl: '/preventivi/origami-project/est_origami-project_01.pdf' },
  // === omb-saleri
  { id: 'est_omb-saleri_01', slug: 'omb-saleri', date: '2023-04-24', hours: 75, amount: 1875, note: 'stimo 75 ore a 1875 euro per il sito aziendale', pdfUrl: '/preventivi/omb-saleri/est_omb-saleri_01.pdf' },
  // === flavio-nani
  { id: 'est_flavio-nani_01', slug: 'flavio-nani', date: '2022-12-19', hours: 35, amount: 875, note: 'stimo 35 ore a 875 euro per il sito personale', pdfUrl: '/preventivi/flavio-nani/est_flavio-nani_01.pdf' },
  // === the-big-archive
  { id: 'est_the-big-archive_01', slug: 'the-big-archive', date: '2022-08-01', hours: 75, amount: 1875, note: 'stimo 75 ore a 1875 euro per l\'archivio', pdfUrl: '/preventivi/the-big-archive/est_the-big-archive_01.pdf' },
  { id: 'est_the-big-archive_02', slug: 'the-big-archive', date: '2023-02-06', hours: 25, amount: 625, note: "l'archivio cresce oltre il previsto — stimo 25 ore a 625 euro", pdfUrl: '/preventivi/the-big-archive/est_the-big-archive_02.pdf' },
  // === massimo-uberti
  { id: 'est_massimo-uberti_01', slug: 'massimo-uberti', date: '2022-10-24', hours: 40, amount: 880, note: "stimo 40 ore a 880 euro per l'archivio opere", pdfUrl: '/preventivi/massimo-uberti/est_massimo-uberti_01.pdf' },
  // === francesco-bellisario
  { id: 'est_francesco-bellisario_01', slug: 'francesco-bellisario', date: '2022-10-03', hours: 30, amount: 660, note: 'stimo 30 ore a 660 euro per il sito personale', pdfUrl: '/preventivi/francesco-bellisario/est_francesco-bellisario_01.pdf' },
  // === bloem
  { id: 'est_bloem_01', slug: 'bloem', date: '2021-09-06', hours: 40, amount: 800, note: 'stimo 40 ore a 800 euro per la testata', pdfUrl: '/preventivi/bloem/est_bloem_01.pdf' },
];

/** work log rows, ascending by date inside each project block */
export const timeEntries: TimeEntry[] = [
  // === davide-derocchi
  { id: 'log_davide-derocchi_01', slug: 'davide-derocchi', date: '2025-12-02', hours: 7, note: 'prima chiamata e audit contenuti — struttura dei cicli e piano archivio immagini' },
  { id: 'log_davide-derocchi_02', slug: 'davide-derocchi', date: '2025-12-19', hours: 8, note: 'traduzione della griglia dello studio nei template portfolio' },
  { id: 'log_davide-derocchi_03', slug: 'davide-derocchi', date: '2026-01-13', hours: 8, note: 'pagine ciclo con gallerie fluide e visualizzatore a schermo intero' },
  { id: 'log_davide-derocchi_04', slug: 'davide-derocchi', date: '2026-02-03', hours: 8, note: 'integrazione CMS per cicli, didascalie e press' },
  { id: 'log_davide-derocchi_05', slug: 'davide-derocchi', date: '2026-02-24', hours: 7, note: "revisioni con lo studio di graphic design sulla sequenza di copertina e l'abbinamento dei font" },
  { id: 'log_davide-derocchi_06', slug: 'davide-derocchi', date: '2026-03-10', hours: 8, note: 'passata responsive — ritratti in coppia e quad 2×2 sotto 721px' },
  { id: 'log_davide-derocchi_07', slug: 'davide-derocchi', date: '2026-03-26', hours: 6, note: 'messa online e QA sul dominio di produzione' },
  { id: 'log_davide-derocchi_08', slug: 'davide-derocchi', date: '2026-05-28', hours: 5, note: 'nuovo ciclo pubblicato dal CMS, template galleria esteso' },
  { id: 'log_davide-derocchi_09', slug: 'davide-derocchi', date: '2026-08-25', hours: 5, note: 'passata performance sulle gallerie lazy e sul form contatti' },
  // === ea-kahane
  { id: 'log_ea-kahane_01', slug: 'ea-kahane', date: '2025-11-25', hours: 7, note: 'prima chiamata — archivio opere e timeline biografica' },
  { id: 'log_ea-kahane_02', slug: 'ea-kahane', date: '2025-12-16', hours: 8, note: "traduzione della griglia editoriale dello studio nei template opere" },
  { id: 'log_ea-kahane_03', slug: 'ea-kahane', date: '2026-01-08', hours: 8, note: 'pagine opera con tavole a tutta pagina e registro didascalie' },
  { id: 'log_ea-kahane_04', slug: 'ea-kahane', date: '2026-01-27', hours: 8, note: "passata tipografica — asse di larghezza variabile e tracking dallo spec di brand" },
  { id: 'log_ea-kahane_05', slug: 'ea-kahane', date: '2026-02-12', hours: 7, note: 'integrazione CMS per opere, testi e mostre' },
  { id: 'log_ea-kahane_06', slug: 'ea-kahane', date: '2026-02-26', hours: 8, note: 'revisioni con lo studio di graphic design sulla sequenza delle tavole' },
  { id: 'log_ea-kahane_07', slug: 'ea-kahane', date: '2026-03-12', hours: 8, note: "passata responsive e pulizia accessibilità, focus sull'accento" },
  { id: 'log_ea-kahane_08', slug: 'ea-kahane', date: '2026-03-26', hours: 6, note: 'messa online e QA sul dominio di produzione' },
  { id: 'log_ea-kahane_09', slug: 'ea-kahane', date: '2026-06-16', hours: 5, note: "filtri e ricerca sull'indice opere" },
  { id: 'log_ea-kahane_10', slug: 'ea-kahane', date: '2026-09-01', hours: 5, note: 'passata performance — budget immagini e LCP sulle pagine opere' },
  // === miriam-mora
  { id: 'log_miriam-mora_01', slug: 'miriam-mora', date: '2025-12-09', hours: 7, note: 'prima chiamata e audit materiali — progetti e archivio stampa' },
  { id: 'log_miriam-mora_02', slug: 'miriam-mora', date: '2026-01-06', hours: 8, note: 'traduzione dei layout dello studio nei template progetto' },
  { id: 'log_miriam-mora_03', slug: 'miriam-mora', date: '2026-01-27', hours: 8, note: 'pagine progetto con ritratti in coppia e note affiancate' },
  { id: 'log_miriam-mora_04', slug: 'miriam-mora', date: '2026-02-10', hours: 8, note: 'integrazione CMS per progetti, press e biografia' },
  { id: 'log_miriam-mora_05', slug: 'miriam-mora', date: '2026-02-24', hours: 7, note: "revisioni con lo studio di graphic design sull'ordine dell'indice e sui crop" },
  { id: 'log_miriam-mora_06', slug: 'miriam-mora', date: '2026-03-10', hours: 8, note: 'passata responsive — paesaggi in coppia a mezza larghezza, quad in 2×2' },
  { id: 'log_miriam-mora_07', slug: 'miriam-mora', date: '2026-03-26', hours: 6, note: 'messa online e QA sul dominio di produzione' },
  { id: 'log_miriam-mora_08', slug: 'miriam-mora', date: '2026-05-12', hours: 5, note: 'nuovo progetto pubblicato dal CMS' },
  { id: 'log_miriam-mora_09', slug: 'miriam-mora', date: '2026-07-21', hours: 5, note: 'shader WebGL ambientale sulla palette del sito' },
  { id: 'log_miriam-mora_10', slug: 'miriam-mora', date: '2026-09-08', hours: 4, note: 'passata performance — budget immagini e subset dei font' },
  // === abitare-in-legno
  { id: 'log_abitare-in-legno_01', slug: 'abitare-in-legno', date: '2025-08-14', hours: 7, note: 'prima chiamata con lo studio e il cliente, mappa del sito e modello dati appartamenti' },
  { id: 'log_abitare-in-legno_02', slug: 'abitare-in-legno', date: '2025-08-29', hours: 8, note: "traduzione del progetto grafico del brochure nella griglia CSS, ritmo 8px sull'unità stampa 4mm" },
  { id: 'log_abitare-in-legno_03', slug: 'abitare-in-legno', date: '2025-09-12', hours: 8, note: 'hero con drone su layer composited, parallasse 0,14× allo scroll senza reflow' },
  { id: 'log_abitare-in-legno_04', slug: 'abitare-in-legno', date: '2025-09-30', hours: 7, note: 'revisioni con lo studio di graphic design sul titolo e sul tracking' },
  { id: 'log_abitare-in-legno_05', slug: 'abitare-in-legno', date: '2025-10-17', hours: 8, note: 'template appartamenti con galleria e tabelle tecniche' },
  { id: 'log_abitare-in-legno_06', slug: 'abitare-in-legno', date: '2025-11-07', hours: 8, note: 'integrazione CMS per appartamenti, planimetrie e pagine residenza' },
  { id: 'log_abitare-in-legno_07', slug: 'abitare-in-legno', date: '2025-11-28', hours: 7, note: 'materiale dello studio preso in consegna — wordmark a layer e planimetrie' },
  { id: 'log_abitare-in-legno_08', slug: 'abitare-in-legno', date: '2025-12-19', hours: 8, note: 'passata responsive e performance dei reveal, un solo IntersectionObserver' },
  { id: 'log_abitare-in-legno_09', slug: 'abitare-in-legno', date: '2026-01-15', hours: 8, note: 'messa online, DNS e test sul dominio di produzione' },
  { id: 'log_abitare-in-legno_10', slug: 'abitare-in-legno', date: '2026-03-12', hours: 6, note: 'correzioni post-lancio sul form contatti e nuovi campi CMS per la fase nuova' },
  { id: 'log_abitare-in-legno_11', slug: 'abitare-in-legno', date: '2026-06-04', hours: 5, note: 'workflow di pubblicazione per il team, ritocchi al CMS' },
  { id: 'log_abitare-in-legno_12', slug: 'abitare-in-legno', date: '2026-09-08', hours: 5, note: 'passata performance sulle gallerie e budget immagini' },
  // === studio-psicologia-doria
  { id: 'log_studio-psicologia-doria_01', slug: 'studio-psicologia-doria', date: '2025-09-23', hours: 4, note: 'prima chiamata e struttura — approccio, percorsi e contatti' },
  { id: 'log_studio-psicologia-doria_02', slug: 'studio-psicologia-doria', date: '2025-10-14', hours: 5, note: "traduzione dell'identità calma dello studio nei template di pagina" },
  { id: 'log_studio-psicologia-doria_03', slug: 'studio-psicologia-doria', date: '2025-11-04', hours: 5, note: 'pagine percorsi con passaggio al calendario dello studio' },
  { id: 'log_studio-psicologia-doria_04', slug: 'studio-psicologia-doria', date: '2025-11-25', hours: 5, note: 'integrazione CMS per percorsi, articoli e note disponibilità' },
  { id: 'log_studio-psicologia-doria_05', slug: 'studio-psicologia-doria', date: '2025-12-31', hours: 5, note: 'ritocchi alla scala tipografica con lo studio, poi messa online' },
  // === fame-la-frittura-di-napoli
  { id: 'log_fame-la-frittura-di-napoli_01', slug: 'fame-la-frittura-di-napoli', date: '2025-04-08', hours: 5, note: 'prima chiamata e piano contenuti — menù, storia e pagine locali' },
  { id: 'log_fame-la-frittura-di-napoli_02', slug: 'fame-la-frittura-di-napoli', date: '2025-04-29', hours: 7, note: 'traduzione della palette calda del brand nei template di pagina' },
  { id: 'log_fame-la-frittura-di-napoli_03', slug: 'fame-la-frittura-di-napoli', date: '2025-05-20', hours: 8, note: 'template menù con lista fritta e note allergeni' },
  { id: 'log_fame-la-frittura-di-napoli_04', slug: 'fame-la-frittura-di-napoli', date: '2025-06-10', hours: 7, note: 'integrazione CMS per menù e orari' },
  { id: 'log_fame-la-frittura-di-napoli_05', slug: 'fame-la-frittura-di-napoli', date: '2025-06-27', hours: 6, note: 'presa fotografica — piatti e sala nel budget immagini' },
  { id: 'log_fame-la-frittura-di-napoli_06', slug: 'fame-la-frittura-di-napoli', date: '2025-07-15', hours: 6, note: "revisioni con lo studio di graphic design sull'hero e sul tipo del menù" },
  { id: 'log_fame-la-frittura-di-napoli_07', slug: 'fame-la-frittura-di-napoli', date: '2025-08-01', hours: 5, note: 'messa online, mappa e primo SEO locale' },
  // === momento-golf
  { id: 'log_momento-golf_01', slug: 'momento-golf', date: '2025-01-14', hours: 7, note: 'prima chiamata e schema catalogo — prodotti, opzioni fitting e giacenze' },
  { id: 'log_momento-golf_02', slug: 'momento-golf', date: '2025-02-04', hours: 8, note: 'traduzione del brand deck dello studio nei template shop' },
  { id: 'log_momento-golf_03', slug: 'momento-golf', date: '2025-02-25', hours: 8, note: 'configuratore prodotto per opzioni e schede tecniche mazze' },
  { id: 'log_momento-golf_04', slug: 'momento-golf', date: '2025-03-18', hours: 8, note: 'carrello e ordini collegati al backend dello shop' },
  { id: 'log_momento-golf_05', slug: 'momento-golf', date: '2025-04-08', hours: 7, note: 'integrazione CMS per collezioni, journal e pagine fitting' },
  { id: 'log_momento-golf_06', slug: 'momento-golf', date: '2025-04-29', hours: 8, note: 'import catalogo e passata fotografica prodotti' },
  { id: 'log_momento-golf_07', slug: 'momento-golf', date: '2025-05-20', hours: 7, note: "revisioni con lo studio di graphic design sull'hero e l'abbinamento dei font" },
  { id: 'log_momento-golf_08', slug: 'momento-golf', date: '2025-06-10', hours: 8, note: 'passata responsive e navigazione da tastiera sul catalogo' },
  { id: 'log_momento-golf_09', slug: 'momento-golf', date: '2025-07-08', hours: 8, note: 'passata performance — budget immagini, LCP sotto 2s sulle collezioni' },
  { id: 'log_momento-golf_10', slug: 'momento-golf', date: '2025-07-29', hours: 6, note: 'messa online e QA del flusso ordini' },
  // === pasolini
  { id: 'log_pasolini_01', slug: 'pasolini', date: '2025-02-11', hours: 6, note: 'prima chiamata e struttura contenuti — mostre, archivio e pagine visita' },
  { id: 'log_pasolini_02', slug: 'pasolini', date: '2025-03-04', hours: 8, note: 'traduzione della grafica mostra nei template di pagina' },
  { id: 'log_pasolini_03', slug: 'pasolini', date: '2025-03-25', hours: 8, note: 'pagine mostra con tavole sala e registro opere' },
  { id: 'log_pasolini_04', slug: 'pasolini', date: '2025-04-15', hours: 7, note: 'integrazione CMS per mostre, eventi e news' },
  { id: 'log_pasolini_05', slug: 'pasolini', date: '2025-05-06', hours: 6, note: "ricerca sull'archivio opere" },
  { id: 'log_pasolini_06', slug: 'pasolini', date: '2025-05-27', hours: 6, note: 'revisioni con lo studio di graphic design sui manifesti e sul titolo' },
  { id: 'log_pasolini_07', slug: 'pasolini', date: '2025-06-24', hours: 7, note: 'studio di luce WebGL sull\'hero sulla palette dei manifesti' },
  { id: 'log_pasolini_08', slug: 'pasolini', date: '2025-07-29', hours: 6, note: 'passata responsive e messa online' },
  // === apr-instruments
  { id: 'log_apr-instruments_01', slug: 'apr-instruments', date: '2024-07-09', hours: 6, note: 'prima chiamata e architettura del tema, schema catalogo con lo studio' },
  { id: 'log_apr-instruments_02', slug: 'apr-instruments', date: '2024-07-25', hours: 8, note: 'traduzione della griglia editoriale a 12 colonne nel layer del tema' },
  { id: 'log_apr-instruments_03', slug: 'apr-instruments', date: '2024-08-14', hours: 8, note: 'visualizzatore Microcamera con texture blending WebGL sui quattro scatti' },
  { id: 'log_apr-instruments_04', slug: 'apr-instruments', date: '2024-09-03', hours: 6, note: 'mega menu e tabelle prodotto bloccati sui gutter stampa da 24px' },
  { id: 'log_apr-instruments_05', slug: 'apr-instruments', date: '2024-09-26', hours: 7, note: 'revisioni con lo studio di graphic design sull\'accento e sui pesi del wordmark' },
  { id: 'log_apr-instruments_06', slug: 'apr-instruments', date: '2024-10-15', hours: 8, note: 'template prodotto e selettori di variante' },
  { id: 'log_apr-instruments_07', slug: 'apr-instruments', date: '2024-11-05', hours: 6, note: 'import catalogo e taglio immagini nel budget da 2,1MB' },
  { id: 'log_apr-instruments_08', slug: 'apr-instruments', date: '2024-11-27', hours: 5, note: 'giri di revisione sullo staging, note di art direction risolte pagina per pagina' },
  { id: 'log_apr-instruments_09', slug: 'apr-instruments', date: '2024-12-17', hours: 7, note: 'passata responsive e modello di interazione da tastiera' },
  { id: 'log_apr-instruments_10', slug: 'apr-instruments', date: '2025-01-16', hours: 6, note: 'messa online e QA del catalogo sullo shop di produzione' },
  // === music-mascots-archive
  { id: 'log_music-mascots-archive_01', slug: 'music-mascots-archive', date: '2024-03-12', hours: 6, note: 'prima chiamata e tassonomia — etichette, epoche e indice mascotte' },
  { id: 'log_music-mascots-archive_02', slug: 'music-mascots-archive', date: '2024-03-28', hours: 8, note: "traduzione delle tavole d'archivio nelle righe indice" },
  { id: 'log_music-mascots-archive_03', slug: 'music-mascots-archive', date: '2024-04-16', hours: 8, note: 'pagine mascotte con tavole scansione e registro crediti' },
  { id: 'log_music-mascots-archive_04', slug: 'music-mascots-archive', date: '2024-05-07', hours: 7, note: 'integrazione CMS per schede, etichette e coda invii' },
  { id: 'log_music-mascots-archive_05', slug: 'music-mascots-archive', date: '2024-05-28', hours: 8, note: "filtri e ricerca sull'indice archivio" },
  { id: 'log_music-mascots-archive_06', slug: 'music-mascots-archive', date: '2024-06-18', hours: 7, note: 'revisioni con lo studio di graphic design sul ritmo righe e numerazione' },
  { id: 'log_music-mascots-archive_07', slug: 'music-mascots-archive', date: '2024-07-09', hours: 6, note: 'anteprime WebGL al passaggio mouse sulle righe indice' },
  { id: 'log_music-mascots-archive_08', slug: 'music-mascots-archive', date: '2024-08-06', hours: 7, note: 'passata responsive e budget sulle scansioni' },
  { id: 'log_music-mascots-archive_09', slug: 'music-mascots-archive', date: '2024-08-30', hours: 5, note: 'messa online e QA sul dominio di produzione' },
  // === gastronomia-lanzani
  { id: 'log_gastronomia-lanzani_01', slug: 'gastronomia-lanzani', date: '2024-02-06', hours: 5, note: 'prima chiamata e piano contenuti — prodotti, storia e negozio' },
  { id: 'log_gastronomia-lanzani_02', slug: 'gastronomia-lanzani', date: '2024-02-27', hours: 7, note: 'traduzione della palette delle etichette nei template di pagina' },
  { id: 'log_gastronomia-lanzani_03', slug: 'gastronomia-lanzani', date: '2024-03-19', hours: 8, note: 'pagine prodotto con registro ingredienti e abbinamenti' },
  { id: 'log_gastronomia-lanzani_04', slug: 'gastronomia-lanzani', date: '2024-04-09', hours: 7, note: 'integrazione CMS per prodotti e aggiornamenti di stagione' },
  { id: 'log_gastronomia-lanzani_05', slug: 'gastronomia-lanzani', date: '2024-05-07', hours: 6, note: 'revisioni con lo studio di graphic design sul trattamento fotografico' },
  { id: 'log_gastronomia-lanzani_06', slug: 'gastronomia-lanzani', date: '2024-05-28', hours: 6, note: 'passata responsive e form contatti' },
  { id: 'log_gastronomia-lanzani_07', slug: 'gastronomia-lanzani', date: '2024-06-20', hours: 5, note: 'messa online e primo SEO locale' },
  // === lorem
  { id: 'log_lorem_01', slug: 'lorem', date: '2024-02-13', hours: 5, note: 'prima chiamata e tassonomia — famiglie di componenti e schema nomi' },
  { id: 'log_lorem_02', slug: 'lorem', date: '2024-03-05', hours: 7, note: 'traduzione dello spec tipografico nelle pagine componente' },
  { id: 'log_lorem_03', slug: 'lorem', date: '2024-03-26', hours: 8, note: 'pagine componente con esempi dal vivo e registro codice' },
  { id: 'log_lorem_04', slug: 'lorem', date: '2024-04-16', hours: 6, note: 'integrazione CMS per componenti e raccolte' },
  { id: 'log_lorem_05', slug: 'lorem', date: '2024-05-14', hours: 6, note: "ricerca e filtri sull'indice componenti" },
  { id: 'log_lorem_06', slug: 'lorem', date: '2024-06-01', hours: 5, note: 'passata performance e messa online' },
  // === laura-baresi
  { id: 'log_laura-baresi_01', slug: 'laura-baresi', date: '2023-12-05', hours: 6, note: 'prima chiamata e schema catalogo — varianti, giacenze e spedizioni' },
  { id: 'log_laura-baresi_02', slug: 'laura-baresi', date: '2023-12-21', hours: 8, note: 'traduzione della griglia dello studio nei template shop' },
  { id: 'log_laura-baresi_03', slug: 'laura-baresi', date: '2024-01-16', hours: 8, note: 'pagina prodotto con selettore varianti e guida taglie' },
  { id: 'log_laura-baresi_04', slug: 'laura-baresi', date: '2024-02-06', hours: 8, note: 'carrello e ordini collegati al backend dello shop' },
  { id: 'log_laura-baresi_05', slug: 'laura-baresi', date: '2024-02-27', hours: 7, note: 'integrazione CMS per collezioni e lookbook' },
  { id: 'log_laura-baresi_06', slug: 'laura-baresi', date: '2024-03-14', hours: 6, note: 'revisioni con lo studio di graphic design sulla sequenza del lookbook' },
  { id: 'log_laura-baresi_07', slug: 'laura-baresi', date: '2024-04-02', hours: 8, note: 'import catalogo e passata fotografica sui prodotti' },
  { id: 'log_laura-baresi_08', slug: 'laura-baresi', date: '2024-04-23', hours: 7, note: 'passata responsive e budget performance sulle collezioni' },
  { id: 'log_laura-baresi_09', slug: 'laura-baresi', date: '2024-05-01', hours: 6, note: 'messa online e QA del flusso ordini' },
  // === origami-project
  { id: 'log_origami-project_01', slug: 'origami-project', date: '2023-08-29', hours: 5, note: 'prima chiamata e piano contenuti — laboratori, progetti e archivio' },
  { id: 'log_origami-project_02', slug: 'origami-project', date: '2023-09-19', hours: 7, note: "traduzione dell'identità a carta piegata nei template di pagina" },
  { id: 'log_origami-project_03', slug: 'origami-project', date: '2023-10-10', hours: 8, note: 'pagine laboratorio con calendario e iscrizioni' },
  { id: 'log_origami-project_04', slug: 'origami-project', date: '2023-10-31', hours: 6, note: 'integrazione CMS per laboratori, partner e news' },
  { id: 'log_origami-project_05', slug: 'origami-project', date: '2023-11-21', hours: 6, note: 'revisioni con lo studio di graphic design sulle texture di piega' },
  { id: 'log_origami-project_06', slug: 'origami-project', date: '2023-12-12', hours: 5, note: 'passata responsive e indice archivio' },
  { id: 'log_origami-project_07', slug: 'origami-project', date: '2024-01-20', hours: 5, note: 'messa online e QA sul dominio di produzione' },
  // === omb-saleri
  { id: 'log_omb-saleri_01', slug: 'omb-saleri', date: '2023-05-09', hours: 6, note: 'prima chiamata e architettura informazioni — prodotti, settori e storia azienda' },
  { id: 'log_omb-saleri_02', slug: 'omb-saleri', date: '2023-05-30', hours: 8, note: 'traduzione del brochure aziendale nei template di pagina' },
  { id: 'log_omb-saleri_03', slug: 'omb-saleri', date: '2023-06-20', hours: 8, note: 'catalogo prodotto con schede tecniche e libreria PDF' },
  { id: 'log_omb-saleri_04', slug: 'omb-saleri', date: '2023-07-11', hours: 8, note: 'pagine settore e mappa referenze' },
  { id: 'log_omb-saleri_05', slug: 'omb-saleri', date: '2023-08-01', hours: 6, note: 'setup multilingua — tre lingue e flusso traduzioni' },
  { id: 'log_omb-saleri_06', slug: 'omb-saleri', date: '2023-09-05', hours: 7, note: 'integrazione CMS per prodotti, news e schede' },
  { id: 'log_omb-saleri_07', slug: 'omb-saleri', date: '2023-10-03', hours: 6, note: 'revisioni con lo studio di graphic design sulle tabelle catalogo e le icone' },
  { id: 'log_omb-saleri_08', slug: 'omb-saleri', date: '2023-11-07', hours: 8, note: 'passata responsive e pulizia performance sulle schede PDF' },
  { id: 'log_omb-saleri_09', slug: 'omb-saleri', date: '2023-11-20', hours: 6, note: 'messa online, redirect dal vecchio sito e QA' },
  // === flavio-nani
  { id: 'log_flavio-nani_01', slug: 'flavio-nani', date: '2023-01-10', hours: 5, note: 'prima chiamata e struttura — biografia, ruoli e contatti' },
  { id: 'log_flavio-nani_02', slug: 'flavio-nani', date: '2023-02-07', hours: 7, note: 'traduzione del layout dello studio nei template di pagina' },
  { id: 'log_flavio-nani_03', slug: 'flavio-nani', date: '2023-03-02', hours: 6, note: 'lista ruoli come registro consultabile con filtri' },
  { id: 'log_flavio-nani_04', slug: 'flavio-nani', date: '2023-04-04', hours: 7, note: 'integrazione CMS per ruoli e news' },
  { id: 'log_flavio-nani_05', slug: 'flavio-nani', date: '2023-05-01', hours: 5, note: 'revisioni con lo studio di graphic design sui ritratti, poi messa online' },
  // === the-big-archive
  { id: 'log_the-big-archive_01', slug: 'the-big-archive', date: '2022-08-16', hours: 6, note: 'prima chiamata e tassonomia — epoche, stili e schema scheda sito' },
  { id: 'log_the-big-archive_02', slug: 'the-big-archive', date: '2022-09-06', hours: 8, note: 'traduzione del layout a registro nelle righe archivio' },
  { id: 'log_the-big-archive_03', slug: 'the-big-archive', date: '2022-09-27', hours: 8, note: 'pipeline di cattura — screenshot a pagina intera normalizzati in tavole' },
  { id: 'log_the-big-archive_04', slug: 'the-big-archive', date: '2022-10-18', hours: 7, note: 'pagine scheda con registro metadati e indice tag' },
  { id: 'log_the-big-archive_05', slug: 'the-big-archive', date: '2022-11-08', hours: 8, note: 'integrazione CMS per schede, raccolte e invii' },
  { id: 'log_the-big-archive_06', slug: 'the-big-archive', date: '2022-11-29', hours: 8, note: 'ricerca e filtri per decennio sull\'archivio' },
  { id: 'log_the-big-archive_07', slug: 'the-big-archive', date: '2022-12-20', hours: 7, note: 'revisioni con lo studio di graphic design sul ritmo righe e numerazione' },
  { id: 'log_the-big-archive_08', slug: 'the-big-archive', date: '2023-01-24', hours: 8, note: 'studio transizioni WebGL sulle tavole scheda' },
  { id: 'log_the-big-archive_09', slug: 'the-big-archive', date: '2023-02-21', hours: 7, note: 'passata responsive e colonna di lettura a 44rem' },
  { id: 'log_the-big-archive_10', slug: 'the-big-archive', date: '2023-03-21', hours: 7, note: 'passata performance — budget tavole e righe lazy sull\'indice lungo' },
  { id: 'log_the-big-archive_11', slug: 'the-big-archive', date: '2023-05-01', hours: 6, note: 'messa online e QA sul dominio di produzione' },
  // === massimo-uberti
  { id: 'log_massimo-uberti_01', slug: 'massimo-uberti', date: '2022-11-08', hours: 5, note: 'prima chiamata e struttura archivio — opere, mostre e testi' },
  { id: 'log_massimo-uberti_02', slug: 'massimo-uberti', date: '2022-11-29', hours: 7, note: 'traduzione dei layout mostra nei template opera' },
  { id: 'log_massimo-uberti_03', slug: 'massimo-uberti', date: '2022-12-20', hours: 8, note: 'pagine opera con fotografie grandi di luce e didascalie' },
  { id: 'log_massimo-uberti_04', slug: 'massimo-uberti', date: '2023-01-17', hours: 7, note: 'integrazione CMS per opere, mostre e bibliografia' },
  { id: 'log_massimo-uberti_05', slug: 'massimo-uberti', date: '2023-02-14', hours: 5, note: "revisioni con lo studio di graphic design sul ritmo dell'indice opere" },
  { id: 'log_massimo-uberti_06', slug: 'massimo-uberti', date: '2023-03-01', hours: 4, note: 'messa online e QA sul dominio di produzione' },
  // === francesco-bellisario
  { id: 'log_francesco-bellisario_01', slug: 'francesco-bellisario', date: '2022-10-18', hours: 5, note: 'prima chiamata — struttura portfolio e piano archivio fotografico' },
  { id: 'log_francesco-bellisario_02', slug: 'francesco-bellisario', date: '2022-11-15', hours: 6, note: 'traduzione del layout dello studio nei template di pagina' },
  { id: 'log_francesco-bellisario_03', slug: 'francesco-bellisario', date: '2022-12-06', hours: 6, note: 'galleria con tavole a tutta pagina e didascalie' },
  { id: 'log_francesco-bellisario_04', slug: 'francesco-bellisario', date: '2023-01-10', hours: 5, note: 'integrazione CMS per progetti e pagina about' },
  { id: 'log_francesco-bellisario_05', slug: 'francesco-bellisario', date: '2023-02-01', hours: 4, note: 'messa online e QA sul dominio di produzione' },
  // === bloem
  { id: 'log_bloem_01', slug: 'bloem', date: '2021-09-21', hours: 5, note: 'prima chiamata e struttura editoriale, template longform e ritmo di lettura' },
  { id: 'log_bloem_02', slug: 'bloem', date: '2021-10-12', hours: 8, note: 'traduzione della scala tipografica stampa in font variabili' },
  { id: 'log_bloem_03', slug: 'bloem', date: '2021-11-02', hours: 7, note: 'template articolo con note, citazioni e tavole a tutta pagina' },
  { id: 'log_bloem_04', slug: 'bloem', date: '2021-11-23', hours: 6, note: 'integrazione CMS per numeri, autori e indice archivio' },
  { id: 'log_bloem_05', slug: 'bloem', date: '2021-12-14', hours: 5, note: 'passata performance — subset dei font e tavole lazy, layout stabile senza reflow' },
  { id: 'log_bloem_06', slug: 'bloem', date: '2022-01-04', hours: 4, note: 'revisioni con lo studio di graphic design sulle copertine, poi messa online' },
];
