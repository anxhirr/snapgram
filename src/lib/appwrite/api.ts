import { ID } from 'appwrite'

import { INewUser } from '@/types'
import { account } from './config'

export async function createUserAccount(user: INewUser) {
  const { email, password, name } = user
  try {
    const newAccount = await account.create(ID.unique(), email, password, name)
    console.log('newAccount', newAccount)
    return newAccount
  } catch (error) {
    console.error(error)
    return error
  }
}
