const COURSE_NAMES: Record<string, string> = {
  Spanish: "Espagnol",
  French: "Français",
  Italian: "Italien",
  Croatian: "Croate",
  Japanese: "Japonais",
};

/** Course names come from the shared DB in English; translate just the display label. */
export const translateCourseName = (title: string) => COURSE_NAMES[title] ?? title;
