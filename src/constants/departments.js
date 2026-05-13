/**
 * Department dropdown options — must match backend `constants/allowedDepartments.js`.
 */
export const DEPARTMENT_OPTIONS = [
  'Information Technology',
  'Research and Development',
  'Customer Service',
  'Finance and Accounting',
  'Human Resources',
  'Sales and Marketing',
  'Executive and Administrative',
  'Operations',
  'Product Management',
  'Business Development',
];

export function isDepartmentOption(value) {
  return DEPARTMENT_OPTIONS.includes(String(value || '').trim());
}
