const COOKIE_NAME = 'peervo_session';

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

const setSessionCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, cookieOptions());
};

const clearSessionCookie = (res) => {
  const options = cookieOptions();
  delete options.maxAge;
  res.clearCookie(COOKIE_NAME, options);
};

const readCookie = (cookieHeader, name) => {
  if (!cookieHeader) return null;
  const entry = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  if (!entry) return null;
  try {
    return decodeURIComponent(entry.slice(name.length + 1));
  } catch {
    return null;
  }
};

module.exports = { COOKIE_NAME, setSessionCookie, clearSessionCookie, readCookie };
