export type FacetField = {
  key: string;
  label: string;
  type: "select" | "multiselect";
  options: { value: string; label: string }[];
};

export const FRAMEWORK_FIELD_CONFIG: Record<
  "react" | "next" | "vue",
  FacetField[]
> = {
  react: [
    {
      key: "bundler",
      label: "Bundler",
      type: "select",
      options: [
        { value: "vite", label: "Vite" },
        { value: "webpack", label: "Webpack" },
        { value: "parcel", label: "Parcel" },
      ],
    },
    {
      key: "styling",
      label: "Styling",
      type: "multiselect",
      options: [
        { value: "tailwind", label: "Tailwind CSS" },
        { value: "css-modules", label: "CSS Modules" },
        { value: "styled-components", label: "Styled Components" },
        { value: "mui", label: "MUI" },
      ],
    },
    {
      key: "state",
      label: "State",
      type: "multiselect",
      options: [
        { value: "redux", label: "Redux" },
        { value: "zustand", label: "Zustand" },
        { value: "jotai", label: "Jotai" },
        { value: "context", label: "React Context" },
      ],
    },
  ],
  next: [
    {
      key: "router",
      label: "Router",
      type: "select",
      options: [
        { value: "app", label: "App Router" },
        { value: "pages", label: "Pages Router" },
      ],
    },
    {
      key: "styling",
      label: "Styling",
      type: "multiselect",
      options: [
        { value: "tailwind", label: "Tailwind CSS" },
        { value: "css-modules", label: "CSS Modules" },
        { value: "styled-components", label: "Styled Components" },
      ],
    },
    {
      key: "data",
      label: "Data layer",
      type: "multiselect",
      options: [
        { value: "prisma", label: "Prisma" },
        { value: "drizzle", label: "Drizzle" },
        { value: "supabase", label: "Supabase" },
        { value: "rest", label: "REST API" },
      ],
    },
  ],
  vue: [],
};

export const PROJECT_CATEGORIES = ["Full Stack", "Frontend", "CMS"] as const;
