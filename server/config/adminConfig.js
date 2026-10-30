/**
 * Central admin configuration — single source of truth for admin email list.
 * Import this anywhere instead of duplicating the array.
 */

const DEFAULT_ADMIN_EMAILS = [
  'mohankhandagale200711@gmail.com',
  'krishnamahtole@gmail.com',
];

/**
 * Returns the merged, deduplicated list of admin emails from both
 * the hard-coded defaults and the ADMIN_EMAIL environment variable
 * (comma-separated, e.g. "user1@example.com,user2@example.com").
 */
const getAllAdminEmails = () => {
  const envEmails = (process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set([...DEFAULT_ADMIN_EMAILS, ...envEmails]));
};

/**
 * Returns true when the given user object qualifies as an admin.
 */
const isAdminUser = (user) => {
  if (!user) return false;
  const userEmail = user.email?.trim().toLowerCase();
  return Boolean(
    user.isAdmin ||
    user.role === 'admin' ||
    getAllAdminEmails().includes(userEmail)
  );
};

module.exports = { DEFAULT_ADMIN_EMAILS, getAllAdminEmails, isAdminUser };
