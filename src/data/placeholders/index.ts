import content from "@/data/placeholders/content.json";

export type PlaceholderProject = (typeof content.projects)[number];
export type PlaceholderProjectStats = typeof content.projectStats;
export type PlaceholderSkillGroup = (typeof content.skills)[keyof typeof content.skills];
export type PlaceholderExperience = (typeof content.experience)[number];
export type PlaceholderEducation = (typeof content.education)[number];
export type PlaceholderService = (typeof content.services)[number];

/** Static fallback content (formerly split across public/*.json). */
export const placeholderContent = content;

export const placeholderProjects = content.projects;
export const placeholderProjectStats = content.projectStats;
export const placeholderSkills = content.skills;
export const placeholderExperience = content.experience;
export const placeholderEducation = content.education;
export const placeholderServices = content.services;
