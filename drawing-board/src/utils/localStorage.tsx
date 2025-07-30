export type Project = {
  id: string;
  title: string;
  pages: any[][];
};

// ✅ 取得目前登入的使用者
export const getCurrentUser = (): string | null => {
  return localStorage.getItem('username');
};

// ✅ 載入目前使用者的所有專案
export const loadProjects = (): Project[] => {
  const username = getCurrentUser();
  if (!username) return [];

  const raw = localStorage.getItem(`projects_${username}`);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to parse projects from localStorage:', error);
    return [];
  }
};

// ✅ 儲存目前使用者的所有專案
export const saveProjects = (projects: Project[]): void => {
  const username = getCurrentUser();
  if (!username) return;

  try {
    localStorage.setItem(`projects_${username}`, JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to save projects to localStorage:', error);
  }
};
