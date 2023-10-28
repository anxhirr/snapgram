import SignUpForm from './_auth/forms/SignUpForm'
import SigninForm from './_auth/forms/SigninForm'
import { Home } from './_root/pages'
import './globals.css'
import { Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <main className='flex h-screen'>
      <Routes>
        <Route path='/sign-in' element={<SigninForm />} />
        <Route path='/sign-up' element={<SignUpForm />} />

        <Route index element={<Home />} />
      </Routes>
    </main>
  )
}
