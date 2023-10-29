import { ID, Query } from 'appwrite'

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
export async function signInAccount(user: { email: string; password: string }) {
  const { email, password } = user
  try {
    const session = await account.createEmailSession(email, password)
    return session
  } catch (error) {
    console.error(error)
  }
}

// ============================== GET ACCOUNT
export async function getAccount() {
  try {
    const currentAccount = await account.get()
    console.log(currentAccount)
    return currentAccount
  } catch (error) {
    console.log(error)
  }
}
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount()
    if (!currentAccount) throw new Error('No current account')
    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    )
    if (!currentUser) throw new Error('No current user')
    return currentUser.documents[0]
  } catch (error) {
    console.error(error)
  }
}
