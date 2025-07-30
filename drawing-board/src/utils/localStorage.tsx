type Project = {
  id: string;
  title: string;
  pages: any[][];
};

// ✅ 取得目前登入的使用者
const getCurrentUser = (): string | null => {
  return localStorage.getItem('username');
};

// utils/localStorage.ts
export const loadProjects = () => {
  const username = localStorage.getItem('username');
  const raw = localStorage.getItem(`projects_${username}`);
  return raw ? JSON.parse(raw) : [];
};

export const saveProjects = (projects: any[]) => {
  const username = localStorage.getItem('username');
  localStorage.setItem(`projects_${username}`, JSON.stringify(projects));
};

