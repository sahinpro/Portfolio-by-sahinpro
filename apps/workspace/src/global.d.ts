/**
 * Admin-only ambient types. The website's `global.d.ts` carries the 3D
 * (`meshline`, `*.glb`) and Calendly declarations, which do not belong here —
 * the CMS needs neither, so keeping them out of this app also keeps `three`
 * and the Calendly loader out of the admin bundle.
 */
export {};
