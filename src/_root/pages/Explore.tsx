import GridPostList from '@/components/shared/GridPostList'
import Loader from '@/components/shared/Loader'
import SearchResults from '@/components/shared/SearchResults'
import { Input } from '@/components/ui/input'
import useDebounce from '@/hooks/useDebounce'
import {
  useGetPosts,
  useSearchPosts,
} from '@/lib/react-query/queriesAndMutations'
import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'

export default function Explore() {
  const { ref, inView } = useInView()
  const { data: posts, fetchNextPage, hasNextPage, isFetching } = useGetPosts()

  const [search, setSearch] = useState('')
  const debouncedValue = useDebounce(search, 500)
  const { data: searchedPosts, isFetching: isSearchFetching } =
    useSearchPosts(debouncedValue)

  useEffect(() => {
    if (inView && !search) fetchNextPage()
  }, [inView, search])

  if (!posts)
    return (
      <div className='flex-center w-full h-full'>
        <Loader />
      </div>
    )

  const shouldShowSearchResults = search !== ''
  const shouldShowPosts =
    !shouldShowSearchResults &&
    posts.documents.every((page) => Object.keys(page).length === 0)

  return (
    <div className='explore-container'>
      <div className='explore-inner_container'>
        <h2 className='h3-bold md:h2-nold w-full'></h2>
        <div className='flex gap-1 px-4 w-full rounded-lg bg-dark-4'>
          <img
            src='/assets/icons/search.svg'
            alt='search'
            width={24}
            height={24}
          />
          <Input
            type='text'
            placeholder='Search'
            className='bg-transparent w-full'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className='flex-between w-full max-w-5xl mt-16 mb-7'>
        <h2 className='body-bold md:h3-bold'>Popular</h2>
        <div className='flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer'>
          <p className='small-medium md:base-medium text-light-2'></p>
          <img
            src='/assets/icons/filter.svg'
            alt='filter'
            width={20}
            height={20}
          />
        </div>
      </div>
      <div className='flex flex-wrap gap-9 w-full max-w-5xl'>
        {shouldShowSearchResults ? (
          <SearchResults
            isSearchFetching={isSearchFetching}
            searchedPosts={searchedPosts?.documents || []}
          />
        ) : shouldShowPosts ? (
          <p className='text-light-4 mt-10 text-center w-full'>End of posts</p>
        ) : (
          posts.documents.map((_, index) => (
            <GridPostList key={`page-${index}`} posts={posts.documents} />
          ))
        )}
      </div>

      {hasNextPage && !search && (
        <div ref={ref} className='mt-10'>
          <Loader />
        </div>
      )}
    </div>
  )
}
