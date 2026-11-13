/**
 * Shared helper for checking explicitly provisioned database admin roles.
 */

/**
 * Returns true when the given user object qualifies as an admin.
 */
const isAdminUser = (user) => {
  if (!user) return false;
  // Provision admins explicitly in the database; never derive privileges from email.
  return Boolean(user.isAdmin || user.role === 'admin');
};

module.exports = { isAdminUser };
