import { Models } from 'appwrite'
import Loader from './Loader'
import GridPostList from './GridPostList'

type SearchResultsProps = {
  isSearchFetching: boolean
  searchedPosts: Models.Document[]
}
export default function SearchResults({
  isSearchFetching,
  searchedPosts,
}: SearchResultsProps) {
  if (isSearchFetching) return <Loader />

  if (searchedPosts.length > 0) return <GridPostList posts={searchedPosts} />

  return (
    <p className='text-light-4 mt-4 text-center w-full'>
      No results found for your search. Please try again.
    </p>
  )
}
