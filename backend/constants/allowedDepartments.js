/**
 * Canonical department labels (MongoDB User.department, registration, profiles).
 * Keep frontend `src/constants/departments.js` in sync.
 */
const ALLOWED_DEPARTMENTS = [
  "Information Technology",
  "Research and Development",
  "Customer Service",
  "Finance and Accounting",
  "Human Resources",
  "Sales and Marketing",
  "Executive and Administrative",
  "Operations",
  "Product Management",
  "Business Development",
];

const ALLOWED_DEPARTMENT_SET = new Set(ALLOWED_DEPARTMENTS);

function isAllowedDepartment(value) {
  const t = String(value || "").trim();
  return ALLOWED_DEPARTMENT_SET.has(t);
}

module.exports = {
  ALLOWED_DEPARTMENTS,
  ALLOWED_DEPARTMENT_SET,
  isAllowedDepartment,
};
