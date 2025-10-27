---
title: "Building a Dynamic Events Component for a Coffee Shop Website"
description: "Lorem ipsum dolor sit amet"
pubDate: "2025-01-28"
tags: ["fullstack", "ui/ux", "case-studies"]
slug: "nextjs-recurring-events-component"
heroImage: "/images/blog/dynamic-events/hero.webp"
---

## Introduction

We wanted to come up with a component that showed the coffee shops customers what events would be happening at the coffee shop as the place was known for hosting different events from Craftsman Meetups to Dj live stream nights. The client wanted to be able to manage these events easily and have them displayed on the website in a way that was easy to understand and navigate. Since the coffee shop frequently hosts new events, they needed an easy way to showcase them.

## How Events Are Managed

I ended up going with a simple data structure for the events. Each event has a title, description, date, start time, end time, and a recurring boolean. If an event is marked as recurring, it requires a recurringFrequency field, which can be set to 'daily', 'weekly', 'monthly', or 'yearly'. This allows us to have events that are one off events or events that may happen every week and with some JavaScript magic we can do some calculations to determine when the next event will be.

![Admin view](/images/blog/dynamic-events/events-admin-view.png)

## Handling Recurring Events

I created a helper function that takes in an event and calculates the next occurrence of the event. If an event is not recurring we return the event date, if its recurring we should take the frequency and add the frequency to it until the date is in the future or today.

![events preview](/images/blog/dynamic-events/events-preview.png)

For example, if an event starts on January 1st and is set to recur weekly, the function adds 1 week at a time until the next valid occurrence is today or in the future.

## Parsing Events on the Frontend

I can use that function to then get any events that are happening either today or in the future, but this also allows us to have events where their original date has passed but they are still recurring so they will show up in the future. If the events recurring date happening to land on todays date then that event should be both in today and upcoming to show the end user that the event is happening today and recurring in the future.

## Using Luxon for Time Management

I ended up using the [npm package Luxon](https://moment.github.io/luxon/#/?id=luxon) to handle the dates and times for the events. Luxon is a JavaScript library with built-in functionality that simplifies working with dates and times and I found it to be very useful when working with the events. It gave me the ability to do something like `DateTime.plus({weeks: 1})`. If I do this in a while loop I am able to calculate the next occurrence of a recurring event.

I spent way too much time trying to manage dates on my own and would recommend using a library like Luxon for any date and time calculations. It also allowed for simple timezone management which was a big plus to make sure users always saw the correct time for the event that will happen in Arizona vs their timezone or the servers timezone.

I experimented with different JavaScript date formats but decided to keep everything in UTC and using ISO Strings when I needed to send the date to the server. This made it easy to convert the date back to a Luxon DateTime object and do any calculations I needed to do.

## Challenges and Solutions

One of the biggest hurdles in this project was server vs client side code. I was not paying enough attention to the fact that the server and client may have different times and dates. I was calculating the next occurrence of an event on the server side and then displaying that to the user. This was causing issues when the server and client had different times (which was almost all the time since I deployed to Vercel). I now fetch all events on the server and handle recurring date calculations on the client relative to Phoenix time (MST). This way, event dates and recurring dates stay accurate based on the user's time of visiting the site.

## Final Thoughts

This project was a great learning experience, especially in managing server vs. client-side logic in Next.js. I also learned a lot about luxon and what it offers when it comes to date calculations. It reminds me of Moment.js, but with more features and less bloat.

This recurring event feature is a component that I am glad to have in my toolbelt and I am sure I will be using it in future projects styled to the specific website.
