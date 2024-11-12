/// <reference path="../types/validation.d.ts" />
import { decryptContent } from '../tools/decrypt_input'
import { Database } from '../types/shell'
import { Validation } from '../types/validation.d'

/**
 *  Connect to the target cluster
 *
 * @param hostname Cluster hostname
 * @param user Cluster username
 * @param encrypedPassword Cluster password with encryption
 * @returns
 */
export const connectTarget = ({ hostname, username, encryptedPassword }: Validation.Connection): Database => {
  const decryptedPassword = decryptContent(encryptedPassword)

  return connect(`mongodb://${username}:${decryptedPassword}@${hostname}?tls=true&tlsAllowInvalidHostnames=true&directConnection=true`)
}

/**
 * Get primary replica set from the target cluster with mongodb+srv
 *
 * @param hostname
 * @param user
 * @param encrypedPassword
 */
export const getPrimary = ({ hostname, username, encryptedPassword }: Validation.Connection): string => {
  const decryptedPassword = decryptContent(encryptedPassword)

  const conn = connect(`mongodb+srv://${username}:${decryptedPassword}@${hostname}?tls=true&tlsAllowInvalidHostnames=true&directConnection=true`)

  return conn.adminCommand({ isMaster: 1 }).primary
}