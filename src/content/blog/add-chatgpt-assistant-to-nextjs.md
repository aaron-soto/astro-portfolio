---
title: "How to Add a ChatGPT Assistant to Your Next.js Website"
description: "Learn how to integrate OpenAI's ChatGPT model into your Next.js website to create a conversational assistant. This tutorial covers setting up the ChatGPT API, creating a custom React hook, and implementing the assistant in your project."
pubDate: "2025-02-10"
tags: ["ai", "ui-ux", "fullstack"]
slug: "add-chatgpt-assistant-to-nextjs"
heroImage: "/images/blog/add-chatgpt-assistant-to-nextjs/hero.webp"
---

## Introduction

I heard about an open frontend developer role at OpenAI and thought, why not build something unique to stand out? Instead of just listing skills, I decided to show them in action by building a ChatGPT assistant from scratch. This was a full-stack project that tested my debugging skills. In this tutorial, I'll show you how to add a ChatGPT assistant to your Next.js site. Check the [OpenAI API documentation](https://platform.openai.com/docs/overview) for the latest updates.

---

## Step 1: Get Your OpenAI Credentials

1. Go to [OpenAI Platform Settings](https://platform.openai.com/settings/organization/general).
2. Click **Organization** on the left sidebar and copy your **Organization ID**.
3. Under **Project > General**, copy your **Project ID**.
4. Navigate to **API Keys**, create a new key, and copy it.

Create a `.env` file in your project's root folder and add the necessary env varibles.

```ts
OPEN_AI_ORGANIZATION = "value";
OPEN_AI_PROJECT = "value";
OPEN_AI_API_KEY = "value";
```

## Step 2: Set Up the OpenAI Client

Create a `lib` folder if it doesn’t exist. Inside it, add `open-ai.ts`:

```ts
import OpenAI from "openai";

export const openai = new OpenAI({
  organization: process.env.OPEN_AI_ORGANIZATION,
  project: process.env.OPEN_AI_PROJECT,
  apiKey: process.env.OPEN_AI_API_KEY,
});
```

This file makes it easy to reuse the OpenAI client without setting it up repeatedly. You can now import `openai` anywhere in your app that you want to interact with the OpenAI API.

## Step 3: Create the API Route

Next we will create an API route to handle chat requests. In `app/api/openai/chat.ts`, add:

```ts
import { NextResponse } from "next/server";
import { openai } from "@/lib/open-ai";
import { systemMessageContent } from "@/data/system-message-content";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemMessageContent },
      { role: "user", content: prompt },
    ],
  });

  const response = NextResponse.json({
    message: completion.choices[0].message.content,
  });

  return response;
}
```

This handles incoming chat requests. Keep in mind that the gpt-4o-mini model is a smaller version of GPT-4 optimized for speed and cost. You can change this to gpt-4 for more accurate responses. Itis also a good idea to limit the number of messages per day to avoid abuse.

Possible Ways to improve this API:

- Integrate a CAPTCHA system to prevent bots from spamming your API.
- Add a profanity filter to block inappropriate messages.
- Implement a cooldown system to prevent users from sending messages too quickly.
- Adding Stripe API and flag to the use model so users can pay you for more messages if they wish so you dont have to pay for all the messages.

## Step 4: Add System Message Content

Next we want to give our assistant some knowledge, so it can respond to users. At the moment it can only respond to the prompt it receives with no context. So we want to add some background context to the assistant that it can use to respond to users.

This is as simple as creating a string with the content you want the assistant to know. For my portfolio website I filled this message with information on the projects I have developed, the technologies I have used and the services I offer. This allows guests to ask any question they want and the assistant will be able to respond with the information I have provided.

Create `data/system-message-content.ts`:

```ts
export const systemMessageContent =
  "I am a frontend developer with experience in React, Next.js, and Tailwind CSS. I have developed projects ranging from e-commerce sites to personal blogs. I offer services such as website development, UI/UX design, and SEO optimization. Feel free to ask me anything!";
```

## Step 5: Sending Messages to the API

Here's how to send a message using Next.js's Fetch API:

```ts
const sendMessageToAPI = async (message: string) => {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: message }),
    });

    const data = await response.json();

    if (data.error) {
      return { error: data.error };
    }

    return data.message;
  } catch (error: any) {
    return { error: error.message };
  }
};
```

## Wrapping Up

You now have a working ChatGPT assistant in your Next.js app. You've covered API setup, message handling, and customizing responses. From here, you can build a frontend chat interface, handle more complex prompts, or tweak the assistant’s behavior to suit your project, maybe even wrap it in a cool floating button on your site that is accessible from any page.
