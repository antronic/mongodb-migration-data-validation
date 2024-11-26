import murmurhash from 'murmurhash'
import { fingerprint32 } from 'farmhash-modern'

export const hash = (str: string) => murmurhash.v3(str).toString()
export const hashObject = (obj: any) => hash(JSON.stringify(obj))

export const hashBigObject = (obj: any): string => {
  if (typeof obj !== 'object') {
    return 'not an object'
  }

  const hashArray = Object.keys(obj)
    // We sort the keys to ensure the hash is consistent
    .sort()
    .map(key => {
      const value = obj[key]
      if (value === null || value === undefined) {
        return `${key}:${value.toString()}`

      }

      return `${key}:${typeof value === 'object' ? hashBigObject(value) : value}`
    })

    return hash(hashArray.join(''))


  // try {
  // } catch (e: any) {
  //   console.log('error', e.message)
  //   return 'error'
  // }
}