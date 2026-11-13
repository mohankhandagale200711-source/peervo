export const checkIsAdmin = (user) => {
  if (!user) return false;
  return Boolean(user.isAdmin || user.role === 'admin');
};
