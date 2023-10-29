import * as z from 'zod'

export const SignUpValidation = z.object({
  name: z.string().min(2, {
    message: 'Minimum 2 characters are allowed',
  }),
  username: z.string().min(2, {
    message: 'Minimum 2 characters are allowed',
  }),
  email: z.string().email({
    message: 'Please enter a valid email',
  }),
  password: z.string().min(8, {
    message: 'Minimum 8 characters are allowed',
  }),
})
export const SigninValidation = z.object({
  email: z.string().email({
    message: 'Please enter a valid email',
  }),
  password: z.string().min(8, {
    message: 'Minimum 8 characters are allowed',
  }),
})
export const PostValidation = z.object({
  caption: z.string().min(2).max(100),
  files: z.custom<File[]>(),
  location: z.string().min(2).max(100),
  tags: z.string(),
})
