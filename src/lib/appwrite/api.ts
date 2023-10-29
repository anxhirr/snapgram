import { ID, Query } from 'appwrite'

import { INewPost, INewUser } from '@/types'
import { account, appwriteConfig, avatars, databases, storage } from './config'

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
export async function signOutAccount() {
  try {
    const session = await account.deleteSession('current')
    return session
  } catch (error) {
    console.error(error)
  }
}
export async function createPost(post: INewPost) {
  try {
    // uploadoad images to storage
    const uploadedFile = await uploadFile(post.files[0])
    if (!uploadedFile) throw new Error('No uploaded file')

    // get file url
    const fileUrl = await getFilePreview(uploadedFile.$id)
    if (!fileUrl) {
      // delete file from storage
      deleteFile(uploadedFile.$id)
      throw new Error('No file url')
    }

    // convert tags to array
    const tags = post.tags?.replace(/ /g, '').split(',') || []

    // save post to db
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageId: uploadedFile.$id,
        imageUrl: fileUrl,
        location: post.location,
        tags,
      }
    )

    if (!newPost) {
      // delete file from storage
      await deleteFile(uploadedFile.$id)
      throw new Error('Post not created')
    }

    return newPost
  } catch (error) {
    console.error(error)
  }
}

export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    )
    return uploadedFile
  } catch (error) {
    console.error(error)
  }
}
export async function getFilePreview(fileId: string) {
  try {
    const filePreview = await storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      'top',
      100
    )
    return filePreview
  } catch (error) {
    console.error(error)
  }
}

export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId)
    return true
  } catch (error) {
    console.error(error)
  }
}

export const getRecentPosts = async () => {
  try {
    const recentPosts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(20)]
    )

    if (!recentPosts) throw new Error('No recent posts')

    return recentPosts
  } catch (error) {
    console.error(error)
  }
}
