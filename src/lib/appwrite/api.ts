import { ID } from 'appwrite'

import { INewUser } from '@/types'
import { account, appwriteConfig, avatars, databases } from './config'

export async function createUserAccount(user: INewUser) {
  const { email, password, name } = user
  try {
    const newAccount = await account.create(ID.unique(), email, password, name)

    if (!newAccount) throw new Error('Account creation failed')

    const avatarUrl = await avatars.getInitials(user.name)

    const newUser = await saveUserToDb({
      accountId: newAccount.$id,
      username: user.username,
      email: newAccount.email,
      name: newAccount.name,
      imageUrl: avatarUrl,
    })
    return newUser
  } catch (error) {
    console.error(error)
    return error
  }
}

export async function saveUserToDb(user: {
  accountId: string
  username: string
  email: string
  name: string
  imageUrl: URL
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    )
    return newUser
  } catch (error) {
    console.error(error)
  }
}
