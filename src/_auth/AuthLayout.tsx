import { Outlet, Navigate } from 'react-router-dom'

export default function AuthLayout() {
  const isAuth = false
  return (
    <>
      {isAuth ? (
        <Navigate to='/' />
      ) : (
        <>
          <section className='flex flex-col flex-1 justify-center items-center py-10'>
            <Outlet />
          </section>

          <img
            src='/assets/images/side-img.svg'
            alt='Side Image'
            className='hidden xl:block h-screen w-1/2 object-cover bg-no-repeat'
          />
        </>
      )}
    </>
  )
}
