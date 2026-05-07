export interface UserLocationFields {
  uf: string | null | undefined
  city: string | null | undefined
  cityIbgeCode: string | null | undefined
}

export function hasCompleteLocation(location: UserLocationFields) {
  return Boolean(location.uf && location.city && location.cityIbgeCode)
}
