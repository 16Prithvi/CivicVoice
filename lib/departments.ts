import { Department, ReportCategory } from "@/types";

const DEPARTMENTS: Department[] = [
  { id: "dept_roads", name: "Municipal Roads Department", category: ["roads"] },
  { id: "dept_safety", name: "Public Safety Department", category: ["safety"] },
  { id: "dept_environment", name: "Environment & Parks Department", category: ["environment"] },
  { id: "dept_sanitation", name: "Health & Sanitation Department", category: ["garbage"] },
];

export function getDepartmentByCategory(category: ReportCategory): Department | null {
  return DEPARTMENTS.find((d) => d.category.includes(category)) || null;
}

export function getAllDepartments(): Department[] {
  return DEPARTMENTS;
}

export function getDepartmentById(id: string): Department | null {
  return DEPARTMENTS.find((d) => d.id === id) || null;
}








