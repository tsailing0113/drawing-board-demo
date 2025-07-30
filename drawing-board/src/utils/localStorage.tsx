export function saveProjects(projects: any) {
  localStorage.setItem("projects", JSON.stringify(projects));
}

export function loadProjects(): any[] {
  const raw = localStorage.getItem("projects");
  return raw ? JSON.parse(raw) : [];
}
