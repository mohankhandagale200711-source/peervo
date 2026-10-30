const DEFAULT_ADMIN_EMAILS = [
  'mohankhandagale200711@gmail.com',
  'krishnamahtole@gmail.com',
];

export const checkIsAdmin = (user) => {
  if (!user) return false;
  const email = user.email?.trim().toLowerCase();
  return Boolean(
    user.isAdmin ||
    user.role === 'admin' ||
    DEFAULT_ADMIN_EMAILS.includes(email)
  );
};
