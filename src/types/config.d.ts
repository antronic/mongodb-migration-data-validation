declare module '../../config.cjs' {
  const config: {
    target: {
      hostname: string
      username: string
      encryptedPassword: string
    }
    listMode: string
    databases: Validation.Database[]
  }

  export = config
}