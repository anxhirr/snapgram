import { ID, Query } from 'appwrite'

import { INewPost, INewUser, IUpdatePost } from '@/types'
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
    // Upload file to appwrite storage
    const uploadedFile = await uploadFile(post.files[0])

    if (!uploadedFile) throw Error

    // Get file url
    const fileUrl = getFilePreview(uploadedFile.$id)
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id)
      throw Error
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, '').split(',') || []

    // Create post
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      }
    )

    if (!newPost) {
      await deleteFile(uploadedFile.$id)
      throw Error
    }

    return newPost
  } catch (error) {
    console.log(error)
  }
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.files.length > 0

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    }

    if (hasFileToUpdate) {
      const uploadedFile = await uploadFile(post.files[0])
      if (!uploadedFile) throw new Error('No uploaded file')

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id)
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id)
        throw Error
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id }
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, '').split(',') || []

    //  Update post
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    )

    // Failed to update
    if (!updatedPost) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId)
      }

      // If no new file uploaded, just throw error
      throw Error
    }

    // Safely delete old file after successful update
    if (hasFileToUpdate) {
      await deleteFile(post.imageId)
    }

    return updatedPost
  } catch (error) {
    console.log(error)
  }
}

export async function deletePost(postId: string, imageId: string) {
  if (!postId || !imageId) throw new Error('No post id or image id')

  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      postId
    )

    if (!statusCode) throw new Error('Post not deleted')

    await deleteFile(imageId)

    return true
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
export function getFilePreview(fileId: string) {
  try {
    const filePreview = storage.getFilePreview(
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

export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      postId,
      {
        likes: likesArray,
      }
    )

    if (!updatedPost) throw new Error('Post not updated')

    return updatedPost
  } catch (error) {
    console.error(error)
  }
}
export async function savePost(postId: string, userId: string) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    )

    if (!updatedPost) throw new Error('Post not updated')

    return updatedPost
  } catch (error) {
    console.error(error)
  }
}
export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    )

    if (!statusCode) throw new Error('Post not deleted')

    return true
  } catch (error) {
    console.error(error)
  }
}

export async function getPostById(postId: string) {
  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      postId
    )

    if (!post) throw new Error('No post')

    return post
  } catch (error) {
    console.error(error)
  }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc('$updatedAt'), Query.limit(10)]

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()))
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      queries
    )

    if (!posts) throw new Error('No posts')

    return posts
  } catch (error) {
    console.error(error)
  }
}

export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      [Query.search('caption', searchTerm)]
    )

    if (!posts) throw new Error('No posts')

    return posts
  } catch (error) {
    console.error(error)
  }
}
