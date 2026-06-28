import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
    async authorize(credentials: Record<"email" | "password", string> | undefined) {
        await dbConnect();
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required');
          }
          
          const user = await UserModel.findOne({ email: credentials.email });
          
          if (!user) {
            throw new Error('No user found with this email');
          }

          if (!user.isVerified) {
            throw new Error('Please verify your email before logging in');
          }

          if (!user.password) {
            throw new Error('Please login with another method');
          }

          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
          
          if (isPasswordCorrect) {
            return {
              id: user._id.toString(),
              _id: user._id.toString(), 
              email: String(user.email),
              role: String(user.role),
            };
          } else {
            throw new Error('Incorrect password');
          }
        } catch (err: unknown) {
          if (err instanceof Error) {
            throw new Error(err.message);
          }
          throw new Error('Authentication failed');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  pages: {
    signIn: '/sign-in',
  },
};