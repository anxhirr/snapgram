import { useEffect } from 'react'
import Loader from '@/components/shared/Loader'
import { useGetRecentPosts } from '@/lib/react-query/queriesAndMutations'
import { Models } from 'appwrite'
import PostCard from '@/components/shared/PostCard'

export default function Home() {
  const {
    data: posts,
    isPending: isPostsLoading,
    isError: isPostsError,
  } = useGetRecentPosts()

  useEffect(() => {
    if (isPostsError) {
      console.log('Error fetching posts')
    }
  }, [isPostsError])
  return (
    <div className='flex flex-1'>
      <div className='home-container'>
        <div className='home-posts'>
          <h2 className='h3-bold md:h2-bold text-left w-full'>Home Feed</h2>

          {isPostsLoading && !posts ? (
            <Loader />
          ) : (
            <ul className='flex flex-col w-full gap-9'>
              {posts?.documents.map((post: Models.Document) => (
                <PostCard key={post.$id} post={post} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
