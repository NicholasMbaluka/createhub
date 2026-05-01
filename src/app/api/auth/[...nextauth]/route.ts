import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { supabase } from '@/lib/supabase'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists in Supabase
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email!)
            .single()

          if (!existingUser) {
            // Create new user in Supabase
            const { error } = await supabase
              .from('users')
              .insert([
                {
                  id: user.id,
                  email: user.email!,
                  role: 'creator', // Default role
                  store_name: user.name,
                  avatar_url: user.image,
                  created_at: new Date().toISOString()
                }
              ])

            if (error) throw error
          }

          return true
        } catch (error) {
          console.error('Error during sign in:', error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user) {
        // Get user data from Supabase
        const { data: userData } = await supabase
          .from('users')
          .select('role, store_name, phone')
          .eq('email', session.user.email!)
          .single()

        session.user.id = token.sub!
        session.user.role = userData?.role || 'creator'
        session.user.storeName = userData?.store_name
        session.user.phone = userData?.phone
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    }
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
  },
})

export { handler as GET, handler as POST }
