import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { SignUpValidation } from '@/lib/validation'
import Loader from '@/components/shared/Loader'
import { createUserAccount } from '@/lib/appwrite/api'

export default function SignUpForm() {
  const isLoading = false
  // 1. Define your form.
  const form = useForm<z.infer<typeof SignUpValidation>>({
    resolver: zodResolver(SignUpValidation),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
    },
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof SignUpValidation>) {
    const newUser = await createUserAccount(values)
    console.log('newUser', newUser)
  }
  return (
    <Form {...form}>
      <div className='sm:w-420 flex-center flex-col'>
        <img src='/assets/images/logo.svg' alt='Logo' />

        <h2 className='h3-bold md:h2-bold pt-5 sm:pt-12'>
          Create your account
        </h2>
        <p className='text-light-3 small-medium md:base-regular mt-2'>
          To start using Snapgram enter your account details
        </p>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col gap-5 w-full mt-4'
        >
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type='text' className='shad-input' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input type='text' className='shad-input' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type='email' className='shad-input' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type='password' className='shad-input' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit' className='shad-button_primary'>
            {isLoading ? (
              <div className='flex-center gap-2'>
                <Loader />
                Loding...
              </div>
            ) : (
              'Sign Up'
            )}
          </Button>

          <p className='text-small-regular texr-light-2 text-center mt-2'>
            Already have an account?{' '}
            <Link
              to='/sign-in'
              className='text-primary-500 text-small-semibold ml-1'
            >
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </Form>
  )
}
