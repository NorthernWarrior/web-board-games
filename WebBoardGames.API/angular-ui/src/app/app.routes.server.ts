import { RenderMode, ServerRoute } from '@angular/ssr';


// Example: fetch or generate all game_ids to prerender
const getPrerenderParams = async () => {
  // TODO: Replace with real game IDs or fetch from API/db
  return [
    { game_id: 'example1' },
    { game_id: 'example2' }
  ];
};

export const serverRoutes: ServerRoute[] = [
  {
    path: 'monopoly/banker/:game_id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
