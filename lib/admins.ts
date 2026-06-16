export const ADMINS = ['andy.miles@docusketch.com']

export function isAdmin(email: string | null | undefined) {
  return !!email && ADMINS.includes(email)
}
