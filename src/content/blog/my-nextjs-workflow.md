---
title: "My NextJs Workflow"
description: "I talk through the project structure that I have found to be the most efficient for my NextJs projects. I use these same practices across each project allowing me to quickly jump into any project and know exactly where everything is."
pubDate: "2025-02-10"
tags: ["ui/ux", "fullstack", "ai"]
slug: "my-nextjs-workflow"
heroImage: "/images/blog/my-nextjs-workflow/hero.webp"
---

## Why I Built This Workflow

I got tired of chasing the newest features without getting more done. I settled on Next.js 14.2—it has everything I need, and I now focus on building, not tinkering. This setup helps me stay fast and organized across every project. Same structure, same tools, no guesswork.

## Project Setup

### Create Your Project Folder

For me I have always liked right clicking my explorer and creating a new folder. I name it the same as the project name. Then I right click to open in code and I have the terminal open automatically so I am ready to start typing the commands.

```shell
npx create-next-app@14.2 my-nextjs-app ./
```

### Install Tools I Use in Every Project

#### UI Components (ShadCN)

```shell
npx shadcn@latest init
npx shadcn@latest add button input
```

I use ShadCN to quickly pull in styled components and keep a consistent design system.

```shell
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
```

Then add your database URL to `.env.local`:

```shell
DATABASE_URL="postgresql://user:password@localhost:5432/db"
```

Set up your schema in `prisma/schema.prisma` using this base User model and roles:

```json
generator client {
  provider = "prisma-client-js"
}

datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}

enum Role {
user
admin
dev
}

model User {
id String @id @default(uuid())
name String?
email String @unique
emailVerified DateTime?
image String?
role Role @default(user)
createdAt DateTime @default(now())
updatedAt DateTime @default(now()) @updatedAt
accounts Account[]
sessions Session[]

@@index([email])
@@map("users")
}

model Account {
id String @id @default(uuid())
userId String
type String
provider String
providerAccountId String
refresh_token String?
access_token String?
expires_at Int?
token_type String?
scope String?
id_token String?
session_state String?
user User @relation(fields: [userId], references: [id], onDelete: Cascade)

@@unique([provider, providerAccountId])
@@map("accounts")
}

model Session {
id String @id @default(uuid())
sessionToken String @unique
userId String
expires DateTime
user User @relation(fields: [userId], references: [id], onDelete: Cascade)

@@map("sessions")
}

model VerificationToken {
identifier String
token String @unique
expires DateTime

@@unique([identifier, token])
@@map("verification_tokens")
}
```

At the moment the changes we made to `schema.prisma` are not reflected in the database. To do that, run the following commands:

```shell
npx prisma generate
npx prisma db push
```

#### Auth (NextAuth + Prisma)

I like to use NextAuth for authentication and prisma to manage my database. My database prefrence at the moment is PostgreSQL I use NeonDB.

```shell
npm install next-auth
```

Then configure it inside `/src/lib/auth.ts`:

```ts
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role; // No more TypeScript error
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const isDev = (session: { user: { role?: string } }) => {
  return session.user.role === "dev";
};

export const isAdminOrAbove = (session: { user: { role?: string } }) => {
  return session.user.role === "admin" || session.user.role === "dev";
};
```

### Folder Structure: `src/lib`

I keep all the important logic pieces here. This centralizes things so I only initialize the fonts once, or the prisma client once, etc. Anytime I need one of these "libraries" I just import it from this `lib` folder and its ready to go.

#### `/lib/prisma.ts`

```ts
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
```

Use this wherever you need database access. If I have a products table in the schema file then I can from any server component in my nextjs app access the products by using

```ts
import { prisma } from "@/lib/prisma";

const products = await prisma.product.findMany();
```

#### `/lib/fonts.ts`

This is a quick way to use google fonts or local font files in your project. This is a must have for every style system.

```ts
import { Bebas_Neue } from "next/font/google";
import localFont from "next/font/local";

export const robotoCondensed = localFont({
  src: "../app/fonts/RobotoCondensed.woff",
  display: "swap",
});

export const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400" });
```

Use with classNames to apply fonts cleanly across components.

```ts
import { robotoCondensed } from "@/lib/fonts";

export const Heading = (children) => (
  <h1 className={cn("text-3xl", robotoCondensed.className)}>{children}</h1>
);
```

### Global Middleware

Create `middleware.ts` at the root to protect routes:

```ts
import { auth } from "@/lib/auth";

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname !== "/login") {
    return Response.redirect(new URL("/login", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### Wrap the App in a Session Provider

```ts
"use client";

import { SessionProvider } from "next-auth/react";

const SessionWrapper = ({ children }) => (
  <SessionProvider>{children}</SessionProvider>
);

export default SessionWrapper;
```

Wrap your layout in this to make sessions available across pages.

### Layout Setup

#### `/app/layout.tsx`

```ts
import SessionWrapper from "@/components/session-wrapper";

export default function RootLayout({ children }) {
  return (
    <SessionWrapper>
      <html lang="en">
        <body className="flex flex-col min-h-screen">
          {/* <Navbar /> */}
          <main className="flex-1">{children}</main>
          {/* <Footer /> */}
        </body>
      </html>
    </SessionWrapper>
  );
}
```

### Metadata and PWA Setup

#### Add Metadata to Layout

Adding metadata to the layout allows you to easily update the title, description, and icons across the site. This is especially useful for SEO best practices and can make your website stand out.

```ts
export const metadata = {
  title: {
    absolute: "Frontend Developer | Aaron Soto",
    template: "%s | Aaron Soto",
  },
  authors: [{ name: "Aaron Soto" }],
  description:
    "Aaron Soto is a Frontend Developer, Designer, and Creator living in Arizona.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "icon", url: "/favicon-16x16.png", sizes: "16x16" },
      { rel: "icon", url: "/favicon-32x32.png", sizes: "32x32" },
      {
        rel: "icon",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
      },
      {
        rel: "icon",
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
      },
    ],
  },
  manifest: "/site.webmanifest",
};
```

Make sure the icon files are in `/public`.

#### `/public/site.webmanifest`

```json
{
  "name": "Aaron Soto | Portfolio",
  "short_name": "Aaron Soto",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#000000",
  "background_color": "#E11E49",
  "display": "standalone"
}
```

### Extras I Add to Most Projects

#### - Resend Email API

```ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export default resend;
```

#### - Stripe API

```ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});
```

Use it like this:

```ts
const session = await stripe.checkout.sessions.retrieve(session_Id);
```

#### - `next.config.mjs`

We have to add strip to the remote patterns for our nextjs images since we would like to show images from stripe.

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "files.stripe.com",
      },
    ],
  },
};

export default nextConfig;
```
